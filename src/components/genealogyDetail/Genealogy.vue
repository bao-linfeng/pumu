<template>
    <div class="wrap">
        <HeadTitle :title="'相关家谱'" />
        <div class="list">
            <router-link v-show="item.genealogyName" :to="'/gd/'+item._key" v-for="(item,index) in article" :key="'article'+index">
                <img class="cover" src="../../assets/search/coverBg.png" alt="封面" />
                <p>{{item.genealogyName}}</p>
                <span v-show="item.place"><img src="../../assets/gdetail/place.png" alt="谱籍地" />{{item.place}}</span>
            </router-link>
        </div>
        <router-link v-show="article.length > 4" :to="'/relateGenealogy?surname='+detail.surname+'&place='+detail.place+'&name='+detail.genealogyName" class="more">更多家谱</router-link>
    </div>
</template>

<script>
import api from "../../api.js";
import HeadTitle from "./HeadTitle.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogy",
    components: {
        HeadTitle,
    },
    props:{
        detail:{
            type:[String,Object],
            default:{}
        },
    },
    data: () => {
        return {
            article:[],
        };
    },
    mounted:function(){
        this.getGenealogyList(this.detail);
    },
    methods:{
        getGenealogyList: async function(detail){
            let data=await api.getAxios('pkCatalog/relate?surname='+(detail.surname || '')+'&place='+(detail.place || '')+'&page=1&limit=4');
            if(data.statusCode == 200){
                this.article=data.data;
            }
        },
    },
    computed: {
        ...mapState({
            activeSurname: state => state.surname.activeSurname,
            activeSurnameIndex:state => state.surname.activeSurnameIndex,
        })
    },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: 100%;
    box-sizing: border-box;
    padding: 20px 40px 80px 40px;
    min-height: 465px;
    font-size: 14px;
    color: #666;
    background:#fff;
    text-align: center;
    border-top: 4px solid #9D7747;
    margin-top: 20px;
    .list{
        text-align: left;
        width: 100%;
        margin-top: 10px;
        a{
            padding: 15px 0 15px 70px;
            border-bottom: 1px solid #ddd;
            display: block;
            overflow: hidden;
            color: #666;
            p{
                font-size: 20px;
                margin-bottom: 5px;
            }
            span{
                color: #9D7747;
                img{
                    margin-right: 5px;
                }
            }
            .cover{
                width: 60px;
                float: left;
                margin-left: -70px;
            }
        }
    }
    .more{
        position: absolute;
        bottom: 20px;
        left: 50%;
        margin-left: -41px;
        display: block;
        width: 82px;
        height: 41px;
        line-height: 41px;
        text-align: center;
        cursor: pointer;
        color: #333;
        background: url('../../assets/person/more.png') -82px 0 no-repeat;
    }
}
</style>

