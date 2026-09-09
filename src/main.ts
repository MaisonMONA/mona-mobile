import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import './global.css';


import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/(DEFAULT_FILE)_variables.css";
const pinia = createPinia();
const app = createApp(App).use(IonicVue).use(router).use(pinia);

// Global error handlers to surface uncaught exceptions and promise rejections
// This helps diagnose runtime failures in emulators where adb may not be available.
window.addEventListener('error', (event: ErrorEvent) => {
  // Log to console and show an alert so the error is visible on the device/emulator
  // (alert is primitive but works reliably within WebView)
  try {
    // eslint-disable-next-line no-console
    console.error('[Global] uncaught error', event.error || event.message, event);
    alert(`Unhandled error: ${event.error?.message ?? event.message}`);
  } catch (e) {
    // swallow
  }
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  try {
    // eslint-disable-next-line no-console
    console.error('[Global] unhandledrejection', event.reason);
    alert(`Unhandled promise rejection: ${event.reason?.message ?? String(event.reason)}`);
  } catch (e) {
    // swallow
  }
});

// Vue error handler to catch framework-level errors
app.config.errorHandler = (err: unknown, vm, info) => {
  try {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error('[Vue] errorHandler', err, info);
    alert(`Vue error: ${message}\nInfo: ${String(info)}`);
  } catch (e) {
    // swallow
  }
};

router.isReady().then(() => {
  app.mount("#app");
});
