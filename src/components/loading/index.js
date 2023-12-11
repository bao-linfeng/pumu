import AdaiLoading from './Loading.vue'
// 这里是重点
const Loading = {
    install: function(Vue){
        Vue.component('Loading',AdaiLoading)
    }
}

// 导出组件
export default Loading