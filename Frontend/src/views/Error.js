import router from '../router.js';

export default {
  name: 'Error',
  setup() {
    return { router };
  },
  template: `
    <main class="main">
      <div class="form-container" style="max-width:600px;margin:40px auto;text-align:center;">
        <h2>Página no disponible</h2>
        <p>La sección que buscas está en construcción.</p>
        <a href="/" class="btn-form" @click.prevent="router.push('/')">Volver al inicio</a>
      </div>
    </main>
  `,
};