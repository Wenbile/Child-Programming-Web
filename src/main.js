import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import  VueResource  from 'vue-resource'
import VueDirectiveWindow from 'vue-directive-window'


import axios from 'axios'
import robotApi from './api'
import request from "./request"


//全局注册，使用方法为:this.$xxx
Vue.prototype.$axios = axios
Vue.prototype.$robotApi = robotApi
Vue.prototype.$request = request


//blocky配置
Vue.config.productionTip = false;
Vue.config.ignoredElements = ['field','block','category','xml','mutation','value','sep']


//Vue脚手架初始化
Vue.use(VueDirectiveWindow);
Vue.use(VueResource);
new Vue({
  router,
  vuetify,
  render: h => h(App),
  data:{
    return:{
      messageb:'',
    }
}
}).$mount('#app')


