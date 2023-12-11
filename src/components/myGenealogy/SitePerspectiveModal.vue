<template>
    <div class="sitePerspectiveModal">
        <div class="form">
            <h3>时光谱目影像资源分发</h3>
            <i class="el-icon-close" @click="close"></i>
            <ul class="distribute_ul">
                <li>
                    <label class="label" for="">分享范围:</label>
                    <span>{{shareContent}}</span>
                </li>
                <li>
                    <label class="label" for="">分享内容:</label>
                    <el-radio-group v-model="givenType" class="radio_site">
                        <el-radio :label="1">谱目</el-radio>
                        <el-radio :label="2">谱目+影像</el-radio>
                        <el-radio :label="3">谱目+影像+全文</el-radio>
                    </el-radio-group>
                </li>
                <li>
                    <label class="label" for="">分享类型:</label>
                    <el-radio-group v-model="manageType" class="radio_site">
                        <el-radio :label="1">引 用（对方只读）</el-radio>
                        <el-radio :label="2">复制（对方可读）</el-radio>
                    </el-radio-group>
                </li>
                <li>
                    <label class="label" for="">分享对象:</label>
                    <div class="site_wrap">
                        <input type="text" placeholder="请输入微站名称" v-model="site" @keyup="handlekeyup" />
                        <input type="button" value="搜索" @click="getSite" />
                    </div>
                </li>
            </ul>
            <p class="total">共选择{{siteCount}}个站点</p>
            <ul class="site_box style1">
                <li v-for="(item,index) in sitelist" :key="'site'+index">
                    <el-checkbox :value="item.select" @change="changeCheckbox(item.select,index)"></el-checkbox>
                    <span>{{item.siteName}}</span>
                </li>
            </ul>
            <input class="btn yellow" type="button" :value="btn" @click="perspective" />
        </div>
        <Loading v-show="loading" />
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "sitePerspectiveModal",
    props:{
        checkList:{
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
            allCheck:false,
            gKeyArr:[],
            siteCheckList:[],
            givenType:1,
            manageType:1,
            siteCount:0,
            sitelist:[],
            userKey:'',
            shareContent:'',
            isperspective:false,
            btn:'确定分发',
        };
    },
    mounted:function(){
        this.userKey = window.localStorage.getItem('userId') || '';
        let vtotal=0,ptotal=0;
        this.checkList ? this.checkList.map((item,index)=>{
           if(item.select){
               this.gKeyArr.push(item._key);
               vtotal = vtotal + Number(Number(item.volume).toString() == 'NaN' ? 0 :item.volume);
               ptotal = ptotal + (Number(item.pages) ? Number(item.pages) : 0);
           }
        }) : null;
        this.shareContent = `选中的  ${this.checkList.length}  种，${vtotal} 册， ${ptotal}  张影像资源`;
        this.getSite();
    },
    methods:{
        close(){
            this.$emit('close-site',false);
        },
        perspective(){//分发
            let checkList=[];
            this.sitelist.map((item)=>{
                if(item.select){
                    checkList.push(item._key);
                }
            });
            this.siteCheckList = checkList;
            if(this.siteCheckList && this.siteCheckList.length){
                this.donationGenealogy();
            }else{
                this.$message({message: '请勾选微站',type: 'warning'});
            }
        },
        donationGenealogy:async function(){//时光赠送家谱
            this.isperspective = true;
            this.btn = '分发中...';
            let data=await api.postAxios('catalog/sgGiven',{'gKeyArr':this.gKeyArr,'siteKeyArr':this.siteCheckList,'userKey':this.userKey,'manageType':this.manageType,'givenType':this.givenType,'shareContent':this.shareContent});
            this.isperspective = false;
            this.btn = '确定分发';
            if(data.status == 200){
                this.$message({message: '分发家谱成功',type: 'success'});
                this.close();
            }else{
                this.$message({message: '分发家谱失败，请重新分发',type: 'warning'});
            }
        },
        allCheckbox(flag){
            if(this.list && this.list.length){
                this.allCheck = !flag;
                if(this.allCheck){
                    this.list.map((item)=>{item['select']=true});
                }else{
                    this.list.map((item)=>{item['select']=false});
                }
            }
        },
        changeCheckbox(flag,index){
            let count = 0;
            this.sitelist[index].select = !flag;
            this.sitelist.map((item)=>{
                if(item.select){
                    count++
                }
            });
            this.siteCount = count;
        },
        getSite:async function(type=true){//列表
            this.loading = true;
            type ? this.page=1 : null;
            let data=await api.getAxios('site?keyWord='+this.site+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status && data.result){
                let sitelist = data.result.list;
                sitelist && sitelist.length ? sitelist.map((item)=>{item['select']=false}) : null;
                this.sitelist = sitelist;
                if(type){
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                }
            }
        },
        handlekeyup(e){
            if(e.keyCode == 13){
                this.getSite();
            }
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
.sitePerspectiveModal{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
    .form{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        padding: 20px 30px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        h3{
            margin-bottom: 20px;
        }
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .total{
            font-size: 14px;
            margin: 30px auto 5px auto;
            text-align: left;
        }
        .btn{
            width: 224px;
            height: 48px;
            line-height: 48px;
            text-align: center;
            border-radius: 24px;
            background: #4C95FF;
            border-radius: 24px;
            display: block;
            margin: 20px auto;
            outline: none;
            border: none;
            color: #fff;
            cursor: pointer;
        }
        .yellow{
            background: #F1CE2C;
        }
        .distribute_ul{
            display: block;
            width: 500px;
            margin: 20px auto;
            li{
                height: 40px;
                line-height: 40px;
                display: flex;
                .label{
                    width: 80px;
                }
                .radio_site{
                    margin-top: 13px;
                    text-align: left;
                }
                .site_wrap{
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
                        top: 5px;
                        right: 0;
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
</style>

