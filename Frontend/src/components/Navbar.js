import { computed, onBeforeUnmount, ref } from '../../assets/js/lib/vue-esm.js';
import router from '../router.js';
import { cartCount } from '../services/cart.js';
import { API_BASE, getJuegos } from '../services/api.js';
import { confirmAction } from '../services/confirm.js';

export default {
  name: 'Navbar',
  setup() {
    const user = ref(JSON.parse(localStorage.getItem('indiAR_user') || 'null'));
    const token = ref(localStorage.getItem('indiAR_token'));
    const isLoggedIn = ref(!!token.value);
    const isAdmin = ref(isLoggedIn.value && user.value && (user.value.es_Admin === true || user.value.es_Admin === 1 || user.value.es_Admin === '1'));
    const cartItemsCount = ref(cartCount());
    const searchQuery = ref(String(router.currentRoute.value.query.buscar || ''));
    const searchTerm = ref('');
    const searchPending = ref(false);
    const searchGamesLoading = ref(true);
    let searchDebounceTimer;
    const searchGames = ref([]);
    const imageUrl = game => game.img_principal?.startsWith('http') ? game.img_principal : `${API_BASE.replace('/api', '')}${game.img_principal || ''}`;
    const searchLoading = computed(() => searchPending.value || searchGamesLoading.value);
    const searchResults = computed(() => {
      const query = searchTerm.value.trim().toLocaleLowerCase('es');
      if (!query) return [];
      return searchGames.value.filter(game =>
        [game.titulo, game.desarrollador, game.distribuidor, game.descripcion]
          .some(value => String(value || '').toLocaleLowerCase('es').includes(query))
      ).slice(0, 6);
    });
    function updateSearchTerm(query) {
      clearTimeout(searchDebounceTimer);
      const normalizedQuery = query.trim();
      if (!normalizedQuery) {
        searchTerm.value = '';
        searchPending.value = false;
        return;
      }
      searchPending.value = true;
      searchDebounceTimer = setTimeout(() => {
        searchTerm.value = normalizedQuery;
        searchPending.value = false;
      }, 250);
    }

    function handleSearchInput() {
      updateSearchTerm(searchQuery.value);
    }
    const isAuthPage = computed(() => ['/login', '/registro'].includes(router.currentRoute.value.path));
    const isAdminPage = computed(() => router.currentRoute.value.path.startsWith('/admin'));
    const activeAdminSection = computed(() => router.currentRoute.value.path);
    const displayName = computed(() => user.value?.nombre || user.value?.Nombre || user.value?.email || user.value?.Email || 'Usuario');
    const userEmail = computed(() => user.value?.email || user.value?.Email || '');
    const userInitial = computed(() => displayName.value.trim().charAt(0).toUpperCase());
    const theme = ref(localStorage.getItem('indiAR_theme') || 'light');
    document.documentElement.setAttribute('data-bs-theme', theme.value);

    function toggleTheme() {
      theme.value = theme.value === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', theme.value);
      localStorage.setItem('indiAR_theme', theme.value);
    }

    function refreshAuthState() {
      const u = JSON.parse(localStorage.getItem('indiAR_user') || 'null');
      const t = localStorage.getItem('indiAR_token');
      user.value = u;
      token.value = t;
      isLoggedIn.value = !!t;
      isAdmin.value = isLoggedIn.value && u && (u.es_Admin === true || u.es_Admin === 1 || u.es_Admin === '1');
      cartItemsCount.value = cartCount();
    }

    function navigate(path) {
      if (router.currentRoute.value.path !== path) router.push(path);
    }

    async function navigateToGames() {
      await router.push('/');
      window.requestAnimationFrame(() => document.getElementById('juegos')?.scrollIntoView({ behavior: 'smooth' }));
    }

    function submitSearch() {
      const query = searchQuery.value.trim();
      router.push({ path: '/', query: query ? { buscar: query } : {} });
    }

    function openSearchResult(game) {
      searchQuery.value = '';
      updateSearchTerm('');
      router.push('/juegos/' + game.ID);
    }

    function handleSearchKeydown(event) {
      if (event.key === 'Escape') {
        searchQuery.value = '';
        updateSearchTerm('');
      }
    }

    router.afterEach(() => {
      searchQuery.value = String(router.currentRoute.value.query.buscar || '');
      updateSearchTerm(searchQuery.value);
    });
    onBeforeUnmount(() => clearTimeout(searchDebounceTimer));

    async function logout() {
      const confirmed = await confirmAction('¿Seguro que querés cerrar sesión?', 'Cerrar sesión', 'Cerrar sesión', 'danger');
      if (!confirmed) return;
      localStorage.removeItem('indiAR_token');
      localStorage.removeItem('indiAR_user');
      sessionStorage.removeItem('indiar_token');
      sessionStorage.removeItem('indiar_user');
      refreshAuthState();
      window.dispatchEvent(new CustomEvent('auth-changed'));
      router.push('/');
    }

    window.addEventListener('auth-changed', refreshAuthState);
    window.addEventListener('cart-changed', () => { cartItemsCount.value = cartCount(); });
    getJuegos()
      .then(items => { searchGames.value = items; })
      .catch(error => console.error('No se pudieron cargar los juegos para la búsqueda:', error))
      .finally(() => { searchGamesLoading.value = false; });

    return { router, isLoggedIn, isAdmin, cartItemsCount, searchQuery, searchResults, searchLoading, imageUrl, isAuthPage, isAdminPage, activeAdminSection, displayName, userEmail, userInitial, user, theme, navigate, navigateToGames, submitSearch, openSearchResult, handleSearchInput, handleSearchKeydown, toggleTheme, logout, refreshAuthState };
  },  
  template: `
    <header class="spa-header" :class="{ 'spa-header--landing': !isAuthPage && !isAdminPage }">
      <nav class="navbar navbar-expand-lg container-fluid px-3 px-lg-4" aria-label="Navegación principal">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Abrir navegación">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-brand-group">
          <a class="spa-logo navbar-brand" href="/" @click.prevent="navigate('/')"><span class="word1">Indi</span><span class="word2">AR</span></a>
          <ul v-if="!isAuthPage && !isAdminPage" class="navbar-nav navbar-desktop-links d-none d-lg-flex" aria-label="Navegación principal">
            <li class="nav-item"><a class="nav-link" :class="{ active: router.currentRoute.value.path === '/' && !router.currentRoute.value.hash }" :aria-current="router.currentRoute.value.path === '/' && !router.currentRoute.value.hash ? 'page' : undefined" href="/" @click.prevent="navigate('/')">Inicio</a></li>
            <li class="nav-item"><a class="nav-link" :class="{ active: router.currentRoute.value.hash === '#juegos' }" :aria-current="router.currentRoute.value.hash === '#juegos' ? 'page' : undefined" href="/#juegos" @click.prevent="navigateToGames">Juegos</a></li>
          </ul>
        </div>
        <div v-if="!isAuthPage && !isAdminPage" class="navbar-tools d-flex align-items-center gap-2">
          <form class="d-flex navbar-search" role="search" @submit.prevent="submitSearch">
            <label class="visually-hidden" for="navbar-game-search">Buscar juegos</label>
            <input id="navbar-game-search" v-model="searchQuery" @input="handleSearchInput" @keydown="handleSearchKeydown" type="search" class="form-control" placeholder="Buscar juegos" aria-label="Buscar juegos" aria-autocomplete="list" aria-controls="navbar-search-results" :aria-expanded="searchQuery.trim().length > 0" />
            <button class="btn" type="submit" aria-label="Buscar"><i class="fas fa-search icon-search"></i></button>
            <ul v-if="searchQuery.trim()" id="navbar-search-results" class="navbar-search-results" role="listbox" aria-label="Resultados de búsqueda" :aria-busy="searchLoading">
              <template v-if="searchLoading"><li v-for="row in 3" :key="'search-skeleton-' + row" class="navbar-search-skeleton" aria-hidden="true"><span class="navbar-search-skeleton-image"></span><span class="navbar-search-skeleton-copy"><span></span><span></span><span></span></span></li></template>
              <template v-if="!searchLoading">
                <li v-for="game in searchResults" :key="game.ID" role="option">
                  <button class="navbar-search-result" type="button" @click="openSearchResult(game)">
                    <img v-if="game.img_principal" class="navbar-search-result-image" :src="imageUrl(game)" alt="" />
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
          <a v-if="isLoggedIn && !isAdmin" href="/carrito" class="btn navbar-cart-button position-relative" aria-label="Carrito" @click.prevent="navigate('/carrito')"><i class="fa-solid fa-cart-shopping icon-header"></i><span v-if="cartItemsCount" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{{ cartItemsCount }}</span></a>
        </div>
        <div class="main-nav collapse navbar-collapse" id="main-nav">
          <ul v-if="isAdminPage" class="navbar-nav me-auto align-items-lg-center admin-nav-links">
            <li class="nav-item"><a class="nav-link" :style="theme === 'dark' ? { color: '#f4f8fb' } : null" :class="{ active: activeAdminSection === '/admin/usuarios' }" :aria-current="activeAdminSection === '/admin/usuarios' ? 'page' : undefined" href="/admin/usuarios" @click.prevent="navigate('/admin/usuarios')">Usuarios</a></li>
            <li class="nav-item"><a class="nav-link" :style="theme === 'dark' ? { color: '#f4f8fb' } : null" :class="{ active: activeAdminSection === '/admin/juegos' }" :aria-current="activeAdminSection === '/admin/juegos' ? 'page' : undefined" href="/admin/juegos" @click.prevent="navigate('/admin/juegos')">Juegos</a></li>
            <li class="nav-item"><a class="nav-link" :style="theme === 'dark' ? { color: '#f4f8fb' } : null" :class="{ active: activeAdminSection === '/admin/categorias' }" :aria-current="activeAdminSection === '/admin/categorias' ? 'page' : undefined" href="/admin/categorias" @click.prevent="navigate('/admin/categorias')">Géneros</a></li>
            <li class="nav-item"><a class="nav-link" :style="theme === 'dark' ? { color: '#f4f8fb' } : null" :class="{ active: activeAdminSection === '/admin/colecciones' }" :aria-current="activeAdminSection === '/admin/colecciones' ? 'page' : undefined" href="/admin/colecciones" @click.prevent="navigate('/admin/colecciones')">Colecciones</a></li>
            <li class="nav-item"><a class="nav-link" :style="theme === 'dark' ? { color: '#f4f8fb' } : null" :class="{ active: activeAdminSection === '/admin/landing' }" :aria-current="activeAdminSection === '/admin/landing' ? 'page' : undefined" href="/admin/landing" @click.prevent="navigate('/admin/landing')">Landing</a></li>
            <template v-if="isLoggedIn">
              <li class="nav-item d-lg-none navbar-admin-account">
                <div class="navbar-admin-account-info">
                  <span class="navbar-avatar" aria-hidden="true">{{ userInitial }}</span>
                  <span class="navbar-admin-account-copy">
                    <strong>{{ displayName }}</strong>
                    <small>{{ userEmail || 'Administrador' }}</small>
                  </span>
                </div>
              </li>
              <li class="nav-item d-lg-none"><a class="nav-link" href="/mi-cuenta" @click.prevent="navigate('/mi-cuenta')">Mi cuenta</a></li>
              <li class="nav-item d-lg-none"><button class="nav-link navbar-mobile-logout d-flex align-items-center gap-2" type="button" @click="logout"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i><span>Cerrar sesión</span></button></li>
            </template>
          </ul>
          <ul v-else-if="!isAuthPage" class="navbar-nav me-auto align-items-lg-center d-lg-none">
            <li class="nav-item"><a class="nav-link" :class="{ active: router.currentRoute.value.path === '/' && !router.currentRoute.value.hash }" :aria-current="router.currentRoute.value.path === '/' && !router.currentRoute.value.hash ? 'page' : undefined" href="/" @click.prevent="navigate('/')">Inicio</a></li>
            <li class="nav-item"><a class="nav-link" :class="{ active: router.currentRoute.value.hash === '#juegos' }" :aria-current="router.currentRoute.value.hash === '#juegos' ? 'page' : undefined" href="/#juegos" @click.prevent="navigateToGames">Juegos</a></li>
            <li v-if="!isLoggedIn" class="nav-item d-lg-none"><a class="nav-link" href="/login" @click.prevent="navigate('/login')">Ingresar</a></li>
            <li v-if="!isLoggedIn" class="nav-item d-lg-none"><a class="nav-link" href="/registro" @click.prevent="navigate('/registro')">Registrarse</a></li>
          </ul>
          <ul v-else class="navbar-nav me-auto d-lg-none">
            <li class="nav-item"><a class="nav-link" href="/" @click.prevent="navigate('/')">Inicio</a></li>
          </ul>
          <div v-if="isAuthPage" class="navbar-auth-mobile-options d-lg-none">
            <div class="navbar-theme-control d-flex align-items-center gap-2">
              <span class="navbar-theme-label">Tema</span>
              <button class="btn navbar-theme-button" type="button" role="switch" :aria-checked="theme === 'dark'" @click="toggleTheme" :title="theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'" :aria-label="theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'">
                <span class="navbar-theme-track" aria-hidden="true">
                  <i class="fa-solid fa-sun"></i>
                  <i class="fa-solid fa-moon"></i>
                  <span class="navbar-theme-thumb"></span>
                </span>
              </button>
            </div>
          </div>
          <div v-if="!isAuthPage" class="main-header-container navbar-actions d-flex align-items-center gap-2 ms-lg-auto">
            <div class="navbar-theme-control navbar-theme-mobile d-flex d-lg-none align-items-center gap-2">
              <span class="navbar-theme-label" aria-hidden="true">Tema</span>
              <button class="btn navbar-theme-button" type="button" role="switch" :aria-checked="theme === 'dark'" @click="toggleTheme" :title="theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'" :aria-label="theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'">
                <span class="navbar-theme-track" aria-hidden="true">
                  <i class="fa-solid fa-sun"></i>
                  <i class="fa-solid fa-moon"></i>
                  <span class="navbar-theme-thumb"></span>
                </span>
              </button>
            </div>
            <template v-if="!isLoggedIn">
              <div class="navbar-theme-control navbar-theme-guest d-none d-lg-flex align-items-center gap-2">
                <span class="navbar-theme-label" aria-hidden="true">Tema</span>
                <button class="btn navbar-theme-button" type="button" role="switch" :aria-checked="theme === 'dark'" @click="toggleTheme" :title="theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'" :aria-label="theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'"><i class="fa-solid" :class="theme === 'dark' ? 'fa-sun' : 'fa-moon'" aria-hidden="true"></i></button>
              </div>
              <a href="/login" class="btn btn-outline-primary navbar-auth-btn d-none d-lg-inline-flex" @click.prevent="navigate('/login')">Ingresar</a>
              <a href="/registro" class="btn btn-primary navbar-auth-btn d-none d-lg-inline-flex" @click.prevent="navigate('/registro')">Registrarse</a>
            </template>
            <div v-else class="dropdown navbar-user-menu d-none d-lg-block">
              <button class="btn navbar-user-toggle dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="navbar-avatar" aria-hidden="true">{{ userInitial }}</span>
                <span class="text-nowrap">{{ displayName }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                <li><a class="dropdown-item" href="/mi-cuenta" @click.prevent="navigate('/mi-cuenta')"><i class="fa-solid fa-user me-2"></i>Mi cuenta</a></li>
                <li class="dropdown-theme-item">
                  <div class="dropdown-theme-control">
                    <span>Tema</span>
                    <button class="btn navbar-theme-button" type="button" role="switch" :aria-checked="theme === 'dark'" @click="toggleTheme" :title="theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'" :aria-label="theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'"><span class="navbar-theme-track" aria-hidden="true"><i class="fa-solid fa-sun"></i><i class="fa-solid fa-moon"></i><span class="navbar-theme-thumb"></span></span></button>
                  </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" type="button" @click="logout"><i class="fa-solid fa-right-from-bracket me-2"></i>Cerrar sesión</button></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `
};
