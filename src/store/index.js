import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
// import MicroLogix from "@/services/MicroLogix.js";

export default new Vuex.Store({
  state: {
    hodnotaTagu: 888,
    poleTagu: []
  },
  mutations: {
    vydejPoleTagu: (state, pole) => (state.poleTagu = pole)
  },
  actions: {},
  modules: {},
  getters: {}
});
