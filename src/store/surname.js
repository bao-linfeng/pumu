
const state = {
    activeSurname:'安',
    activeSurnameIndex:0,
    surnameMap:'安',
}

const actions = {
    saveSurname({ commit }, data) {
        commit('SAVESURNAME', data)
    },
    saveSurnameIndex({ commit }, data) {
        commit('SAVESURNAMEINDEX', data)
    },
    changeSurnameMap({ commit }, data) {
        commit('CHANGESURNAMEMAP', data)
    },
}


const mutations = {
    SAVESURNAME(state, data) {
        state.activeSurname = data
    },
    SAVESURNAMEINDEX(state, data) {
        state.activeSurnameIndex = data
    },
    CHANGESURNAMEMAP(state, data) {
        state.surnameMap = data
    },
}

export default {
    state,
    actions,
    mutations
}