import router from './router.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import Home from './views/Home.js';
import Login from './views/Login.js';
import Admin from './views/Admin.js';
import Contacto from './views/Contacto.js';
import ErrorView from './views/Error.js';
import * as api from './services/api.js';

const { createApp } = window.Vue;
const { createRouter, createWebHistory } = window.VueRouter;

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