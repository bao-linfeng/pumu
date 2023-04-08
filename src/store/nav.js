

const state = {
    pathname: window.localStorage.getItem('pathname') || '/',
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
    email: window.localStorage.getItem('email') || '',
    userName: window.localStorage.getItem('userName') || '',
    userId: window.localStorage.getItem('userId') || '',
    stationKey: window.localStorage.getItem('stationKey') || '',
    stationName: window.localStorage.getItem('stationName') || '',
    stationlogo: window.localStorage.getItem('stationlogo') || '',
    role: window.localStorage.getItem('role') || 99,
    orgAdmin: window.localStorage.getItem('orgAdmin') || '',
    orgId: window.localStorage.getItem('orgId') || '',
    orgName: window.localStorage.getItem('orgName') || '',
    organizationNo: window.localStorage.getItem('organizationNo') || '',
    qiniu: 'https://cdn-icare.qingtime.cn/',
    loading: false,
    sumbmitNum: 0,
    noBindNum: 0,
    returnNum: 0,
    waitReviewNumber: 0,
    Ptotal: 1,
    Ppage: 0,
    Utotal: 1,
    Upage: 0,
    cleanOk: false,
    bindTotal: 1,
    bindPage: 0,
    isOrg: window.localStorage.getItem('isOrg') || '',
    messageNotReadNumber: 0,
    catalogStatusO: {
        '0': '初始提交',
        '10': '失效谱',
        '15': '重复谱',
        '20': '待议谱',
        '23': '待议复审',
        '25': '逾期谱',
        '30': '可拍谱',
        '32': '在拍复合谱',
        '35': '开放谱',
        '40': '认领谱',
        '50': '拍摄完结',
    },
    baseURL: window.location.origin.indexOf('genealogy.1jiapu.com') > -1 ? 'https://genealogydata.1jiapu.com/' : 'https://pumudata.qingtime.cn/',
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