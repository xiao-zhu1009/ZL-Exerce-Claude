import Vue from 'vue'
import Vuex from 'vuex'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: getToken() || '',
    user: getUser() || null,
    reservationCount: 0  // 用户有效预约数（待审批+已确认），用于侧边栏红点
  },
  getters: {
    isLoggedIn: state => !!state.token,
    role: state => state.user?.role || ''
  },
  mutations: {
    SET_TOKEN(state, token) { state.token = token; setToken(token) },
    SET_USER(state, user) { state.user = user; setUser(user) },
    SET_RESERVATION_COUNT(state, count) { state.reservationCount = count },
    LOGOUT(state) {
      state.token = ''
      state.user = null
      state.reservationCount = 0
      removeToken()
      removeUser()
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    },
    logout({ commit }) {
      commit('LOGOUT')
    }
  }
})
