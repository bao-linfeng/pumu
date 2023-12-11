<template>
  <div class="payment">
    <NavLink />
    <div class="center">
        <HeadTitle :title="'参与赞助'" class="about_title" />
        <div class="payment_form">
            <label for="">赞助金额</label>
            <span class="qian" :class="{active:activeNode == index}" v-for="(item,index) in [50,100,200]" :key="'qian'+index" @click="changePayment(item,index)">{{item}}元</span>
            <div class="input_group">
                <span>其他</span>
                <input type="text" placeholder="赞助金额" :disabled="!!amount" v-model="payment" />
                <i>元</i>
            </div>
        </div>
        <div class="payment_form">
            <label for="">赞助类型</label>
            <el-radio-group v-model="donateType">
                <el-radio :label="1">个人</el-radio>
                <el-radio :label="2">机构</el-radio>
            </el-radio-group>
        </div>
        <div class="item_wrap style1" v-show="donateType == 2">
            <el-radio class="user_item" v-for="(item,index) in userList" name='user' :key="'user'+index" :label="item._key" v-model="radio">{{item.name}}</el-radio>
        </div>
        <!-- <div class="payment_form">
            <label for="">手机号码</label>
            <input class="mobile" type="text" :disabled="!!tel" placeholder="请输入手机号码" v-model="mobile" />
            <span class="desc">（ 项目动态向手机号反馈 ）</span>
        </div> -->
        <div class="payment_method">
            <p>付款方式选择</p>
            <div class="payment_icon">
                <img :class="{active:activePayment==0}" @click="postPayment(0)" src="../assets/payment/weixin.svg" alt="微信支付" />
                <img :class="{active:activePayment==1}" @click="postPayment(1)" src="../assets/payment/alipay.svg" alt="支付宝支付" />
            </div>
        </div>
    </div>
    <Footer />
    <div class="payment_pic" v-show="paymentPic">
        <p>捐助金额 {{payment}} 元，支持 {{gname}}</p>
        <a class="weixin_iphone" v-if="isIphone" :href="mweb_url">微信支付</a>
        <div v-else class="share_qrcode" id="share_qrcode"></div>
        <div v-html="form"></div>
        <i class="el-icon-close" @click="closePayment"></i>
    </div>
  </div>
</template>

<script>
import ADS from "../ADS.js";
import api from "../api.js";
import NavLink from "@/views/NavLink.vue";
import Footer from "@/views/Footer.vue";
import HeadTitle from "../components/genealogyDetail/HeadTitle.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "payment",
    components: {
        NavLink,
        Footer,
        HeadTitle,
    },
    data: () => {
        return {
            id:'',
            payment:50,
            mobile:'',
            mobileArea:'+86',
            activeNode:0,
            activePayment:-1,
            token:'',
            gid:'',
            gname:'',
            paymentPic:false,
            out_trade_no:'',
            timer:'',
            seconds:0,
            form:'',
            isIphone:false,
            mweb_url:'',
            amount:0,
            tel:'',
            orderId:'',
            userKey:'',
            donateType:1,
            siteInfo:'',
            radio:'',
            pathname:'',
            userList:[],
            isWeixin:false,
        };
    },
    mounted:function(){
        let search=window.location.search,params=ADS.params(search),gid=params['gid'] || '',gname=decodeURI(params['gname']) || '',amount=params['amount'] || 0,mobile=params['mobile'] || '',orderId=params['orderId'] || '';
        this.gid = gid;
        this.gname = gname;
        this.amount = amount;
        this.payment = amount || 50;
        this.mobile = mobile;
        this.tel = mobile;
        this.orderId = orderId;
        this.token = window.localStorage.getItem('token') || '';
        this.userKey = window.localStorage.getItem('userId') || '';
        this.pathname = window.localStorage.getItem('pathname') || '';
        if(window.innerWidth < 768){//手机端判断
            this.isIphone = true;
        }
        this.getSite();
    },
    methods:{
        qrcode(uri){//生成二维码
            let qrcode=new QRCode('share_qrcode',{
                text: uri,
                width: 150,
                height: 150,
                colorDark : '#000000',
                colorLight : '#ffffff',
                correctLevel : QRCode.CorrectLevel.H
            });
        },
        changePayment(item,index){
            if(!this.amount){
                this.payment = item;
                this.activeNode = index;
            }
        },
        getSite:async function(){
            let data=await api.getAxios('userSite?token='+this.token+'&searchCondition=&curPage=1&perPage=20');
            if(data.statusCode == 200 && data.result){
                this.userList = data.result;
            }
        },
        postPayment: async function(index){
            let paymentType = {0:'weixinPayment',1:'AliPayment'}//支付方式
            this.activePayment = index;
            if(this.payment <= 0){this.$message({message: '请选择捐赠金额',type: 'warning'});return false;}
            // if(!this.mobile){this.$message({message: '请填写手机号',type: 'warning'});return false;}
            if(!this.userKey){this.$message({message: '请登录',type: 'warning'});return false;}
            this[paymentType[index]]();//调用支付工具
        },
        weixinPayment:async function(){//微信支付请求
            let siteInfo = '';
            if(this.userList && this.userList.length){
                this.userList.map((item)=>{
                    if(item._key == this.radio){
                        siteInfo = item
                    }
                });
            }
            if(this.donateType == 2 && !siteInfo){
                this.$message({message: '请勾选机构',type: 'warning'});
                return false;
            }
            let data=await api.postAxios('catalog/donate',{'userKey':this.userKey,'donateType':this.donateType,'siteInfo':siteInfo,toGenealogyKey:this.gid, mobile:this.mobile,fee:Number(this.payment),"trade_type":this.isIphone ? "MWEB" : "NATIVE",'orderId':this.orderId});
            if(data.statusCode == 200){
                this.out_trade_no = data.data.out_trade_no;
                this.mweb_url = data.data.mweb_url+'&redirect_url='+encodeURIComponent(window.location.origin+'/paymentok?out_trade_no='+data.data.out_trade_no);
                this.paymentPic = true;
                if(!this.isIphone){
                    this.qrcode(this.mweb_url);
                    let self = this;
                    this.timer = setInterval(function(){
                        self.getWeixinPayment();
                    },5000);
                }
            }else{
                this.$message({message: data.msg,type: 'warning'});
            }
        },
        AliPayment:async function(){//支付宝支付请求
            let siteInfo = [];
            if(this.userList && this.userList.length){
                this.userList.map((item)=>{
                    if(item._key == this.radio){
                        siteInfo.push({"_key":item._key,"siteName":item.siteName,"siteLogo":item.siteLogo});
                    }
                });
            }
            if(this.donateType == 2 && !siteInfo.length){
                this.$message({message: '请勾选机构',type: 'warning'});
                return false;
            }
            let data=await api.postAxios('catalog/donateAli',{'cao':window.location.origin+'/paymentok','userKey':this.userKey,'donateType':this.donateType,'siteInfo':siteInfo,toGenealogyKey:this.gid, mobile:this.mobile,fee:Number(this.payment),"trade_type":this.isIphone ? "wap" : "page",'orderId':this.orderId});
            if(data.statusCode == 200){
                this.form = data.data.form;
                let self = this;
                setTimeout(function(){
                    self.$nextTick(()=>{
                        document.forms[0].submit();
                    });
                },200);
            }else{
                this.$message({message: data.msg,type: 'warning'});
            }
        },
        closePayment(){
            clearInterval(this.timer);
            this.paymentPic = false;
            this.timer = '';
            this.out_trade_no = '';
            this.mweb_url = '';
            this.isIphone ? null : document.getElementById('share_qrcode').innerHTML = '';
        },
        getWeixinPayment:async function(){//微信支付，订单确认
            this.seconds = this.seconds + 5;
            let data=await api.getAxios('donateDetail?rechargeKey='+this.out_trade_no+'&simple=1');
            if(data.statusCode == 200){
                if(data.result.status == 2){
                    clearInterval(this.timer);
                    this.paymentPic = false;
                    this.timer = '';
                    this.out_trade_no = '';
                    this.mweb_url = '';
                    this.$router.push('/'+this.pathname+'/genealogySearch')
                }else{
                    if(this.seconds >= 300){
                        clearInterval(this.timer);
                        this.paymentPic = false;
                        this.out_trade_no = '';
                        this.mweb_url = '';
                        this.timer = '';
                        this.seconds = 0;
                        document.getElementById('share_qrcode').innerHTML = '';
                        this.$message({message: '二维码已失效，请重新付款',type: 'warning'});
                    }
                }
            }else if(data.result.status == 701){
                this.$router.push('/login')
            }else if(data.result.status == 201){
                clearInterval(this.timer);
                this.paymentPic = false;
                this.timer = '';
                this.out_trade_no = '';
                this.mweb_url = '';
                this.$message({message: data.msg,type: 'warning'});
            }
        },
    },
    computed: {
        ...mapState({
            activeSurname: state => state.surname.activeSurname,
            activeSurnameIndex:state => state.surname.activeSurnameIndex,
        })
    },
    watch: {
    　　'payment': function (newValue,oldValue) {
            switch(Number(newValue)){
                case 50:
                    this.activeNode = 0;
                    break;
                case 100:
                    this.activeNode = 1;
                    break;
                case 200:
                    this.activeNode = 2;
                    break;
                default:
                    this.activeNode = -1;
                    break;
            }
    　　}
    },
};
</script>
<style scoped lang="scss">
.payment{
    position: relative;
    width: 100%;
    min-height: 100%;
    font-size: 16px;
    text-align: left;
    padding-bottom: 98px;
    background: #f2f2f2;
}
.center{
    position: relative;
    width: 1360px;
    margin: -80px auto 0 auto;
    color: #333;
    background: #fff url('../assets/gdetail/bgTop.png') 50% 0 repeat-x;
    padding: 20px;
    text-align: center;
    min-height: 700px;
    p{
        text-align: left;
        line-height: 30px;
        text-indent: 20px;
    }
    .payment_form{
        width: 700px;
        margin: 20px auto;
        padding-top: 50px;
        display: flex;
        color: #666;
        font-size: 16px;
        label{
            width: 80px;
            height: 40px;
            line-height: 40px;
            display: inline-block;
        }
        .qian{
            display: inline-block;
            width: 80px;
            height: 40px;
            line-height: 40px;
            border: 1px solid #e5e5e5;
            margin-left: 20px;
            border-radius: 3px;
            cursor: pointer;
            &.active{
                background: #3285FF;
                color: #fff;
                border: 1px solid #3285FF;
            }
        }
        .input_group{
            margin-left: 20px;
            width: 300px;
            height: 40px;
            line-height: 40px;
            border: 1px solid #e5e5e5;
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
            span{
                width: 80px;
                height: 40px;
                line-height: 40px;
                background: #F4F7F9;
                border-radius: 8px 0px 0px 8px;
            }
            input{
                border: none;
                outline: none;
                height: 40px;
                line-height: 40px;
                text-indent: 10px;
            }
            i{
                display: block;
                width: 40px;
                height: 40px;
                line-height: 40px;
                font-style: normal;
            }
        }
        .mobile{
            outline: none;
            height: 40px;
            line-height: 40px;
            text-indent: 10px;
            width: 300px;
            border: 1px solid #e5e5e5;
            margin: 0 20px;
            border-radius: 3px;
        }
        .desc{
            color: #9b9b9b;
            height: 40px;
            line-height: 40px;
            display: inline-block;
            font-size: 14px;
        }
    }
    .payment_method{
        text-align: center;
        width: 700px;
        margin: 20px auto;
        p{
            text-align: center;
            color: #4a4a4a;
        }
        img{
            width: 80px;
            margin: 20px;
            cursor: pointer;
            border: 1px solid #f2f2f2;
            padding: 5px;
            border-radius: 3px;
            &.active{
                border: 1px solid #3285FF;
            }
        }
    }
}
.item_wrap{
    background: #D6E7F3;
    padding: 10px;
    overflow-y: auto;
    max-height: 300px;
    text-align: left;
    width: 700px;
    margin: 10px auto;
}
.payment_pic{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.6);
    p{
        margin-top: 200px;
        color: #fff;
        text-align: center;
    }
    .share_qrcode{
        margin: 20px auto;
        display: block;
        width: 150px;
        height: 150px;
    }
    i{
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 40px;
        color: #fff;
    }
}
.weixin_iphone{
    display: block;
    margin: 10px auto;
    text-align: center;
}
@media screen and (max-width:1400px) and (min-width:769px) {
    .center{
        width: 1160px;
    }
}
@media screen and (max-width: 768px) {
    .center{
        width: calc(100% - 20px);
        min-height: 300px;
        padding: 20px 0;
        .payment_form{
            width:100%;
            display: block;
            padding-top: 0;
            label{
                display: block;
            }
            .qian{
                margin-left: 0;
                margin-right: 20px;
            }
            .input_group{
                margin: 10px auto;
            }
        }
        .payment_method{
            width:100%;
            display: block;
        }
    }
    .about_title{
        text-align: center;
        margin: 15px auto;
    }
}
.user_item{
    display: block;
    height: 30px;
    line-height: 30px;
}
.el-radio+.el-radio {
    margin-left: 0;
}
</style>

