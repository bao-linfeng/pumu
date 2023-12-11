import Vue from "vue";
import Vuex from "vuex";
import surname from './store/surname';
import nav from './store/nav';
import login from './store/login';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    surname,nav,login
  }
});
