<template>
    <div class="wrap">
        <HeadTitle class="searchHide" :title="'谱内全文检索'" />
        <div class="sm_search_wrap">
            <div class="inputGroup">
                <input type="text" v-model="keywords" @keyup="getNodes" placeholder="请输入关键字..." />
                <a @click="getGenealogyNode"><img src="../../assets/search/search.png" alt="" /><span>搜索</span></a>
                <i class="el-icon-search" @click="getGenealogyNode"></i>
            </div>
            <span class="searchShow" @click="toggleSearch">取消</span>
        </div>
        <div class="genealogyWrap" v-if="list && list.length">
            <p>总计{{list.length}}条</p>
            <h3>{{detail.genealogyName}}<span v-show="detail.pages">{{detail.pages}}页,</span><span v-show="detail.publish">{{detail.publish}}出版</span></h3>
            <div class="nodeList style1">
                <p v-for="(item,index) in list" :key="'person'+index">{{item.name}}({{item.dis}}世)<span v-show="item.father">父:{{item.father}}</span><span v-show="item.mother">母:{{item.mother}}</span></p>
            </div>
        </div>
        <div class="nodata" v-else>
            <img src="../../assets/home/nodata.png" alt="暂无数据" />
            <p>暂无数据</p>
        </div>
        <Loading v-show="flag" />
    </div>
</template>

<script>
import HeadTitle from "./HeadTitle.vue";
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "search",
    components: {
        HeadTitle,
    },
    props:{
        detail:{
            type:[String,Object],
            default:{'genealogyName':'','pages':'','publish':''}
        },
    },
    data: () => {
        return {
            keywords:'',
            list:[],
            page:1,
            pages:0,
            total:0,
            flag:false,
        };
    },
    mounted:function(){
        
    },
    methods:{
        getGenealogyNode: async function(){
            if(!this.keywords){return false;}
            this.flag=true;
            let data=await api.getAxios('pkCatalog/searchSingleCatalog?genealogyKey='+this.detail._key+'&name='+this.keywords);
            this.flag=false;
            this.list=data.result;
            if(this.list.length == 0){
                this.$message({message: '暂无数据',type: 'warning'});
            }
        },
        getNodes(e){
            if(e.keyCode == 13){
                this.getGenealogyNode();
            }
        },
        toggleSearch(){
            this.$emit('toggle-search',false);
        }
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
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #e5e5e5;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #e5e5e5;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #caaa6f;
}
.style1::-webkit-scrollbar-corner{
	background-color: #e5e5e5;
}
.wrap{
    width: 100%;
    box-sizing: border-box;
    padding: 10px 20px 20px 20px;
    border-top: 4px solid #9D7747;
    font-size: 14px;
    color: #333;
    background:#fff;
    text-align: center;
}
.marginTop0{
    margin-top: 0;
}
.inputGroup{
    margin-top: 10px;
    width: 100%;
    height: 44px;
    box-sizing: border-box;
    padding-right: 88px;
    input{
        width: 100%;
        height: 44px;
        line-height: 44px;
        border: none;
        outline: none;
        text-indent: 10px;
        background: #F6F7F9;
    }
    a{
        float:right;
        margin-right: -88px;
        display: block;
        height: 44px;
        text-align: center;
        width: 88px;
        border-radius: 3px;
        background: #5082CC;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        img{
            margin-right: 5px;
        }
    }
}
.genealogyWrap{
    border-top: 1px solid #ddd;
    width: 100%;
    // max-height: 300px;
    text-align: left;
    margin-top: 20px;
    padding-bottom: 20px;
    >p{
        margin: 20px 0;
        height: 14px;
        line-height: 14px;
        border-left: 4px solid #333;
        text-indent: 10px;
    }
    h3{
        font-size: 16px;
        padding-bottom: 10px;
        border-bottom: 2px solid #9D7747;
        span{
            font-size: 14px;
            margin-left: 20px;
            font-weight: normal;
        }
    }
    .nodeList{
        max-height: 240px;
        overflow-y: scroll;
        margin-top: 10px;
        p{
            color: #666;
            display: block;
            height: 40px;
            line-height: 40px;
            border-bottom: 1px solid #ddd;
            span{
                margin-left: 10px;
            }
        }
    }
    a{
        color: #666;
        display: block;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #ddd;
        span{
            margin-left: 10px;
        }
    }
}
.searchShow{
    display: none;
}
.el-icon-search{
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 24px;
    display: none;
    color: #333;
}
.nodata{
    display: none;
}
@media screen and (max-width: 768px) {
    .wrap{
        border-top: none;
        padding: 0;
        margin-top: 0;
        height: 100%;
    }
    .sm_search_wrap{
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #154180;
        color: #fff;
        span{
            width: 60px;
        }
    }
    .inputGroup{
        position: relative;
        margin-top: 0;
        border-radius: 22px;
        overflow: hidden;
        background: #f2f2f2;
        padding-right: 0;
        input{
            width: 100%;
            text-indent: 40px;
        }
        a{
            display: none;
        }
    }
    .genealogyWrap{
        width: auto;
        padding-bottom: 10px;
        margin: 0 10px;
        .nodeList{
            min-height: 500px;
        }
    }
    .searchHide{
        display: none;
    }
    .searchShow{
        display: block;
    }
    .el-icon-search{
        display: block;
    }
    .nodata{
        display: block;
        text-align: center;
        img{
            margin-top: 180px;
        }
        p{
            margin-top: 10px;
        }
    }
}
</style>

