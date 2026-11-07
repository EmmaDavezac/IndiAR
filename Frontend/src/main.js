import { createApp } from 'vue';
import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import * as bootstrap from 'bootstrap';

import router from './router.js';
import Navbar from './components/Navbar.js?v=20261103a';
import Footer from './components/Footer.js';
import Login from './views/Login.js';
import Admin from './views/Admin.js';
import Contacto from './views/Contacto.js';
import ErrorView from './views/Error.js';
import * as api from './services/api.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../assets/css/style.css';
import '../assets/css/navbar.css';

window.Vue = Vue;
window.VueRouter = VueRouter;
window.bootstrap = bootstrap;

// Exponer API globalmente para uso en componentes
window.__API__ = api;

const App = {
  components: {
    Navbar,
    Footer,
  },
  template: `
    <Navbar />
    <div class="spa-page flex-grow-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <Footer />
  `,
};

const app = createApp(App);
app.use(router);
app.mount('#app');
