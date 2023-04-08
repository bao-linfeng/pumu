<template>
<div class="nav_bg" :class="{h72:isIphone}">
  <div class="nav">
    <div class="navCenter">
        <div class="navleft">
            <router-link :to="'/'+pathname"><img src="../assets/nav/logo_nav.svg"></router-link>
            <a :href="'https://baoku.qingtime.cn/'+pathname" target="_blank">{{stationNames}}</a>
        </div>
        <div class="navRight">
            <ul class="navLink">
                <li title="谱目审核" v-if="(role >= 1 && role <= 4) || isOrg == 3">
                    <router-link :to="'/'+pathname+(role >= 1 && role <= 3 ? '/bookaudit?type=&fileName=&libListCheck=&startTime=&endTime=&stage=&page=1' : '/batchmanage?type=&fileName=&startTime=&endTime=&stage=&page=1')">谱目审核</router-link>
                </li>
                <li title="待议谱" v-if="(role >= 1 && role <= 4) || isOrg == 3">
                    <router-link :to="'/'+pathname+'/toBeDiscussedGC'">待议谱</router-link>
                </li>
                <li title="影像审核" v-if="(role >= 1 && role <= 4) || isOrg == 3"><router-link :to="'/'+pathname+'/takeCamera?i='+(role >= 1 && role <= 3 ? 14: 13)+'&hasRoot=1&genealogyName=&gcKey=&place=&singleOrTwo=&isLeadImages=&startTime=&endTime=&orgListCheck=&page=1'">影像审核</router-link></li>
                <li @click="gotoLink('/'+pathname+'/genealogySearch')"><span class="search">家谱检索</span></li>
                <li title="管理" v-if="(role >= 1 && role <= 4) || isOrg == 3"><router-link :to="'/'+pathname+'/myGenealogy'"><span class="menu">管理</span></router-link></li>
                <li @click="logout()" title="退出"><span>退出</span></li>
            </ul>
            <i class="el-icon-menu navmenu" v-if="flag" @click="toggleNav(false)"></i>
            <i class="el-icon-close navmenu" v-else @click="toggleNav(true)"></i>
            <ul class="navLink_xs" v-show="!flag">
                <li @click="gotoLink('/'+pathname)"><span>首页</span></li>
                <li @click="gotoLink('/'+pathname+'/genealogySearch')"><span>家谱检索</span></li>
                <li @click="gotoLink('/'+pathname+'/myGenealogy')" v-if="(role >= 1 && role <= 3) || isOrg == 3"><span>管理</span></li>
                <li @click="gotoLink()"><span>退出</span></li>
            </ul>
        </div>

    </div>
  </div>
</div>  
</template>

<script>
import ADS from "../ADS.js";
// 1 超管 2 管理员 3 编辑 4 作者 5 成员 20 付费订阅者 21 粉丝 0 游客
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "navLink",
    components: {
        
    },
    data: () => {
        return {
            stationNames:'',
            isShow:false,
            pathname:'',
            flag:true,
            isIphone:false,
        };
    },
    methods:{
        gotoLink(path){
            this.flag = true;
            ADS.ModalHelper.beforeClose();
            if(path){
                this.$router.push(path);
            }else{
                this.$store.dispatch("changeProperty",{'token':'','sitekey':''});
                this.logout();
            }
        },
        toggleNav(flag){
            if(flag){
                ADS.ModalHelper.beforeClose();
            }else{
                ADS.ModalHelper.afterOpen();
            }
            this.flag = flag;
        },
    },
    mounted:function(){
        this.stationNames = window.localStorage.getItem('stationName') || '';
        this.pathname = window.localStorage.getItem('pathname') || '';

        if((this.role >= 1 && this.role <= 3) || (this.isOrg == 3)){// 站长、管理员、编辑、已经加入机构
            this.isShow = true;
        }
        if(window.innerWidth < 600){
            this.$store.dispatch("changeIphoneStatus",true);
            this.isIphone = true;

        }
    },
    computed: {
        ...mapState({
            userRole: state => state.nav.userRole,
            stationName: state => state.nav.stationName,
            role: state => state.nav.role,
            isOrg: state => state.nav.isOrg,
        })
    },
    watch: {
    　　'userRole': function (newValue,oldValue) {
            if(newValue <= 4 && newValue >= 1){
                this.isShow = true;
            }
    　　},
        'role': function (newValue,oldValue) {
            if(newValue <= 4 && newValue >= 1){
                this.isShow = true;
            }
    　　},
        'stationName':function(newValue,oldValue){
            if(newValue){
                this.stationNames = newValue;
            }
        },
        'domain':function(newValue,oldValue){
            this.pathname = newValue;
        },
    },
};
</script>
<style scoped lang="scss">
.nav_bg{
    width: 100%;
    height: 180px;
    background: url('../assets/search/bg.png') 50% 50% no-repeat;
}
.nav{
    position: relative;
    padding-bottom: 188px;
    width: 100%;
    height: 52px;
    padding: 10px 0;
    color: #fff;
    font-size: 16px;
    background: rgba(21,65,128,0.6);
    // background: rgba(21,65,128,0.6) url('../assets/search/bg.png') 50% 50% no-repeat;
    .navCenter{
        width: 90%;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
.navleft{
    display: flex;
    align-items: center;
    a{
        color: #fff;
        margin-right: 10px;
        font-size: 18px;
    }
}
.navRight{
    position: relative;
    height: 52px;
    a{
        color: #fff;
    }
}
.navmenu{
    font-size: 30px;
    display: none;
}
.navLink{
    display: block;
    >li{
        float: left;
        font-size: 20px;
        height: 50px;
        line-height: 50px;
        text-align: center;
        margin-left: 20px;
        color: #fff;
        cursor: pointer;
        font-size: 14px;
        span{
            font-size: 14px;
            padding-left: 22px;
            background: url('../assets/icon/logout_white.svg') 0 50% no-repeat;
            background-size: 18px;
            display: inline-block;
            height: 20px;
            line-height: 20px;
            &.menu{
                background-image: url('../assets/icon/menu.svg');
            }
            &.search{
                background-image: url('../assets/icon/searchWhite.svg');
            }
        }
    }
}
.navmenu{
    font-size: 30px;
    display: none;
}
.navLink_xs{
    display: none;
}
@media screen and (max-width: 1400px) and (min-width: 768px){
  .nav{
    .navCenter{
        width: 90%;
    }
  }  
}
@media screen and (max-width: 768px) {
    .nav{
        .navCenter{
            width: calc(100% - 20px);
        }
    }  
    .h72{
        height: 72px;
    }
    .navmenu{
        display: block;
        margin-top: 11px;
    }
    .navLink{
        display: none;
    }
    .navmenu{
        display: block;
        margin-top: 11px;
    }
    .navLink_xs{
        position: fixed;
        top: 72px;
        right: 0;
        bottom: 0;
        left: 0;
        display: block;
        background: rgba(0,0,0,0.6);
        z-index: 10000000;
        li{
            height: 50px;
            text-align: center;
            line-height: 50px;
            background: #10356A;
            padding: 0 10px;
            span{
                display: block;
                color: #fff;
                border-bottom: 1px solid #fff;
                cursor: pointer;
                &:nth-last-of-type(1){
                    border-bottom: none;
                }
            }
        }
    }
}

</style>

