import * as VueRouter from 'vue-router';

if (typeof window !== 'undefined') {
  window.VueRouter = VueRouter;
}

export * from 'vue-router';
export const createRouter = VueRouter.createRouter;
export const createWebHistory = VueRouter.createWebHistory;
export const createWebHashHistory = VueRouter.createWebHashHistory;

export default VueRouter;