import { ref, computed } from '../../assets/js/lib/vue-esm.js';
import router from '../router.js';
import { getJuegos, getLandingConfig } from '../services/api.js';
import { addToCart, isInCart } from '../services/cart.js';
import { showToast } from '../services/confirm.js';
import LandingContent from '../components/LandingContent.js';

export default {
  name: 'Home',
  components: { LandingContent },
  setup() {
    const games = ref([]);
    const selectedGame = ref(null);
    const selectedPlatform = ref('');
    const showPlatformPicker = ref(false);
    const searchTerm = computed(() => String(router.currentRoute.value.query.buscar || '').trim());
    const config = ref({ title: 'Novedades para ti', mode: 'todos', categoryId: '', collectionId: '', categoryIds: [], collectionIds: [], limit: 8, featuredIds: [], carouselGameIds: [] });
    getLandingConfig().then(saved => { if (saved) config.value = { ...config.value, ...saved }; })
      .catch(error => console.error('No se pudo cargar la configuración de la landing:', error));
    function isLoggedIn() { return Boolean(localStorage.getItem('indiAR_token') && JSON.parse(localStorage.getItem('indiAR_user') || 'null')); }
    function addGame(game) {
      if (!isLoggedIn()) { router.push({ path: '/login', query: { redirect: '/juegos/' + game.ID, intent: 'add-to-cart' } }); return; }
      if (isInCart(game.ID)) {
        showToast(`${game.titulo} ya está en el carrito.`, 'warning');
        return;
      }
      selectedGame.value = game;
      selectedPlatform.value = '';
      showPlatformPicker.value = true;
    }
    function confirmAddToCart() {
      if (!selectedGame.value || !selectedPlatform.value) return;
      addToCart(selectedGame.value, selectedPlatform.value);
      showToast(`${selectedGame.value.titulo} para ${selectedPlatform.value} se añadió al carrito.`, 'success');
      showPlatformPicker.value = false;
    }
    function openGame(game) { router.push('/juegos/' + game.ID); }
    getJuegos().then(items => { games.value = items; })
      .catch(error => console.error('No se pudieron cargar los juegos de la portada:', error));
    function clearSearch() { router.push('/'); }
    return { router, games, config, searchTerm, addGame, openGame, clearSearch, selectedGame, selectedPlatform, showPlatformPicker, confirmAddToCart };
  },
  template: `
    <main>
      <LandingContent :config="config" :games="games" :search-term="searchTerm" carousel-id="homeCarousel" interactive @open-game="openGame" @add-game="addGame" @clear-search="clearSearch" />
      <div v-if="showPlatformPicker" class="cart-checkout-backdrop" role="presentation" @click.self="showPlatformPicker = false">
        <section class="cart-checkout-modal" role="dialog" aria-modal="true" aria-labelledby="platform-picker-title">
          <div class="cart-checkout-header"><div><span>Compatibilidad</span><h2 id="platform-picker-title">Elegí una plataforma</h2></div><button class="btn-close" type="button" aria-label="Cerrar" @click="showPlatformPicker = false"></button></div>
          <p class="text-secondary mt-3">{{ selectedGame.titulo }}</p>
          <label class="form-label" for="card-game-platform">Plataforma</label>
          <select id="card-game-platform" v-model="selectedPlatform" class="form-select">
            <option value="" disabled>Seleccioná una plataforma</option>
            <option v-for="platform in selectedGame.plataformas || []" :key="platform" :value="platform">{{ platform }}</option>
          </select>
          <p v-if="!(selectedGame.plataformas || []).length" class="text-danger small mt-2 mb-0">Este juego todavía no tiene plataformas configuradas.</p>
          <button class="btn btn-primary w-100 mt-4" type="button" :disabled="!selectedPlatform" @click="confirmAddToCart">Añadir al carrito</button>
        </section>
      </div>
    </main>
  `
};
