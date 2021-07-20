import Router from './router';
import State from './state';
import { createApp } from "vue";
import App from "./App";
// import device from "./plugins/device";

const app = createApp(App);
// app.config.globalProperties.$device = device;

app.use(Router)
  .use(State)
  .mount("#app");

  