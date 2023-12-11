
const state = {
    token:'',
}

const actions = {
    saveToken({ commit }, data) {
        commit('SAVETOKEN', data)
    },
}


const mutations = {
    SAVETOKEN(state, data) {
        state.token = data
    },
}

export default {
    state,
    actions,
    mutations
}