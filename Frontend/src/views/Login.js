import { ref } from '../../assets/js/lib/vue-esm.js';
import { login } from '../services/api.js';
import router from '../router.js';

export default {
  name: 'Login',
  setup() {
    const email = ref('');
    const password = ref('');
    const warning = ref('');
    const showCartLoginMessage = router.currentRoute.value.query.intent === 'add-to-cart';

    function saveSession(data) {
      localStorage.setItem('indiAR_token', data.token);
      localStorage.setItem('indiAR_user', JSON.stringify(data.usuario));
      sessionStorage.setItem('indiar_token', data.token);
      sessionStorage.setItem('indiar_user', JSON.stringify(data.usuario));
      window.dispatchEvent(new CustomEvent('auth-changed'));
      if (data.usuario && data.usuario.es_Admin) router.push('/admin');
      else router.push(router.currentRoute.value.query.redirect || '/');
    }

    async function handleLogin(e) {
      e.preventDefault();
      warning.value = '';

      try {
        const { response, data } = await login(email.value, password.value);

        if (response.ok && data.token) {
          saveSession(data);
        } else {
          warning.value = data.mensaje || 'Credenciales inválidas';
        }
      } catch (err) {
        warning.value = 'No se pudo conectar con el servidor';
        console.error(err);
      }
    }

    return { email, password, warning, showCartLoginMessage, router, handleLogin };
  },
  template: `
    <main class="auth-page">
      <div class="container py-4 py-sm-5">
        <div class="row justify-content-center align-items-center">
          <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <section class="card auth-card shadow-lg">
              <div class="card-body p-3 p-sm-4 p-lg-5">
                <div class="auth-heading text-center mb-4">
                  <span class="auth-icon" aria-hidden="true"><i class="fa-solid fa-user"></i></span>
                  <h1 class="h3 mt-3 mb-2">Iniciar sesión</h1>
                  <p class="text-secondary mb-0">Ingresa a tu cuenta de IndiAR</p>
                </div>
                <section v-if="showCartLoginMessage" class="auth-cart-message mb-4" aria-labelledby="cart-login-title">
                  <h2 id="cart-login-title">Inicia sesión para agregar juegos</h2>
                  <p class="mb-0">Necesitás una cuenta de IndiAR para elegir la plataforma y guardar juegos en tu carrito.</p>
                </section>
                <form id="form-login-user" @submit.prevent="handleLogin" novalidate>
                  <div class="mb-3">
                    <label for="email" class="form-label">Correo electrónico</label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text" aria-hidden="true"><i class="fa-solid fa-envelope"></i></span>
                      <input class="form-control" type="email" id="email" name="email" placeholder="nombre@ejemplo.com" v-model="email" required />
                    </div>
                  </div>
                  <div class="mb-4">
                    <label for="password" class="form-label">Contraseña</label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text" aria-hidden="true"><i class="fa-solid fa-lock"></i></span>
                      <input class="form-control" type="password" id="password" name="password" placeholder="Ingresa tu contraseña" v-model="password" required />
                    </div>
                  </div>
                  <div v-if="warning" class="alert alert-danger py-2" role="alert">{{ warning }}</div>
                  <button class="btn btn-primary btn-lg w-100 auth-submit" type="submit">Ingresar</button>
                  <div class="mt-4">
                    <p class="text-center mb-2">¿No tienes cuenta?</p>
                    <a class="btn btn-outline-secondary w-100" href="/registro" @click.prevent="router.push('/registro')">Regístrate</a>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  `,
};