<template>
    <div class="siteModal">
        <div class="form">
            <i class="el-icon-close" @click="close"></i>
            <div class="site_wrap">
                <input class="search" type="text" placeholder="微站名" v-model="site" @keyup="handlekeyup" />
                <input class="btn" type="button" value="检索" @click="getSite" />
            </div>
            <p class="total">找到  {{total}} 条结果</p>
            <div class="list_wrap style1">
                <table class="mytable">
                    <thead>
                        <tr>
                            <th v-for="(item,index) in label" :key="'th'+index">
                                <span>{{item}}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item,index) in sitelist" :key="'tr'+index" @click="persactive(item)">
                            <td>{{item.siteName}}</td>
                            <td>{{item.catalogNum}}</td>
                            <td>{{item.hasImageNum}}</td>
                            <td>{{item.sgGivenNum}}</td>
                            <td>{{item.sgGivenImageNum}}</td>
                            <td>{{item.loginTime | getLocalTime}}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="more" v-if="page < pages" @click="getMore">更多</p>
            </div>
        </div>
        <Loading v-show="loading" />
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "siteModal",
    props:{
        data:{
            type:Array,
        },
    },
    data: () => {
        return {
            loading:false,
            limit:50,
            page:1,
            pages:0,
            total:0,
            site:'',
            userKey:'',
            label:['微站','自建谱目','自建影像谱目','时光授权谱目','时光授权影像谱目','最新访问时间'],
            sitelist:[],
        };
    },
    mounted:function(){
        this.userKey = window.localStorage.getItem('userId') || '';
        this.getSite();
    },
    methods:{
        close(){
            this.$emit('close-site',false);
        },
        save(item){
            this.$emit('save-site',item);
        },
        getSite:async function(type=true){//列表
            //if(!this.site){this.$message({message: '请输入微站名称',type: 'warning'});return false;}
            this.loading = true;
            type ? this.page=1 : null;
            let data=await api.getAxios('site?keyWord='+this.site+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status && data.result){
                if(type){
                    this.sitelist = data.result.list;
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                }else{
                    this.sitelist = this.sitelist.concat(data.result.list);
                }
            }
        },
        handlekeyup(e){
            if(e.keyCode == 13){
                this.getSite();
            }
        },
        persactive:async function(item){//设置透视微站
            let data=await api.patchAxios('site/friend',{'siteKey':item._key,'siteName':item.siteName,'siteLogo':item.siteLogo});
            if(data.status == 200){
                this.save(item);
            }else{
                this.$message({message: '家谱透视失败，请重新透视',type: 'warning'})
            }
        },
        getMore(){
            this.page = this.page +1;
            this.getSite(false);
        },
    },
};
</script>
<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #F6FAFD;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #F6FAFD;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: #F6FAFD;
}
.siteModal{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
    .form{
        position: absolute;
        top: 220px;
        right: 20px;
        bottom: 20px;
        // transform: translate(-50%,-50%);
        width: 660px;
        padding: 20px 10px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        h3{
            margin-bottom: 20px;
        }
        i{
            position: absolute;
            top: 25px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .total{
            font-size: 14px;
            margin: 10px auto 5px auto;
            text-align: left;
        }
        .site_wrap{
            width: 302px;
            margin: 0 auto;
            position: relative;
            input[type=text]{
                width: 300px;
                height: 30px;
                line-height: 30px;
                background: #F6FAFD;
                border: 1px solid #D6E7F3;
                border-radius: 15px;
                text-indent: 15px;
                outline: none;
            }
            input[type=button]{
                position: absolute;
                top: 1px;
                right: 1px;
                width: 100px;
                height: 30px;
                line-height: 30px;
                border-radius: 15px;
                color: #fff;
                text-align: center;
                background: #50D0A6;
                outline: none;
                border: none;
                cursor: pointer;
            }
        }
        .site_box{
            background: #F6FAFD;
            padding: 10px;
            height: 120px;
            overflow-y: auto;
            display: block;
            li{
                display: flex;
                height: 30px;
                line-height: 30px;
                span{
                    display: block;
                    margin-left: 5px;
                }
            }
        }
    }
}
.list_wrap{
    position: absolute;
    top: 85px;
    right: 10px;
    bottom: 10px;
    left: 10px;
    overflow-y: auto;
    .more{
        text-align: center;
        color: #358acd;
        height: 30px;
        line-height: 30px;
        cursor: pointer;
    }
}
</style>