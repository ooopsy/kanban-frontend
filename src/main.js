import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/main.css";
import VueDragscroll from "vue-dragscroll";
import VueCookies from 'vue-cookies'
import Keycloak from 'keycloak-js';
import axios from "axios";
axios.defaults.withCredentials = true

const app = createApp(App);
app.use(VueDragscroll);
app.use(createPinia());
app.config.globalProperties.$logout = function() {
    keycloak.logout()
}
var keycloak = new Keycloak({ 
    url: 'https://sso.sad-waterdeer.com/auth', 
    realm: 'MY', 
    clientId: 'kanban_local' 
});



keycloak.init({
    flow:  'standard',
    onLoad: 'login-required',
    checkLoginIframe: false,
}).then((auth) => {
    console.log(keycloak.token)
    app.mount("#app");
})

axios.interceptors.request.use(
    async config => {
        await keycloak.updateToken(60) 
        config.headers.Authorization = `Bearer ${keycloak['token']}`
      return config;
    }
  );
  
  axios.interceptors.response.use((response) => {
    return response
  }, function (error) {
    if (error.response.status === 401 || error.response.status === 403) {
        VueCookies.remove("token", '/', getTopDomain());
        //keycloak.logout()
    }
    return Promise.reject(error.response)
  });


  function getTopDomain(){
    var url = new URL(window.location.href);
    return "." + url.hostname.split(/\./).slice(-2).join('.');
  }
    








