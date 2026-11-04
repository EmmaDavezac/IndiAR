import { computed } from '../../assets/js/lib/vue-esm.js';

export default {
  name: 'Account',
  setup() {
    const user = computed(() => JSON.parse(localStorage.getItem('indiAR_user') || '{}'));
    const displayName = computed(() => user.value.nombre || user.value.Nombre || user.value.email || 'Usuario');
    return { user, displayName };
  },
  template: `
    <main class="container py-4 py-lg-5">
      <section class="card shadow-sm border-0 mx-auto account-card">
        <div class="card-body p-4 p-sm-5">
          <h1 class="h3 mb-4">Mi cuenta</h1>
          <dl class="row mb-0">
            <dt class="col-sm-4">Usuario</dt>
            <dd class="col-sm-8">{{ displayName }}</dd>
            <dt class="col-sm-4">Correo electrónico</dt>
            <dd class="col-sm-8">{{ user.email || 'No disponible' }}</dd>
          </dl>
        </div>
      </section>
    </main>
  `
};
