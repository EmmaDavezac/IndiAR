import { ref, computed } from '../../assets/js/lib/vue-esm.js';
import { request } from '../services/api.js';
import router from '../router.js';
import { confirmAction } from '../services/confirm.js';

export default {
  name: 'AdminRequirements',
  setup() {
    const items=ref([]); const form=ref({}); const editingId=ref(null); const warning=ref(''); const fields=computed(()=>items.value.length ? Object.keys(items.value[0]).filter(k=>k.toLowerCase() !== 'id') : []);
    async function load(){const r=await request('/requisitos');items.value=r.ok?await r.json():[]; if(!editingId.value && items.value[0]) form.value=Object.fromEntries(fields.value.map(k=>[k,'']));}
    function edit(item){editingId.value=item.id||item.ID; form.value={}; fields.value.forEach(k=>form.value[k]=item[k]??'');}
    function cancel(){editingId.value=null; form.value=Object.fromEntries(fields.value.map(k=>[k,''])); warning.value='';}
    async function save(){warning.value='';const r=await request(editingId.value?`/requisitos/${editingId.value}`:'/requisitos',{method:editingId.value?'PUT':'POST',body:JSON.stringify(form.value)});const d=await r.json();if(!r.ok)return warning.value=d.mensaje||'No se pudo guardar';cancel();await load();}
    async function remove(item){if(!await confirmAction('¿Eliminar este perfil de requisitos?', 'Eliminar requisitos', 'Eliminar', 'danger'))return;const r=await request(`/requisitos/${item.id||item.ID}`,{method:'DELETE'});const d=await r.json();if(!r.ok)return warning.value=d.mensaje||'No se pudo eliminar';await load();}
    load(); return{items,form,editingId,warning,fields,edit,cancel,save,remove,router};
  },
  template:`<main class="admin-page"><div class="container-fluid px-3 px-lg-4 py-4 py-lg-5"><div class="mb-4"><h1 class="h2 mt-1 mb-0">Requisitos técnicos</h1></div><div class="row g-4"><div class="col-12 col-xl-4"><section class="card border-0 shadow-sm"><div class="card-body p-4"><h2 class="h4">{{ editingId ? 'Editar perfil' : 'Nuevo perfil' }}</h2><form v-if="fields.length" class="row g-3 mt-1" @submit.prevent="save"><div v-for="field in fields" :key="field" class="col-sm-6"><label class="form-label" :for="'req-'+field">{{ field.replaceAll('_',' ') }}</label><input :id="'req-'+field" class="form-control" v-model="form[field]"></div><div v-if="warning" class="col-12"><div class="alert alert-danger py-2 mb-0">{{ warning }}</div></div><div class="col-12 d-flex gap-2"><button class="btn btn-primary">Guardar</button><button v-if="editingId" type="button" class="btn btn-outline-secondary" @click="cancel">Cancelar</button></div></form><p v-else class="text-secondary mb-0">No se pudieron leer las columnas de requisitos.</p></div></section></div><div class="col-12 col-xl-8"><div class="card border-0 shadow-sm table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>ID</th><th v-for="field in fields" :key="field">{{ field.replaceAll('_',' ') }}</th><th class="text-end">Acciones</th></tr></thead><tbody><tr v-for="item in items" :key="item.id || item.ID"><td>{{ item.id || item.ID }}</td><td v-for="field in fields" :key="field">{{ item[field] }}</td><td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary me-2" @click="edit(item)">Editar</button><button class="btn btn-sm btn-outline-danger" @click="remove(item)">Eliminar</button></td></tr><tr v-if="!items.length"><td :colspan="fields.length + 2" class="text-center text-secondary py-4">No hay perfiles registrados.</td></tr></tbody></table></div></div></div></div></main>`
};
