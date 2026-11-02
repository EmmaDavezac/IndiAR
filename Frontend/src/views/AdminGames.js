import { ref, computed } from '../../assets/js/lib/vue-esm.js';
import { request, getJuegos, saveJuego, uploadJuegoImagen, getJuegoImagenes, setJuegoEstado, deleteResource, getCategorias, getColecciones } from '../services/api.js?v=20261101h';
import router from '../router.js';
import { confirmAction } from '../services/confirm.js';

const emptyGame = () => ({ titulo: '', distribuidor: '', desarrollador: '', lanzamiento: '', descripcion: '', precio: '', oferta_tipo: '', oferta_valor: '', oferta_desde: '', oferta_hasta: '', categorias: [], colecciones: [], plataformas: [], idiomas: [] });
const requirementFieldDefaults = ['procesador_min', 'ram_min', 'gpu_min', 'almacenamiento_min', 'sistema_min', 'procesador_rec', 'ram_rec', 'gpu_rec', 'almacenamiento_rec', 'sistema_rec'];

export default {
  name: 'AdminGames',
  setup() {
    const games = ref([]); const categorias = ref([]); const colecciones = ref([]); const requisitos = ref([]);
    const game = ref(emptyGame()); const gameOriginal = ref(emptyGame()); const editingId = ref(null); const showGameForm = ref(false); const gameStep = ref(1); const warning = ref(''); const loading = ref(true);
    const selectedGame = ref(null); const imageWarning = ref(''); const activeTab = ref('juegos'); const detailTab = ref('informacion'); const requirement = ref({}); const requirementOriginal = ref({}); const requirementsEditing = ref(false); const editingRequirementId = ref(null);
    const gameImages = ref([]); const selectedImageIndex = ref(0); const imagePreviews = ref([]); const pendingImageFiles = ref([]);
    const searchText = ref(''); const statusFilter = ref('todos'); const currentPage = ref(1); const pageSize = 10;
    const filteredGames = computed(() => {
      const search = searchText.value.trim().toLowerCase();
      return games.value.filter(item => {
        const matchesSearch = !search || `${item.titulo} ${item.desarrollador} ${item.distribuidor}`.toLowerCase().includes(search);
        const matchesStatus = statusFilter.value === 'todos' || (statusFilter.value === 'activos' ? item.activo !== false : item.activo === false);
        return matchesSearch && matchesStatus;
      });
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(filteredGames.value.length / pageSize)));
    const paginatedGames = computed(() => {
      if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
      const start = (currentPage.value - 1) * pageSize;
      return filteredGames.value.slice(start, start + pageSize);
    });
    const emptyGameRows = computed(() => Math.max(0, pageSize - paginatedGames.value.length));
    function resetPagination() { currentPage.value = 1; }
    function changePage(page) {
      if (page >= 1 && page <= totalPages.value) currentPage.value = page;
    }
    const requirementFields = computed(() => {
      const fields = requisitos.value.length
        ? Object.keys(requisitos.value[0])
        : requirementFieldDefaults;
      return [...new Set(fields)].filter(field => field.toLowerCase() !== 'id');
    });
    const requirementLabels = {
      procesador_min: 'Procesador mínimo', ram_min: 'RAM mínima', gpu_min: 'GPU mínima',
      almacenamiento_min: 'Almacenamiento mínimo', sistema_min: 'Sistema mínimo',
      procesador_rec: 'Procesador recomendado', ram_rec: 'RAM recomendada', gpu_rec: 'GPU recomendada',
      almacenamiento_rec: 'Almacenamiento recomendado', sistema_rec: 'Sistema recomendado'
    };
    function requirementLabel(field) {
      return requirementLabels[field] || field.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
    }

    async function load() {
      loading.value = true;
      const [juegosData, categoriasData, coleccionesData, requisitosResponse] = await Promise.all([getJuegos(), getCategorias(), getColecciones(), request('/requisitos')]);
      games.value = juegosData; categorias.value = categoriasData; colecciones.value = coleccionesData;
      requisitos.value = requisitosResponse.ok ? await requisitosResponse.json() : [];
      if (!editingRequirementId.value && !Object.keys(requirement.value).length && requirementFields.value.length) {
        requirement.value = Object.fromEntries(requirementFields.value.map(field => [field, '']));
      }
      loading.value = false;
    }
    function clearDetailChanges() {
      imagePreviews.value.forEach(url => URL.revokeObjectURL(url));
      imagePreviews.value = [];
      pendingImageFiles.value = [];
      requirement.value = { ...requirementOriginal.value };
      requirementsEditing.value = false;
      game.value = emptyGame();
      gameOriginal.value = emptyGame();
      document.body.classList.remove('indiar-detail-open');
    }

    function hasUnsavedChanges() {
      const gameDirty = showGameForm.value && JSON.stringify(game.value) !== JSON.stringify(gameOriginal.value);
      const requirementsDirty = requirementsEditing.value && JSON.stringify(requirement.value) !== JSON.stringify(requirementOriginal.value);
      return gameDirty || requirementsDirty || pendingImageFiles.value.length > 0;
    }

    window.__indiarNavigationDirtyCheck = async function confirmNavigation() {
      if (!hasUnsavedChanges()) return true;
      const discard = await confirmAction('Hay cambios sin guardar. ¿Descartar los cambios y cambiar de sección?', 'Cambiar de sección', 'Descartar y continuar', 'danger');
      if (discard) clearDetailChanges();
      return discard;
    };

    function imageUrl(url) {
      if (!url) return '';
      return url.startsWith('/uploads/') ? `http://localhost:5000${url}` : url;
    }

    function hideMissingImage(event) {
      event.target.style.display = 'none';
      const placeholder = event.target.nextElementSibling;
      if (placeholder?.classList.contains('admin-image-placeholder')) placeholder.hidden = false;
    }

    async function openGameDetails(item) {
      selectedGame.value = item;
      detailTab.value = 'informacion';
      const id = item.requisitosID;
      const current = requisitos.value.find(entry => String(entry.id || entry.ID) === String(id));
      editingRequirementId.value = current ? (current.id || current.ID) : null;
      const requirementData = current ? Object.fromEntries(requirementFields.value.map(field => [field, current[field] ?? ''])) : Object.fromEntries(requirementFields.value.map(field => [field, '']));
      requirement.value = { ...requirementData };
      requirementOriginal.value = { ...requirementData };
      requirementsEditing.value = false;
      imageWarning.value = '';
      imagePreviews.value = [];
      pendingImageFiles.value = [];
      selectedImageIndex.value = 0;
      const { response, data } = await getJuegoImagenes(item.ID);
      gameImages.value = response.ok ? data : [];
      document.body.classList.add('indiar-detail-open');
    }

    function previewImages(event) {
      setImageFiles(Array.from(event.target.files || []));
    }

    function setImageFiles(files) {
      pendingImageFiles.value = files;
      imagePreviews.value.forEach(url => URL.revokeObjectURL(url));
      imagePreviews.value = files.map(file => URL.createObjectURL(file));
    }

    function dropImages(event) {
      const files = Array.from(event.dataTransfer?.files || []).filter(file => file.type.startsWith('image/'));
      setImageFiles(files);
    }

    async function confirmImageUpload() {
      if (!pendingImageFiles.value.length || !selectedGame.value) return;
      if (!await confirmAction(`¿Subir ${pendingImageFiles.value.length} imagen${pendingImageFiles.value.length === 1 ? '' : 'es'} al juego?`, 'Confirmar imágenes', 'Subir imágenes')) return;
      imageWarning.value = '';
      for (const file of pendingImageFiles.value) {
        const { response, data } = await uploadJuegoImagen(selectedGame.value.ID, file);
        if (!response.ok) { imageWarning.value = data.mensaje || 'No se pudo subir una imagen'; return; }
      }
      const { response, data } = await getJuegoImagenes(selectedGame.value.ID);
      gameImages.value = response.ok ? data : [];
      imagePreviews.value.forEach(url => URL.revokeObjectURL(url));
      imagePreviews.value = []; pendingImageFiles.value = [];
      const imageInput = document.querySelector('#game-detail-images-input');
      if (imageInput) imageInput.value = '';
      await load();
    }

    async function removeGameImage(image) {
      if (!await confirmAction('¿Eliminar esta imagen? Esta acción no se puede deshacer.', 'Eliminar imagen', 'Eliminar', 'danger')) return;
      const { response, data } = await deleteResource('/imagenes', image.ID);
      if (!response.ok) return imageWarning.value = data.mensaje || 'No se pudo eliminar la imagen';
      const gallery = await getJuegoImagenes(selectedGame.value.ID);
      gameImages.value = gallery.response.ok ? gallery.data : [];
      selectedImageIndex.value = Math.min(selectedImageIndex.value, Math.max(gameImages.value.length - 1, 0));
      await load();
    }

    function edit(item) {
      editingId.value = item.ID;
      showGameForm.value = true;
      game.value = { ...item, lanzamiento: item.lanzamiento?.slice(0, 10) || '', oferta_tipo: item.oferta_tipo || '', oferta_valor: item.oferta_valor ?? '', oferta_desde: item.oferta_desde?.slice(0, 10) || '', oferta_hasta: item.oferta_hasta?.slice(0, 10) || '', categorias: item.categorias?.map(x => String(x.ID)) || [], colecciones: item.colecciones?.map(x => String(x.ID)) || [], plataformas: item.plataformas || [], idiomas: Array.isArray(item.idiomas) ? item.idiomas.join(', ') : (item.idiomas || '') };
      gameOriginal.value = JSON.parse(JSON.stringify(game.value));
      gameStep.value = 1;
      document.body.classList.remove('indiar-detail-open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function cancel() { editingId.value = null; showGameForm.value = false; gameStep.value = 1; game.value = emptyGame(); gameOriginal.value = emptyGame(); warning.value = ''; document.body.classList.remove('indiar-detail-open'); }
    async function confirmCancelGame() { if (await confirmAction('¿Descartar los cambios del juego?', 'Descartar cambios', 'Descartar', 'danger')) cancel(); }
    function openNewGame() { cancel(); showGameForm.value = true; gameOriginal.value = JSON.parse(JSON.stringify(game.value)); window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }
    function nextGameStep() {
      const price = Number(String(game.value.precio ?? '').replace(',', '.'));
      if (!game.value.titulo.trim() || !Number.isFinite(price) || price < 0 || !game.value.lanzamiento) {
        warning.value = 'Completá todos los campos obligatorios antes de continuar.';
        return;
      }
      if (game.value.oferta_tipo && (game.value.oferta_valor === '' || game.value.oferta_valor == null || !game.value.oferta_desde || !game.value.oferta_hasta)) {
        warning.value = 'Completá el valor y las fechas de inicio y fin de la oferta.';
        return;
      }
      gameStep.value = 2;
      warning.value = '';
    }
    function previousGameStep() { gameStep.value = 1; warning.value = ''; }
    async function save() {
      if (!await confirmAction(editingId.value ? '¿Guardar los cambios de este juego?' : '¿Crear este juego?', editingId.value ? 'Guardar juego' : 'Crear juego', editingId.value ? 'Guardar' : 'Crear')) return;
      warning.value = '';
      const requiredText = [game.value.titulo, game.value.distribuidor, game.value.desarrollador, game.value.descripcion, game.value.lanzamiento];
      const price = Number(String(game.value.precio ?? '').replace(',', '.'));
      if (requiredText.some(value => !String(value ?? '').trim()) || !Number.isFinite(price) || price < 0) {
        warning.value = 'Completá todos los campos obligatorios con valores válidos.';
        return;
      }
      const offerValue = game.value.oferta_tipo
        ? Number(String(game.value.oferta_valor ?? '').replace(',', '.'))
        : null;
      if (game.value.oferta_tipo) {
        if (!Number.isFinite(offerValue) || game.value.oferta_valor === '' || game.value.oferta_valor == null || !game.value.oferta_desde || !game.value.oferta_hasta) {
          warning.value = 'Completá el valor y las fechas de inicio y fin de la oferta.';
          return;
        }
        if (game.value.oferta_desde > game.value.oferta_hasta) {
          warning.value = 'La fecha de fin de la oferta debe ser igual o posterior al inicio.';
          return;
        }
        if (game.value.oferta_tipo === 'precio' && (offerValue < 0 || offerValue >= price)) {
          warning.value = 'El precio de oferta debe ser mayor o igual a cero y menor que el precio normal.';
          return;
        }
        if (game.value.oferta_tipo === 'porcentaje' && (offerValue <= 0 || offerValue > 100)) {
          warning.value = 'El descuento porcentual debe ser mayor que cero y como máximo 100%.';
          return;
        }
      }
      let requisitosID = Number(game.value.requisitosID);
      if (!editingId.value && !requisitosID) {
        const blankRequirement = Object.fromEntries(requirementFields.value.map(field => [field, 'Por definir']));
        const requirementResponse = await request('/requisitos', { method: 'POST', body: JSON.stringify(blankRequirement) });
        const requirementData = await requirementResponse.json();
        if (!requirementResponse.ok) return warning.value = requirementData.mensaje || 'No se pudo crear el perfil de requisitos';
        requisitosID = Number(requirementData.id);
      }
      const payload = {
        ...game.value,
        precio: price,
        oferta_tipo: game.value.oferta_tipo || null,
        oferta_valor: offerValue,
        oferta_desde: game.value.oferta_tipo ? game.value.oferta_desde : null,
        oferta_hasta: game.value.oferta_tipo ? game.value.oferta_hasta : null,
        plataformas: Array.isArray(game.value.plataformas) ? game.value.plataformas : [],
        idiomas: typeof game.value.idiomas === 'string' ? game.value.idiomas.split(',').map(item => item.trim()).filter(Boolean) : (game.value.idiomas || []),
        requisitosID: requisitosID || Number(game.value.requisitosID),
        img_principal: game.value.img_principal || '/uploads/pendiente.webp',
        categorias: game.value.categorias.map(Number),
        colecciones: game.value.colecciones.map(Number)
      };
      const { response, data } = await saveJuego(payload, editingId.value);
      if (!response.ok) return warning.value = data.mensaje || 'No se pudo guardar el juego';
      const wasEditing = Boolean(editingId.value);
      const createdTitle = game.value.titulo;
      cancel(); await load();
      if (!wasEditing) {
        const createdGame = games.value.find(item => item.titulo === createdTitle);
        if (createdGame) openGameDetails(createdGame);
      }
    }
    async function saveImage(item) {
      warning.value = '';
      const payload = { ...item, categorias: (item.categorias || []).map(category => category.ID), colecciones: (item.colecciones || []).map(collection => collection.ID), precio: Number(item.precio), requisitosID: Number(item.requisitosID) };
      const { response, data } = await saveJuego(payload, item.ID);
      if (!response.ok) return warning.value = data.mensaje || 'No se pudo guardar la imagen';
      await load();
    }

    async function remove(item) {
      if (!await confirmAction(`¿Dar de baja ${item.titulo}? Esta acción eliminará el juego.`, 'Dar de baja', 'Dar de baja', 'danger')) return false;
      const { response, data } = await deleteResource('/juegos', item.ID);
      if (!response.ok) { warning.value = data.mensaje || 'No se pudo dar de baja el juego'; return false; }
      await load();
      return true;
    }
    function editSelectedGame() {
      const item = selectedGame.value;
      selectedGame.value = null;
      document.body.classList.remove('indiar-detail-open');
      if (item) edit(item);
    }
    function editDetailContent() {
      if (detailTab.value === 'requisitos') return editRequirement();
      editSelectedGame();
    }
    async function removeSelectedGame() {
      const gameItem = selectedGame.value;
      if (!gameItem) return;
      const activar = gameItem.activo === false;
      const action = activar ? 'activar' : 'dar de baja';
      if (!await confirmAction(`¿${action[0].toUpperCase() + action.slice(1)} ${gameItem.titulo}?`, action[0].toUpperCase() + action.slice(1), action[0].toUpperCase() + action.slice(1), activar ? 'success' : 'danger')) return;
      const { response, data } = await setJuegoEstado(gameItem.ID, activar);
      if (!response.ok) return warning.value = data.mensaje || 'No se pudo cambiar el estado';
      await load();
      selectedGame.value = games.value.find(item => item.ID === gameItem.ID) || null;
    }
    function editRequirement() {
      requirementOriginal.value = { ...requirement.value };
      requirementsEditing.value = true;
      warning.value = '';
    }

    async function cancelRequirement() {
      if (!await confirmAction('¿Descartar los cambios en los requisitos?', 'Descartar cambios', 'Descartar', 'danger')) return;
      requirement.value = { ...requirementOriginal.value };
      requirementsEditing.value = false;
      warning.value = '';
    }

    async function changeDetailTab(tab) {
      if (tab === detailTab.value) return;
      if (requirementsEditing.value) {
        await confirmAction('Guardá o descartá los cambios antes de cambiar de pestaña.', 'Edición en curso', 'Entendido');
        return;
      }
      if (requirementsEditing.value && JSON.stringify(requirement.value) !== JSON.stringify(requirementOriginal.value)) {
        if (!await confirmAction('Hay cambios sin guardar en los requisitos. ¿Descartar y cambiar de sección?', 'Cambiar de sección', 'Cambiar y descartar', 'danger')) return;
        requirement.value = { ...requirementOriginal.value };
        requirementsEditing.value = false;
      }
      if (pendingImageFiles.value.length && !await confirmAction('Hay imágenes seleccionadas sin subir. ¿Descartar y cambiar de sección?', 'Cambiar de sección', 'Cambiar y descartar', 'danger')) return;
      imagePreviews.value.forEach(url => URL.revokeObjectURL(url)); imagePreviews.value = []; pendingImageFiles.value = [];
      detailTab.value = tab;
    }

    async function closeGameDetails() {
      const dirtyRequirements = requirementsEditing.value && JSON.stringify(requirement.value) !== JSON.stringify(requirementOriginal.value);
      if ((dirtyRequirements || pendingImageFiles.value.length) && !await confirmAction('Hay cambios pendientes. ¿Cerrar y descartarlos?', 'Cerrar detalle', 'Cerrar y descartar', 'danger')) return;
      imagePreviews.value.forEach(url => URL.revokeObjectURL(url)); imagePreviews.value = []; pendingImageFiles.value = [];
      requirementsEditing.value = false; selectedGame.value = null;
      document.body.classList.remove('indiar-detail-open');
    }

    async function saveRequirement() {
      if (!await confirmAction('¿Guardar los cambios en los requisitos técnicos?', 'Guardar requisitos', 'Guardar')) return;
      const id = editingRequirementId.value;
      const response = await request(id ? `/requisitos/${id}` : '/requisitos', { method: id ? 'PUT' : 'POST', body: JSON.stringify(requirement.value) });
      const data = await response.json();
      if (!response.ok) return warning.value = data.mensaje || 'No se pudieron guardar los requisitos';
      if (!id && data.id && selectedGame.value) {
        selectedGame.value.requisitosID = data.id;
        const payload = { ...selectedGame.value, precio: Number(selectedGame.value.precio), requisitosID: Number(data.id), categorias: (selectedGame.value.categorias || []).map(item => Number(item.ID || item)), colecciones: (selectedGame.value.colecciones || []).map(item => Number(item.ID || item)) };
        await saveJuego(payload, selectedGame.value.ID);
      }
      requirementsEditing.value = false;
      await load();
      requirementOriginal.value = { ...requirement.value };
      if (selectedGame.value) openGameDetails(games.value.find(game => game.ID === selectedGame.value.ID) || selectedGame.value);
    }

    async function removeRequirement(item) {
      if (!await confirmAction('¿Eliminar este perfil de requisitos?', 'Eliminar requisitos', 'Eliminar', 'danger')) return;
      const id = item.id || item.ID;
      const response = await request(`/requisitos/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) return warning.value = data.mensaje || 'No se pudieron eliminar los requisitos';
      await load();
    }

    load();
    return { games, filteredGames, paginatedGames, emptyGameRows, totalPages, currentPage, resetPagination, changePage, searchText, statusFilter, categorias, colecciones, requisitos, requirementFields, requirementLabel, game, editingId, showGameForm, gameStep, selectedGame, imageWarning, warning, loading, activeTab, detailTab, requirement, requirementsEditing, editingRequirementId, gameImages, selectedImageIndex, imagePreviews, pendingImageFiles, imageUrl, hideMissingImage, openGameDetails, previewImages, dropImages, confirmImageUpload, removeGameImage, changeDetailTab, closeGameDetails, save, edit, cancel, confirmCancelGame, openNewGame, nextGameStep, previousGameStep, saveImage, remove, editSelectedGame, editDetailContent, removeSelectedGame, editRequirement, cancelRequirement, saveRequirement, removeRequirement, router };
  },
  template: `
    <main class="admin-page"><div class="container-fluid px-3 px-lg-4 py-4 py-lg-5">
      <div class="admin-games-shell">
        <div class="admin-games-page-header" :class="{ 'is-game-form-open': showGameForm }"><div><h1 v-if="!showGameForm" class="h2 mb-0">Gestión de juegos</h1></div><button v-if="activeTab === 'juegos' && !showGameForm" type="button" class="btn btn-primary" @click="openNewGame">Nuevo juego</button></div>
      <section v-if="showGameForm" class="admin-game-form-panel card shadow-sm border-0"><div class="card-body p-4">
          <h2 class="h4 mb-4">{{ editingId ? 'Editar juego' : 'Nuevo juego' }}</h2>
          <div class="admin-game-stepper mb-4" aria-label="Progreso del formulario"><div :class="{ active: gameStep === 1, complete: gameStep > 1 }"><span>1</span><strong>Información principal</strong></div><div :class="{ active: gameStep === 2 }"><span>2</span><strong>Detalles y descripción</strong></div></div>
          <p class="small text-secondary mb-3"><span class="text-danger">*</span> Campos obligatorios</p>
          <form @submit.prevent="save" class="admin-game-form-grid">
            <template v-if="gameStep === 1">
              <div class="admin-game-field-full"><label class="form-label" for="game-title">Título <span class="text-danger">*</span></label><input id="game-title" class="form-control" placeholder="Ej. Hollow Knight" v-model="game.titulo" required></div>
              <div class="admin-game-field"><label class="form-label" for="game-price">Precio <span class="text-danger">*</span></label><input id="game-price" type="number" min="0" step="0.01" class="form-control" placeholder="Ej. 19990" v-model="game.precio" required></div>
              <div class="admin-game-field"><label class="form-label" for="game-date">Lanzamiento <span class="text-danger">*</span></label><input id="game-date" type="date" class="form-control" v-model="game.lanzamiento" required></div>
              <div class="admin-game-field-full"><label class="form-label" for="game-offer-type">Oferta</label><select id="game-offer-type" class="form-select" v-model="game.oferta_tipo"><option value="">Sin oferta</option><option value="precio">Precio de oferta</option><option value="porcentaje">Descuento porcentual</option></select></div>
              <template v-if="game.oferta_tipo">
                <div class="admin-game-field"><label class="form-label" for="game-offer-value">{{ game.oferta_tipo === 'precio' ? 'Precio de oferta' : 'Descuento (%)' }} <span class="text-danger">*</span></label><input id="game-offer-value" type="number" class="form-control" :min="game.oferta_tipo === 'precio' ? 0 : 0.01" :max="game.oferta_tipo === 'porcentaje' ? 100 : undefined" step="0.01" v-model="game.oferta_valor" required></div>
                <div class="admin-game-field"><label class="form-label" for="game-offer-start">Inicio de oferta <span class="text-danger">*</span></label><input id="game-offer-start" type="date" class="form-control" v-model="game.oferta_desde" required></div>
                <div class="admin-game-field"><label class="form-label" for="game-offer-end">Fin de oferta <span class="text-danger">*</span></label><input id="game-offer-end" type="date" class="form-control" v-model="game.oferta_hasta" required></div>
              </template>
            </template>
            <template v-else>
              <div class="admin-game-field"><label class="form-label" for="game-publisher">Distribuidor <span class="text-danger">*</span></label><input id="game-publisher" class="form-control" placeholder="Ej. Team Cherry" v-model="game.distribuidor" required></div>
              <div class="admin-game-field"><label class="form-label" for="game-dev">Desarrollador <span class="text-danger">*</span></label><input id="game-dev" class="form-control" placeholder="Ej. Team Cherry" v-model="game.desarrollador" required></div>
              <div class="admin-game-field-full"><label class="form-label" for="game-description">Descripción <span class="text-danger">*</span></label><textarea id="game-description" rows="5" class="form-control admin-game-description" placeholder="Escribe una descripción breve del juego" v-model="game.descripcion" required></textarea></div>
              <fieldset class="admin-game-field-full border-0 p-0"><legend class="form-label">Géneros</legend><div class="admin-taxonomy-options"><label v-for="genre in categorias" :key="genre.ID" class="form-check"><input v-model="game.categorias" class="form-check-input" type="checkbox" :value="String(genre.ID)"><span class="form-check-label">{{ genre.nombre }}</span></label></div></fieldset>
              <fieldset class="admin-game-field-full border-0 p-0"><legend class="form-label">Colecciones</legend><div class="admin-taxonomy-options"><label v-for="collection in colecciones" :key="collection.ID" class="form-check"><input v-model="game.colecciones" class="form-check-input" type="checkbox" :value="String(collection.ID)"><span class="form-check-label">{{ collection.nombre }}</span></label></div></fieldset>
              <fieldset class="admin-game-field-full border-0 p-0"><legend class="form-label">Plataformas</legend><div class="d-flex flex-wrap gap-3"><label v-for="platform in ['Windows', 'Linux', 'macOS', 'Android', 'iOS']" :key="platform" class="form-check"><input v-model="game.plataformas" class="form-check-input" type="checkbox" :value="platform"><span class="form-check-label">{{ platform }}</span></label></div></fieldset>
              <div class="admin-game-field-full"><label class="form-label" for="game-languages">Idiomas disponibles</label><input id="game-languages" class="form-control" v-model="game.idiomas" placeholder="Español, Inglés, Portugués">
                <div class="form-text">Separá los idiomas con comas. Se mostrarán en la página del juego.</div>
              </div>
              <div class="admin-game-field-full"><div class="alert alert-info mb-0 py-2">Podrás subir imágenes y completar los requisitos después de crear el juego.</div></div>
            </template>
            <div v-if="warning" class="admin-game-field-full"><div class="alert alert-danger mb-0 py-2">{{ warning }}</div></div>
            <div class="admin-game-field-full admin-game-form-actions"><button v-if="gameStep === 2" class="btn btn-outline-secondary" type="button" @click="previousGameStep">Atrás</button><button v-if="gameStep === 1" class="btn btn-primary ms-auto" type="button" @click="nextGameStep">{{ editingId ? 'Continuar edición' : 'Continuar creación' }}</button><button v-if="gameStep === 2" class="btn btn-primary ms-auto" type="submit">{{ editingId ? 'Guardar cambios' : 'Crear juego' }}</button><button class="btn btn-outline-secondary" type="button" @click="confirmCancelGame">Cancelar</button></div>
          </form>
        </div></section>
      <div v-if="!showGameForm" class="admin-games-content col-12">
        <div class="admin-games-toolbar card border-0 mb-3">
          <div class="card-body d-flex flex-wrap gap-3">
            <div class="flex-grow-1">
              <label class="visually-hidden" for="games-search">Buscar juegos</label>
              <input id="games-search" v-model="searchText" @input="resetPagination" class="form-control" type="search" placeholder="Buscar por título, desarrollador o distribuidor">
            </div>
            <div>
              <label class="visually-hidden" for="games-status">Estado</label>
              <select id="games-status" v-model="statusFilter" @change="resetPagination" class="form-select">
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="desactivados">Desactivados</option>
              </select>
            </div>
          </div>
        </div>
        <div class="admin-games-table-card card border-0">
          <div class="table-responsive">
            <table class="table admin-games-table align-middle mb-0">
              <thead><tr><th>Juego</th><th>Precio</th><th>Géneros</th><th>Colecciones</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead>
              <tbody>
                <tr v-if="loading"><td colspan="6" class="text-center py-5">Cargando juegos...</td></tr>
                <tr v-for="item in paginatedGames" :key="item.ID">
                  <td><strong class="admin-game-name">{{ item.titulo }}</strong><div class="small text-secondary mt-1">{{ item.desarrollador }}</div></td>
                  <td class="admin-game-price"><template v-if="item.oferta_activa"><span class="text-decoration-line-through text-secondary small">\${{ Number(item.precio).toFixed(2) }}</span><br><strong class="text-danger">\${{ Number(item.precio_final).toFixed(2) }}</strong></template><template v-else>\${{ Number(item.precio).toFixed(2) }}</template></td>
                  <td><span v-for="cat in item.categorias" :key="cat.ID" class="badge admin-filter-badge me-1 mb-1">{{ cat.nombre }}</span></td>
                  <td><span v-for="col in item.colecciones" :key="col.ID" class="badge admin-collection-badge me-1 mb-1">{{ col.nombre }}</span></td>
                  <td><span class="badge" :class="item.activo === false ? 'text-bg-secondary' : 'text-bg-success'">{{ item.activo === false ? 'Desactivado' : 'Activo' }}</span></td>
                  <td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary" type="button" @click="openGameDetails(item)"><i class="fa-solid fa-eye me-1" aria-hidden="true"></i>Ver</button></td>
                </tr>
                <tr v-if="!loading && !filteredGames.length"><td colspan="6" class="text-center text-secondary py-5">No hay juegos que coincidan con los filtros.</td></tr>
                <template v-if="!loading && filteredGames.length"><tr v-for="row in emptyGameRows" :key="'empty-game-'+row" class="admin-table-empty-row" aria-hidden="true"><td colspan="6"></td></tr></template>
              </tbody>
            </table>
          </div>
          <div class="admin-games-pagination d-flex flex-wrap align-items-center justify-content-between gap-3" v-if="filteredGames.length">
            <span class="small text-secondary">Página {{ currentPage }} de {{ totalPages }} · {{ filteredGames.length }} juegos</span>
            <nav aria-label="Paginación de juegos"><ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }"><button class="page-link" type="button" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Anterior</button></li>
              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }"><button class="page-link" type="button" @click="changePage(page)" :aria-current="currentPage === page ? 'page' : undefined">{{ page }}</button></li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }"><button class="page-link" type="button" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Siguiente</button></li>
            </ul></nav>
          </div>
        </div>
      </div>
      <div v-if="selectedGame" class="admin-game-detail-backdrop" @click.self="closeGameDetails">
      <section class="admin-game-detail-window card border-0 shadow-lg" role="dialog" aria-modal="true" aria-label="Detalles del juego">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
            <div><span class="text-secondary small">Detalles del juego</span><h2 class="h4 mb-0">{{ selectedGame.titulo }}</h2></div>
            <button type="button" class="btn-close" aria-label="Cerrar" @click="closeGameDetails"></button>
          </div>
          <ul class="nav nav-tabs admin-game-detail-tabs mb-4" role="tablist">
            <li class="nav-item"><button type="button" class="nav-link" :class="{ active: detailTab === 'informacion' }" @click="changeDetailTab('informacion')">Información</button></li>
            <li class="nav-item"><button type="button" class="nav-link" :class="{ active: detailTab === 'imagenes' }" @click="changeDetailTab('imagenes')">Imágenes</button></li>
            <li class="nav-item"><button type="button" class="nav-link" :class="{ active: detailTab === 'requisitos' }" @click="changeDetailTab('requisitos')">Requisitos</button></li>
          </ul>
          <section v-if="detailTab === 'informacion'" class="admin-game-summary-grid">
            <div><span>Precio</span><strong v-if="selectedGame.oferta_activa"><del class="text-secondary">$ {{ Number(selectedGame.precio).toFixed(2) }}</del> $ {{ Number(selectedGame.precio_final).toFixed(2) }}</strong><strong v-else>$ {{ Number(selectedGame.precio).toFixed(2) }}</strong><small v-if="selectedGame.oferta_tipo">Oferta: {{ selectedGame.oferta_tipo === 'precio' ? 'precio especial' : selectedGame.oferta_valor + '% de descuento' }} · {{ selectedGame.oferta_desde }} al {{ selectedGame.oferta_hasta }}</small></div>
            <div><span>Fecha de publicación</span><strong>{{ selectedGame.lanzamiento?.slice(0, 10) }}</strong></div>
            <div><span>Fecha de subida</span><strong>{{ selectedGame.fecha_subida?.slice(0, 10) || 'No disponible' }}</strong></div>
            <div><span>Distribuidor</span><strong>{{ selectedGame.distribuidor }}</strong></div>
            <div><span>Desarrollador</span><strong>{{ selectedGame.desarrollador }}</strong></div>
            <div><span>Géneros</span><strong>{{ (selectedGame.categorias || []).map(item => item.nombre).join(', ') || 'Sin géneros' }}</strong></div>
            <div><span>Plataformas</span><strong>{{ (selectedGame.plataformas || []).join(', ') || 'Sin plataformas' }}</strong></div>
            <div><span>Idiomas</span><strong>{{ (Array.isArray(selectedGame.idiomas) ? selectedGame.idiomas : []).join(', ') || 'Sin idiomas' }}</strong></div>
            <div class="admin-game-field-full"><span>Descripción</span><p class="mb-0">{{ selectedGame.descripcion }}</p></div>
          </section>
          <section v-if="detailTab === 'imagenes'">
            <div v-if="gameImages.length" class="admin-game-gallery mb-4">
              <img :src="imageUrl(gameImages[selectedImageIndex]?.url)" class="admin-game-gallery-main" :alt="selectedGame.titulo">
              <div class="admin-game-gallery-thumbnails">
                <button v-for="(image, index) in gameImages" :key="image.ID" type="button" :class="{ active: selectedImageIndex === index }" @click="selectedImageIndex = index">
                  <img :src="imageUrl(image.url)" :alt="'Miniatura ' + (index + 1)">
                </button>
              </div>
              <button v-if="gameImages[selectedImageIndex]" type="button" class="btn btn-outline-danger btn-sm mt-3" @click="removeGameImage(gameImages[selectedImageIndex])">Eliminar imagen seleccionada</button>
            </div>
            <div v-else class="admin-empty-gallery mb-4">Este juego todavía no tiene imágenes.</div>
            <label class="admin-image-dropzone" for="game-detail-images-input" @dragover.prevent @drop.prevent="dropImages">
              <i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
              <strong>Arrastrá imágenes aquí</strong>
              <span>o hacé clic para seleccionar archivos</span>
              <input id="game-detail-images-input" class="visually-hidden" type="file" accept="image/*" multiple @change="previewImages">
            </label>
            <div class="form-text">Las imágenes se convierten y comprimen automáticamente a WebP.</div>
            <div v-if="imagePreviews.length" class="admin-image-previews mt-3">
              <figure v-for="(preview, index) in imagePreviews" :key="preview"><img :src="preview" :alt="'Vista previa ' + (index + 1)"></figure>
              <div class="w-100"><button type="button" class="btn btn-primary" @click="confirmImageUpload">Confirmar subida</button></div>
            </div>
            <div v-if="imageWarning" class="alert alert-danger mt-3 mb-0 py-2">{{ imageWarning }}</div>
          </section>
          <section v-if="detailTab === 'requisitos'">
            <form v-if="requirementFields.length" id="requirements-detail-form" @submit.prevent="saveRequirement" class="row g-3">
              <div v-for="field in requirementFields" :key="field" class="col-12 col-md-6">
                <label class="form-label" :for="'detail-req-'+field">{{ requirementLabel(field) }}</label>
                <input :id="'detail-req-'+field" class="form-control" v-model="requirement[field]" :readonly="!requirementsEditing">
              </div>
              <div v-if="warning" class="col-12"><div class="alert alert-danger mb-0 py-2">{{ warning }}</div></div>
            </form>
          </section>
          <div class="admin-game-detail-actions mt-4"><button v-if="!requirementsEditing" type="button" class="btn btn-outline-primary" @click="editDetailContent">Editar</button><button v-if="requirementsEditing && detailTab === 'requisitos'" type="submit" class="btn btn-primary" form="requirements-detail-form">Guardar requisitos</button><button v-if="requirementsEditing && detailTab === 'requisitos'" type="button" class="btn btn-outline-secondary" @click="cancelRequirement">Descartar</button><button type="button" class="btn" :class="selectedGame.activo === false ? 'btn-outline-success' : 'btn-outline-danger'" @click="removeSelectedGame">{{ selectedGame.activo === false ? 'Activar' : 'Dar de baja' }}</button><button type="button" class="btn btn-secondary" @click="closeGameDetails">Cerrar</button></div>
        </div>
      </section>
      </div>
      </div>
    </div></main>
  `
};