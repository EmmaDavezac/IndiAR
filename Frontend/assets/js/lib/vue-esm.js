import * as Vue from 'vue';

if (typeof window !== 'undefined') {
  window.Vue = Vue;
}

export * from 'vue';
export const createApp = Vue.createApp;
export const ref = Vue.ref;
export const computed = Vue.computed;
export const onUnmounted = Vue.onUnmounted;
export const onMounted = Vue.onMounted;
export const onBeforeUnmount = Vue.onBeforeUnmount;
export const nextTick = Vue.nextTick;
export const watch = Vue.watch;

export default Vue;
