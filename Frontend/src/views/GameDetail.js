import { ref } from '../../assets/js/lib/vue-esm.js';
import router from '../router.js';
import { API_BASE, request } from '../services/api.js';
import { addToCart, isInCart } from '../services/cart.js';
import { showToast } from '../services/confirm.js';

export default {
  name: 'GameDetail',
  setup() {
    const game = ref(null);
    const loading = ref(true);
    const warning = ref('');
    const gallery = ref([]);
    const requirements = ref(null);
    const selectedPlatform = ref('');
    const imageUrl = computedUrl();

    async function load() {
      const response = await request(`/juegos/${router.currentRoute.value.params.id}`);
      if (!response.ok) warning.value = 'No se pudo cargar el juego.';
      else {
        game.value = await response.json();
        const [imagesResponse, requirementsResponse] = await Promise.all([
          request(`/juegos/${game.value.ID}/imagenes`),
          request(`/requisitos/${game.value.requisitosID}`),
        ]);
        if (imagesResponse.ok) gallery.value = await imagesResponse.json();
        if (requirementsResponse.ok) requirements.value = await requirementsResponse.json();
      }
      loading.value = false;
    }

    function isLoggedIn() { return Boolean(localStorage.getItem('indiAR_token') && JSON.parse(localStorage.getItem('indiAR_user') || 'null')); }
    function addGame() {
      if (!isLoggedIn()) {
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath, intent: 'add-to-cart' } });
        return;
      }
      if (isInCart(game.value.ID)) {
        showToast(`${game.value.titulo} ya está en el carrito.`, 'warning');
        return;
      }
      if (!(game.value.plataformas || []).length) {
        showToast('Este juego todavía no tiene plataformas configuradas.', 'warning');
        return;
      }
      if (!selectedPlatform.value) {
        showToast('Elegí una plataforma antes de añadir el juego.', 'warning');
        return;
      }
      addToCart(game.value, selectedPlatform.value);
      showToast(`${game.value.titulo} para ${selectedPlatform.value} se añadió al carrito.`, 'success');
    }

    function computedUrl() { return game => game?.img_principal?.startsWith('http') ? game.img_principal : `${API_BASE.replace('/api', '')}${game?.img_principal || ''}`; }
    function formatDate(value) { if (!value) return 'No informado'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(date); }
    load();
    return { game, loading, warning, gallery, requirements, imageUrl, addGame, formatDate, selectedPlatform, router };
  },
  template: `<main class="game-detail-page container-fluid px-3 px-lg-4 py-4 py-lg-5">
    <div v-if="loading" class="game-detail-state text-center py-5">Cargando juego...</div>
    <div v-else-if="warning" class="alert alert-danger mx-auto game-detail-state">{{ warning }}</div>
    <article v-else class="game-detail-card card border-0 mx-auto">
      <button class="btn game-detail-back" type="button" @click="router.push('/')"><i class="fa-solid fa-arrow-left"></i><span>Volver al catálogo</span></button>
      <div class="game-detail-layout">
        <div class="game-detail-media">
          <div v-if="gallery.length" :id="'game-gallery-' + game.ID" class="carousel slide game-detail-carousel" data-bs-ride="carousel">
            <div class="carousel-inner">
              <div v-for="(image, index) in gallery" :key="image.ID || index" class="carousel-item" :class="{ active: index === 0 }"><img class="game-detail-image" :src="imageUrl({ img_principal: image.url })" :alt="game.titulo + ' captura ' + (index + 1)"></div>
            </div>
            <button v-if="gallery.length > 1" class="carousel-control-prev" type="button" :data-bs-target="'#game-gallery-' + game.ID" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span><span class="visually-hidden">Anterior</span></button>
            <button v-if="gallery.length > 1" class="carousel-control-next" type="button" :data-bs-target="'#game-gallery-' + game.ID" data-bs-slide="next"><span class="carousel-control-next-icon"></span><span class="visually-hidden">Siguiente</span></button>
            <div v-if="gallery.length > 1" class="game-detail-thumbnails" aria-label="Miniaturas de capturas">
              <button v-for="(image, index) in gallery" :key="'thumb-' + (image.ID || index)" type="button" :data-bs-target="'#game-gallery-' + game.ID" :data-bs-slide-to="index" :class="{ active: index === 0 }" :aria-label="'Mostrar captura ' + (index + 1)"><img :src="imageUrl({ img_principal: image.url })" :alt="''"></button>
            </div>
          </div>
          <img v-else-if="game.img_principal" class="game-detail-image" :src="imageUrl(game)" :alt="game.titulo">
          <div v-else class="game-detail-placeholder"><i class="fa-solid fa-gamepad"></i></div>
        </div>
        <div class="game-detail-content">
          <div class="game-detail-kicker"><span>Juego indie</span><span>{{ formatDate(game.lanzamiento) || 'Fecha por definir' }}</span></div>
          <h1>{{ game.titulo }}</h1>
          <p class="game-detail-developer">por {{ game.desarrollador || 'Desarrollador indie' }}</p>
          <p class="game-detail-description">{{ game.descripcion || 'Descubrí este juego indie disponible en IndiAR.' }}</p>
          <div v-if="(game.categorias || []).length || (game.colecciones || []).length" class="game-detail-tags">
            <span v-for="category in game.categorias || []" :key="'category-' + category.ID">{{ category.nombre }}</span>
            <span v-for="collection in game.colecciones || []" :key="'collection-' + collection.ID">{{ collection.nombre }}</span>
          </div>
          <div class="game-detail-purchase">
            <div><span>Precio</span><del v-if="game.oferta_activa && Number(game.precio || 0) > 0" class="game-detail-original-price">\${{ Number(game.precio || 0).toFixed(2) }}</del><strong v-if="Number(game.precio_final ?? game.precio ?? 0) === 0" class="game-detail-price game-price-free">Gratis</strong><strong v-else class="game-detail-price">\${{ Number(game.precio_final ?? game.precio ?? 0).toFixed(2) }}</strong><span v-if="game.oferta_activa" class="badge text-bg-danger align-self-start">Oferta vigente</span></div>
            <label class="game-detail-platform-select"><span>Plataforma</span><select v-model="selectedPlatform" class="form-select" :disabled="!(game.plataformas || []).length"><option value="" disabled>Elegí una plataforma</option><option v-for="platform in game.plataformas || []" :key="platform" :value="platform">{{ platform }}</option></select></label>
            <button class="btn btn-primary btn-lg" type="button" @click="addGame"><i class="fa-solid fa-cart-plus"></i>Añadir al carrito</button>
          </div>
          <p v-if="!(game.plataformas || []).length" class="text-danger small mt-2">Este juego todavía no tiene plataformas configuradas.</p>
        </div>
      </div>
    </article>

    <section v-if="game" class="game-detail-info-grid">
      <article class="game-detail-panel">
        <h2>Información del juego</h2>
        <dl>
          <div><dt>Géneros</dt><dd>{{ (game.categorias || []).map(item => item.nombre).join(', ') || 'Sin géneros' }}</dd></div>
          <div><dt>Fecha de publicación</dt><dd>{{ formatDate(game.lanzamiento) }}</dd></div>
          <div><dt>Fecha de subida</dt><dd>{{ formatDate(game.fecha_subida) }}</dd></div>
          <div><dt>Distribuidor</dt><dd>{{ game.distribuidor || 'No informado' }}</dd></div>
        </dl>
      </article>
      <article class="game-detail-panel">
        <h2>Compatibilidad</h2>
        <div class="game-detail-platforms"><span v-for="platform in (game.plataformas || [])" :key="platform"><i class="fa-solid fa-desktop"></i>{{ platform }}</span><span v-if="!(game.plataformas || []).length">Sin plataformas informadas</span></div>
        <h3>Idiomas disponibles</h3>
        <p>{{ (game.idiomas || []).join(', ') || 'No informado' }}</p>
      </article>
    </section>

    <section v-if="game && requirements" class="game-detail-panel game-detail-requirements">
      <h2>Requisitos del sistema</h2>
      <div class="game-detail-requirements-grid">
        <article><h3>Mínimos</h3><dl><div><dt>Procesador</dt><dd>{{ requirements.procesador_min || 'Por definir' }}</dd></div><div><dt>RAM</dt><dd>{{ requirements.ram_min || 'Por definir' }}</dd></div><div><dt>Gráficos</dt><dd>{{ requirements.gpu_min || 'Por definir' }}</dd></div><div><dt>Almacenamiento</dt><dd>{{ requirements.almacenamiento_min || 'Por definir' }}</dd></div><div><dt>Sistema</dt><dd>{{ requirements.sistema_min || 'Por definir' }}</dd></div></dl></article>
        <article><h3>Recomendados</h3><dl><div><dt>Procesador</dt><dd>{{ requirements.procesador_rec || 'Por definir' }}</dd></div><div><dt>RAM</dt><dd>{{ requirements.ram_rec || 'Por definir' }}</dd></div><div><dt>Gráficos</dt><dd>{{ requirements.gpu_rec || 'Por definir' }}</dd></div><div><dt>Almacenamiento</dt><dd>{{ requirements.almacenamiento_rec || 'Por definir' }}</dd></div><div><dt>Sistema</dt><dd>{{ requirements.sistema_rec || 'Por definir' }}</dd></div></dl></article>
      </div>
    </section>

    <section v-if="game" class="game-detail-panel game-detail-reviews">
      <div class="d-flex align-items-center justify-content-between gap-3"><h2 class="mb-0">Reseñas</h2><span class="badge text-bg-secondary">Próximamente</span></div>
      <p class="text-secondary mb-0 mt-3">La sección de reseñas estará disponible próximamente.</p>
    </section>
  </main>`
};
