import { computed, ref, onUnmounted } from '../../assets/js/lib/vue-esm.js';
import { request } from '../services/api.js';
import router from '../router.js';
import { confirmAction } from '../services/confirm.js';

export default {
  name: 'AdminUsers',
  setup() {
    const users = ref([]); const view = ref('administradores'); const searchText = ref(''); const statusFilter = ref('todos'); const page = ref(1); const pageSize = 10;
    const user = ref({ Nombre: '', Email: '', es_Admin: true, activo: true }); const userOriginal = ref({ Nombre: '', Email: '', es_Admin: true, activo: true }); const editingId = ref(null); const showForm = ref(false); const selectedUser = ref(null); const warning = ref(''); const loading = ref(true);
    async function load() { loading.value=true; const r=await request('/usuarios'); users.value=r.ok ? await r.json():[]; loading.value=false; }
    async function save() {
      warning.value='';
      if (!await confirmAction(editingId.value ? '¿Guardar los cambios del usuario?' : '¿Crear el usuario y enviar sus credenciales por correo?', editingId.value ? 'Guardar usuario' : 'Crear usuario', editingId.value ? 'Guardar cambios' : 'Crear y enviar correo')) return;
      const payload={Nombre:user.value.Nombre, Email:user.value.Email, es_Admin:Boolean(user.value.es_Admin), activo:user.value.activo !== false};
      const r=await request(editingId.value ? `/usuarios/${editingId.value}`:'/usuarios',{method:editingId.value?'PUT':'POST',body:JSON.stringify(payload)});
      const d=await r.json(); if(!r.ok) return warning.value=d.mensaje||'No se pudo guardar el usuario';
      showForm.value=false; editingId.value=null; warning.value=''; document.body.classList.remove('indiar-detail-open'); await load();
    }
    function hasUnsavedChanges(){ return showForm.value && JSON.stringify(user.value) !== JSON.stringify(userOriginal.value); }
    function clearFormChanges(){ showForm.value=false; editingId.value=null; user.value={Nombre:'',Email:'',es_Admin:true,activo:true}; userOriginal.value={Nombre:'',Email:'',es_Admin:true,activo:true}; warning.value=''; document.body.classList.remove('indiar-detail-open'); }
    async function confirmDiscard(){ if(!hasUnsavedChanges()) return true; return confirmAction('Hay cambios sin guardar. ¿Descartar los cambios?', 'Descartar cambios', 'Descartar y continuar', 'danger'); }
    function openNewAdmin(){ clearFormChanges(); user.value={Nombre:'',Email:'',es_Admin:true,activo:true}; userOriginal.value={Nombre:'',Email:'',es_Admin:true,activo:true}; showForm.value=true; document.body.classList.add('indiar-detail-open'); }
    function edit(item){ clearFormChanges(); editingId.value=item.ID; user.value={Nombre:item.Nombre||item.nombre,Email:item.Email||item.email,es_Admin:Boolean(item.es_Admin),activo:item.activo!==false}; userOriginal.value=JSON.parse(JSON.stringify(user.value)); selectedUser.value=null; showForm.value=true; document.body.classList.add('indiar-detail-open'); }
    async function cancel(){ if(!await confirmDiscard()) return; clearFormChanges(); }
    async function toggleActive(item){ const next=item.activo===false; if(!await confirmAction(next?`¿Desbloquear la cuenta de ${item.Nombre||item.nombre}?`:`¿Bloquear la cuenta de ${item.Nombre||item.nombre}?`,next?'Desbloquear usuario':'Bloquear usuario',next?'Desbloquear':'Bloquear',next?'primary':'danger'))return; const payload={Nombre:item.Nombre||item.nombre,Email:item.Email||item.email,es_Admin:Boolean(item.es_Admin),activo:next}; const r=await request(`/usuarios/${item.ID}`,{method:'PUT',body:JSON.stringify(payload)}); if(!r.ok)warning.value='No se pudo cambiar el estado'; else {await load(); selectedUser.value=users.value.find(usuario=>usuario.ID===item.ID)||selectedUser.value;} }
    async function resetPassword(item){
      if(!await confirmAction(`¿Generar una contraseña nueva y enviarla a ${item.Email||item.email}?`,'Restablecer contraseña','Enviar contraseña','primary')) return;
      const r=await request(`/usuarios/${item.ID}/restablecer-password`, {method:'POST'});
      const d=await r.json();
      if(!r.ok) warning.value=d.mensaje||'No se pudo restablecer la contraseña';
      else warning.value=d.mensaje||'Contraseña restablecida y enviada por correo';
    }
    function openDetails(item){ selectedUser.value={...item}; document.body.classList.add('indiar-detail-open'); }
    function closeDetails(){ selectedUser.value=null; document.body.classList.remove('indiar-detail-open'); }
    const filtered=computed(()=>{
      const q=searchText.value.trim().toLowerCase();
      return users.value.filter(item=>{
        const role=Boolean(item.es_Admin) === (view.value==='administradores');
        const matchesSearch=!q || `${item.Nombre||item.nombre||''} ${item.Email||item.email||''}`.toLowerCase().includes(q);
        const matchesStatus=statusFilter.value==='todos'||(statusFilter.value==='activos'?item.activo!==false:item.activo===false);
        return role && matchesSearch && matchesStatus;
      });
    });
    const pages=computed(()=>Math.max(1,Math.ceil(filtered.value.length/pageSize))); const paginated=computed(()=>filtered.value.slice((page.value-1)*pageSize,page.value*pageSize));
    const emptyRows=computed(()=>Math.max(0, pageSize - paginated.value.length));
    function resetPage(){page.value=1;}
    async function changeView(v){ if(v===view.value) return; if(!await confirmDiscard()) return; clearFormChanges(); view.value=v; resetPage(); }
    const navigationCheck = async function(){ if(!hasUnsavedChanges()) return true; const discard=await confirmAction('Hay cambios sin guardar. ¿Descartar los cambios y cambiar de sección?', 'Cambiar de sección', 'Descartar y continuar', 'danger'); if(discard) clearFormChanges(); return discard; };
    window.__indiarNavigationDirtyCheck=navigationCheck;
    onUnmounted(()=>{ if(window.__indiarNavigationDirtyCheck===navigationCheck) delete window.__indiarNavigationDirtyCheck; document.body.classList.remove('indiar-detail-open'); });
    load();
    return {users,view,searchText,statusFilter,page,pages,paginated,emptyRows,filtered,showForm,user,editingId,selectedUser,warning,loading,save,openNewAdmin,edit,cancel,toggleActive,resetPassword,openDetails,closeDetails,resetPage,changeView,changePage(p){if(p>=1&&p<=pages.value)page.value=p;}};
  },
  template: `
<main class="admin-page"><div class="container-fluid px-3 px-lg-4 py-4 py-lg-5">
  <div class="admin-games-shell">
    <div class="admin-games-page-header"><div><h1 class="h2 mb-0">Gestión de usuarios</h1></div></div>
    <ul class="nav nav-tabs admin-game-detail-tabs mb-3" role="tablist"><li class="nav-item"><button class="nav-link" :class="{active:view==='administradores'}" type="button" @click="changeView('administradores')">Administradores</button></li><li class="nav-item"><button class="nav-link" :class="{active:view==='usuarios'}" type="button" @click="changeView('usuarios')">Usuarios registrados</button></li></ul>
    <div class="d-flex justify-content-end mb-3"><button v-if="!showForm && view==='administradores'" class="btn btn-primary" type="button" @click="openNewAdmin">Nuevo administrador</button></div>
    <div v-if="showForm" class="admin-game-detail-backdrop" @click.self="cancel">
      <section class="admin-game-detail-window card border-0 shadow-lg" role="dialog" aria-modal="true" aria-label="Formulario de usuario">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
            <div><span class="text-secondary small">Administración de usuarios</span><h2 class="h4 mb-0">{{ editingId ? (user.es_Admin ? 'Editar administrador' : 'Editar usuario') : 'Nuevo administrador' }}</h2></div>
            <button type="button" class="btn-close" aria-label="Cerrar" @click="cancel"></button>
          </div>
          <form class="admin-game-form-grid" @submit.prevent="save">
            <div class="admin-game-field"><label class="form-label" for="user-name">Nombre *</label><input id="user-name" v-model="user.Nombre" class="form-control" placeholder="Nombre y apellido" required></div>
            <div class="admin-game-field"><label class="form-label" for="user-email">Correo electrónico *</label><input id="user-email" type="email" v-model="user.Email" class="form-control" placeholder="usuario@ejemplo.com" required></div>
            <div v-if="!editingId" class="admin-game-field-full"><div class="alert alert-info mb-0">La contraseña se generará automáticamente y se enviará al correo del usuario por Gmail.</div></div>
            <div v-if="warning" class="admin-game-field-full"><div class="alert alert-danger mb-0">{{ warning }}</div></div>
            <div class="admin-game-field-full admin-game-detail-actions mt-2"><button class="btn btn-primary" type="submit">{{ editingId?'Guardar cambios':'Crear administrador' }}</button><button class="btn btn-outline-secondary" type="button" @click="cancel">Cancelar</button></div>
          </form>
        </div>
      </section>
    </div>
    <div v-else class="admin-games-content">
      <div class="admin-games-toolbar admin-users-toolbar mb-3"><div class="card-body p-0 d-flex flex-wrap gap-3"><div class="flex-grow-1"><label class="visually-hidden" for="users-search">Buscar usuarios</label><input id="users-search" v-model="searchText" @input="resetPage" class="form-control" type="search" placeholder="Buscar por nombre o correo"></div><div><label class="visually-hidden" for="users-status">Estado</label><select id="users-status" v-model="statusFilter" @change="resetPage" class="form-select"><option value="todos">Todos los estados</option><option value="activos">Activos</option><option value="bloqueados">Bloqueados</option></select></div></div></div>
      <div class="admin-games-table-card card border-0"><div class="table-responsive"><table class="table admin-games-table align-middle mb-0"><thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead><tbody>
        <tr v-if="loading"><td colspan="5" class="text-center py-5">Cargando...</td></tr>
        <tr v-for="item in paginated" :key="item.ID"><td><strong class="admin-game-name">{{item.Nombre||item.nombre}}</strong></td><td>{{item.Email||item.email}}</td><td><span class="badge" :class="item.es_Admin?'text-bg-primary':'text-bg-secondary'">{{item.es_Admin?'Administrador':'Usuario'}}</span></td><td><span class="badge" :class="item.activo===false?'text-bg-danger':'text-bg-success'">{{item.activo===false?'Bloqueado':'Activo'}}</span></td><td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary" type="button" @click="openDetails(item)">Ver</button></td></tr>
        <tr v-if="!loading&&!filtered.length"><td colspan="5" class="text-center text-secondary py-5">No hay usuarios que coincidan con los filtros.</td></tr>
        <template v-if="!loading && filtered.length"><tr v-for="row in emptyRows" :key="'empty-user-'+row" class="admin-table-empty-row" aria-hidden="true"><td colspan="5"></td></tr></template>
      </tbody></table></div><div v-if="filtered.length" class="admin-games-pagination d-flex flex-wrap align-items-center justify-content-between gap-3"><span class="small text-secondary">Página {{page}} de {{pages}} · {{filtered.length}} usuarios</span><nav aria-label="Paginación de usuarios"><ul class="pagination pagination-sm mb-0"><li class="page-item" :class="{disabled:page===1}"><button class="page-link" type="button" :disabled="page===1" @click="changePage(page-1)">Anterior</button></li><li v-for="p in pages" :key="p" class="page-item" :class="{active:page===p}"><button class="page-link" type="button" @click="changePage(p)">{{p}}</button></li><li class="page-item" :class="{disabled:page===pages}"><button class="page-link" type="button" :disabled="page===pages" @click="changePage(page+1)">Siguiente</button></li></ul></nav></div></div>
    </div>
  </div>
  <div v-if="selectedUser" class="admin-game-detail-backdrop" @click.self="closeDetails">
    <section class="admin-game-detail-window admin-user-detail-window card border-0 shadow-lg" role="dialog" aria-modal="true" aria-label="Detalles del usuario">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
          <div><span class="text-secondary small">Detalles del usuario</span><h2 class="h4 mb-0">{{ selectedUser.Nombre || selectedUser.nombre }}</h2></div>
          <button type="button" class="btn-close" aria-label="Cerrar" @click="closeDetails"></button>
        </div>
        <section class="admin-game-summary-grid mb-0"><div><span>Correo electrónico</span><strong>{{ selectedUser.Email || selectedUser.email }}</strong></div><div><span>Rol</span><strong>{{ selectedUser.es_Admin ? 'Administrador' : 'Usuario registrado' }}</strong></div><div><span>Estado</span><strong>{{ selectedUser.activo === false ? 'Dado de baja' : 'Activo' }}</strong></div></section>
        <div v-if="warning" class="alert alert-info mt-3 mb-0">{{ warning }}</div>
        <div class="admin-game-detail-actions mt-4">
          <button class="btn btn-outline-primary" type="button" @click="edit(selectedUser)">Editar</button>
          <button class="btn btn-outline-secondary" type="button" @click="resetPassword(selectedUser)">Restablecer contraseña</button>
          <button class="btn" :class="selectedUser.activo === false ? 'btn-outline-success' : 'btn-outline-danger'" type="button" @click="toggleActive(selectedUser)">{{ selectedUser.activo === false ? 'Reactivar' : 'Dar de baja' }}</button>
  
        </div>
      </div>
    </section>
  </div>
</div></main>`
};
