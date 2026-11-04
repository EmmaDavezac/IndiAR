import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from '../../assets/js/lib/vue-esm.js';
import { API_BASE } from '../services/api.js';

const defaultCarouselSlides = [
  { title: 'Nuevos lanzamientos', action: 'Explorar', variant: 'home-slide-primary' },
  { title: 'Ofertas de la semana', action: 'Ver ofertas', variant: 'home-slide-secondary' },
  { title: 'Indies destacados', action: 'Descubrir', variant: 'home-slide-tertiary' },
];
const MIN_CATEGORY_SECTION_GAMES = 3;

export default {
  name: 'LandingContent',
  props: {
    config: { type: Object, required: true },
    games: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    searchTerm: { type: String, default: '' },
    sectionId: { type: String, default: '' },
    carouselId: { type: String, required: true },
    interactive: { type: Boolean, default: false },
  },
  emits: ['open-game', 'add-game', 'clear-search', 'open-section', 'clear-section'],
  setup(props) {
    const sectionTracks = new Map();
    const sectionScrollStates = ref({});
    const imageStates = ref({});
    const imageUrl = game => game.img_principal?.startsWith('http') ? game.img_principal : `${API_BASE.replace('/api', '')}${game.img_principal || ''}`;
    const landingSections = computed(() => {
      if (props.config.taxonomySectionsEnabled) {
        const activeGames = props.games.filter(game => game.activo !== false);
        const categories = new Map();
        const categoryGameCounts = new Map();
        const collections = new Map();
        activeGames.forEach(game => {
          (game.colecciones || []).forEach(item => collections.set(String(item.ID), item));
          (game.categorias || []).forEach(item => {
            const id = String(item.ID);
            categories.set(id, item);
            categoryGameCounts.set(id, (categoryGameCounts.get(id) || 0) + 1);
          });
        });
        const hiddenCategories = (props.config.hiddenCategoryIds || []).map(String);
        const hiddenCollections = (props.config.hiddenCollectionIds || []).map(String);
        const byName = (a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
        return [
          ...[...collections.entries()]
            .filter(([id]) => !hiddenCollections.includes(id))
            .sort(([, a], [, b]) => byName(a, b))
            .map(([id, item]) => ({ id: `collection-${id}`, title: item.nombre, mode: 'coleccion', collectionIds: [id], limit: 10 })),
          ...[...categories.entries()]
            .filter(([id]) => !hiddenCategories.includes(id))
            .filter(([id]) => categoryGameCounts.get(id) >= MIN_CATEGORY_SECTION_GAMES)
            .sort(([, a], [, b]) => byName(a, b))
            .map(([id, item]) => ({ id: `category-${id}`, title: item.nombre, mode: 'categoria', categoryIds: [id], limit: 10 })),
        ];
      }
      if (Array.isArray(props.config.sections) && props.config.sections.length) {
        return props.config.sections.map((section, index) => ({ ...section, id: String(section.id || `section-${index + 1}`) }));
      }
      return [{
        id: 'novedades',
        title: props.config.title || 'Novedades para ti',
        mode: props.config.mode || 'todos',
        categoryIds: props.config.categoryIds?.length ? props.config.categoryIds : [props.config.categoryId].filter(Boolean),
        collectionIds: props.config.collectionIds?.length ? props.config.collectionIds : [props.config.collectionId].filter(Boolean),
        featuredIds: props.config.featuredIds || [],
        limit: props.config.limit || 8,
      }];
    });
    const carouselSlides = computed(() => {
      const selectedIds = props.config.carouselGameIds || [];
      if (!selectedIds.length) return defaultCarouselSlides;
      const gamesById = new Map(props.games.map(game => [String(game.ID), game]));
      const selectedGames = selectedIds
        .map(id => gamesById.get(String(id)))
        .filter(game => game && game.activo !== false);
      return selectedGames.length ? selectedGames.map(game => ({ game })) : defaultCarouselSlides;
    });
    const selectedSection = computed(() => landingSections.value.find(section => section.id === String(props.sectionId)));
    const displayedSections = computed(() => {
      if (props.loading) {
        return [{
          id: 'loading-sections',
          title: props.searchTerm.trim() ? 'Resultados para “' + props.searchTerm.trim() + '”' : 'Juegos para descubrir',
          mode: 'todos',
          limit: 4,
          isLoading: true,
        }];
      }
      if (props.sectionId) {
        return selectedSection.value && (selectedSection.value.mode !== 'categoria' || sectionGames(selectedSection.value).length >= MIN_CATEGORY_SECTION_GAMES)
          ? [selectedSection.value]
          : [];
      }
      if (props.searchTerm.trim()) return [{
        id: 'search-results',
        title: 'Resultados para “' + props.searchTerm.trim() + '”',
        mode: 'todos',
        limit: Number.MAX_SAFE_INTEGER,
        isSearch: true,
      }];
      return landingSections.value.filter(section => section.mode !== 'categoria' || sectionGames(section).length >= MIN_CATEGORY_SECTION_GAMES);
    });
    function imageKey(prefix, game) {
      return `${prefix}-${game.ID}-${game.img_principal || ''}`;
    }
    function imageLoaded(key) {
      return imageStates.value[key] === 'loaded';
    }
    function imageFailed(key) {
      return imageStates.value[key] === 'failed';
    }
    function setImageState(key, state) {
      imageStates.value = { ...imageStates.value, [key]: state };
    }
    function sectionGames(section) {
      const active = props.games.filter(game => game.activo !== false);
      let selected = active;
      if (section.mode === 'categoria') {
        const ids = (section.categoryIds || []).length ? section.categoryIds : [section.categoryId].filter(Boolean);
        selected = active.filter(game => (game.categorias || []).some(item => ids.map(String).includes(String(item.ID))));
      }
      if (section.mode === 'coleccion') {
        const ids = (section.collectionIds || []).length ? section.collectionIds : [section.collectionId].filter(Boolean);
        selected = active.filter(game => (game.colecciones || []).some(item => ids.map(String).includes(String(item.ID))));
      }
      if (section.mode === 'destacados') {
        selected = active.filter(game => (section.featuredIds || []).map(String).includes(String(game.ID)));
      }
      const search = props.searchTerm.trim().toLocaleLowerCase('es');
      if (search) {
        selected = selected.filter(game => [game.titulo, game.desarrollador, game.distribuidor, game.descripcion]
          .some(value => String(value || '').toLocaleLowerCase('es').includes(search)));
      }
      if (search || props.sectionId) return selected;
      return selected.slice(0, Number(section.limit) || 10);
    }
    function setSectionTrack(id, track) {
      if (track) sectionTracks.set(id, track);
      else sectionTracks.delete(id);
      if (track) nextTick(() => updateCardsPosition(id));
    }
    function updateCardsPosition(id) {
      const track = sectionTracks.get(id);
      if (!track) return;
      const atStart = track.scrollLeft <= 1;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      const currentState = sectionScrollStates.value[id];
      if (currentState?.atStart === atStart && currentState?.atEnd === atEnd) return;
      sectionScrollStates.value = {
        ...sectionScrollStates.value,
        [id]: { atStart, atEnd },
      };
    }
    function updateAllCardPositions() {
      sectionTracks.forEach((track, id) => updateCardsPosition(id));
    }
    function cardsAtStart(id) {
      return sectionScrollStates.value[id]?.atStart ?? true;
    }
    function cardsAtEnd(id) {
      return sectionScrollStates.value[id]?.atEnd ?? false;
    }
    function scrollCards(id, direction) {
      const track = sectionTracks.get(id);
      if (!track) return;
      const distance = direction * track.clientWidth * 0.85;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        track.scrollLeft += distance;
        updateCardsPosition(id);
        return;
      }
      track.scrollBy({ left: distance, behavior: 'smooth' });
    }
    onMounted(() => {
      requestAnimationFrame(updateAllCardPositions);
      window.addEventListener('resize', updateAllCardPositions);
    });
    onBeforeUnmount(() => window.removeEventListener('resize', updateAllCardPositions));
    watch([displayedSections, () => props.games], () => nextTick(updateAllCardPositions));
    return { imageUrl, imageKey, imageLoaded, imageFailed, setImageState, carouselSlides, displayedSections, sectionGames, setSectionTrack, sectionScrollStates, cardsAtStart, cardsAtEnd, updateCardsPosition, scrollCards };
  },
  template: `
    <div>
      <section v-if="loading" class="home-carousel home-carousel-skeleton container-fluid px-0" aria-label="Cargando destacados" role="status">
        <span class="home-skeleton-pulse"></span>
      </section>
      <section v-else class="home-carousel container-fluid px-0" aria-label="Destacados">
        <div :id="carouselId" class="carousel slide" :data-bs-ride="interactive ? 'carousel' : undefined">
          <div v-if="carouselSlides.length > 1" class="carousel-indicators">
            <button v-for="(slide, index) in carouselSlides" :key="index" type="button" :data-bs-target="'#' + carouselId" :data-bs-slide-to="index" :class="{ active: index === 0 }" :aria-current="index === 0 ? 'true' : undefined" :aria-label="slide.game?.titulo || slide.title"></button>
          </div>
          <div class="carousel-inner">
            <div v-for="(slide, index) in carouselSlides" :key="slide.game?.ID || slide.title" class="carousel-item home-slide" :class="[slide.variant, { active: index === 0, 'home-slide-game': !!slide.game }]">
              <span v-if="slide.game?.img_principal && !imageLoaded(imageKey('hero', slide.game)) && !imageFailed(imageKey('hero', slide.game))" class="home-slide-image-skeleton home-skeleton-pulse" aria-hidden="true"></span>
              <img v-if="slide.game?.img_principal && !imageFailed(imageKey('hero', slide.game))" class="home-slide-image" :src="imageUrl(slide.game)" :alt="slide.game.titulo" :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : 'auto'" decoding="async" @load="setImageState(imageKey('hero', slide.game), 'loaded')" @error="setImageState(imageKey('hero', slide.game), 'failed')">
              <div class="carousel-caption">
                <template v-if="slide.game">
                  <h2>Juegos destacados</h2>
                  <p class="home-slide-description">Descubrí juegos independientes de Argentina.</p>
                  <button v-if="interactive" class="btn btn-light" type="button" @click="$emit('open-game', slide.game)">Ver juego</button>
                  <span v-else class="btn btn-light">Ver juego</span>
                </template>
                <template v-else>
                  <h2>{{ slide.title }}</h2><a v-if="interactive" class="btn btn-light" href="/" @click.prevent="$emit('clear-search')">{{ slide.action }}</a><span v-else class="btn btn-light">{{ slide.action }}</span>
                </template>
              </div>
            </div>
          </div>
          <button v-if="carouselSlides.length > 1" class="carousel-control-prev" type="button" :data-bs-target="'#' + carouselId" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span><span class="visually-hidden">Anterior</span></button>
          <button v-if="carouselSlides.length > 1" class="carousel-control-next" type="button" :data-bs-target="'#' + carouselId" data-bs-slide="next"><span class="carousel-control-next-icon"></span><span class="visually-hidden">Siguiente</span></button>
        </div>
      </section>
      <div class="container-fluid home-content py-4">
        <section v-for="section in displayedSections" :id="'home-section-' + section.id" :key="section.id" class="home-section mb-5">
          <div class="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
            <h2 class="main-title mb-0">{{ section.title }}</h2>
            <div class="d-flex align-items-center gap-2">
              <button v-if="interactive && searchTerm" type="button" class="btn btn-link text-decoration-none" @click="$emit('clear-search')">Limpiar búsqueda</button>
              <button v-if="sectionId" type="button" class="btn btn-link text-decoration-none" @click="$emit('clear-section')">Volver a la portada</button>
              <a v-else-if="!searchTerm" class="home-section-more" href="/" @click.prevent="$emit('open-section', section.id)">Ver más</a>
            </div>
          </div>
          <div v-if="loading" class="home-cards-carousel home-cards-carousel-skeleton" role="status" :aria-label="'Cargando ' + section.title">
            <div class="home-cards-skeleton-track">
              <span v-for="row in 4" :key="row" class="home-card-skeleton">
                <span class="home-card-skeleton-media home-skeleton-pulse"></span>
                <span class="home-card-skeleton-copy"><i class="home-skeleton-pulse"></i><i class="home-skeleton-pulse"></i><i class="home-skeleton-pulse"></i></span>
              </span>
            </div>
          </div>
          <div v-else-if="sectionGames(section).length" class="home-cards-carousel">
            <button v-if="sectionGames(section).length > 1" class="home-cards-side-control btn btn-outline-secondary" :class="{ 'is-hidden': sectionScrollStates[section.id]?.atStart ?? true }" type="button" :disabled="sectionScrollStates[section.id]?.atStart ?? true" :aria-label="'Ver tarjetas anteriores de ' + section.title" @click="scrollCards(section.id, -1)"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
            <div :ref="track => setSectionTrack(section.id, track)" class="home-cards-track" role="region" :aria-label="section.title" tabindex="0" @scroll.passive="updateCardsPosition(section.id)">
              <div class="home-cards-item" v-for="game in sectionGames(section)" :key="game.ID">
                <article class="card h-100 shadow-sm game-card" :role="interactive ? 'link' : undefined" :tabindex="interactive ? 0 : undefined" @click="interactive && $emit('open-game', game)" @keydown.enter.prevent="interactive && $emit('open-game', game)" @keydown.space.prevent="interactive && $emit('open-game', game)">
                  <div v-if="game.img_principal && !imageFailed(imageKey('card', game))" class="game-card-cover-media">
                    <span v-if="!imageLoaded(imageKey('card', game))" class="game-card-image-skeleton home-skeleton-pulse" aria-hidden="true"></span>
                    <img class="game-card-cover-image" :src="imageUrl(game)" :alt="game.titulo" loading="lazy" decoding="async" @load="setImageState(imageKey('card', game), 'loaded')" @error="setImageState(imageKey('card', game), 'failed')">
                  </div>
                  <div v-else class="game-card-cover"><i class="fas fa-gamepad" aria-hidden="true"></i></div>
                  <div class="card-body d-flex flex-column"><h3 class="card-title h5"><a v-if="interactive" href="#" @click.prevent.stop="$emit('open-game', game)">{{ game.titulo }}</a><span v-else>{{ game.titulo }}</span></h3><p class="card-text game-card-description">{{ game.descripcion || 'Descubrí este juego indie en IndiAR.' }}</p><div class="mt-auto"><div class="d-flex justify-content-between align-items-center mb-3"><span class="small text-secondary">{{ game.desarrollador }}</span><span class="game-card-pricing"><del v-if="game.oferta_activa && Number(game.precio || 0) > 0" class="game-price-original">\${{ Number(game.precio || 0).toFixed(2) }}</del><strong v-if="Number(game.precio_final ?? game.precio ?? 0) === 0" class="game-price-free">Gratis</strong><strong v-else class="game-price">\${{ Number(game.precio_final ?? game.precio ?? 0).toFixed(2) }}</strong></span></div><div class="d-flex gap-2"><button v-if="interactive" class="btn btn-outline-primary flex-grow-1" type="button" @click.stop="$emit('open-game', game)">Ver juego</button><span v-else class="btn btn-outline-primary flex-grow-1">Ver juego</span><button v-if="interactive" class="btn btn-primary" type="button" aria-label="Añadir al carrito" @click.stop="$emit('add-game', game)"><i class="fa-solid fa-cart-plus"></i></button><span v-else class="btn btn-primary" aria-hidden="true"><i class="fa-solid fa-cart-plus"></i></span></div></div></div>
                </article>
              </div>
            </div>
            <button v-if="sectionGames(section).length > 1" class="home-cards-side-control btn btn-outline-secondary" :class="{ 'is-hidden': sectionScrollStates[section.id]?.atEnd ?? false }" type="button" :disabled="sectionScrollStates[section.id]?.atEnd ?? false" :aria-label="'Ver más tarjetas de ' + section.title" @click="scrollCards(section.id, 1)"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
          </div>
          <div v-else class="alert alert-info">No hay juegos activos que coincidan con esta selección.</div>
        </section>
        <div v-if="!displayedSections.length && sectionId" class="alert alert-info">No se encontró la sección solicitada.</div>
        <div v-else-if="!displayedSections.length" class="alert alert-info">Todavía no hay suficientes juegos para mostrar secciones.</div>
      </div>
    </div>
  `,
};
