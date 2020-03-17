import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入字体图标
import './assets/fonts/iconfont.css'
// 引入全局背景颜色
import './assets/css/global.css'
// 引入axios请求
import axios from 'axios'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
