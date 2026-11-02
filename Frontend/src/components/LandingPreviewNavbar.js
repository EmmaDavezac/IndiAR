import { computed, onBeforeUnmount, ref } from '../../assets/js/lib/vue-esm.js';
import { API_BASE } from '../services/api.js';

export default {
  name: 'LandingPreviewNavbar',
  props: {
    mobile: { type: Boolean, default: false },
    theme: { type: String, default: 'light' },
    menuOpen: { type: Boolean, default: false },
    games: { type: Array, default: () => [] },
  },
  emits: ['toggle-menu', 'toggle-theme'],
  setup(props) {
    const searchQuery = ref('');
    const searchTerm = ref('');
    const searchPending = ref(false);
    let searchDebounceTimer;
    const imageUrl = game => game.img_principal?.startsWith('http') ? game.img_principal : `${API_BASE.replace('/api', '')}${game.img_principal || ''}`;
    const searchLoading = computed(() => searchPending.value);
    const searchResults = computed(() => {
      const query = searchTerm.value.trim().toLocaleLowerCase('es');
      if (!query) return [];
      return props.games.filter(game =>
        [game.titulo, game.desarrollador, game.distribuidor, game.descripcion]
          .some(value => String(value || '').toLocaleLowerCase('es').includes(query))
      ).slice(0, 6);
    });
    function handleSearchInput() {
      clearTimeout(searchDebounceTimer);
      const query = searchQuery.value.trim();
      if (!query) {
        searchTerm.value = '';
        searchPending.value = false;
        return;
      }
      searchPending.value = true;
      searchDebounceTimer = setTimeout(() => {
        searchTerm.value = query;
        searchPending.value = false;
      }, 250);
    }
    onBeforeUnmount(() => clearTimeout(searchDebounceTimer));
    return { searchQuery, searchResults, searchLoading, imageUrl, handleSearchInput };
  },
  template: `
    <header class="spa-header spa-header--landing landing-preview-navbar" aria-label="Vista previa de navegación">
      <nav class="navbar navbar-expand-lg container-fluid px-3 px-lg-4" aria-label="Navegación principal">
        <button class="navbar-toggler" type="button" aria-controls="landing-preview-main-nav" :aria-expanded="menuOpen" aria-label="Abrir navegación" @click="$emit('toggle-menu')">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-brand-group">
          <a class="spa-logo navbar-brand" href="#" @click.prevent><span class="word1">Indi</span><span class="word2">AR</span></a>
          <ul class="navbar-nav navbar-desktop-links d-none d-lg-flex" aria-label="Navegación principal">
            <li class="nav-item"><a class="nav-link active" aria-current="page" href="#" @click.prevent>Inicio</a></li>
            <li class="nav-item"><a class="nav-link" href="#juegos" @click.prevent>Juegos</a></li>
          </ul>
        </div>
        <div class="navbar-tools d-flex align-items-center gap-2">
          <form class="d-flex navbar-search" role="search" @submit.prevent>
            <label class="visually-hidden" for="landing-preview-search">Buscar juegos</label>
            <input id="landing-preview-search" v-model="searchQuery" @input="handleSearchInput" type="search" class="form-control" placeholder="Buscar juegos" aria-label="Buscar juegos" aria-autocomplete="list" aria-controls="landing-preview-search-results" :aria-expanded="searchQuery.trim().length > 0">
            <button class="btn" type="submit" aria-label="Buscar"><i class="fas fa-search icon-search" aria-hidden="true"></i></button>
            <ul v-if="searchQuery.trim()" id="landing-preview-search-results" class="navbar-search-results" role="listbox" aria-label="Resultados de búsqueda" :aria-busy="searchLoading">
              <template v-if="searchLoading"><li v-for="row in 3" :key="'preview-search-skeleton-' + row" class="navbar-search-skeleton" aria-hidden="true"><span class="navbar-search-skeleton-image"></span><span class="navbar-search-skeleton-copy"><span></span><span></span><span></span></span></li></template>
              <template v-if="!searchLoading">
                <li v-for="game in searchResults" :key="game.ID" role="option">
                  <button class="navbar-search-result" type="button">
                    <img v-if="game.img_principal" class="navbar-search-result-image" :src="imageUrl(game)" alt="">
                    <span v-else class="navbar-search-result-image navbar-search-result-placeholder" aria-hidden="true"><i class="fa-solid fa-gamepad"></i></span>
                    <span class="navbar-search-result-copy">
                      <span class="navbar-search-result-title">{{ game.titulo }}</span>
                      <span class="navbar-search-result-meta">{{ game.desarrollador || 'Desarrollador indie' }}</span>
                      <span class="navbar-search-result-price"><del v-if="game.oferta_activa">\${{ Number(game.precio || 0).toFixed(2) }}</del> \${{ Number(game.precio_final ?? game.precio ?? 0).toFixed(2) }}</span>
                    </span>
                  </button>
                </li>
                <li v-if="!searchResults.length" class="navbar-search-empty">No se encontraron juegos.</li>
              </template>
            </ul>
          </form>
        </div>
        <div id="landing-preview-main-nav" class="main-nav navbar-collapse" :class="{ show: !mobile || menuOpen }">
          <ul class="navbar-nav me-auto align-items-lg-center d-lg-none">
            <li class="nav-item"><a class="nav-link active" aria-current="page" href="#" @click.prevent>Inicio</a></li>
            <li class="nav-item"><a class="nav-link" href="#juegos" @click.prevent>Juegos</a></li>
            <li class="nav-item d-lg-none"><a class="nav-link" href="#" @click.prevent>Ingresar</a></li>
            <li class="nav-item d-lg-none"><a class="nav-link" href="#" @click.prevent>Registrarse</a></li>
          </ul>
          <div class="main-header-container navbar-actions d-flex align-items-center gap-2 ms-lg-auto">
            <div class="navbar-theme-control navbar-theme-mobile d-flex d-lg-none align-items-center gap-2">
              <span class="navbar-theme-label" aria-hidden="true">Tema</span>
              <button class="btn navbar-theme-button" type="button" role="switch" :aria-checked="theme === 'dark'" :aria-label="theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'" @click="$emit('toggle-theme')">
                <span class="navbar-theme-track" aria-hidden="true"><i class="fa-solid fa-sun"></i><i class="fa-solid fa-moon"></i><span class="navbar-theme-thumb"></span></span>
              </button>
            </div>
            <div class="navbar-theme-control navbar-theme-guest d-none d-lg-flex align-items-center gap-2">
              <span class="navbar-theme-label" aria-hidden="true">Tema</span>
              <button class="btn navbar-theme-button" type="button" role="switch" :aria-checked="theme === 'dark'" :aria-label="theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'" @click="$emit('toggle-theme')"><i class="fa-solid" :class="theme === 'dark' ? 'fa-sun' : 'fa-moon'" aria-hidden="true"></i></button>
            </div>
            <a href="#" class="btn btn-outline-primary navbar-auth-btn d-none d-lg-inline-flex" @click.prevent>Ingresar</a>
            <a href="#" class="btn btn-primary navbar-auth-btn d-none d-lg-inline-flex" @click.prevent>Registrarse</a>
          </div>
        </div>
      </nav>
    </header>
  `,
};
