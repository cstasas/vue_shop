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
// 引入树形table表格
import treeTable from 'vue-table-with-tree-grid'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求头拦截
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须 return config 出去
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', treeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
