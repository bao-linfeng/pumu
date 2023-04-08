<template>
  <div class="sidebar">
    <router-link :to="'/'+pathname" class="logo"><img :src="require('../../assets/nav/logo_side_a.svg')"></router-link>
    <p class="userName">{{userName}}</p>
    <p class="userName role">{{roleO}}</p>
    <p class="stationName">{{stationKey == '1528234980' ? (role >= 1 && role <= 3 ? 'FS' : organizationNo+'('+orgName+')') : stationName}}</p>
    <ul class="menu style1">
        <li v-show="item['show']" :class="{active:activePath.indexOf(item.path) > -1}" v-for="(item,index) in menu" :key="'menu'+index">
            <router-link :to="item.path">
                <span :class="'icon'+index+(item.isChild ? ' child' : '')">
                    {{item.name}}
                    <span class="count-dot" v-if="item.path.indexOf('takeCamera') > -1 && waitReviewNumber">{{waitReviewNumber}}</span>
                    <span class="count-dot" v-if="item.path.indexOf('bookaudit') > -1 && sumbmitNum">{{sumbmitNum}}</span>
                    <span class="count-dot" v-if="item.path.indexOf('DORlist') > -1 && noBindNum">{{noBindNum}}</span>
                    <span class="count-dot" v-if="item.path.indexOf('batchmanage') > -1 && returnNum">{{returnNum}}</span>
                    <span class="count-dot" v-if="item.path.indexOf('message') > -1 && messageNotReadNumber">{{messageNotReadNumber}}</span>
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
            roleO: '普通用户',
            canSee:0,
            menu:[],
        };
    },
    mounted:function(){
        if(this.role >= 1 && this.role <= 2){
            this.roleO = '微站管理员';
        }
        if(this.role == 3){
            this.roleO = '微站审核员';
        }
        if(this.orgAdmin == 'admin'){
            this.roleO = '机构管理员';
        }
        this.stationName = window.localStorage.getItem('stationName') || '';
        this.stationKey = window.localStorage.getItem('stationKey') || '';
        this.pathname = window.localStorage.getItem('pathname') || '';
        this.activePath = window.location.pathname;

        // 普通用户
        let menu = [
                {name:'本站家谱',path:'/myGenealogy',show:true,isChild:false},
                {name:'数据装载',path:'/batchmanage',show:true,isChild:false},
                {name: '待议谱', path: '/toBeDiscussedGC', show:true, isChild: false},
                {name:'开放谱书', path: '/dupProjectID', show: this.orgAdmin == 'admin' ? true : false, isChild: false},
                {name: '影像审核', path: '/takeCamera', show: this.orgAdmin == 'admin' ? true : false, isChild: false},
                {name: '单谱查重', path: '/singleRecheck', show: true, isChild: false},
                {name: '拍机编号', path: '/cameraDevice', show: true, isChild: false},
                {name:'组织机构',path:'/institution',show:true,isChild:false},
                {name:'机构审核',path:'/auditOrg',show: this.orgAdmin == 'admin' ? true : false,isChild:false},
                {name:'用户管理',path:'/usermanage',show:true,isChild:false},
                // {name: '一键注册', path: '/quickRegistration', show: true, isChild: false},
                {name:'消息中心',path:'/message',show:true,isChild:false},
                {name:'家谱认领记录',path:'/claimLog',show:true,isChild:false}
            ];

        if(this.role >= 1 && this.role <= 2){// 微站管理员和站长
            menu = [
                {name:'本站家谱',path:'/myGenealogy',show:true,isChild:false},
                // {name:'交换记录',path:'/swapListModal',show:true,isChild:true},
                // {name:'分发历史',path:'/perspectiveList',show:true,isChild:true},
                // {name:'数据装载',path:'/batchmanage',show:true,isChild:false},
                {name:'谱目审核',path:'/bookaudit',show:true,isChild:false},
                {name: '待议谱', path: '/toBeDiscussedGC', show:true, isChild: false},
                {name:'谱目复检', path: '/genealogyRecheck', show: true, isChild: false},
                {name:'开放谱书', path: '/dupProjectID', show: true, isChild: false},
                // {name:'DOR列表',path:'/dor',show:true,isChild:false},
                // {name:'DOR关联',path:'/DORlist',show:true,isChild:false},
                {name: '影像审核', path: '/takeCamera', show: true, isChild: false},
                {name: '单谱查重', path: '/singleRecheck', show: true, isChild: false},
                {name: '家谱列表', path: '/catalogSearch', show: true, isChild: false},
                {name: '拍机编号', path: '/cameraDevice', show: true, isChild: false},
                {name:'组织机构',path:'/institution',show:true,isChild:false},
                {name:'成员申请审核',path:'/auditOrg',show:true,isChild:false},
                {name:'用户管理',path:'/usermanage',show:true,isChild:false},
                // {name: '一键注册', path: '/quickRegistration', show: true, isChild: false},
                // {name:'月报',path:'/monthreport',show:true,isChild:false},
                {name:'数据字典',path:'/dataTypeDictionary',show:true,isChild:false},
                {name:'谱目字段',path:'/datamenufield',show:true,isChild:true},
                {name:'查重规则',path:'/cnkirule',show:true,isChild:true},
                {name:'数据源',path:'/datazource',show:true,isChild:true},
                {name:'数据源模板',path:'/datasourcemodal',show:true,isChild:true},
                // {name:'时光家谱',path:'/qtGenealogy',show:true,isChild:false},
                // {name:'购买记录',path:'/purchaseHistory',show:true,isChild:true},
                // {name:'我的谱劵',path:'/coupon',show:true,isChild:true},
                // {name:'关于谱库',path:'/about',show:false,isChild:false},
                // {name:'友站家谱',path:'/fgenealogy',show:true,isChild:false},
                // {name:'OCR识别',path:'/ocr',show:true,isChild:false},
                {name:'消息中心',path:'/message',show:true,isChild:false},
                {name:'系统日志',path:'/logManage',show:true,isChild:false},
                {name:'家谱认领记录',path:'/claimLog',show:true,isChild:false},
                {name:'回收站',path:'/recycleBin',show:true,isChild:false},
                {name: '上传报错卷册', path: '/volumeError', show: true, isChild: false},
                {name: '人员工作量统计', path: '/workloadAccount', show: true, isChild: false},
                {name: '卷册审核状态统计', path: '/volumeStatusAccount', show: true, isChild: false},
            ];
        }

        if(this.role == 3){// 微站编辑 => 审核谱目和影像
            menu = [
                {name:'本站家谱',path:'/myGenealogy',show:true,isChild:false},
                {name:'谱目审核',path:'/bookaudit',show:true,isChild:false},
                {name: '待议谱', path: '/toBeDiscussedGC', show:true, isChild: false},
                {name:'谱目复检', path: '/genealogyRecheck', show: true, isChild: false},
                {name:'开放谱书', path: '/dupProjectID', show: true, isChild: false},
                {name: '影像审核', path: '/takeCamera', show: true, isChild: false},
                {name: '单谱查重', path: '/singleRecheck', show: true, isChild: false},
                {name: '家谱列表', path: '/catalogSearch', show: true, isChild: false},
                {name: '拍机编号', path: '/cameraDevice', show: true, isChild: false},
                {name:'组织机构',path:'/institution',show:true,isChild:false},
                {name:'消息中心',path:'/message',show:true,isChild:false},
                {name:'家谱认领记录',path:'/claimLog',show:true,isChild:false},
                {name:'回收站',path:'/recycleBin',show:true,isChild:false},
                {name: '上传报错卷册', path: '/volumeError', show: true, isChild: false},
                {name: '人员工作量统计', path: '/workloadAccount', show: true, isChild: false},
                {name: '卷册审核状态统计', path: '/volumeStatusAccount', show: true, isChild: false},
            ];
        }

        this.menu = menu.map((item)=>{
            item.path = ('/'+this.pathname+item.path);
            return item;
        });

        this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});

        this.getMessageNotReadNumber();
        this.getWaitReviewNumber();
    },
    methods:{
        async getWaitReviewNumber(){//获取等待审核卷数（机构或微站）
            let result = await api.getAxios('v3/review/waitReviewNumber?siteKey='+this.stationKey+'&userKey='+this.userId);
            if(result.status == 200){
                this.$store.dispatch('setPropertyValue',{'property': 'waitReviewNumber', 'value': result.data});
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
        async getMessageNotReadNumber(){// 未读消息统计
            let result = await api.getAxios('messageNotReadNumber?siteKey='+this.stationKey+'&userKey='+this.userId);
            if(result.status == 200){
                this.$store.dispatch('setPropertyValue',{'property': 'messageNotReadNumber', 'value': result.data});
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
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
            orgAdmin: state => state.nav.orgAdmin,
            messageNotReadNumber: state => state.nav.messageNotReadNumber,
            waitReviewNumber: state => state.nav.waitReviewNumber,
            orgName: state => state.nav.orgName,
            organizationNo: state => state.nav.organizationNo,
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