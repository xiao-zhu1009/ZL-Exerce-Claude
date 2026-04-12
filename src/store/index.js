import Vue from 'vue'
import Vuex from 'vuex'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: getToken() || '',
    user: getUser() || null
  },
  getters: {
    isLoggedIn: state => !!state.token,
    role: state => state.user?.role || ''
  },
  mutations: {
    SET_TOKEN(state, token) { state.token = token; setToken(token) },
    SET_USER(state, user) { state.user = user; setUser(user) },
    LOGOUT(state) {
      state.token = ''
      state.user = null
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
