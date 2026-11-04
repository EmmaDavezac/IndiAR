import { computed, ref } from '../../assets/js/lib/vue-esm.js';
import router from '../router.js';
import { API_BASE, getJuegos } from '../services/api.js';
import { readCart, removeFromCart, clearCart, updateCartPlatform, syncCartDetails } from '../services/cart.js';
import { confirmAction, showToast } from '../services/confirm.js';

export default {
  name: 'Cart',
  setup() {
    const items = ref(readCart());
        const itemCount = computed(() => items.value.length);
    const total = computed(() => items.value.reduce((sum, item) => sum + Number(item.precio || 0), 0));
    const showCheckout = ref(false);
    const processingPayment = ref(false);
    const paymentComplete = ref(false);
    const imageUrl = game => game.img_principal?.startsWith('http') ? game.img_principal : `${API_BASE.replace('/api', '')}${game.img_principal || ''}`;
    function refresh() { items.value = readCart(); }
    function changePlatform(item, event) {
      updateCartPlatform(item.ID, event.target.value);
      refresh();
    }
    function remove(item) { removeFromCart(item.ID); refresh(); showToast(`${item.titulo} fue eliminado.`, 'success'); }
    async function emptyCart() { if (!await confirmAction('¿Vaciar todos los juegos del carrito?', 'Vaciar carrito', 'Vaciar carrito', 'danger')) return; clearCart(); refresh(); }
    function openCheckout() {
      if (items.value.some(item => !item.plataforma)) {
        showToast('Seleccioná una plataforma para cada juego antes de pagar.', 'warning');
        return;
      }
      showCheckout.value = true;
      document.body.classList.add('checkout-open');
    }
    function closeCheckout() {
      if (processingPayment.value) return;
      showCheckout.value = false;
      document.body.classList.remove('checkout-open');
    }
    async function simulatePayment() {
      if (processingPayment.value) return;
      processingPayment.value = true;
      await new Promise(resolve => setTimeout(resolve, 900));
      processingPayment.value = false;
      paymentComplete.value = true;
      clearCart();
      items.value = [];
      closeCheckout();
      showToast('Pago simulado correctamente. Tus juegos quedaron listos.', 'success');
    }
    window.addEventListener('cart-changed', refresh);
    getJuegos()
      .then(games => { syncCartDetails(games); refresh(); })
      .catch(error => console.error('No se pudieron actualizar los datos de juegos del carrito:', error));
    return { items, itemCount, total, showCheckout, processingPayment, paymentComplete, imageUrl, remove, changePlatform, emptyCart, openCheckout, closeCheckout, simulatePayment, router };
  },
  template: `<main class="cart-page container-fluid px-3 px-lg-4 py-4 py-lg-5">
    <div v-show="!showCheckout" class="cart-page-content">
    <div class="cart-page-header mb-4">
      <span class="cart-eyebrow">Tus selecciones</span>
      <div class="d-flex flex-wrap align-items-end justify-content-between gap-3">
        <div><h1>Carrito</h1><p class="text-secondary mb-0">{{ itemCount }} {{ itemCount === 1 ? 'juego seleccionado' : 'juegos seleccionados' }}</p></div>
        <button v-if="items.length" class="btn btn-outline-danger" type="button" @click="emptyCart">Vaciar carrito</button>
      </div>
    </div>

    <section v-if="!items.length" class="cart-empty card border-0">
      <div class="card-body text-center py-5 px-4">
        <div class="cart-empty-icon-wrap"><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i></div>
        <h2>Tu carrito está vacío</h2>
        <p class="text-secondary mb-4">Explorá el catálogo y encontrá tu próximo juego indie.</p>
        <button class="btn btn-primary px-4" type="button" @click="router.push('/')">Explorar juegos</button>
      </div>
    </section>

    <div v-else class="row g-4 align-items-start">
      <section class="col-lg-8">
        <article v-for="item in items" :key="item.ID" class="cart-item card border-0 mb-3">
          <div class="row g-0">
            <div class="col-sm-auto">
              <button class="cart-item-cover-button" type="button" :aria-label="'Ver ' + item.titulo" @click="router.push('/juegos/' + item.ID)">
                <img v-if="item.img_principal" class="cart-item-image" :src="imageUrl(item)" :alt="item.titulo">
                <span v-else class="cart-item-placeholder"><i class="fa-solid fa-gamepad" aria-hidden="true"></i></span>
              </button>
            </div>
            <div class="col-sm">
              <div class="cart-item-body">
                <div class="cart-item-copy">
                  <a href="#" class="cart-item-title" @click.prevent="router.push('/juegos/' + item.ID)">{{ item.titulo }}</a>
                  <span class="cart-item-developer">{{ item.desarrollador || 'Desarrollador indie' }}</span>
                  <span class="cart-item-description">{{ item.descripcion ? (item.descripcion.length > 110 ? item.descripcion.slice(0, 110).trim() + '...' : item.descripcion) : 'Descripción breve no disponible.' }}</span>
                  <label class="cart-item-platform-label">Plataforma
                    <select class="form-select form-select-sm" :value="item.plataforma || ''" :aria-label="'Plataforma para ' + item.titulo" @change="changePlatform(item, $event)">
                      <option value="" disabled>Elegí una plataforma</option>
                      <option v-for="platform in item.plataformas || []" :key="platform" :value="platform">{{ platform }}</option>
                    </select>
                  </label>
                  <span v-if="!(item.plataformas || []).length" class="small text-danger mt-1">Sin plataformas configuradas.</span>
                  <span class="cart-item-unit-price"><del v-if="item.oferta_activa && Number(item.precio_original || 0) > 0">\${{ Number(item.precio_original || 0).toFixed(2) }}</del><strong v-if="Number(item.precio || 0) === 0" class="game-price-free">Gratis</strong><strong v-else>\${{ Number(item.precio || 0).toFixed(2) }}</strong><span v-if="item.oferta_activa" class="badge text-bg-danger ms-1">Oferta</span></span>
                </div>
                <div class="cart-item-actions">
                  <strong class="cart-item-price"><del v-if="item.oferta_activa && Number(item.precio_original || 0) > 0" class="cart-item-original-price">\${{ Number(item.precio_original || 0).toFixed(2) }}</del><span v-if="Number(item.precio || 0) === 0" class="game-price-free">Gratis</span><template v-else>\${{ Number(item.precio || 0).toFixed(2) }}</template></strong>
                  <button class="btn btn-link cart-remove" type="button" aria-label="Eliminar del carrito" @click="remove(item)"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      <aside class="col-lg-4">
        <section class="cart-summary card border-0 sticky-lg-top">
          <div class="card-body p-4">
            <h2>Resumen de compra</h2>
            <div class="cart-summary-row"><span>Subtotal</span><strong v-if="items.length && total === 0" class="game-price-free">Gratis</strong><strong v-else>\${{ Number(total).toFixed(2) }}</strong></div>
            <hr>
            <div class="cart-total"><span>Total</span><strong v-if="items.length && total === 0" class="game-price-free">Gratis</strong><strong v-else>\${{ Number(total).toFixed(2) }}</strong></div>
            <button class="btn btn-success w-100 mt-3" type="button" @click="openCheckout">Finalizar compra</button>
          </div>
        </section>
      </aside>
    </div>
    </div>

    <div v-if="paymentComplete" class="cart-payment-success" role="status">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      <div><strong>Pago aprobado</strong><span>Esta fue una compra simulada.</span></div>
      <button class="btn btn-primary" type="button" @click="paymentComplete = false; router.push('/')">Volver al catálogo</button>
    </div>

    <div v-if="showCheckout" class="cart-checkout-backdrop" role="presentation" @click.self="closeCheckout">
      <section class="cart-checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div class="cart-checkout-header"><div><span>Pago seguro de demostración</span><h2 id="checkout-title">Finalizar compra</h2></div><button class="btn-close" type="button" aria-label="Cerrar" :disabled="processingPayment" @click="closeCheckout"></button></div>
        <div class="cart-checkout-total"><span>Total a pagar</span><strong v-if="items.length && total === 0" class="game-price-free">Gratis</strong><strong v-else>\${{ Number(total).toFixed(2) }}</strong></div>
        <form @submit.prevent="simulatePayment">
          <label class="form-label" for="checkout-name">Nombre en la tarjeta</label><input id="checkout-name" class="form-control mb-3" value="Usuario de prueba" required>
          <label class="form-label" for="checkout-card">Número de tarjeta</label><input id="checkout-card" class="form-control mb-3" inputmode="numeric" value="4242 4242 4242 4242" required>
          <div class="row g-3"><div class="col-6"><label class="form-label" for="checkout-expiry">Vencimiento</label><input id="checkout-expiry" class="form-control" value="12/30" required></div><div class="col-6"><label class="form-label" for="checkout-cvc">CVC</label><input id="checkout-cvc" class="form-control" inputmode="numeric" value="123" required></div></div>
          <button class="btn btn-success w-100 mt-4" type="submit" :disabled="processingPayment"><span v-if="processingPayment" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>{{ processingPayment ? 'Procesando pago...' : 'Pagar' }}</button>
        </form>
      </section>
    </div>
  </main>`
};
