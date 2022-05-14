

const state = {
    pathname:'/',
    isWeixin:false,
    isIphone:false,
    APIURL:'https://home.qingtime.cn/home/',
    userRole:99,
    domain:'',
    socketId:'',
    percentage:0,
    phraseOk:false,
    allPage:100,
    TOKEN: window.localStorage.getItem('token') || '',
    SITEKEY:'',
    userName: window.localStorage.getItem('userName') || '',
    userId: window.localStorage.getItem('userId') || '',
    stationKey: window.localStorage.getItem('stationKey') || '',
    stationName: window.localStorage.getItem('stationName') || '',
    stationlogo: window.localStorage.getItem('stationlogo') || '',
    role: window.localStorage.getItem('role') || 0,
    orgAdmin: window.localStorage.getItem('orgAdmin') || 'admin',
    orgId: window.localStorage.getItem('orgId') || '',
    qiniu: 'https://cdn-icare.qingtime.cn/',
    loading: false,
    sumbmitNum: 0,
    noBindNum: 0,
    returnNum: 0,
    Ptotal: 1,
    Ppage: 0,
    Utotal: 1,
    Upage: 0,
    cleanOk: false,
    bindTotal: 1,
    bindPage: 0,
}

const actions = {
    setPropertyValue({commit},data){
        commit('SETPROPERTYVALUE',data);
    },
    savePathname({ commit }, data) {
        commit('SAVEPATHNAME', data)
    },
    saveWeixinStatus({ commit }, data) {
        commit('SAVEWEIXINSTATUS', data)
    },
    changeIphoneStatus({ commit }, data){
        commit('CHANGEIPHONESTATUS', data)
    },
    changeUserRole({ commit }, data){
        commit('CHANGEUSERROLE', data)
    },
    changeSocket({ commit }, data){
        commit('CHANGESOCKET', data)
    },
    changePhraseOk({ commit }, data){
        commit('CHANGEPHRASEOK', data)
    },
    saveDomain({ commit }, data){
        commit('SAVEDOMAIN', data)
    },
    changeProperty({ commit }, data){
        commit('CHANGEPROPERTY', data)
    },
}


const mutations = {
    SAVEPATHNAME(state, data) {
        state.pathname = data
    },
    SAVEWEIXINSTATUS(state, data){
        state.isWeixin = data
    },
    CHANGEIPHONESTATUS(state, data){
        state.isIphone = data
    },
    CHANGEUSERROLE(state,data){
        state.userRole = data.userRole;
        // state.stationName = data.stationName;
    },
    CHANGESOCKET(state,data){
        data['socketId'] ? state.socketId = data.socketId : null;
        data['percentage'] ? state.percentage = data.percentage : null;
        data['phraseOk'] ? state.phraseOk = data.phraseOk : null;
        data['allPage'] ? state.allPage = data.allPage : null;
    },
    CHANGEPROPERTY(state,data){
        data['token'] ? state.TOKEN = data.token : null;
        data['sitekey'] ? state.SITEKEY = data.sitekey : null;
    },
    SETPROPERTYVALUE(state,data){
        state[data.property] = data.value;
    },
    CHANGEPHRASEOK(state,data){
        state.phraseOk = data
    },
    SAVEDOMAIN(state,data){
        state.domain = data
    },
}

export default {
    state,
    actions,
    mutations
}