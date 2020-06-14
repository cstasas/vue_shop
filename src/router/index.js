import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/login.vue'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/login.vue')

// import Home from '../components/home.vue'
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/home.vue')

// import Welcome from '../components/welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/welcome.vue')

// import User from '../components/users/user.vue'
const User = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/users/user.vue')

// import Rights from '../components/power/rights.vue'
const Rights = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/power/rights.vue')

// import Roles from '../components/power/roles.vue'
const Roles = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/power/roles.vue')

// import Cate from '../components/goods/cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/cate.vue')

// import Params from '../components/goods/params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/params.vue')

// import GoodsList from '../components/goods/list.vue'
const GoodsList = () => import(/* webpackChunkName: "GoodsList_GoodsAdd" */ '../components/goods/list.vue')

// import GoodsAdd from '../components/goods/add.vue'
const GoodsAdd = () => import(/* webpackChunkName: "GoodsList_GoodsAdd" */ '../components/goods/add.vue')

// import Order from '../components/order/order.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/order.vue')

// import Report from '../components/report/report.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: GoodsAdd },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
