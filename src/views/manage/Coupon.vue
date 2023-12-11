<template>
  <div class="wrap">
    <Sidebar />
    <div class="content">
        <div class="nav">
            <span class="logo" @click="sideShow=!sideShow"><img :src="stationlogo" @error="picError" alt="微站图标" />{{stationName}}</span>
            <span class="logout" @click="logout()">退出</span>
        </div>
        <div class="coupon">
            <h3 class="title">谱劵余额</h3>
            <div class="user">
                <img :src="avatar" @error="avatarError" alt="头像" />
                <p>{{name}}</p>
                <span>谱劵余额：<i>{{coupon}}</i>元</span>
            </div>
            <div class="btn_wrap">
                <input class="btn" type="button" value="购买" @click="payment" />
                <input class="btn yellow" type="button" value="转账" @click="openModal" />
            </div>
        </div>
        <div class="coupon_wrap">
            <h3 class="title">交易记录</h3>
            <div class="tab_wrap">
                <span :class="{active:tabIndex == index}" v-for="(item,index) in tab" :key="'tab'+index" @click="changeTab(index)">{{item}}</span>
            </div>
            <div class="coupon_list">
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
                        <td><span>{{item.time | getLocalTime}}</span></td>
                        <td><span>{{item.action}}</span></td>
                        <td><span>{{tabIndex ? '-' : '+'}}{{item.amount}}</span></td>
                    </tr>
                    </tbody>
                </table>
                <PageTurn v-if="pages > 1" :total="total" :pages="pages" :curPage="page" :label="'条记录'" v-on:click-page="getGenealogyListForPage" />
            </div>
        </div>
    </div>
    <div class="modal_wrap" v-show="isShow">
        <div class="modal_box">
            <h3>转账</h3>
            <i class="el-icon-close" @click="isShow=false"></i>
            <div class="search_box">
                <input class="search" type="text" placeholder="请输入姓名或手机号" v-model="userName" @keyup="handleUserKeyup" />
                <input class="btn" type="button" value="检索" @click="getUserList" />
            </div>
            <div class="item_wrap style1">
                <el-radio class="user_item" v-for="(item,index) in userList" name='user' :key="'user'+index" :label="item._key" v-model="radio">{{item.userName}}({{item.mobile}})</el-radio>
            </div>
            <div class="payment">
                <span>转账额度：</span>
                <input class="account" type="text" placeholder="请输入谱劵" v-model="account" />
            </div>
            <input class="btn" type="button" value="转账" @click="submitcoupon" />
        </div>
    </div>
    <Loading v-show="loading" />
  </div>
</template>

<script>
import api from "../../api.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import PageTurn from "../../components/genealogySearch/PageTurn.vue";
export default {
  name: "coupon",
  components: {
    Sidebar,
    PageTurn,
  },
  data: () => {
    return {
        stationName:'',
        stationlogo:'',
        tab:['获得','消耗'],
        tabIndex:0,
        coupon:0,
        avatar:'',
        name:'匿名',
        list:[],
        label:['时间','事件','谱劵明细'],
        userKey:'',
        page:1,
        limit:10,
        pages:1,
        total:0,
        loading:false,
        userName:'',
        userList:[],
        radio:'',
        account:1,
        isShow:false,
        sideShow:true,
    };
  },
  mounted:function(){
    let profile = window.localStorage.getItem('profile') ? JSON.parse(window.localStorage.getItem('profile')) : '';
    if(profile){
        this.avatar = profile.avatar;
        this.name = profile.trueName || profile.nickName;
    }
    this.stationName = window.localStorage.getItem('stationName') || '';
    this.stationlogo = window.localStorage.getItem('stationlogo') || '';
    this.userKey = window.localStorage.getItem('userId') || '';
    this.getUser();
    this.getCoupon();
  },
  methods:{
    changeTab(index){
        this.tabIndex = index;
        this.getCoupon();
    },
    picError(){
        this.stationlogo = require('../../assets/nav/avatar.svg');
    },
    avatarError(){
        this.avatar = require('../../assets/nav/avatar.svg');
    },
    getUser:async function(){//谱劵
        let data=await api.getAxios('user?userKey='+this.userKey);
        if(data.status == 200 && data.result){
            this.coupon = data.result.coupon.toFixed(2);
        }
    },
    openModal(){
        this.isShow = true;
        this.getUserList();
    },
    getCoupon:async function(flag=true){
        this.loading = true;
        flag ? this.page=1 : null;
        let type = this.tabIndex == 1 ? 1 : 2;
        let data=await api.getAxios('coupon/change?userKey='+this.userKey+'&type='+type+'&page='+this.page+'&limit='+this.limit);
        this.loading = false;
        if(data.status && data.result){
            let list = data.result.list;
            this.list = list;
            if(flag){
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }
        }
    },
    getGenealogyListForPage(page){
        this.page=page;
        this.getCoupon(false);
    },
    payment(){
        this.$router.push({path: '/couponPayment'});
    },
    getUserList:async function(flag=true){
        this.loading = true;
        flag ? this.page=1 : null;
        let data=await api.getAxios('user?userName='+this.userName+'&page=1&limit=100');
        this.loading = false;
        if(data.status && data.result){
            let userList = data.result.list;
            this.userList = userList;
            // if(this.userList && this.userList.length){
            //     this.radio = this.userList[0]._key;
            // }
            if(flag){
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }
        }
    },
    handleUserKeyup(e){
        if(e.keyCode == 13){
            this.getUserList();
        }
    },
    changeCheckbox(flag,index){
        this.userList[index].select = !flag;
    },
    submitcoupon(){
        if(!this.radio){this.$message({message: '请勾选转账用户',type: 'warning'});return false;}
        this.$confirm('此操作将消耗你的'+this.account+'谱券，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.givecoupon();
        }).catch(() => {});
    },
    givecoupon:async function(){
        let account = Number(this.account);
        if(account <= 0 || account > this.coupon){
            this.$message({message: '转账超出账户余额',type: 'warning'});
            return false;
        }
        let data=await api.postAxios('coupon/given',{'userKey':this.userKey,'toUser':this.radio,'fee':this.account});
        if(data.status == 200){
            this.isShow = false;
            this.getUser();
            this.getCoupon();
        }else{
            this.$message({message: data.msg,type: 'warning'});
        }
    }
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
.wrap{
    position: relative;
    width: calc(100% - 200px);
    min-height: 100%;
    padding-left: 200px;
    padding-bottom: 20px;
    background: #EFF1F5;
    .content{
        position: relative;
        width: 100%;
        font-size: 14px;
        .nav{
            height: 60px;
            background: #fff;
            padding: 0 20px;
            color: #344B5A;
            display: flex;
            align-items:center;
            justify-content: space-between;
            .logo{
                height: 40px;
                line-height: 40px;
                padding-left: 50px;
                font-size: 22px;
                img{
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    float: left;
                    margin-left: -50px;
                }
            }
            .logout{
                cursor: pointer;
                padding-left: 22px;
                background: url('../../assets/icon/logout.svg') 0 50% no-repeat;
                background-size: 18px;
                display: inline-block;
                height: 20px;
                line-height: 20px;
            }
        }
        .coupon{
            position: relative;
            background: #fff;
            margin: 20px;
            box-shadow: 0 2px 12px 0 #DDE3EA;
            text-align: left;
            padding: 10px 0 20px 0;
            width: 760px;
            .title{
                font-size: 16px;
                color: #344B5A;
                height: 16px;
                line-height: 16px;
                border-left: 2px solid #4C95FF;
                padding-left: 30px;
            }
            .user{
                margin-top: 30px;
                margin-left: 30px;
                padding-left: 70px;
                height: 60px;
                img{
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    float: left;
                    margin-left: -70px;
                }
                p{
                    color: #344B5A;
                    font-size: 16px;
                    padding: 0;
                    margin: 0;
                }
                span{
                    font-size: 12px;
                    i{
                        color: #4C95FF;
                        font-size: 30px;
                        font-style: normal;
                    }
                }
            }
        }
        .btn_wrap{
            position: absolute;
            right: 20px;
            bottom: 20px;
            text-align: center;
        }
        .coupon_wrap{
            margin-left: 20px;
            background: #fff;
            box-shadow: 0 2px 12px 0 #DDE3EA;
            text-align: left;
            width: 760px;
            padding-top: 10px;
            .title{
                font-size: 16px;
                color: #344B5A;
                height: 16px;
                line-height: 16px;
                border-left: 2px solid #4C95FF;
                padding-left: 30px;
            }
            .tab_wrap{
                margin-top: 20px;
                margin-bottom: 20px;
                text-align: left;
                span{
                    display: inline-block;
                    width: 100px;
                    height: 40px;
                    line-height: 40px;
                    cursor: pointer;
                    text-align: center;
                    margin-left: 20px;
                    &.active{
                        color: #4C95FF;
                        border-bottom: 2px solid #4C95FF;
                    }
                }
            }
            .coupon_list{
                margin: 10px auto;
                width: 740px;
                position: relative;
                padding-bottom: 60px;
            }
        }
    }
}
.btn{
    display: inline-block;
    cursor: pointer;
    width: 90px;
    height: 32px;
    line-height: 32px;
    border-radius: 16px;
    border: none;
    margin-left: 20px;
    outline: none;
    background: #50D0A6;
    color: #fff;
}
.yellow{
    background: #F1CE2C;
}
.modal_wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    .modal_box{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 300px;
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        >i{
            position: absolute;
            top: 20px;
            right: 20px;
            cursor: pointer;
            font-size: 20px;
        }
        .search_box{
            position: relative;
            margin: 10px auto;
            background: #F6FAFD;
            border: 1px solid #D6E7F3;
            border-radius: 20px;
            overflow: hidden;
            .search{
                width: 100%;
                height: 40px;
                line-height: 40px;
                text-indent: 20px;
                border: none;
                outline: none;
            }
            .btn{
                position: absolute;
                top: 0;
                right: 0;
                width: 100px;
                height: 40px;
                line-height: 40px;
                text-align: center;
                color: #fff;
                background: #358acd;
                border: none;
                outline: none;
                border-radius: 20px;
                cursor: pointer;
                margin: 0;
            }
        }
        .item_wrap{
            background: #D6E7F3;
            padding: 10px;
            overflow-y: auto;
            max-height: 300px;
            text-align: left;
        }
        .payment{
            display: flex;
            margin: 10px 0;
            span{
                display: block;
                margin-right: 10px;
                height: 30px;
                line-height: 30px;
            }
        }
        .account{
            width: 100px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            border: 1px solid #ddd;
            outline: none;
            border-radius: 5px;
            display: block;
        }
        .btn{
            width: 200px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            color: #fff;
            background: #358acd;
            border: none;
            outline: none;
            border-radius: 20px;
            cursor: pointer;
            margin: 0;
        }
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
@media screen and (max-width:1200px) and (min-width:600px){
    .wrap{
        .content{
            .coupon{
                width: calc(100% - 40px);
            }
            .coupon_wrap{
                width: calc(100% - 40px);
                .coupon_list{
                    width: 100%;
                }
            }
        } 
    } 
}
@media screen and (max-width:600px) {
    .wrap{
        padding-left: 30px;
        width: calc(100% - 30px);
        .content{
            .coupon{
                margin-left: 0;
                width: 100%;
                .btn_wrap{
                    top: 20px;
                    bottom: auto;
                }
            }
            .coupon_wrap{
                margin-left: 0;
                width: 100%;
                .coupon_list{
                    width: 100%;
                }
            }
        }
    }
    .hide{
        display: none;
    }
}
</style>

