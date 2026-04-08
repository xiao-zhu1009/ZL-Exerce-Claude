import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../views/auth/Login.vue') },
  { path: '/register', component: () => import('../views/auth/Register.vue') },
  { path: '/403', component: () => import('../views/auth/Forbidden.vue') },

  // 用户端
  {
    path: '/user',
    component: () => import('../components/Layout/UserLayout.vue'),
    meta: { role: 'user' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('../views/user/Dashboard/index.vue') },
      { path: 'actions', component: () => import('../views/user/ActionLibrary/index.vue') },
      { path: 'actions/:id', component: () => import('../views/user/ActionLibrary/Detail.vue') },
      { path: 'diet', component: () => import('../views/user/DietCenter/index.vue') },
      { path: 'diet/articles/:id', component: () => import('../views/user/DietCenter/ArticleDetail.vue') },
      { path: 'diet/record', component: () => import('../views/user/DietCenter/DietRecord.vue') },
      { path: 'courses', component: () => import('../views/user/Course/index.vue') },
      { path: 'profile', component: () => import('../views/user/Profile/index.vue') }
    ]
  },

  // 教练端
  {
    path: '/coach',
    component: () => import('../components/Layout/CoachLayout.vue'),
    meta: { role: 'coach' },
    children: [
      { path: '', redirect: 'students' },
      { path: 'students', component: () => import('../views/coach/Students/index.vue') },
      { path: 'students/:id', component: () => import('../views/coach/Students/Detail.vue') },
      { path: 'courses', component: () => import('../views/coach/CourseManage/index.vue') },
      { path: 'publish/action', component: () => import('../views/coach/ContentPublish/ActionPublish.vue') },
      { path: 'publish/article', component: () => import('../views/coach/ContentPublish/ArticlePublish.vue') }
    ]
  },

  // 管理员端
  {
    path: '/admin',
    component: () => import('../components/Layout/AdminLayout.vue'),
    meta: { role: 'admin' },
    children: [
      { path: '', redirect: 'statistics' },
      { path: 'statistics', component: () => import('../views/admin/Statistics/index.vue') },
      { path: 'users', component: () => import('../views/admin/UserManage/index.vue') },
      { path: 'review/actions', component: () => import('../views/admin/ContentReview/ActionReview.vue') },
      { path: 'review/articles', component: () => import('../views/admin/ContentReview/ArticleReview.vue') }
    ]
  }
]

const router = new VueRouter({ mode: 'history', routes })

// 路由守卫：角色权限控制
router.beforeEach((to, from, next) => {
  const role = store.getters.role
  const requiredRole = to.matched.find(r => r.meta.role)?.meta.role
  if (!requiredRole) return next()
  if (!store.getters.isLoggedIn) return next('/login')
  if (role !== requiredRole && role !== 'admin') return next('/403')
  next()
})

export default router
