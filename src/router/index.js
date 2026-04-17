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
      // 数据看板
      { path: 'dashboard', component: () => import('@/views/user/Dashboard/index.vue'), meta: { title: '数据看板' } },
      // 训练中心
      { path: 'training', component: () => import('@/views/user/Training/index.vue'), meta: { title: '训练中心' } },
      // 训练中心动作库动作详情
      { path: 'training/actions/:id', component: () => import('@/views/user/Training/ActionDetail.vue'), meta: { title: '动作详情' } },
      // // 动作库（直接路由，不使用重定向）
      // { path: 'actions', component: () => import('@/views/user/Training/index.vue'), meta: { title: '动作库' } },
      // // 动作库详情（直接路由，不使用重定向）
      // { path: 'actions/:id', component: () => import('@/views/user/Training/ActionDetail.vue'), meta: { title: '动作详情' } },
      // 饮食中心
      { path: 'diet', component: () => import('@/views/user/DietCenter/index.vue'), meta: { title: '饮食中心' } },
      // // 饮食中心食物库食物详情
      // { path: 'diet/articles/:id', redirect: to => ({ path: `/user/articles/${to.params.id}` }) },
      // 文章库
      { path: 'articles', component: () => import('@/views/user/ArticleLibrary/index.vue'), meta: { title: '文章库' } },
      // 文章库文章详情
      { path: 'articles/:id', component: () => import('@/views/user/ArticleLibrary/ArticleDetail.vue'), meta: { title: '文章详情' } },
      // 教练专区
      { path: 'coach-zone', component: () => import('@/views/user/CoachZone/index.vue'), meta: { title: '教练专区' } },
      // 课程预约
      { path: 'courses', component: () => import('@/views/user/Course/index.vue'), meta: { title: '课程预约' } },
      // 个人主页
      { path: 'profile', component: () => import('@/views/user/Profile/index.vue'), meta: { title: '个人主页' } },
      // 申请成为教练
      { path: 'apply-coach', component: () => import('@/views/user/ApplyCoach/index.vue'), meta: { title: '申请成为教练' } },
    ]
  },

  // 教练端
  {
    path: '/coach',
    component: () => import('@/components/Layout/CoachLayout.vue'),
    meta: { role: 'coach' },
    children: [
      { path: '', redirect: 'students' },
      { path: 'students', component: () => import('@/views/coach/Students/index.vue'), meta: { title: '学员管理' } },
      { path: 'students/:id', component: () => import('@/views/coach/Students/Detail.vue'), meta: { title: '学员详情' } },
      { path: 'courses', component: () => import('@/views/coach/CourseManage/index.vue'), meta: { title: '课程管理' } },
      { path: 'publish/action', component: () => import('@/views/coach/ContentPublish/ActionPublish.vue'), meta: { title: '动作库投稿' } },
      { path: 'publish/article', component: () => import('@/views/coach/ContentPublish/ArticlePublish.vue'), meta: { title: '文章库投稿' } },
      { path: 'foods', component: () => import('@/views/coach/FoodSubmit/index.vue'), meta: { title: '食物库投稿' } },
      { path: 'profile', component: () => import('@/views/coach/Profile/index.vue'), meta: { title: '个人主页' } }
    ]
  },

  // 管理员端
  {
    path: '/admin',
    component: () => import('@/components/Layout/AdminLayout.vue'),
    meta: { role: 'admin' },
    children: [
      { path: '', redirect: 'statistics' },
      { path: 'statistics', component: () => import('@/views/admin/Statistics/index.vue'), meta: { title: '数据统计' } },
      { path: 'users', component: () => import('@/views/admin/UserManage/index.vue'), meta: { title: '用户管理' } },
      { path: 'review/actions', component: () => import('@/views/admin/ContentReview/ActionReview.vue'), meta: { title: '动作审核' } },
      { path: 'review/articles', component: () => import('@/views/admin/ContentReview/ArticleReview.vue'), meta: { title: '文章审核' } },
      { path: 'review/courses', component: () => import('@/views/admin/ContentReview/CourseReview.vue'), meta: { title: '课程审核' } },
      { path: 'review/foods', component: () => import('@/views/admin/ContentReview/FoodReview.vue'), meta: { title: '食物库审核' } },
      { path: 'coach-apply', component: () => import('@/views/admin/CoachApply/index.vue'), meta: { title: '教练申请' } },
      { path: 'bind-monitor', component: () => import('@/views/admin/BindMonitor/index.vue'), meta: { title: '绑定监管' } }
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
  // 遍历当前目标路由往上全部路由配置项的meta中确定当前用户角色权限（user/coach/admin）
  const requiredRole = to.matched.find(r => r.meta.role)?.meta.role
  // 只有目标路由所需权限和当前账号权限相同时才能放行跳转
  if (requiredRole && effectiveRole !== requiredRole && effectiveRole !== 'admin') {
    return next('/403')
  }

  next()
})

export default router
