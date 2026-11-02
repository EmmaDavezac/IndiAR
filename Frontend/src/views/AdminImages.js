import { ref } from '../../assets/js/lib/vue-esm.js';
import { getJuegos, saveJuego } from '../services/api.js';
import router from '../router.js';

export default {
  name: 'AdminImages',
  setup() {
    const games = ref([]); const selected = ref(null); const url = ref(''); const warning = ref('');
    async function load() { games.value = await getJuegos(); }
    function choose(game) { selected.value = game; url.value = game.img_principal || ''; }
    async function save() { warning.value=''; if(!selected.value)return; const payload={...selected.value,img_principal:url.value}; const {response,data}=await saveJuego(payload,selected.value.ID); if(!response.ok)return warning.value=data.mensaje||'No se pudo guardar la imagen'; await load(); selected.value=null; url.value=''; }
    load(); return {games,selected,url,warning,choose,save,router};
  },
  template: `<main class="admin-page"><div class="container py-4 py-lg-5"><div class="mb-4"><h1 class="h2 mt-1 mb-0">Imágenes</h1></div><div class="row g-4"><div class="col-12 col-lg-5"><div class="list-group shadow-sm"> <button v-for="game in games" :key="game.ID" type="button" class="list-group-item list-group-item-action" @click="choose(game)"><div class="d-flex gap-3 align-items-center"><img :src="game.img_principal" alt="" style="width:72px;height:48px;object-fit:cover"><div><strong>{{ game.titulo }}</strong><div class="small text-secondary">{{ game.desarrollador }}</div></div></div></button></div></div><div class="col-12 col-lg-7"><section v-if="selected" class="card border-0 shadow-sm"><div class="card-body p-4"><h2 class="h4">{{ selected.titulo }}</h2><img :src="url" class="img-fluid rounded mb-3" :alt="'Imagen de '+selected.titulo" style="max-height:260px"><label class="form-label" for="image-url">URL de la imagen</label><input id="image-url" v-model="url" type="url" class="form-control" required><div v-if="warning" class="alert alert-danger mt-3 py-2 mb-0">{{ warning }}</div><button class="btn btn-primary mt-3" @click="save">Guardar imagen</button></div></section><section v-else class="card border-0 shadow-sm"><div class="card-body text-secondary text-center p-5">Selecciona un juego para administrar su imagen principal.</div></section></div></div></div></main>`
};
