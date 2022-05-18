<template>
  <div class="sidebar">
    <router-link :to="'/'+pathname" class="logo"><img :src="require('../../assets/nav/logo_side_a.svg')"></router-link>
    <p class="userName">{{userName}}</p>
    <p class="userName role">{{roleO[role]}}</p>
    <p class="stationName">{{stationName}}</p>
    <ul class="menu style1">
        <li v-show="item['show']" :class="{active:activePath.indexOf(item.path) > -1}" v-for="(item,index) in menu" :key="'menu'+index">
            <router-link :to="item.path">
                <span :class="'icon'+index+(item.isChild ? ' child' : '')">
                    {{item.name}}
                    <span class="count-dot" v-if="item.path.indexOf('bookaudit') > -1 && sumbmitNum">{{sumbmitNum}}</span>
                    <span class="count-dot" v-if="item.path.indexOf('DORlist') > -1 && noBindNum">{{noBindNum}}</span>
                    <span class="count-dot" v-if="item.path.indexOf('batchmanage') > -1 && returnNum">{{returnNum}}</span>
                </span>
            </router-link>
        </li>
    </ul>
    <img class="logout" @click="logout()" :src="require('../../assets/nav/logout.svg')" alt="退出" />
  </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "sidebar",
    components: {

    },
    data: () => {
        return {
            activePath:'/myGenealogy',
            stationName:'',
            stationKey:'',
            pathname:'',
            roleO: {
                1: '超管',
                2: '管理员',
                3: '编辑',
                4: '作者',
            },
            canSee:0,
            menu:[{name:'本站家谱',path:'/myGenealogy',show:true,isChild:false},
            {name:'交换记录',path:'/swapListModal',show:true,isChild:true},
            {name:'分发历史',path:'/perspectiveList',show:true,isChild:true},
            {name:'数据装载',path:'/batchmanage',show:true,isChild:false},
            {name:'谱目审核',path:'/bookaudit',show:true,isChild:false},
            {name:'DOR列表',path:'/dor',show:true,isChild:false},
            {name:'DOR关联',path:'/DORlist',show:true,isChild:false},
            {name: '拍机列表', path: '/takeCamera', show: true, isChild: false},
            {name:'月报',path:'/monthreport',show:true,isChild:false},
            {name:'数据字典',path:'/dataTypeDictionary',show:true,isChild:false},
            {name:'谱目字段',path:'/datamenufield',show:true,isChild:true},
            {name:'查重规则',path:'/cnkirule',show:true,isChild:true},
            {name:'数据源',path:'/datazource',show:true,isChild:true},
            {name:'数据源模板',path:'/datasourcemodal',show:true,isChild:true},
            {name:'时光家谱',path:'/qtGenealogy',show:true,isChild:false},
            {name:'购买记录',path:'/purchaseHistory',show:true,isChild:true},
            {name:'我的谱劵',path:'/coupon',show:true,isChild:true},
            {name:'关于谱库',path:'/about',show:false,isChild:false},
            {name:'友站家谱',path:'/fgenealogy',show:true,isChild:false},
            {name:'OCR识别',path:'/ocr',show:true,isChild:false},
            {name:'消息中心',path:'/message',show:true,isChild:false},
            {name:'用户管理',path:'/usermanage',show:true,isChild:false},
            {name:'组织机构',path:'/institution',show:true,isChild:false}],
        };
    },
    mounted:function(){
        let menu = [];
        this.stationName = window.localStorage.getItem('stationName') || '';
        this.stationKey = window.localStorage.getItem('stationKey') || '';
        this.pathname = window.localStorage.getItem('pathname') || '';
        this.activePath = window.location.pathname;
        this.menu.map((item)=>{item.path=('/'+this.pathname+item.path)});
        this.menu.map((item,index)=>{
        //交换记录、分发历史 -> sg站有
            if((this.stationKey != '1379194999' || (this.stationKey == '1379194999' && (this.role < 1 || this.role > 2))) && (item.path.indexOf('perspectiveList') > -1)){
                item['show'] = false;
            }
            if((this.role < 1 || this.role > 2) && item.path.indexOf('swapListModal') > -1){
                item['show'] = false;
            }
            //购买记录、我的谱劵 -> 非管理员
            if((item.path.indexOf('purchaseHistory') > -1 || item.path.indexOf('coupon')) > -1 && ((this.role >= 1 && this.role <= 4) || this.stationKey == '1379194999')){
                item['show'] = false;
            }
            // 时光站管理员可见
            if((this.stationKey != '1379194999' || (this.stationKey == '1379194999' && (this.role < 1 || this.role > 2))) && (item.path.indexOf('ocr') > -1 || item.path.indexOf('fgenealogy') > -1)){
                item['show'] = false;
            }
            // 用户管理
            if(item.path.indexOf('usermanage') > -1 && (this.role < 1 || this.role > 3)){
                item['show'] = false;
            }
            if(item.path.indexOf('qtGenealogy') > -1){
                item['show'] = false;
            }
            if(item.path.indexOf('institution') > -1 && (!this.orgId && (this.role < 1 || this.role > 2))){
                item['show'] = false;
            }
            if(item.path.indexOf('bookaudit') > -1 && (this.role < 1 || this.role > 2)){
                item['show'] = false;
            }
        });
        this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
    },
    methods:{
        getSiteSeeSG:async function(){// 时光家谱是否显示
            let data=await api.getAxios('site/seeSg?siteKey='+this.stationKey);
            if(data.status == 200){
                this.canSee = data.canSee;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            orgId: state => state.nav.orgId,
            sumbmitNum: state => state.nav.sumbmitNum,
            noBindNum: state => state.nav.noBindNum,
            returnNum: state => state.nav.returnNum,
        })
    },
};
</script>
<style scoped lang="scss">
.sidebar{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 200px;
    background: #353D51;
    color: #fff;
    text-align: center;
    z-index: 10;
    .userName{
        position: absolute;
        top:20px;
        right: 0;
        width: 80px;
        text-align: center;
        font-size: 10px;
        letter-spacing: 1px;
    }
    .role{
        top:40px;
    }
    .stationName{
        position: absolute;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
    }
    .logo{
        height: 48px;
        margin:20px 0 50px 0;
        img{
            width: 48px;
            height: 48px;
        }
    }
    .sation{
        margin-bottom: 50px;
        color: #fff;
    }
    a{
        display: block;
    }
    .menu{
        height: calc(100% - 148px);
        overflow-y: auto;
        display: block;
        text-align: left;
        li{
            position: relative;
            height: 40px;
            line-height: 40px;
            a{
                color: #9B9B9B;
                span{
                    position: relative;
                    margin-left: 40px;
                    display: inline-block;
                    padding-left: 25px;
                    background-image: url('../../assets/icon/icon0.svg');
                    background-position: 0 50%;
                    background-repeat: no-repeat;
                    background-size: 18px;
                    letter-spacing: 1px;
                    .count-dot{
                        position: absolute;
                        top: 5px;
                        left: calc(100% + 5px);
                        display: block;
                        padding: 0 5px;
                        height: 14px;
                        line-height: 14px;
                        background: #f00;
                        color: #fff;
                        font-size: 10px;
                        cursor: pointer;
                        border-radius: 5px;
                        margin-left: 0;
                    }
                    &.icon1{
                        
                    }
                    &.icon2{
                       
                    }
                    &.icon3{
                        background-image: url('../../assets/icon/icon1.svg');
                    }
                    &.icon4{
                        background-image: url('../../assets/icon/icon1.svg');
                    }
                    &.icon5{
                        background-image: url('../../assets/icon/icon2.svg');
                    }
                    &.icon6{
                        background-image: url('../../assets/icon/icon3.svg');
                    }
                    &.icon7{
                        background-image: url('../../assets/icon/icon4.svg');
                    }
                    &.icon8{
                        background-image: url('../../assets/icon/icon5.svg');
                    }
                    &.icon9{
                        background-image: url('../../assets/icon/icon6.svg');
                    }
                    &.child{
                        padding-left: 45px;
                        background-position-x: 20px;
                    }
                }
            }
            &.active{
                a{
                    color: #fff;
                    border-left: 2px solid #4C95FF;
                    background: #414455;
                }
            }
        }
    }
    .logout{
        position: absolute;
        bottom: 5px;
        left: 50%;
        transform: translateX(-50%);
        cursor: pointer;
    }
}
@media screen and (max-width:600px) {
    .sidebar{
        width: 30px;
        p{
           display: none;
        }
        .logo{
            height: 30px;
            img{
                width: 20px;
                margin-top: 2px;
            }
        }
        .menu{
            li{
                a{
                    height: 30px;
                    span{
                       padding-left: 0;
                       color: transparent;
                       height: 30px;
                       width: 30px;
                       background-position: 50% 50%;
                    }
                }
                &.active{
                    a{
                        color: #fff;
                        border-left: 2px solid #f00;
                        background: #414455;
                    }
                }
            }
        }
    } 
}
</style> 