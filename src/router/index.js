import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import { getToken, removeToken } from '@/utils/auth'

Vue.use(VueRouter)

const WHITE_LIST = ['/login', '/register', '/403']
const ROLE_HOME = { user: '/user/dashboard', coach: '/coach/students', admin: '/admin/statistics' }

function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 < Date.now()
}

/** 首页跳转用：优先 Vuex，避免仅有 token、本地 user 丢失时 next('/') → / 再跳 /login 死循环 */
function resolveRoleForHome(token) {
  const r = store.getters.role
  if (r && ROLE_HOME[r]) return r
  const fromJwt = decodeJwtPayload(token)?.role
  if (fromJwt && ROLE_HOME[fromJwt]) return fromJwt
  return ''
}

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('@/views/auth/Login.vue') },
  { path: '/register', component: () => import('@/views/auth/Register.vue') },
  { path: '/403', component: () => import('@/views/auth/Forbidden.vue') },

  // 用户端
  {
    path: '/user',
    component: () => import('@/components/Layout/UserLayout.vue'),
    meta: { role: 'user' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('@/views/user/Dashboard/index.vue') },
      { path: 'actions', component: () => import('@/views/user/ActionLibrary/index.vue') },
      { path: 'actions/:id', component: () => import('@/views/user/ActionLibrary/Detail.vue') },
      { path: 'diet', component: () => import('@/views/user/DietCenter/index.vue') },
      { path: 'diet/articles/:id', component: () => import('@/views/user/DietCenter/ArticleDetail.vue') },
      { path: 'diet/record', component: () => import('@/views/user/DietCenter/DietRecord.vue') },
      { path: 'courses', component: () => import('@/views/user/Course/index.vue') },
      { path: 'profile', component: () => import('@/views/user/Profile/index.vue') },
      { path: 'apply-coach', component: () => import('@/views/user/ApplyCoach/index.vue') },
      { path: 'training', component: () => import('@/views/user/Training/index.vue') }
    ]
  },

  // 教练端
  {
    path: '/coach',
    component: () => import('@/components/Layout/CoachLayout.vue'),
    meta: { role: 'coach' },
    children: [
      { path: '', redirect: 'students' },
      { path: 'students', component: () => import('@/views/coach/Students/index.vue') },
      { path: 'students/:id', component: () => import('@/views/coach/Students/Detail.vue') },
      { path: 'courses', component: () => import('@/views/coach/CourseManage/index.vue') },
      { path: 'publish/action', component: () => import('@/views/coach/ContentPublish/ActionPublish.vue') },
      { path: 'publish/article', component: () => import('@/views/coach/ContentPublish/ArticlePublish.vue') },
      { path: 'foods', component: () => import('@/views/coach/FoodSubmit/index.vue') }
    ]
  },

  // 管理员端
  {
    path: '/admin',
    component: () => import('@/components/Layout/AdminLayout.vue'),
    meta: { role: 'admin' },
    children: [
      { path: '', redirect: 'statistics' },
      { path: 'statistics', component: () => import('@/views/admin/Statistics/index.vue') },
      { path: 'users', component: () => import('@/views/admin/UserManage/index.vue') },
      { path: 'review/actions', component: () => import('@/views/admin/ContentReview/ActionReview.vue') },
      { path: 'review/articles', component: () => import('@/views/admin/ContentReview/ArticleReview.vue') },
      { path: 'review/courses', component: () => import('@/views/admin/ContentReview/CourseReview.vue') },
      { path: 'review/foods', component: () => import('@/views/admin/ContentReview/FoodReview.vue') },
      { path: 'coach-apply', component: () => import('@/views/admin/CoachApply/index.vue') }
    ]
  }
]

const router = new VueRouter({ mode: 'history', routes })

router.beforeEach((to, from, next) => {
  const token = getToken()

  // 登录页、注册页、403路由页无需全局前置守卫token验证，其余路由跳转需要判断有无token+失效验证
  if (WHITE_LIST.includes(to.path)) {
    if (token && !isTokenExpired(token)) {
      const home = ROLE_HOME[resolveRoleForHome(token)]
      if (home) return next(home)
      removeToken()
      store.commit('LOGOUT')
    } 
    return next()
  }

  // 无 token
  if (!token) return next('/login')

  // token 过期
  if (isTokenExpired(token)) {
    removeToken()
    return next('/login')
  }

  // 角色权限校验（与首页跳转一致：JWT 可作后备，避免仅有 token、Vuex 未带 role 时误拦）
  // 判断当前登录的用户等级role(user/coach/admin)，先从vuex中拿去role，没有就解码token解析role
  const effectiveRole = resolveRoleForHome(token) || store.getters.role
  console.log('to是什么',to)
  // 遍历当前目标路由往上全部路由配置项的meta中确定当前用户角色权限（user/coach/admin）
  const requiredRole = to.matched.find(r => r.meta.role)?.meta.role
  // 只有目标路由所需权限和当前账号权限相同时才能放行跳转
  if (requiredRole && effectiveRole !== requiredRole && effectiveRole !== 'admin') {
    return next('/403')
  }

  next()
})

export default router
