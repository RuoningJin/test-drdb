import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import "./plugins/axios";
import { sync } from "vuex-router-sync";
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import AsyncComputed from 'vue-async-computed'

sync(store, router);

Vue.config.productionTip = false
Vue.use(AsyncComputed);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
