import AdaiNoData from './NoData.vue'
// 这里是重点
const NoData = {
    install: function(Vue){
        Vue.component('NoData',AdaiNoData)
    }
}

// 导出组件
export default NoData