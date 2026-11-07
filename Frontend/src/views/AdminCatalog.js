import { computed, onUnmounted, ref, watch } from '../../assets/js/lib/vue-esm.js';
import { getCategorias, getColecciones, saveTaxonomy, deleteResource } from '../services/api.js';
import { confirmAction } from '../services/confirm.js';

export default {
  name: 'AdminCatalog',
  props: { type: { type: String, required: true } },
  setup(props) {
    const items = ref([]);
    const nombre = ref('');
    const nombreOriginal = ref('');
    const editingId = ref(null);
    const showForm = ref(false);
    const selectedItem = ref(null);
    const warning = ref('');
    const loading = ref(true);
    const searchText = ref('');
    const page = ref(1);
    const pageSize = 10;
    const endpoint = computed(() => props.type === 'categorias' ? '/categorias' : '/colecciones');
    const singular = computed(() => props.type === 'categorias' ? 'Género' : 'Colección');
    const title = computed(() => props.type === 'categorias' ? 'Géneros' : 'Colecciones');
    const newLabel = computed(() => props.type === 'categorias' ? 'Nuevo género' : 'Nueva colección');
    const itemNoun = computed(() => props.type === 'categorias' ? 'género' : 'colección');

    async function load() {
      loading.value = true;
      items.value = props.type === 'categorias' ? await getCategorias() : await getColecciones();
      loading.value = false;
    }
    function setModalScroll(open) { document.body.classList.toggle('indiar-detail-open', open); }
    function hasUnsavedChanges() { return showForm.value && nombre.value !== nombreOriginal.value; }
    function clearForm() { showForm.value = false; editingId.value = null; nombre.value = ''; nombreOriginal.value = ''; warning.value = ''; setModalScroll(false); }
    async function confirmDiscard() {
      if (!hasUnsavedChanges()) return true;
      return confirmAction('Hay cambios sin guardar. ¿Descartar los cambios?', 'Descartar cambios', 'Descartar y continuar', 'danger');
    }
    async function openNew() {
      if (!await confirmDiscard()) return;
      clearForm();
      showForm.value = true;
      nombreOriginal.value = '';
      setModalScroll(true);
    }
    function openDetails(item) { selectedItem.value = { ...item }; setModalScroll(true); }
    async function closeDetails() { selectedItem.value = null; setModalScroll(false); }
    function edit(item) {
      clearForm();
      editingId.value = item.ID;
      nombre.value = item.nombre;
      nombreOriginal.value = item.nombre;
      selectedItem.value = null;
      showForm.value = true;
      setModalScroll(true);
    }
    async function cancel() { if (!await confirmDiscard()) return; clearForm(); }
    async function save() {
      warning.value = '';
      if (!await confirmAction(editingId.value ? `¿Guardar los cambios de ${singular.value.toLowerCase()}?` : `¿Crear la nueva ${singular.value.toLowerCase()}?`, editingId.value ? 'Guardar cambios' : `Nueva ${singular.value}`, 'Continuar', 'primary')) return;
      const { response, data } = await saveTaxonomy(endpoint.value, { nombre: nombre.value.trim() }, editingId.value);
      if (!response.ok) return warning.value = data.mensaje || 'No se pudo guardar';
      clearForm();
      await load();
    }
    async function remove(item) {
      if (!await confirmAction(`¿Eliminar ${singular.value.toLowerCase()} ${item.nombre}?`, `Eliminar ${singular.value.toLowerCase()}`, 'Eliminar', 'danger')) return;
      const { response, data } = await deleteResource(endpoint.value, item.ID);
      if (!response.ok) return warning.value = data.mensaje || 'No se pudo eliminar';
      selectedItem.value = null;
      setModalScroll(false);
      await load();
    }
    const filteredItems = computed(() => {
      const query = searchText.value.trim().toLowerCase();
      if (!query) return items.value;
      return items.value.filter(item => String(item.nombre || '').toLowerCase().includes(query));
    });
    const pages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize)));
    const paginatedItems = computed(() => filteredItems.value.slice((page.value - 1) * pageSize, page.value * pageSize));
    function resetPage() { page.value = 1; }
    function changePage(nextPage) { if (nextPage >= 1 && nextPage <= pages.value) page.value = nextPage; }
    const navigationCheck = async function () {
      if (!hasUnsavedChanges()) return true;
      const discard = await confirmAction('Hay cambios sin guardar. ¿Descartar los cambios y cambiar de sección?', 'Cambiar de sección', 'Descartar y continuar', 'danger');
      if (discard) clearForm();
      return discard;
    };
    window.__indiarNavigationDirtyCheck = navigationCheck;
    onUnmounted(() => { if (window.__indiarNavigationDirtyCheck === navigationCheck) delete window.__indiarNavigationDirtyCheck; setModalScroll(false); });
    watch(() => props.type, () => {
      clearForm();
      selectedItem.value = null;
      searchText.value = '';
      resetPage();
      load();
    });
    load();
    return { items, nombre, editingId, showForm, selectedItem, warning, loading, searchText, page, pages, pageSize, paginatedItems, filteredItems, singular, title, type: props.type, newLabel, itemNoun, openNew, openDetails, closeDetails, edit, cancel, save, remove, resetPage, changePage };
  },
  template: `
    <main class="admin-page"><div class="container-fluid px-3 px-lg-4 py-4 py-lg-5">
      <div class="admin-games-shell">
        <div class="admin-games-page-header"><div><h1 class="h2 mb-1">Gestión de {{ title.toLowerCase() }}</h1><p class="text-secondary mb-0">Buscá, consultá y administrá {{ title.toLowerCase() }} desde un solo lugar.</p></div><button v-if="!showForm" type="button" class="btn btn-primary" @click="openNew"><i class="fa-solid fa-plus me-2" aria-hidden="true"></i>{{ newLabel }}</button></div>
        <div class="admin-games-toolbar card border-0 mb-3"><div class="card-body"><div class="w-100"><label class="visually-hidden" for="taxonomy-search">Buscar {{ title.toLowerCase() }}</label><input id="taxonomy-search" v-model="searchText" @input="resetPage" class="form-control" type="search" :placeholder="'Buscar ' + title.toLowerCase()"></div></div></div>
        <div class="admin-games-table-card card border-0">
          <div class="table-responsive">
            <table class="table admin-taxonomy-table align-middle mb-0">
              <thead>
                <tr>
                  <th style="width: 100px;">ID</th>
                  <th>{{ singular }}</th>
                  <th class="text-end" style="width: 260px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading"><td colspan="3" class="text-center py-5 text-secondary"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Cargando {{ title.toLowerCase() }}...</td></tr>
                <tr v-else-if="!filteredItems.length"><td colspan="3" class="text-center text-secondary py-5">{{ searchText ? 'No hay resultados para esa búsqueda.' : 'Todavía no hay ' + title.toLowerCase() + '.' }}</td></tr>
                <tr v-else v-for="item in paginatedItems" :key="item.ID">
                  <td><span class="badge text-bg-secondary">#{{ item.ID }}</span></td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i :class="type === 'categorias' ? 'fa-solid fa-shapes text-primary' : 'fa-solid fa-layer-group text-primary'" aria-hidden="true"></i>
                      <strong class="admin-taxonomy-name">{{ item.nombre }}</strong>
                    </div>
                  </td>
                  <td class="text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-primary me-1" type="button" :aria-label="'Ver ' + itemNoun + ' ' + item.nombre" @click="openDetails(item)"><i class="fa-regular fa-eye me-1" aria-hidden="true"></i><span>Ver</span></button>
                    <button class="btn btn-sm btn-outline-secondary me-1" type="button" :aria-label="'Editar ' + itemNoun + ' ' + item.nombre" @click="edit(item)"><i class="fa-solid fa-pen me-1" aria-hidden="true"></i><span>Editar</span></button>
                    <button class="btn btn-sm btn-outline-danger" type="button" :aria-label="'Eliminar ' + itemNoun + ' ' + item.nombre" @click="remove(item)"><i class="fa-regular fa-trash-can me-1" aria-hidden="true"></i><span>Eliminar</span></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="filteredItems.length" class="admin-games-pagination d-flex flex-wrap align-items-center justify-content-between gap-3"><span class="small text-secondary">Mostrando {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, filteredItems.length) }} de {{ filteredItems.length }}</span><nav :aria-label="'Paginación de ' + title"><ul class="pagination pagination-sm mb-0"><li class="page-item" :class="{disabled: page === 1}"><button class="page-link" type="button" :disabled="page === 1" @click="changePage(page - 1)">Anterior</button></li><li v-for="p in pages" :key="p" class="page-item" :class="{active: page === p}"><button class="page-link" type="button" @click="changePage(p)">{{ p }}</button></li><li class="page-item" :class="{disabled: page === pages}"><button class="page-link" type="button" :disabled="page === pages" @click="changePage(page + 1)">Siguiente</button></li></ul></nav></div>
        </div>
      </div>
      <div v-if="showForm" class="admin-game-detail-backdrop" @click.self="cancel"><section class="admin-game-detail-window admin-taxonomy-dialog card border-0 shadow-lg" role="dialog" aria-modal="true" :aria-label="'Formulario de ' + itemNoun"><div class="card-body p-4"><div class="d-flex justify-content-between align-items-start gap-3 mb-4"><div><span class="text-secondary small">Gestión de {{ title.toLowerCase() }}</span><h2 class="h4 mb-0">{{ editingId ? 'Editar ' + itemNoun : newLabel }}</h2></div><button type="button" class="btn-close" aria-label="Cerrar" @click="cancel"></button></div><form @submit.prevent="save"><div class="admin-game-field-full"><label class="form-label" for="taxonomy-name">Nombre *</label><input id="taxonomy-name" v-model="nombre" class="form-control" required maxlength="100" :placeholder="'Nombre del ' + itemNoun"></div><div v-if="warning" class="alert alert-danger mt-3 mb-0 py-2">{{ warning }}</div><div class="admin-game-form-actions mt-4"><button class="btn btn-primary ms-auto" type="submit">{{ editingId ? 'Guardar cambios' : 'Crear ' + itemNoun }}</button><button class="btn btn-outline-secondary" type="button" @click="cancel">Cancelar</button></div></form></div></section></div>
      <div v-if="selectedItem" class="admin-game-detail-backdrop" @click.self="closeDetails"><section class="admin-game-detail-window admin-taxonomy-dialog card border-0 shadow-lg" role="dialog" aria-modal="true" :aria-label="'Detalles de ' + singular.toLowerCase()"><div class="card-body p-4"><div class="d-flex justify-content-between align-items-start gap-3 mb-4"><div><span class="text-secondary small">Detalles de {{ singular.toLowerCase() }}</span><h2 class="h4 mb-0">{{ selectedItem.nombre }}</h2></div><button type="button" class="btn-close" aria-label="Cerrar" @click="closeDetails"></button></div><section class="admin-game-summary-grid admin-taxonomy-summary-grid mb-0"><div><span>Nombre</span><strong>{{ selectedItem.nombre }}</strong></div><div><span>ID</span><strong>{{ selectedItem.ID }}</strong></div></section><div v-if="warning" class="alert alert-info mt-3 mb-0">{{ warning }}</div><div class="admin-game-detail-actions mt-4"><button class="btn btn-outline-primary" type="button" @click="edit(selectedItem)">Editar</button><button class="btn btn-outline-danger" type="button" @click="remove(selectedItem)">Eliminar</button></div></div></section></div>
    </div></main>
  `
};
