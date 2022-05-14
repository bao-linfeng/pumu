<template>
    <div class="perspectiveList">
        <div class="form">
            <h3>时光谱目影像分发记录</h3>
            <!-- <i class="el-icon-close" @click="close"></i> -->
            <p class="total">总共{{total}}记录</p>
            <div class="table_wrap style1">
                <table class="mytable">
                    <thead>
                        <tr>
                            <th v-for="(item,index) in label" :key="'th'+index">
                                <span>{{item}}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item,index) in list" :key="'tr'+index">
                            <td>{{item.time | getLocalTime}}</td>
                            <td>{{item.executor}}</td>
                            <td>{{item.manageType == 1 ? '只读' : '可读'}}</td>
                            <td>{{item.siteName ? item.siteName.join() : ''}}</td>
                            <td>{{item.cotent}}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="more" @click="getMore" v-show="page < pages">更多</p>
            </div>
        </div>
        <Loading v-show="loading" />
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "perspectiveList",
    props:{
        data:{
            type:Array,
        },
    },
    data: () => {
        return {
            label:['分享时间','分享人','类型','分享对象','分享内容'],
            list:[],
            loading:false,
            page:1,
            limit:20,
            pages:0,
            total:0,
        };
    },
    mounted:function(){
       this.getSite();
    },
    methods:{
        close(){
            this.$emit('close-perspective',false);
        },
        getSite:async function(type=true){//列表
            this.loading = true;
            type ? this.page=1 : null;
            let data=await api.getAxios('givenHistory?page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status && data.result){
                let result = data.result;
                if(type){
                    this.list = result.list;
                    this.pages = result.pageNum;
                    this.total = result.total;
                }else{
                    this.list=this.list.concat(result.list);
                }
            }
        },
        getMore(){
            this.page = this.page + 1;
            this.getSite(false);
        },
    },
};
</script>
<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #fff;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #fff;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: #fff;
}
.perspectiveList{
    // position: fixed;
    // top: 0;
    // right: 0;
    // left: 200px;
    width: calc(100% - 40px);
    height: 100%;
    background: rgba(43,51,72,0.9);
    z-index: 100;
    padding: 0 20px;
    .form{
        position: relative;
        width: 100%;
        height: calc(100% - 30px);
        padding: 15px 0;
        h3{
            margin-bottom: 20px;
            color: #fff;
        }
        .total{
            text-align: left;
            margin-bottom: 5px;
            color: #fff;
        }
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
            color: #fff;
        }
        .more{
            color: #358acd;
            cursor: pointer;
            text-align: center;
        }
        .table_wrap{
            overflow-y: auto;
            height: calc(100% - 72px);
        }
    }
}
.mytable{
    color: #e7f0fc;
    .line{
        margin: 0 5px;
    }
    cursor: pointer;
    thead{
        background: #515869;
        tr{
            th{
                height: 30px;
                line-height: 30px;
                font-size: 12px;
                letter-spacing: 1px;
            }
        }
    }
    tbody tr{
        background: #787e8b;
        td{
            padding: 5px 0;
            height: 30px;
            line-height: 16px;
            font-size: 12px;
        }
        &:nth-of-type(even){
            background: #515869;
        }
        &:hover{
            background: #72a5ef;
        }
    }
}
</style>

