import { createRouter, createWebHistory } from '../assets/js/lib/vue-router-esm.js';

import Home from './views/Home.js';
import Login from './views/Login.js';
import Register from './views/Register.js';
import Admin from './views/Admin.js';
import Contacto from './views/Contacto.js';
import ErrorView from './views/Error.js';
import Account from './views/Account.js';
import AdminGames from './views/AdminGames.js?v=20261101e';
import AdminCatalog from './views/AdminCatalog.js?v=20261101t';
import AdminUsers from './views/AdminUsers.js';
import AdminLanding from './views/AdminLanding.js';
import GameDetail from './views/GameDetail.js?v=20261101e';
import Cart from './views/Cart.js';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/registro', component: Register },
  { path: '/mi-cuenta', component: Account, meta: { requiresAuth: true } },
  { path: '/juegos/:id', component: GameDetail },
  { path: '/carrito', component: Cart, meta: { requiresAuth: true } },
  { path: '/admin', component: Admin, meta: { requiresAdmin: true } },
  { path: '/admin/usuarios', component: AdminUsers, meta: { requiresAdmin: true } },
  { path: '/admin/juegos', component: AdminGames, meta: { requiresAdmin: true } },
  { path: '/admin/imagenes', redirect: '/admin/juegos', meta: { requiresAdmin: true } },
  { path: '/admin/requisitos', redirect: '/admin/juegos', meta: { requiresAdmin: true } },
  { path: '/admin/categorias', component: AdminCatalog, props: { type: 'categorias' }, meta: { requiresAdmin: true } },
  { path: '/admin/colecciones', component: AdminCatalog, props: { type: 'colecciones' }, meta: { requiresAdmin: true } },
  { path: '/admin/landing', component: AdminLanding, meta: { requiresAdmin: true } },
  { path: '/contacto', component: Contacto },
  { path: '/error', component: ErrorView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  if (from.path !== to.path && typeof window.__indiarNavigationDirtyCheck === 'function') {
    const canNavigate = await window.__indiarNavigationDirtyCheck(to);
    if (!canNavigate) return false;
  }

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('indiAR_user') || 'null');
  } catch (_) {
    localStorage.removeItem('indiAR_user');
  }
  const token = localStorage.getItem('indiAR_token');
  const isLoggedIn = Boolean(token && user);
  const isAdmin = Boolean(isLoggedIn && (user.es_Admin === true || user.es_Admin === 1 || user.es_Admin === '1'));

  if (to.path === '/' && isAdmin) return '/admin';
  if (to.meta.requiresAuth && !isLoggedIn) return '/';
  if (to.meta.requiresAdmin && !isAdmin) return '/';
});

export default router;