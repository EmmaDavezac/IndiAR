import { ref, computed, onMounted } from '../../assets/js/lib/vue-esm.js';
import router from '../router.js';

import { showToast } from '../services/confirm.js';
import { getJuegos, API_BASE } from '../services/api.js?v=20261102d';

export default {
  name: 'Store',
  setup() {
    const games = ref([]);
    const loading = ref(true);
    const error = ref(null);

    // Filters
    const searchTerm = ref('');
    const selectedCategory = ref('');
    const priceFilter = ref('all'); // 'all', 'free', 'paid'
    const sortOption = ref('name'); // 'name', 'price', 'date'


    // Populate categories from the games list
    const categories = computed(() => {
      const set = new Set();
      games.value.forEach(g => {
        (g.categorias || []).forEach(cat => set.add(cat.nombre || cat.titulo || cat.id));
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
    });

    // Filtered games list
    const filteredGames = computed(() => {
      const term = searchTerm.value.trim().toLowerCase();
      let result = games.value.filter(g => {
        const searchable = `${g.titulo} ${g.desarrollador} ${g.descripcion}`.toLowerCase();
        if (term && !searchable.includes(term)) return false;
        if (selectedCategory.value) {
          const catNames = (g.categorias || []).map(c => c.nombre || c.titulo || String(c.ID));
          if (!catNames.includes(selectedCategory.value)) return false;
        }
        if (priceFilter.value === 'free' && Number(g.precio) > 0) return false;
        if (priceFilter.value === 'paid' && Number(g.precio) === 0) return false;
        return true;
      });
      // Sorting
      if (sortOption.value === 'name') {
        result.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
      } else if (sortOption.value === 'price') {
        result.sort((a, b) => Number(a.precio) - Number(b.precio));
      } else if (sortOption.value === 'date' && result[0]?.fecha) {
        result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      }
      return result;
    });

    const imageUrl = game => game.img_principal?.startsWith('http') ? game.img_principal : API_BASE.replace('/api', '') + (game.img_principal || '');

    function fetchGames() {
      loading.value = true;
      getJuegos()
        .then(list => { games.value = list; })
        .catch(err => { error.value = err; console.error(err); showToast('No se pudieron cargar los juegos.', 'error'); })
        .finally(() => { loading.value = false; });
    }

    function clearFilters() {
      searchTerm.value = '';
      selectedCategory.value = '';
      priceFilter.value = 'all';
      sortOption.value = 'name';
      router.push({ path: '/tienda', query: {} });
    }

    // Fetch games on mount
    onMounted(() => { fetchGames(); });

    return { loading, error, games, filteredGames, searchTerm, selectedCategory, categories, priceFilter, sortOption, imageUrl };
  },
  template: `
    <main class="container py-4">
      <h1 class="mb-4">Tienda de Juegos</h1>

      <!-- Filter bar -->
      <div class="row g-3 mb-4 align-items-center">
        <div class="col-sm-4">
          <input class="form-control" type="search" placeholder="Buscar juego..." v-model="searchTerm" />
        </div>
        <div class="col-sm-3">
          <select class="form-select" v-model="selectedCategory">
            <option value="">Todas las categorías</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="col-sm-3">
          <select class="form-select" v-model="priceFilter">
            <option value="all">Todos los precios</option>
            <option value="free">Gratis</option>
            <option value="paid">De pago</option>
          </select>
        </div>
        <div class="col-sm-2 text-end">
          <select class="form-select mb-2" v-model="sortOption" aria-label="Ordenar">
            <option value="name">Ordenar por nombre</option>
            <option value="price">Ordenar por precio</option>
            <option value="date">Ordenar por fecha</option>
          </select>
          <button class="btn btn-outline-secondary w-100" @click="clearFilters">Limpiar</button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div>
      </div>

      <div v-else-if="filteredGames.length === 0" class="alert alert-info">No se encontraron juegos con los criterios seleccionados.</div>

      <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
        <div class="col" v-for="game in filteredGames" :key="game.ID">
          <div class="card h-100 game-card">
            <img v-if="game.img_principal" :src="imageUrl(game)" class="card-img-top" alt="Imagen de {{ game.titulo }}" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ game.titulo }}</h5>
              <p class="card-text flex-grow-1" v-html="game.descripcion?.substring(0, 120) + '...'"></p>
              <p class="mb-2"><strong>Precio:</strong> {{ Number(game.precio) === 0 ? 'Gratis' : '$' + game.precio }}</p>
              <router-link :to="'/juegos/' + game.ID" class="btn btn-primary mt-auto">Ver detalle</router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
};
