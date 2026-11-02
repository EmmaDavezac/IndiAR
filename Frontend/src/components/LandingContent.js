import { computed } from '../../assets/js/lib/vue-esm.js';
import { API_BASE } from '../services/api.js';

const defaultCarouselSlides = [
  { title: 'Nuevos lanzamientos', action: 'Explorar', variant: 'home-slide-primary' },
  { title: 'Ofertas de la semana', action: 'Ver ofertas', variant: 'home-slide-secondary' },
  { title: 'Indies destacados', action: 'Descubrir', variant: 'home-slide-tertiary' },
];

export default {
  name: 'LandingContent',
  props: {
    config: { type: Object, required: true },
    games: { type: Array, required: true },
    searchTerm: { type: String, default: '' },
    carouselId: { type: String, required: true },
    interactive: { type: Boolean, default: false },
  },
  emits: ['open-game', 'add-game', 'clear-search'],
  setup(props) {
    const imageUrl = game => game.img_principal?.startsWith('http') ? game.img_principal : `${API_BASE.replace('/api', '')}${game.img_principal || ''}`;
    const carouselSlides = computed(() => {
      const selectedIds = props.config.carouselGameIds || [];
      if (!selectedIds.length) return defaultCarouselSlides;
      const gamesById = new Map(props.games.map(game => [String(game.ID), game]));
      const selectedGames = selectedIds
        .map(id => gamesById.get(String(id)))
        .filter(game => game && game.activo !== false);
      return selectedGames.length ? selectedGames.map(game => ({ game })) : defaultCarouselSlides;
    });
    const displayedGames = computed(() => {
      const active = props.games.filter(game => game.activo !== false);
      let selected = active;
      if (props.config.mode === 'categoria') {
        const ids = (props.config.categoryIds || []).length ? props.config.categoryIds : [props.config.categoryId].filter(Boolean);
        selected = active.filter(game => (game.categorias || []).some(item => ids.map(String).includes(String(item.ID))));
      }
      if (props.config.mode === 'coleccion') {
        const ids = (props.config.collectionIds || []).length ? props.config.collectionIds : [props.config.collectionId].filter(Boolean);
        selected = active.filter(game => (game.colecciones || []).some(item => ids.map(String).includes(String(item.ID))));
      }
      if (props.config.mode === 'destacados') {
        selected = active.filter(game => (props.config.featuredIds || []).map(String).includes(String(game.ID)));
      }
      const search = props.searchTerm.trim().toLocaleLowerCase('es');
      if (search) {
        selected = selected.filter(game => [game.titulo, game.desarrollador, game.distribuidor, game.descripcion]
          .some(value => String(value || '').toLocaleLowerCase('es').includes(search)));
      }
      return selected.slice(0, Number(props.config.limit) || 8);
    });
    return { imageUrl, carouselSlides, displayedGames };
  },
  template: `
    <div>
      <section class="home-carousel container-fluid px-0" aria-label="Destacados">
        <div :id="carouselId" class="carousel slide" :data-bs-ride="interactive ? 'carousel' : undefined">
          <div v-if="carouselSlides.length > 1" class="carousel-indicators">
            <button v-for="(slide, index) in carouselSlides" :key="index" type="button" :data-bs-target="'#' + carouselId" :data-bs-slide-to="index" :class="{ active: index === 0 }" :aria-current="index === 0 ? 'true' : undefined" :aria-label="slide.game?.titulo || slide.title"></button>
          </div>
          <div class="carousel-inner">
            <div v-for="(slide, index) in carouselSlides" :key="slide.game?.ID || slide.title" class="carousel-item home-slide" :class="[slide.variant, { active: index === 0, 'home-slide-game': !!slide.game }]">
              <img v-if="slide.game?.img_principal" class="home-slide-image" :src="imageUrl(slide.game)" alt="">
              <div class="carousel-caption">
                <template v-if="slide.game">
                  <h2>{{ slide.game.titulo }}</h2>
                  <p class="home-slide-description">{{ slide.game.descripcion || 'Descubrí este juego indie en IndiAR.' }}</p>
                  <div class="d-flex flex-wrap align-items-center gap-3"><span class="home-slide-pricing"><del v-if="slide.game.oferta_activa" class="home-slide-original-price">\${{ Number(slide.game.precio || 0).toFixed(2) }}</del><strong class="home-slide-price">\${{ Number(slide.game.precio_final ?? slide.game.precio ?? 0).toFixed(2) }}</strong><span v-if="slide.game.oferta_activa" class="badge text-bg-danger">Oferta</span></span><button v-if="interactive" class="btn btn-light" type="button" @click="$emit('open-game', slide.game)">Ver juego</button><span v-else class="btn btn-light">Ver juego</span></div>
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
        <section id="juegos" class="home-section mb-5">
          <div class="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
            <h2 class="main-title mb-0">{{ searchTerm ? 'Resultados para “' + searchTerm + '”' : config.title }}</h2>
            <button v-if="interactive && searchTerm" type="button" class="btn btn-link text-decoration-none" @click="$emit('clear-search')">Limpiar búsqueda</button>
          </div>
          <div v-if="displayedGames.length" class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
            <div class="col" v-for="game in displayedGames" :key="game.ID">
              <article class="card h-100 shadow-sm game-card" :role="interactive ? 'link' : undefined" :tabindex="interactive ? 0 : undefined" @click="interactive && $emit('open-game', game)" @keydown.enter.prevent="interactive && $emit('open-game', game)" @keydown.space.prevent="interactive && $emit('open-game', game)">
                <img v-if="game.img_principal" class="game-card-cover-image" :src="imageUrl(game)" :alt="game.titulo">
                <div v-else class="game-card-cover"><i class="fas fa-gamepad"></i></div>
                <div class="card-body d-flex flex-column"><h3 class="card-title h5"><a v-if="interactive" href="#" @click.prevent.stop="$emit('open-game', game)">{{ game.titulo }}</a><span v-else>{{ game.titulo }}</span></h3><p class="card-text game-card-description">{{ game.descripcion || 'Descubrí este juego indie en IndiAR.' }}</p><div class="mt-auto"><div class="d-flex justify-content-between align-items-center mb-3"><span class="small text-secondary">{{ game.desarrollador }}</span><span class="game-card-pricing"><del v-if="game.oferta_activa" class="game-price-original">\${{ Number(game.precio || 0).toFixed(2) }}</del><strong class="game-price">\${{ Number(game.precio_final ?? game.precio ?? 0).toFixed(2) }}</strong></span></div><div class="d-flex gap-2"><button v-if="interactive" class="btn btn-outline-primary flex-grow-1" type="button" @click.stop="$emit('open-game', game)">Ver juego</button><span v-else class="btn btn-outline-primary flex-grow-1">Ver juego</span><button v-if="interactive" class="btn btn-primary" type="button" aria-label="Añadir al carrito" @click.stop="$emit('add-game', game)"><i class="fa-solid fa-cart-plus"></i></button><span v-else class="btn btn-primary" aria-hidden="true"><i class="fa-solid fa-cart-plus"></i></span></div></div></div>
              </article>
            </div>
          </div>
          <div v-else class="alert alert-info">No hay juegos activos que coincidan con esta selección.</div>
        </section>
      </div>
    </div>
  `,
};
