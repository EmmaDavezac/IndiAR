import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from '../../assets/js/lib/vue-esm.js';
import { API_BASE, getCategorias, getColecciones, getJuegos, getLandingConfig, saveLandingConfig } from '../services/api.js?v=20261102d';
import { confirmAction, showToast } from '../services/confirm.js';
import LandingContent from '../components/LandingContent.js?v=20261103b';
import LandingPreviewNavbar from '../components/LandingPreviewNavbar.js?v=20261103a';

const STORAGE_KEY = 'indiAR_landing_config';
const defaults = { title: 'Novedades para ti', mode: 'todos', categoryId: '', collectionId: '', categoryIds: [], collectionIds: [], limit: 8, featuredIds: [], carouselGameIds: [], taxonomySectionsEnabled: true, hiddenCategoryIds: [], hiddenCollectionIds: [] };
const createDefaultSection = () => ({ id: 'section-1', title: 'Novedades para ti', mode: 'todos', categoryIds: [], collectionIds: [], featuredIds: [], limit: 8 });

function normalizeConfig(saved = {}) {
  const config = {
    ...defaults,
    ...saved,
    taxonomySectionsEnabled: true,
    hiddenCategoryIds: Array.isArray(saved.hiddenCategoryIds) ? saved.hiddenCategoryIds.map(String) : [],
    hiddenCollectionIds: Array.isArray(saved.hiddenCollectionIds) ? saved.hiddenCollectionIds.map(String) : [],
  };
  if (Array.isArray(saved.sections) && saved.sections.length) {
    config.sections = saved.sections.map((section, index) => ({
      ...section,
      id: String(section.id || `section-${index + 1}`),
      title: section.title || `Sección ${index + 1}`,
      mode: section.mode || 'todos',
      categoryIds: section.categoryIds || [],
      collectionIds: section.collectionIds || [],
      featuredIds: section.featuredIds || [],
      limit: Number(section.limit) || 8,
    }));
  } else {
    config.sections = [{
      id: 'section-1',
      title: saved.title || defaults.title,
      mode: saved.mode || defaults.mode,
      categoryIds: saved.categoryIds?.length ? saved.categoryIds : [saved.categoryId].filter(Boolean),
      collectionIds: saved.collectionIds?.length ? saved.collectionIds : [saved.collectionId].filter(Boolean),
      featuredIds: saved.featuredIds || [],
      limit: Number(saved.limit) || defaults.limit,
    }];
  }
  return config;
}

export default {
  name: 'AdminLanding',
  components: { LandingContent, LandingPreviewNavbar },
  setup() {
    const juegos = ref([]);
    const categorias = ref([]);
    const colecciones = ref([]);
    const config = ref({ ...defaults, sections: [createDefaultSection()] });
    getLandingConfig().then(saved => { if (saved) config.value = normalizeConfig(saved); })
      .catch(error => { console.error('No se pudo cargar la configuración de la landing:', error); showToast('No se pudo cargar la configuración de la landing.', 'error'); });
    const activeTab = ref('carousel');
    const sectionSearch = ref('');
    const carouselSearch = ref('');
    const previewMode = ref('desktop');
    const previewTheme = ref('light');
    const previewMenuOpen = ref(false);
    const previewFrame = ref(null);
    const previewViewport = ref(null);
    const previewScale = ref(1);
    const previewContentHeight = ref(0);
    let previewResizeObserver;
    const filteredCategories = computed(() => categorias.value
      .filter(item => String(item.nombre || '').toLocaleLowerCase('es').includes(sectionSearch.value.toLocaleLowerCase('es')))
      .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')));
    const filteredCollections = computed(() => colecciones.value
      .filter(item => String(item.nombre || '').toLocaleLowerCase('es').includes(sectionSearch.value.toLocaleLowerCase('es')))
      .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')));
    const filteredCarouselGames = computed(() => juegos.value
      .filter(game => game.activo !== false)
      .filter(game => String(game.titulo || '').toLocaleLowerCase('es').includes(carouselSearch.value.toLocaleLowerCase('es'))));
    const selectedCarouselGames = computed(() => {
      const byId = new Map(juegos.value.map(game => [String(game.ID), game]));
      return (config.value.carouselGameIds || []).map(id => byId.get(String(id))).filter(Boolean);
    });
    function imageUrl(game) {
      if (!game.img_principal) return '';
      return game.img_principal.startsWith('http') ? game.img_principal : `${API_BASE.replace('/api', '')}${game.img_principal}`;
    }
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
    function toggleTaxonomyVisibility(field, value) {
      const id = String(value);
      const ids = [...(config.value[field] || [])].map(String);
      config.value[field] = ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id];
    }
    function isTaxonomyVisible(field, value) {
      return !(config.value[field] || []).map(String).includes(String(value));
    }
    function setTaxonomyVisibility(field, items, visible) {
      const currentIds = (config.value[field] || []).map(String);
      const itemIds = items.map(item => String(item.ID));
      config.value[field] = visible
        ? currentIds.filter(id => !itemIds.includes(id))
        : [...new Set([...currentIds, ...itemIds])];
    }
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
      const restoredConfig = { ...defaults, featuredIds: [], carouselGameIds: [], sections: [createDefaultSection()] };
      const { response } = await saveLandingConfig(restoredConfig);
      if (!response.ok) {
        showToast('No se pudo restaurar la configuración.', 'error');
        return;
      }
      config.value = restoredConfig;
      localStorage.removeItem(STORAGE_KEY);
      showToast('Configuración restaurada.', 'success');
    }
    return { config, juegos, filteredCategories, filteredCollections, sectionSearch, activeTab, categorias, colecciones, filteredCarouselGames, carouselSearch, selectedCarouselGames, carouselGameOrder, imageUrl, previewMode, previewTheme, previewMenuOpen, previewFrame, previewViewport, previewScale, previewContentHeight, updatePreviewDimensions, toggleId, toggleTaxonomyVisibility, isTaxonomyVisible, setTaxonomyVisibility, toggleCarouselGame, moveCarouselGame, save, restore };
  },
  template: `<main class="admin-page"><div class="container-fluid px-3 px-lg-4 py-4 py-lg-5">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><div><h1 class="h2 mb-1">Landing page</h1><p class="text-secondary mb-0">Configurá el carrusel principal y elegí qué secciones mostrar.</p></div><div class="d-flex gap-2"><button class="btn btn-outline-secondary" type="button" @click="restore">Restaurar</button><button class="btn btn-primary" type="button" @click="save">Guardar cambios</button></div></div>
    <section class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-body border-bottom-0 pt-3 px-3 px-lg-4"><ul class="nav nav-tabs admin-game-detail-tabs" role="tablist" aria-label="Configuración de la landing">
        <li class="nav-item" role="presentation"><button id="landing-carousel-tab" class="nav-link" :class="{ active: activeTab === 'carousel' }" type="button" role="tab" :aria-selected="activeTab === 'carousel'" aria-controls="landing-carousel-panel" @click="activeTab = 'carousel'">Carrusel de portada</button></li>
        <li class="nav-item" role="presentation"><button id="landing-sections-tab" class="nav-link" :class="{ active: activeTab === 'sections' }" type="button" role="tab" :aria-selected="activeTab === 'sections'" aria-controls="landing-sections-panel" @click="activeTab = 'sections'">Secciones de landing</button></li>
      </ul></div>
      <div v-if="activeTab === 'carousel'" id="landing-carousel-panel" class="card-body p-3 p-lg-4" role="tabpanel" aria-labelledby="landing-carousel-tab">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3"><div><h2 class="h5 mb-1">Juegos destacados</h2><p class="small text-secondary mb-0">Elegí los juegos del carrusel principal y ordená cómo aparecerán.</p></div><span class="badge text-bg-light border">{{ selectedCarouselGames.length }} seleccionados</span></div>
        <label class="form-label" for="carousel-search">Buscar juegos</label><input id="carousel-search" v-model="carouselSearch" type="search" class="form-control mb-3" placeholder="Buscar por nombre">
        <div class="landing-game-picker"><label v-for="game in filteredCarouselGames" :key="game.ID" class="landing-game-option"><input type="checkbox" class="form-check-input" :checked="carouselGameOrder(game.ID) !== null" @change="toggleCarouselGame(game.ID)"><img v-if="game.img_principal" class="landing-game-thumbnail" :src="imageUrl(game)" :alt="'Portada de ' + game.titulo" loading="lazy"><span v-else class="landing-game-thumbnail landing-game-thumbnail-placeholder" aria-hidden="true"><i class="fa-solid fa-gamepad"></i></span><span class="flex-grow-1"><strong>{{ game.titulo }}</strong><small class="d-block text-secondary">\${{ Number(game.precio || 0).toFixed(2) }}</small></span><span v-if="carouselGameOrder(game.ID)" class="badge text-bg-primary">{{ carouselGameOrder(game.ID) }}</span></label><p v-if="!filteredCarouselGames.length" class="small text-secondary mb-0">No hay juegos que coincidan con la búsqueda.</p></div>
        <ol v-if="selectedCarouselGames.length" class="list-group list-group-numbered mt-3">
          <li v-for="(game, index) in selectedCarouselGames" :key="game.ID" class="list-group-item d-flex align-items-center gap-2 landing-selected-game">
            <img v-if="game.img_principal" class="landing-game-thumbnail" :src="imageUrl(game)" :alt="'Portada de ' + game.titulo" loading="lazy">
            <span v-else class="landing-game-thumbnail landing-game-thumbnail-placeholder" aria-hidden="true"><i class="fa-solid fa-gamepad"></i></span>
            <span class="flex-grow-1">{{ game.titulo }}</span>
            <button class="btn btn-sm btn-outline-secondary" type="button" :disabled="index === 0" :aria-label="'Mover ' + game.titulo + ' hacia arriba'" @click="moveCarouselGame(index, -1)">Subir</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" :disabled="index === selectedCarouselGames.length - 1" :aria-label="'Mover ' + game.titulo + ' hacia abajo'" @click="moveCarouselGame(index, 1)">Bajar</button>
            <button class="btn btn-sm btn-outline-danger" type="button" :aria-label="'Quitar ' + game.titulo" @click="toggleCarouselGame(game.ID)">Quitar</button>
          </li>
        </ol>
      </div>
      <div v-else id="landing-sections-panel" class="card-body p-3 p-lg-4" role="tabpanel" aria-labelledby="landing-sections-tab">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3"><div><h2 class="h5 mb-1">Secciones por colección y género</h2><p class="small text-secondary mb-0">Las secciones se crean desde tus colecciones y géneros. Aquí solo elegís cuáles mostrar; las colecciones aparecen primero.</p></div></div>
        <label class="form-label" for="landing-section-search">Filtrar colecciones y géneros</label><input id="landing-section-search" v-model="sectionSearch" type="search" class="form-control mb-4" placeholder="Escribí un nombre">
        <section class="mb-4" aria-labelledby="landing-collections-heading">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2"><h3 id="landing-collections-heading" class="h6 mb-0">Colecciones <span class="text-secondary fw-normal">({{ colecciones.length }})</span></h3><div class="btn-group btn-group-sm" role="group" aria-label="Visibilidad de todas las colecciones"><button class="btn btn-outline-secondary" type="button" @click="setTaxonomyVisibility('hiddenCollectionIds', colecciones, true)">Mostrar todas</button><button class="btn btn-outline-secondary" type="button" @click="setTaxonomyVisibility('hiddenCollectionIds', colecciones, false)">Ocultar todas</button></div></div>
          <div v-if="filteredCollections.length" class="landing-taxonomy-list"><label v-for="item in filteredCollections" :key="item.ID" class="landing-taxonomy-option"><input type="checkbox" class="form-check-input" :checked="isTaxonomyVisible('hiddenCollectionIds', item.ID)" @change="toggleTaxonomyVisibility('hiddenCollectionIds', item.ID)"><span>{{ item.nombre }}</span></label></div>
          <p v-else class="small text-secondary mb-0">No hay colecciones que coincidan.</p>
        </section>
        <section aria-labelledby="landing-categories-heading">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2"><h3 id="landing-categories-heading" class="h6 mb-0">Géneros <span class="text-secondary fw-normal">({{ categorias.length }})</span></h3><div class="btn-group btn-group-sm" role="group" aria-label="Visibilidad de todos los géneros"><button class="btn btn-outline-secondary" type="button" @click="setTaxonomyVisibility('hiddenCategoryIds', categorias, true)">Mostrar todos</button><button class="btn btn-outline-secondary" type="button" @click="setTaxonomyVisibility('hiddenCategoryIds', categorias, false)">Ocultar todos</button></div></div>
          <div v-if="filteredCategories.length" class="landing-taxonomy-list"><label v-for="item in filteredCategories" :key="item.ID" class="landing-taxonomy-option"><input type="checkbox" class="form-check-input" :checked="isTaxonomyVisible('hiddenCategoryIds', item.ID)" @change="toggleTaxonomyVisibility('hiddenCategoryIds', item.ID)"><span>{{ item.nombre }}</span></label></div>
          <p v-else class="small text-secondary mb-0">No hay géneros que coincidan.</p>
        </section>
      </div>
    </section>
    <section class="card border-0 shadow-sm">
      <div class="card-body p-3 p-lg-4">
        <div class="landing-page-preview-heading"><div><span class="badge text-bg-primary mb-2">Vista previa en vivo</span><p class="small text-secondary mb-0">Así se verá la portada con la configuración actual.</p></div><div class="btn-group btn-group-sm" role="group" aria-label="Tamaño de vista previa"><button class="btn" :class="previewMode === 'desktop' ? 'btn-primary' : 'btn-outline-primary'" type="button" :aria-pressed="previewMode === 'desktop'" @click="previewMode = 'desktop'"><i class="fa-solid fa-desktop me-1" aria-hidden="true"></i>Escritorio</button><button class="btn" :class="previewMode === 'mobile' ? 'btn-primary' : 'btn-outline-primary'" type="button" :aria-pressed="previewMode === 'mobile'" @click="previewMode = 'mobile'"><i class="fa-solid fa-mobile-screen-button me-1" aria-hidden="true"></i>Móvil</button></div></div>
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
    </section>
  </div></main>`
};
