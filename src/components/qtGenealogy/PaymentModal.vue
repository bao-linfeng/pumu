<template>
    <div class="paymentModal">
        <div class="form">
            <div class="tab_wrap">
                <p>{{stationName}}采购时光家谱资源</p>
            </div>
            <i class="el-icon-close close" @click="close"></i>
            <ul class="payment_wrap">
                <li class="source" :class="{active:source===1}">
                    <el-radio v-model="source" name="source" :label="1">谱目资源</el-radio>
                    <p>{{glabel}}</p>
                </li>
                <li class="source" :class="{active:source===2}" v-show="allHasImages">
                    <el-radio v-model="source" name="source" :label="2">谱目+影像资源</el-radio>
                    <p>{{plabel}}</p>
                </li>
                <li>
                    <el-checkbox v-model="isPuJuan"></el-checkbox>
                    <span class="marginLeft5">用 <i class="blue">谱劵</i> 抵扣￥{{pujuanbuy && pujuanbuy.toFixed(2)}}</span>
                </li>
                <li>
                    <span>需支付：<i class="blue fontSize24">￥{{isPuJuan ? (source == 2 ? (imagePages + checkList.length - pujuanbuy) : (checkList.length-pujuanbuy)) : (source == 2 ? (imagePages + checkList.length) : (checkList.length))}}</i></span>
                </li>
                <li>
                    <el-radio-group v-model="root">
                        <el-radio :label="1">时光维护</el-radio>
                        <el-radio :label="2">自行维护</el-radio>
                    </el-radio-group>
                </li>
            </ul>
            <div class="btn_wrap">
                <el-button round class="btn" @click="close">取消</el-button>
                <el-button type="primary" round class="btn" @click="payment">确认支付</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "paymentModal",
    props:{
        data:{
            type:Array,
        },
        gid:{
            type:String,
        },
    },
    data: () => {
        return {
            userKey:'',
            siteKey:'',
            stationName:'',
            glabel:'',
            plabel:'',
            source:1,
            isPuJuan:true,
            coupon:0,
            root:1,
            allHasImages:false,
            pujuanbuy:0,
            imagePages:0,
            checkList:[],
            pathname:'',
            isBuyList:[],
        };
    },
    mounted:function(){
       let checkList=[],total=0,volume=0,page=0,imagePages=0,isBuyList=[];
       this.token= window.localStorage.getItem('token') || '';
       this.userKey = window.localStorage.getItem('userId') || '';
       this.siteKey = window.localStorage.getItem('stationKey') || '';
       this.stationName = window.localStorage.getItem('stationName') || '';
       this.pathname = window.localStorage.getItem('pathname') || '';
       this.data.map((item)=>{
           if(item.select){
               checkList.push(item._key);
               total = total + 1;
               volume = volume + Number(item.imageVolumes);
               page = page + Number(item.pages);
               imagePages = imagePages + (Number(item.imagePages) || 0);
               if(item.buyCatalog || item.buyImage){
                   isBuyList.push(item.genealogyName);
               }
           }
       });
       this.allHasImages=this.data.every((item)=>{return item.imagePages});
       this.isBuyList = isBuyList;
       this.checkList = checkList;
       this.imagePages = imagePages;
       this.glabel = '采购  '+total+'  套，'+volume+'  册，共计 '+page+' 页';
       this.plabel = '采购  '+total+'  套，'+volume+'  册，共计 '+imagePages+' 页';
       this.getUser();
    },
    methods:{
        close(){
            this.$emit('close-source',false);
        },
        getSource:async function(type=true){//资源列表
            let data=await api.getAxios('catalog/file?page='+this.page+'&limit='+this.limit+'&catalogKey='+this.gid);
            if(data.status == 200){
                if(type){
                    this.sourceList = data.result.list;
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                }
            }
        },
        getUser:async function(){//谱劵
            let data=await api.getAxios('user?userKey='+this.userKey);
            if(data.status == 200 && data.result){
                this.coupon = data.result.coupon;
                if(this.source == 2){
                    let account = this.imagePages + this.checkList.length;
                    if(account > this.coupon){
                        this.pujuanbuy = this.coupon;
                    }else{
                        this.pujuanbuy = account;
                    }
                }else{
                    if(this.checkList.length > this.coupon){
                        this.pujuanbuy = this.coupon;
                    }else{
                        this.pujuanbuy = this.checkList.length;
                    }
                }
            }
        },
        buyGenealogy:async function(){//谱劵购买家谱
            let data=await api.postAxios('coupon/buyCatalog',{
                "userKey":this.userKey, 
                "catalogKeyArr":this.checkList,
                "siteKey":this.siteKey,
                "manageType":this.root,
                "givenType":this.source,
                "payCoupon":this.pujuanbuy
            });
            if(data.status == 200){
                this.$message({message: '谱劵购买家谱成功',type: 'success'});
                this.$router.push({path:'/'+this.pathname+'/coupon'});
            }else{
                this.$message({message: '谱劵购买家谱失败，请重新购买',type: 'warning'});
            }
        },
        payment(){
            let pujuanbuy = 0,catalogKeyArr=this.checkList.join(),payContent=this.plabel,fee=0;
            if(this.isBuyList && this.isBuyList.length){
                this.$message({message: this.isBuyList.join()+'已购买，不要重复购买',type: 'warning'});
                return false;
            }
            fee = this.isPuJuan ? (this.source == 2 ? (this.imagePages + this.checkList.length - this.pujuanbuy) : (this.checkList.length-this.pujuanbuy)) : (this.source == 2 ? (this.imagePages + this.checkList.length) : (this.checkList.length));
            this.isPuJuan ? pujuanbuy = this.pujuanbuy : null
            if(this.source == 2){
                payContent = this.glabel;
            }
            if(fee){
                this.$router.push({path: '/payments?manageType='+this.root+'&givenType='+this.source+'&payCoupon='+pujuanbuy+'&catalogKeyArr='+catalogKeyArr+'&payContent='+payContent+'&fee='+fee});
            }else{
                this.buyGenealogy();
            }
        }
    },
    watch: {
    　　'source': function (newValue,oldValue) {
            if(this.source == 2){
                let account = this.imagePages + this.checkList.length;
                if(account > this.coupon){
                    this.pujuanbuy = this.coupon;
                }else{
                    this.pujuanbuy = account;
                }
            }else{
                if(this.checkList.length > this.coupon){
                    this.pujuanbuy = this.coupon;
                }else{
                    this.pujuanbuy = this.checkList.length;
                }
            }
    　　}
    },
};
</script>
<style scoped lang="scss">
.paymentModal{
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
        padding: 65px 50px 20px 50px;
        width: 520px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        .tab_wrap{
            position: absolute;
            top: 10px;
            right: 0;
            height: 54px;
            line-height: 54px;
            left: 0;
            font-size: 18px;
            p{
                font-weight: bold;
            }
            span{
                display: inline-block;
                color: #7E8E98;
                margin: 0 10px;
                cursor: pointer;
                &.active{
                    color: #344B5A;
                    border-bottom: 2px solid #4C95FF;
                }
            }
        }
        i.close{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .payment_wrap{
            display: block;
            margin-top: 10px;
            li{
                text-align: right;
                height: 40px;
                line-height: 40px;
                border-bottom: 1px solid #ddd;
                &.source{
                    text-align: left;
                    height: 40px;
                    line-height: 1;
                    background: #F6FAFD;
                    padding: 20px;
                    border-bottom: none;
                    p{
                        margin-top: 10px;
                    }
                    &.active{
                        background: #EAF6FF;
                    }
                }
            }
        }
        .btn_wrap{
            margin-top: 20px;
            .btn{
                margin: 0 20px;
            }
        }
    }
}
.blue{
    color: #4C95FF;
    font-style: normal;
}
.fontSize24{
    font-size: 24px;
}
.marginLeft5{
    margin-left: 5px;
}
</style>

