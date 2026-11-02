// Puente ES6 para Vue 3 (cargado globalmente como window.Vue)
export const createApp = window.Vue.createApp;
export const ref = window.Vue.ref;
export const computed = window.Vue.computed;
export const onUnmounted = window.Vue.onUnmounted;
export const onMounted = window.Vue.onMounted;
export const onBeforeUnmount = window.Vue.onBeforeUnmount;
export const nextTick = window.Vue.nextTick;
export const watch = window.Vue.watch;