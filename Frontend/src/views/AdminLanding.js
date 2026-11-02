import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from '../../assets/js/lib/vue-esm.js';
import { getCategorias, getColecciones, getJuegos, getLandingConfig, saveLandingConfig } from '../services/api.js';
import { confirmAction, showToast } from '../services/confirm.js';
import LandingContent from '../components/LandingContent.js';
import LandingPreviewNavbar from '../components/LandingPreviewNavbar.js';

const STORAGE_KEY = 'indiAR_landing_config';
const defaults = { title: 'Novedades para ti', mode: 'todos', categoryId: '', collectionId: '', categoryIds: [], collectionIds: [], limit: 8, featuredIds: [], carouselGameIds: [] };

export default {
  name: 'AdminLanding',
  components: { LandingContent, LandingPreviewNavbar },
  setup() {
    const juegos = ref([]);
    const categorias = ref([]);
    const colecciones = ref([]);
    const config = ref({ ...defaults });
    getLandingConfig().then(saved => { if (saved) config.value = { ...defaults, ...saved }; })
      .catch(error => { console.error('No se pudo cargar la configuración de la landing:', error); showToast('No se pudo cargar la configuración de la landing.', 'error'); });
    const featuredSearch = ref('');
    const carouselSearch = ref('');
    const previewMode = ref('desktop');
    const previewTheme = ref('light');
    const previewMenuOpen = ref(false);
    const previewFrame = ref(null);
    const previewViewport = ref(null);
    const previewScale = ref(1);
    const previewContentHeight = ref(0);
    let previewResizeObserver;
    const filteredGames = computed(() => juegos.value.filter(game => game.titulo.toLowerCase().includes(featuredSearch.value.toLowerCase())));
    const filteredCarouselGames = computed(() => juegos.value
      .filter(game => game.activo !== false)
      .filter(game => String(game.titulo || '').toLocaleLowerCase('es').includes(carouselSearch.value.toLocaleLowerCase('es'))));
    const selectedCarouselGames = computed(() => {
      const byId = new Map(juegos.value.map(game => [String(game.ID), game]));
      return (config.value.carouselGameIds || []).map(id => byId.get(String(id))).filter(Boolean);
    });
    function updatePreviewDimensions() {
      if (previewMode.value === 'mobile') {
        previewScale.value = 1;
        previewContentHeight.value = 0;
        return;
      }
      const viewportWidth = 1200;
      previewScale.value = Math.min(1, (previewFrame.value?.clientWidth || viewportWidth) / viewportWidth);
      previewContentHeight.value = previewViewport.value?.scrollHeight || 0;
    }
    onMounted(() => {
      previewTheme.value = localStorage.getItem('indiAR_theme') || 'light';
      previewResizeObserver = new ResizeObserver(updatePreviewDimensions);
      if (previewFrame.value) previewResizeObserver.observe(previewFrame.value);
      if (previewViewport.value) previewResizeObserver.observe(previewViewport.value);
      updatePreviewDimensions();
    });
    watch(previewMode, async () => {
      await nextTick();
      previewResizeObserver?.disconnect();
      if (previewFrame.value) previewResizeObserver?.observe(previewFrame.value);
      if (previewViewport.value) previewResizeObserver?.observe(previewViewport.value);
      updatePreviewDimensions();
    });
    onBeforeUnmount(() => previewResizeObserver?.disconnect());
    getJuegos().then(items => { juegos.value = items; })
      .catch(error => { console.error('No se pudieron cargar los juegos para la landing:', error); showToast('No se pudieron cargar los juegos.', 'error'); });
    getCategorias().then(items => { categorias.value = items; })
      .catch(error => { console.error('No se pudieron cargar los géneros:', error); showToast('No se pudieron cargar los géneros.', 'error'); });
    getColecciones().then(items => { colecciones.value = items; })
      .catch(error => { console.error('No se pudieron cargar las colecciones:', error); showToast('No se pudieron cargar las colecciones.', 'error'); });

    function toggleId(field, value, maximum = null) {
      const id = String(value);
      const ids = [...(config.value[field] || [])].map(String);
      if (ids.includes(id)) config.value[field] = ids.filter(item => item !== id);
      else if (!maximum || ids.length < maximum) config.value[field] = [...ids, id];
    }
    function toggleFeatured(gameId) { toggleId('featuredIds', gameId); }
    function toggleCarouselGame(gameId) {
      toggleId('carouselGameIds', gameId);
    }
    function moveCarouselGame(index, direction) {
      const ids = [...(config.value.carouselGameIds || [])];
      const target = index + direction;
      if (target < 0 || target >= ids.length) return;
      [ids[index], ids[target]] = [ids[target], ids[index]];
      config.value.carouselGameIds = ids;
    }
    function carouselGameOrder(gameId) {
      const index = (config.value.carouselGameIds || []).map(String).indexOf(String(gameId));
      return index < 0 ? null : index + 1;
    }
    async function save() {
      if (!await confirmAction('¿Publicar esta configuración en la página principal?', 'Guardar landing page', 'Publicar')) return;
      const { response } = await saveLandingConfig(config.value);
      if (!response.ok) {
        showToast('No se pudo publicar la configuración.', 'error');
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value));
      showToast('Configuración de la landing page publicada.', 'success');
    }
    async function restore() {
      if (!await confirmAction('¿Restaurar la configuración predeterminada?', 'Restaurar landing page', 'Restaurar', 'warning')) return;
      const restoredConfig = { ...defaults, featuredIds: [], carouselGameIds: [] };
      const { response } = await saveLandingConfig(restoredConfig);
      if (!response.ok) {
        showToast('No se pudo restaurar la configuración.', 'error');
        return;
      }
      config.value = restoredConfig;
      localStorage.removeItem(STORAGE_KEY);
      showToast('Configuración restaurada.', 'success');
    }
    return { config, juegos, categorias, colecciones, filteredGames, featuredSearch, filteredCarouselGames, carouselSearch, selectedCarouselGames, carouselGameOrder, previewMode, previewTheme, previewMenuOpen, previewFrame, previewViewport, previewScale, previewContentHeight, updatePreviewDimensions, toggleId, toggleFeatured, toggleCarouselGame, moveCarouselGame, save, restore };
  },
  template: `<main class="admin-page"><div class="container-fluid px-3 px-lg-4 py-4 py-lg-5">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><div><h1 class="h2 mb-1">Landing page</h1><p class="text-secondary mb-0">Configurá la portada y mirá los cambios en tiempo real.</p></div><button class="btn btn-primary" type="button" @click="save">Guardar cambios</button></div>
    <div class="row g-4 align-items-start">
      <div class="col-12 col-lg-4 landing-editor-options">
        <section class="card border-0 shadow-sm"><div class="card-body p-4">
          <h2 class="h5 mb-3">Sección principal</h2><div class="mb-3"><label class="form-label" for="landing-title">Título</label><input id="landing-title" v-model="config.title" class="form-control" maxlength="80" required></div>
          <div class="mb-3"><label class="form-label" for="landing-mode">Mostrar juegos</label><select id="landing-mode" v-model="config.mode" class="form-select"><option value="todos">Todos los juegos activos</option><option value="categoria">Por género</option><option value="coleccion">Por colección</option><option value="destacados">Seleccionados destacados</option></select></div>
          <div v-if="config.mode === 'categoria'" class="mb-3"><label class="form-label">Géneros a mostrar</label><div class="landing-selection-list"><label v-for="item in categorias" :key="item.ID" class="landing-game-option"><input type="checkbox" class="form-check-input" :checked="(config.categoryIds || []).map(String).includes(String(item.ID))" @change="toggleId('categoryIds', item.ID)"><span>{{ item.nombre }}</span></label></div></div>
          <div v-if="config.mode === 'coleccion'" class="mb-3"><label class="form-label">Colecciones a mostrar</label><div class="small text-secondary mb-2">Podés elegir hasta 4 colecciones.</div><div class="landing-selection-list"><label v-for="item in colecciones" :key="item.ID" class="landing-game-option"><input type="checkbox" class="form-check-input" :checked="(config.collectionIds || []).map(String).includes(String(item.ID))" :disabled="!(config.collectionIds || []).map(String).includes(String(item.ID)) && (config.collectionIds || []).length >= 4" @change="toggleId('collectionIds', item.ID, 4)"><span>{{ item.nombre }}</span></label></div></div>
          <div class="mb-3"><label class="form-label" for="landing-limit">Máximo de juegos</label><input id="landing-limit" v-model.number="config.limit" class="form-control" type="number" min="1" max="24"></div>
          <div class="d-flex justify-content-end gap-2"><button class="btn btn-outline-secondary" type="button" @click="restore">Restaurar</button><button class="btn btn-primary" type="button" @click="save">Guardar sección</button></div>
        </div></section>
        <section v-if="config.mode === 'destacados'" class="card border-0 shadow-sm mt-4"><div class="card-body p-4"><h2 class="h5">Juegos destacados</h2><input v-model="featuredSearch" type="search" class="form-control mb-3" placeholder="Buscar juego"><div class="landing-game-picker"><label v-for="game in filteredGames" :key="game.ID" class="landing-game-option"><input type="checkbox" class="form-check-input" :checked="(config.featuredIds || []).map(String).includes(String(game.ID))" @change="toggleFeatured(game.ID)"><span><strong>{{ game.titulo }}</strong><small class="d-block text-secondary">{{ game.desarrollador }}</small></span></label></div></div></section>
        <section class="card border-0 shadow-sm mt-4"><div class="card-body p-4">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3"><div><h2 class="h5 mb-1">Carrusel de portada</h2><p class="small text-secondary mb-0">Elegí los juegos y ordená cómo aparecerán.</p></div><span class="badge text-bg-light border">{{ selectedCarouselGames.length }} seleccionados</span></div>
          <label class="form-label" for="carousel-search">Buscar juegos</label><input id="carousel-search" v-model="carouselSearch" type="search" class="form-control mb-3" placeholder="Buscar por nombre">
          <div class="landing-game-picker"><label v-for="game in filteredCarouselGames" :key="game.ID" class="landing-game-option"><input type="checkbox" class="form-check-input" :checked="carouselGameOrder(game.ID) !== null" @change="toggleCarouselGame(game.ID)"><span class="flex-grow-1"><strong>{{ game.titulo }}</strong><small class="d-block text-secondary">\${{ Number(game.precio || 0).toFixed(2) }}</small></span><span v-if="carouselGameOrder(game.ID)" class="badge text-bg-primary">{{ carouselGameOrder(game.ID) }}</span></label></div>
          <ol v-if="selectedCarouselGames.length" class="list-group list-group-numbered mt-3">
            <li v-for="(game, index) in selectedCarouselGames" :key="game.ID" class="list-group-item d-flex align-items-center gap-2">
              <span class="flex-grow-1">{{ game.titulo }}</span>
              <button class="btn btn-sm btn-outline-secondary" type="button" :disabled="index === 0" :aria-label="'Mover ' + game.titulo + ' hacia arriba'" @click="moveCarouselGame(index, -1)">Subir</button>
              <button class="btn btn-sm btn-outline-secondary" type="button" :disabled="index === selectedCarouselGames.length - 1" :aria-label="'Mover ' + game.titulo + ' hacia abajo'" @click="moveCarouselGame(index, 1)">Bajar</button>
              <button class="btn btn-sm btn-outline-danger" type="button" :aria-label="'Quitar ' + game.titulo" @click="toggleCarouselGame(game.ID)">Quitar</button>
            </li>
          </ol>
        </div></section>
      </div>
      <div class="col-12 col-lg-8">
        <div class="landing-page-preview-heading"><div><span class="badge text-bg-primary mb-2">Vista previa en vivo</span><p class="small text-secondary mb-0">Carrusel y catálogo con la configuración actual.</p></div><div class="btn-group btn-group-sm" role="group" aria-label="Tamaño de vista previa"><button class="btn" :class="previewMode === 'desktop' ? 'btn-primary' : 'btn-outline-primary'" type="button" :aria-pressed="previewMode === 'desktop'" @click="previewMode = 'desktop'"><i class="fa-solid fa-desktop me-1" aria-hidden="true"></i>Escritorio</button><button class="btn" :class="previewMode === 'mobile' ? 'btn-primary' : 'btn-outline-primary'" type="button" :aria-pressed="previewMode === 'mobile'" @click="previewMode = 'mobile'"><i class="fa-solid fa-mobile-screen-button me-1" aria-hidden="true"></i>Móvil</button></div></div>
        <div ref="previewFrame" class="landing-preview-frame" :class="'landing-preview-frame--' + previewMode" aria-label="Vista previa de la página principal">
          <div v-if="previewMode === 'desktop'" class="landing-preview-stage" :style="{ height: (previewContentHeight * previewScale) + 'px' }">
            <div ref="previewViewport" class="landing-preview-viewport landing-preview-viewport--desktop" :data-bs-theme="previewTheme" :style="{ transform: 'scale(' + previewScale + ')' }">
              <LandingPreviewNavbar :theme="previewTheme" :games="juegos" @toggle-theme="previewTheme = previewTheme === 'dark' ? 'light' : 'dark'" />
              <LandingContent :config="config" :games="juegos" carousel-id="adminLandingPreviewDesktopCarousel" />
            </div>
          </div>
          <div v-else ref="previewViewport" class="landing-preview-viewport landing-preview-viewport--mobile" :data-bs-theme="previewTheme">
            <LandingPreviewNavbar :mobile="true" :theme="previewTheme" :menu-open="previewMenuOpen" :games="juegos" @toggle-menu="previewMenuOpen = !previewMenuOpen" @toggle-theme="previewTheme = previewTheme === 'dark' ? 'light' : 'dark'" />
            <LandingContent :config="config" :games="juegos" carousel-id="adminLandingPreviewMobileCarousel" />
          </div>
        </div>
      </div>
    </div>
  </div></main>`
};
