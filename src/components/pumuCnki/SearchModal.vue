<template>  
    <div class="search-wrap">
        <h3 class="title">谱目检索</h3>
        <div class="search-box">
            <Search v-for="(item,index) in forms" :key="'search'+index" :defaultValue="pumuForm[item.type]" :name="item.name" :type="item.type" v-on:get-value="getValue" v-on:key-up="getGenealogyAll" />
        </div>
        <button class="search-button" @click="getGenealogyAll">检索</button>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Search from "./Search.vue";
export default {
    name: "searchmodal",
    props:{
        siteKey:{
            type: String
        }
    },
    components: {
        Search,
    },
    data: () => {
        return {
            forms:[{'name':'姓氏','type':'surname'},
            {'name':'家谱名','type':'genealogyName'},
            {'name':'谱籍地','type':'place'},
            {'name':'堂号','type':'hall'},
            {'name':'批次','type':'batch'},
            {'name':'出版年','type':'writeTime'}],
            pumuForm:{
                surname:'',
                genealogyName:'',
                place:'',
                hall:'',
                batch:'',
                writeTime:'',
            }
        };
    },
    mounted:function(){
        
    },
    methods:{
        getValue(data){
            this.pumuForm[data.type] = data.value;
        },
        getGenealogyAll:async function(){// 全部
            if(!ADS.objectValue2String(this.pumuForm)){
                return ADS.message('输入框必填一项');
            }
            let url='catalog/back?surname='+this.pumuForm.surname+'&genealogyName='+this.pumuForm.genealogyName+'&place='+this.pumuForm.place+'&hall='+this.pumuForm.hall+'&celebrity=&generationName=&batch='+this.pumuForm.batch+'&version=&writeTime='+this.pumuForm.writeTime+'&author=&hasImage=2&siteKey='+this.siteKey+'&source=&hasCheck=&creator=&page=1&limit=200';
            let data=await api.getAxios(url);
            if(data.status == 200 && data.result){
                console.log(data.result);
                this.$emit('get-result',data.result);
            }
        },
    },
};
</script>
<style scoped lang="scss">
.search-wrap{
    width: 100%;
    padding: 10px 0;
    background-color: #fff;
    text-align: right;
    .title{
        font-size: 16px;
        color: #344B5A;
        height: 16px;
        line-height: 16px;
        border-left: 2px solid #4C95FF;
        padding-left: 20px;
        text-align: left;
    }
    .search-box{
        padding: 0 20px 20px 20px;
        display: flex;
        justify-content: space-between;
        flex-wrap:wrap;
    }
    .search-button{
        width: 140px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #4C95FF;
        color: #fff;
        border: none;
        outline: none;
        border-radius: 20px;
        cursor: pointer;
        margin-right: 20px;
    }
}
</style>

