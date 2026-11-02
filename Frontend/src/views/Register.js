import { ref } from '../../assets/js/lib/vue-esm.js';
import { register } from '../services/api.js';
import router from '../router.js';

export default {
  name: 'Register',
  setup() {
    const nombre = ref('');
    const email = ref('');
    const password = ref('');
    const warning = ref('');

    async function handleRegister(event) {
      event.preventDefault();
      warning.value = '';

      try {
        const { response, data } = await register(nombre.value, email.value, password.value);
        if (response.ok) {
          router.push('/login');
        } else {
          warning.value = data.mensaje || 'No se pudo crear la cuenta';
        }
      } catch (error) {
        warning.value = 'No se pudo conectar con el servidor';
        console.error(error);
      }
    }

    return { nombre, email, password, warning, router, handleRegister };
  },
  template: `
    <main class="auth-page">
      <div class="container py-4 py-sm-5">
        <div class="row justify-content-center align-items-center">
          <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <section class="card auth-card shadow-lg">
              <div class="card-body p-3 p-sm-4 p-lg-5">
                <div class="auth-heading text-center mb-4">
                  <span class="auth-icon" aria-hidden="true"><i class="fa-solid fa-user-plus"></i></span>
                  <h1 class="h3 mt-3 mb-2">Crear cuenta</h1>
                  <p class="text-secondary mb-0">Únete a la comunidad de IndiAR</p>
                </div>
                <form @submit.prevent="handleRegister" novalidate>
                  <div class="mb-3">
                    <label for="register-name" class="form-label">Nombre</label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text" aria-hidden="true"><i class="fa-solid fa-user"></i></span>
                      <input class="form-control" type="text" id="register-name" placeholder="Tu nombre" v-model="nombre" required />
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="register-email" class="form-label">Correo electrónico</label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text" aria-hidden="true"><i class="fa-solid fa-envelope"></i></span>
                      <input class="form-control" type="email" id="register-email" placeholder="nombre@ejemplo.com" v-model="email" required />
                    </div>
                  </div>
                  <div class="mb-4">
                    <label for="register-password" class="form-label">Contraseña</label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text" aria-hidden="true"><i class="fa-solid fa-lock"></i></span>
                      <input class="form-control" type="password" id="register-password" placeholder="Crea una contraseña" v-model="password" required />
                    </div>
                  </div>
                  <div v-if="warning" class="alert alert-danger py-2" role="alert">{{ warning }}</div>
                  <button class="btn btn-primary btn-lg w-100 auth-submit" type="submit">Registrarse</button>
                  <div class="d-flex align-items-center gap-3 my-3"><hr class="flex-grow-1"><span class="text-secondary small">o</span><hr class="flex-grow-1"></div>
                  <button class="btn btn-outline-secondary btn-lg w-100 auth-google" type="button" disabled aria-label="Registrarse con Google">
                    <i class="fa-brands fa-google me-2" aria-hidden="true"></i>Continuar con Google
                  </button>
                  <div class="mt-4">
                    <p class="text-center mb-2">¿Ya tienes cuenta?</p>
                    <a class="btn btn-outline-secondary w-100" href="/login" @click.prevent="router.push('/login')">Ingresa</a>
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
