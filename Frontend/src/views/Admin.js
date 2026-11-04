import { ref } from '../../assets/js/lib/vue-esm.js';
import router from '../router.js';

export default {
  name: 'Admin',
  setup() {
    const user = ref(JSON.parse(localStorage.getItem('indiAR_user') || 'null'));
    const isAdmin = ref(!!user.value && (user.value.es_Admin === true || user.value.es_Admin === 1 || user.value.es_Admin === '1'));

    return { isAdmin, user, router };
  },
  template: `
    <main class="admin-page">
      <div class="container py-4 py-lg-5">
        <div v-if="!isAdmin" class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="card border-0 shadow-sm text-center">
              <div class="card-body p-4 p-sm-5">
                <i class="fa-solid fa-shield-halved text-danger fs-1 mb-3"></i>
                <h1 class="h3">Acceso denegado</h1>
                <p class="text-secondary">No tienes permisos de administrador.</p>
                <a href="/" class="btn btn-primary" @click.prevent="router.push('/')">Volver al inicio</a>
              </div>
            </div>
          </div>
        </div>

        <template v-else>
          <div class="mb-4">
            <p class="text-primary fw-semibold mb-1">Administración</p>
            <h1 class="h2 mb-0">Panel de control</h1>
          </div>

          <div class="row g-3 g-lg-4">
            <div class="col-12 col-md-6 col-xl-3">
              <article class="card admin-card h-100 shadow-sm"><div class="card-body d-flex flex-column p-4">
                <div class="admin-card-icon mb-3"><i class="fa-solid fa-users"></i></div>
                <h2 class="h4 card-title">Usuarios</h2>
                <p class="card-text text-secondary flex-grow-1">Administra las cuentas registradas en la plataforma.</p>
                <a href="/admin/usuarios" class="btn btn-outline-primary mt-3" @click.prevent="router.push('/admin/usuarios')">Gestionar usuarios</a>
              </div></article>
            </div>
            <div class="col-12 col-md-6 col-xl-3">
              <article class="card admin-card h-100 shadow-sm"><div class="card-body d-flex flex-column p-4">
                <div class="admin-card-icon mb-3"><i class="fa-solid fa-gamepad"></i></div>
                <h2 class="h4 card-title">Juegos</h2>
                <p class="card-text text-secondary flex-grow-1">Gestiona el catálogo, imágenes, estados, requisitos y detalles técnicos.</p>
                <a href="/admin/juegos" class="btn btn-outline-primary mt-3" @click.prevent="router.push('/admin/juegos')">Gestionar juegos</a>
              </div></article>
            </div>
            <div class="col-12 col-md-6 col-xl-3">
              <article class="card admin-card h-100 shadow-sm"><div class="card-body d-flex flex-column p-4">
                <div class="admin-card-icon mb-3"><i class="fa-solid fa-tags"></i></div>
                <h2 class="h4 card-title">Géneros</h2>
                <p class="card-text text-secondary flex-grow-1">Organiza los juegos según género o temática.</p>
                <a href="/admin/categorias" class="btn btn-outline-primary mt-3" @click.prevent="router.push('/admin/categorias')">Gestionar géneros</a>
              </div></article>
            </div>
            <div class="col-12 col-md-6 col-xl-3">
              <article class="card admin-card h-100 shadow-sm"><div class="card-body d-flex flex-column p-4">
                <div class="admin-card-icon mb-3"><i class="fa-solid fa-layer-group"></i></div>
                <h2 class="h4 card-title">Colecciones</h2>
                <p class="card-text text-secondary flex-grow-1">Crea grupos especiales para destacar títulos relacionados.</p>
                <a href="/admin/colecciones" class="btn btn-outline-primary mt-3" @click.prevent="router.push('/admin/colecciones')">Gestionar colecciones</a>
              </div></article>
            </div>
            <div class="col-12 col-md-6 col-xl-3">
              <article class="card admin-card h-100 shadow-sm"><div class="card-body d-flex flex-column p-4">
                <div class="admin-card-icon mb-3"><i class="fa-solid fa-house"></i></div>
                <h2 class="h4 card-title">Landing</h2>
                <p class="card-text text-secondary flex-grow-1">Configura qué juegos y qué título se muestran en la portada pública.</p>
                <a href="/admin/landing" class="btn btn-outline-primary mt-3" @click.prevent="router.push('/admin/landing')">Configurar landing</a>
              </div></article>
            </div>
          </div>
        </template>
      </div>
    </main>
  `
};
