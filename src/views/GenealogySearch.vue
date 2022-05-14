<template>
  <div class="genealogySearch">
    <NavLink class="searchNav" />
    <i :class="(searchIsShow ? 'el-icon-search' : 'el-icon-close') +' searchIcon'" @click="searchIsShow=!searchIsShow"></i>
    <div class="center">
        <div class="searchWrap" :class="{hide:searchIsShow}">
            <div class="searchBox">
                <div class="group">
                    <input class="search" type="text" placeholder="请输入姓氏" v-model.trim="surname" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="surname" @click="clear('surname')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="请输入谱名" v-model.trim="genealogyName" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="genealogyName" @click="clear('genealogyName')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="请输入谱籍地" v-model.trim="place" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="place" @click="clear('place')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="请输入堂号" v-model.trim="hall" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="hall" @click="clear('hall')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="出版时间" v-model.trim="publish" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="publish" @click="clear('publish')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="作者姓名" v-model.trim="authors" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="authors" @click="clear('authors')"><i class="el-icon-close"></i></div>
                </div>
                <!-- <div class="group">
                    <input class="search" type="text" placeholder="全文检索" v-model.trim="name" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="name" @click="clear('name')"><i class="el-icon-close"></i></div>
                </div> -->
                <div class="group">
                    <el-radio-group v-model="isImage" class="marginTop10 isImage">
                        <el-radio :label="2">全部</el-radio>
                        <el-radio :label="1">有影像</el-radio>
                        <el-radio :label="0">无影像</el-radio>
                    </el-radio-group>
                </div>
                <div class="square"></div>
                <div class="square"></div>
                <!-- <div class="square"></div> -->
                <button class="marginTop10 searchbtn" @click="clickBtn">搜索</button>
            </div>
        </div>
        <div class="titleWrap">
            <div class="titleWrap_left">
                <span class="title">找到{{total}}部家谱</span>
                <ul class="titleType">
                    <li @click="type=index" :class="{active:type==index}" v-for="(item,index) in iconList" :key="'icon'+index"><i :class="item.icon"></i><span>{{item.name}}</span></li>
                </ul>
            </div>
            <div class="titleWrap_right" v-show="type < 2">
                <span @click="isFilter=!isFilter">筛选器</span>
            </div>
        </div>
        <div v-show="type <= 1" class="content">
            <div class="genealogyList">
                <GenealogyList v-if="gList && type == 0" :data="gList" :total="total" :personTotalNum="personTotalNum" />
                <GenealogyBox v-if="gList && type == 1" :data="gList" />
                <PageTurn v-if="pages > 1" :total="total" :pages="pages" :curPage="curPage" :label="'本家谱'" v-on:click-page="getGenealogyListForPage" :style="{left:'10px',right:'10px',width: 'calc(100% - 20px)'}" />
            </div>
            <div class="facet" v-if="isFilter">
                <Scroll />
                <p class="facetResult">显示搜索结果</p>
                <ul class="facetWrap">
                    <li v-for="(item,index) in groupFilter" :key="'facet'+index">
                        <p><span>{{facet[index]}}</span><i v-show="index <= 3" class="el-icon-arrow-right" @click="showMoreFacet(facetType[index])"></i></p>
                        <ul class="facetList style1" :class="{overflowY:facetTypeActive == facetType[index]}">
                            <li :class="{active:((facetType[index]+index2) == facetActive)}" @click="clickFacet(item2.hallName,index,index2)" v-for="(item2,index2) in item" :key="facet[index]+index2">{{index == 4 ? (item2.hallName == 1 ? '有' : '无') : item2.hallName}}({{item2.num}})</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
        <div v-if="type == 2" class="genealogyMap">
            <GenealogyMap :param="'surname='+surname+'&place='+place+'&hall='+hall+'&userRole='+this.userRole+'&genealogyName='+genealogyName+'&celebrity='+celebrity+'&name='+keyword+'&isCollect=1&isPersonDetail=1&isImage='+this.isImage+'&isHasPerson='+this.isHasPerson+'&siteKey='+this.siteKey" />
        </div>
    </div>
    <Footer />
    <Loading v-show="flag" />
  </div>
</template>

<script>
import NavLink from "@/views/NavLink.vue";
import Footer from "@/views/Footer.vue";
import GenealogyList from "../components/genealogySearch/GenealogyList.vue";
import GenealogyBox from "../components/genealogySearch/GenealogyBox.vue";
import GenealogyMap from "../components/genealogySearch/GenealogyMap.vue";
import PageTurn from "../components/genealogySearch/PageTurn.vue";
import api from "../api.js";
import ADS from "../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "surnameData",
    components: {
        NavLink,
        Footer,
        GenealogyList,
        GenealogyBox,
        GenealogyMap,
        PageTurn,
    },
    data: () => {
        return {
            searchIsShow:true,
            isFilter:true,
            isImage:2,
            isHasPerson:2,
            flag:false,
            hasImage:'',
            surname:'',
            genealogyName:'',
            place:'',
            hall:'',
            celebrity:'',
            publish: '',
            authors: '',
            keyword:'',
            version:'',
            owner:'',
            userKey:'',
            siteKey:'',
            isPersonDetail:2,
            facetTypeActive:'',
            name:'',
            url:'http://192.168.1.101:8529/',
            gList:'',
            total:0,
            pages:1,
            curPage:1,
            perPage:20,
            personTotalNum:0,
            groupFilter:[],
            facetActive:'',
            facet:{0:'谱籍地',1:'堂号',2:'版本类型',3:'馆藏地',4:'是否全文'},
            facetType:{0:'place',1:'hall',2:'version',3:'owner',4:'isImage'},
            type:0,
            userRole:99,
            iconList:[{'icon':'el-icon-tickets',name:'列表'},{'icon':'el-icon-menu',name:'图库'},{'icon':'el-icon-location',name:'地图'}],
        };
    },
    created:function(){
        this.surname = window.localStorage.getItem('surname') || '';
        this.genealogyName = window.localStorage.getItem('genealogyName') || '';
        this.place = window.localStorage.getItem('place') || '';
        this.hall = window.localStorage.getItem('hall') || '';
        this.name = window.localStorage.getItem('name') || '';
        this.celebrity = window.localStorage.getItem('celebrity') || '';
        this.isImage = window.localStorage.getItem('isImage') ? Number(window.localStorage.getItem('isImage')) : 2;

        ADS.clearCacheTime();
    },
    mounted:function(){
        let self=this,search=window.location.search,params=ADS.params(search),token=params['token'] || '';
        token ? window.localStorage.setItem('token',token) : null;

        if(token){
            this.get_user_info(token);
        }else{
            if(window.localStorage.getItem('stationKey') && window.localStorage.getItem('token')){
                this.userKey = window.localStorage.getItem('userId') || '';
                this.siteKey = window.localStorage.getItem('stationKey') || '';
                this.userRole = window.localStorage.getItem('role') || 0;
                this.clickBtn();
                this.getUserAndStarInfoAndRole();
            }else{
                let pathname=window.localStorage.getItem('pathname') || '';
                this.$router.push({path: '/'+pathname});
            }
        }
        if(window.innerWidth < 600){
            this.type = 1;
        }
    },
    methods:{
        clear(key){
            this[key] = '';
        },
        getUserAndStarInfoAndRole: async function(){//获取用户在微站的权限
            let token = window.localStorage.getItem('token') || '',starKey = window.localStorage.getItem('starKey') || '',role = 99;
            let data = await api.postAxios('https://kintime.qingtime.cn/sgbh/star/userAndStarInfoAndRole',{'token': token,'starKey': starKey},true);
            if(data.statusCode == 200){
                role = data.result.role || 99;
                console.log(role);
                window.localStorage.setItem('role', role);
                this.$store.dispatch('setPropertyValue',{'property':'role','value': role});
            }
        },
        get_user_info: async function(token){//小程序端根据token获取用户数据
            let pathname=window.location.pathname,lastIndex=pathname.lastIndexOf('/');
            let pluginURL='',domain='';
            pluginURL = window.location.origin;
            pluginURL = 'https://pumu.qingtime.cn';
            domain = pathname.substr(1,lastIndex-1);
            window.localStorage.setItem('pathname',domain);
            let data=await api.getAxios('https://kintime.qingtime.cn/sgbh/plugin/userAndStarInfoNew?token='+token+'&domain='+domain +'&pluginURL='+encodeURIComponent(pluginURL),true);
            let result='';
            if(data.statusCode == 200){
                result = data.result;
                window.localStorage.setItem('userId',result.userInfo._key);
                window.localStorage.setItem('userName',result.userInfo.profile && (result.userInfo.profile.trueName || result.userInfo.profile.nickName));
                window.localStorage.setItem('profile',result.userInfo.profile ? JSON.stringify(result.userInfo.profile) : '');
                window.localStorage.setItem('role',result.role);
                window.localStorage.setItem('stationKey',result.siteKey);
                window.localStorage.setItem('stationName',result.starInfo.name);
                window.localStorage.setItem('stationlogo',result.starInfo.logo);
                window.localStorage.setItem('starKey', result.starInfo._key);
                window.localStorage.setItem('pumutime', Date.now());
                this.userKey = result.userInfo._key;
                this.siteKey = result.siteKey;
                this.userRole = result.role;
                this.$store.dispatch("changeProperty",{'token':token,'sitekey':result.siteKey});
                this.$store.dispatch('setPropertyValue',{'property':'role','value': result.role || 99});
                this.$store.dispatch('setPropertyValue',{'property':'userId','value':result.userInfo._key});
                this.$store.dispatch('setPropertyValue',{'property':'userName','value':result.userInfo.profile && (result.userInfo.profile.trueName || result.userInfo.profile.nickName)});
                this.$store.dispatch('setPropertyValue',{'property':'stationKey','value':result.siteKey});
                this.$store.dispatch('setPropertyValue',{'property':'stationName','value':result.starInfo.name});
                this.$store.dispatch('setPropertyValue',{'property':'stationlogo','value':result.starInfo.logo});
                this.$store.dispatch("changeUserRole",{'stationName':result.starInfo.name,'userRole':this.userRole});
                this.$store.dispatch("saveDomain",domain);
                
                this.saveUser(result.role || 99,token,result.userInfo._key,result.userInfo.profile && (result.userInfo.profile.trueName || result.userInfo.profile.nickName),result.userInfo.mobile,result.siteKey,result.starInfo.name,result.starInfo.cover,result.userInfo.profile && result.userInfo.profile.avatar,result.starInfo.ownerKey);
                this.getGenealogy();
                this.getCatalogFilter();
            }else{
                this.$message({message: data.msg, type: 'warning'});
                let pathname=window.localStorage.getItem('pathname') || '';
                this.$router.push({path: '/'+pathname});
            }
        },
        saveUser: async function(userRole,token,userKey,userName,mobile,siteKey,siteName,siteLogo,userAvatar,rooterId){
            let data=await api.postAxios('user',{'userRole':userRole,'token':token,'userKey':userKey,'userName':userName,'mobile':mobile,'siteKey':siteKey,'siteName':siteName,'siteLogo':siteLogo,'userAvatar':userAvatar,'rooterId':rooterId});
            if(data.status == 200){
            
            }else{
            this.$message({message: data.msg, type: 'warning'});
            }
        },
        showMoreFacet(type){
            this.facetTypeActive == type ? this.facetTypeActive='' : this.facetTypeActive=type;
        },
        clickBtn(){
            window.localStorage.setItem('surname',this.surname);
            window.localStorage.setItem('genealogyName',this.genealogyName);
            window.localStorage.setItem('place',this.place);
            window.localStorage.setItem('hall',this.hall);
            window.localStorage.setItem('celebrity',this.celebrity);
            window.localStorage.setItem('name',this.name);
            window.localStorage.setItem('isImage',this.isImage);
            this.version='';
            this.owner='';
            this.facetActive='';
            this.getGenealogy();
            this.getCatalogFilter();
        },
        getGenealogy:async function(type=true){
            this.searchIsShow = true;
            this.flag = true;
            type ? this.curPage=1 : null;
            let data=await api.getAxios('catalog?surname='+this.surname+'&person='+this.name+'&genealogyName='+this.genealogyName+'&place='+this.place+'&hall='+this.hall+'&authors='+this.authors+'&publish='+this.publish+'&keyword='+this.keyword+'&hasImage='+this.isImage+'&hasPerson='+this.isHasPerson+'&version='+this.version+'&owner='+this.owner+'&siteKey='+this.siteKey+'&userRole='+this.userRole+'&page='+this.curPage+'&limit='+this.perPage);
            this.flag = false;
            if(data.status == 200){
                this.gList = data.result.list;
                if(type){
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                }
            }else{
                this.$message({message: data.msg, type: 'warning'});
            }
        },
        getGenealogyListForPage(page){
            this.curPage=page;
            this.getGenealogy(false);
        },
        handleKeyUp:function(e){
            if(e.keyCode == 13){
                this.clickBtn();
            }
        },
        clickFacet(item,index,index2){
            let self=this;
            this.facetActive=this.facetType[index]+index2;
            
            if(self.facetType[index] == 'isImage'){
                self[self.facetType[index]]=item == '无' ? 0 : item;
            }else{
                self[self.facetType[index]]=item;
            }

            this.getGenealogy();
            this.getCatalogFilter();
        },
        getCatalogFilter: async function(){
            let data=await api.getAxios('catalog/filter?place='+this.place+'&hall='+this.hall+'&surname='+this.surname+'&genealogyName='+this.genealogyName+'&celebrity='+this.celebrity+'&authors='+this.authors+'&publish='+this.publish+'&siteKey='+this.siteKey+'&keyword='+this.keyword+'&userRole='+this.userRole+'&hasImage='+this.isImage+'&hasPerson='+this.isHasPerson+'&version='+this.version+'&owner='+this.owner);
            if(data.status == 200){
                let groupFilter=[];
                data=data.result;
                groupFilter[0]=data.place;
                groupFilter[1]=data.hall;
                groupFilter[2]=data.version;
                groupFilter[3]=data.owner;
                groupFilter[4]=data.hasImage;
                this.groupFilter=groupFilter;
            }
        },
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
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: #e5e5e5;
}
.input{
    width: 250px;
    text-indent: 10px;
    height: 35px;
    border: 1px solid #ddd;
    border-radius: 3px;
    outline: none;
    margin-bottom: 20px;
}
.genealogySearch{
    position: relative;
    width: 100%;
    min-height: 100%;
    font-size: 16px;
    text-align: left;
    padding-bottom: 98px;
    background: #f2f2f2;
}
.bg{
    width: 100%;
    height: 180px;
    background: url('../assets/search/bg.png') 50% 50% no-repeat;
    p{
        width: 1400px;
        margin: 0 auto;
        font-size: 20px;
        color: #fff;
    }
}
.center{
    position: relative;
    padding-bottom: 20px;
    width: 90%;
    margin: -80px auto 0 auto;
}
.searchWrap{
    width: 100%;
    box-sizing: border-box;
    padding: 30px 30px 20px 30px;
    background: #fff url('../assets/gdetail/bgTop.png') 0 0 repeat-x;
}
.searchBox{
    width: 100%;
    padding: 10px 0 0 0;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .inputGroup{
        display: flex;
        justify-content: space-between;
    }
    p{
        padding-bottom: 20px;
    }
    .w100{
        width: 100%;
    }
    .btnWrap{
        display: flex;
        justify-content: space-between;
    }
    button{
        width: 252px;
        height: 35px;
        line-height: 35px;
        border-radius: 3px;
        background: #358acd;
        text-align: center;
        font-size: 16px;
        color: #fff;
        display: block;
        float: right;
        border:none;
        cursor: pointer;
        outline: none;
    }
}
.marginTop10{
    margin-top: 10px;
}
.square{
    width:252px;
    height:37px;
}
.titleWrap{
    margin: 30px 0;
    height: 16px;
    line-height: 16px;
    border-left: 4px solid #666;
    color: #666;
    font-size: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .titleWrap_left{
        width: 1040px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .titleWrap_right{
        width: 336px;
        text-align: right;
        span{
            cursor: pointer;
            padding-left: 20px;
            background-position: 0 50%;
            background-repeat: no-repeat;
            background-image: url('../assets/search/filter.svg');
        }
    }
    .title{
        margin-left: 10px;
    }
    .titleType{
        li{
            float: left;
            margin-left: 20px;
            cursor: pointer;
            span{
                margin-left: 5px;
            }
            &:hover{
                color: #358acd;
            }
            &.active{
                color: #358acd;
            }
        }
    }
}
.content{
    width: 100%;
    min-height: 200px;
    box-sizing: border-box;
    // padding-left: 350px;
    display: flex;
    .facet{
        position: relative;
        padding-top: 30px;
        box-sizing: border-box;
        width: 336px;
        // float: left;
        // margin-left: -350px;
        color: #666;
        font-size: 20px;
        background: #fff;
        margin-left: 20px;
        .facetResult{
            margin: 10px 20px 30px 20px;
        }
        .facetWrap{
            display: block;
            margin: 0 20px;
            p{
                font-size: 18px;
                height: 16px;
                line-height: 16px;
                border-left: 4px solid #333;
                text-indent: 10px;
                display: flex;
                justify-content: space-between;
                i{
                    color: #999;
                    cursor: pointer;
                }
            }
            .facetList{
                display: block;
                max-height: 150px;
                overflow: hidden;
                margin:10px 0 20px 0;
                font-size: 14px;
                color: #999;
                li{
                    height: 30px;
                    line-height: 30px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    cursor: pointer;
                    &:hover{
                        color: #358acd;
                    }
                    &.active{
                        color: #358acd;
                    }
                }
            }
            .overflowY{
                overflow-y: scroll;
            }
        }
    }
    .genealogyList{
        position: relative;
        padding-bottom: 60px;
        width: 100%;
        background: #fff;
    }
}
.group{
  position: relative;
  width: 250px;
  height: 38px;
  line-height: 38px;
  margin-bottom: 10px;
  input{
      width: 100%;
      height: 38px;
      border: 1px solid #ddd;
      outline: none;
      text-indent: 10px;
  }
  .tag_close{
    position: absolute;
    top: 11px;
    right: 10px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    font-size: 12px;
    text-align: center;
    color: #fff;
    background: #4C95FF;
    cursor: pointer;
  }
}
@media screen and (max-width:1400px) and (min-width:1200px){
    .center{
        width: 90%;
    }
    .bg{
        p{
            width: 90%;
        }
    }
    .titleWrap{
        
    }
    .searchBox {
        .btnWrap{
            display: block;
        }
        button{
            width: 220px;
        }
    }
    .input{
        width: 220px;
    }
    .square{
        display: none;
    }
    .group{
        width: 220px;
    }
    .el-radio+.el-radio{
        margin-left: 10px;
        //margin-right: 10px;
    }
    // .marginTop10{
    //     margin-left: 10px;
    // }
}
.searchIcon{
    display: none;
}
.isHide{
    display: none;
}
@media screen and (max-width:1199px) and (min-width:600px){
    .center{
        width: 100%;
        margin-top: -100px;
    }
    .searchWrap{
        width: calc(100% - 20px);
        padding: 20px 10px 10px 10px;
        margin: 0 auto;
    }
    .searchBox{
        position: relative;
        .inputGroup{
            display: flex;
            justify-content: space-between;
            flex-wrap:wrap;
            .input{
                width: 48%;
            }
        }
        button{
            margin: 0;
            width: 100%;
            float: left;
        }
    }
    .titleWrap{
        margin: 10px 0;
    }
    .square{
        display: none;
    }
    .group{
        width: 32%;
    }
    .input{
        width: 32%;
        height: 36px;
        line-height: 36px;
        margin-bottom: 10px;
        font-size: 18px;
    }
    .isImage{
        width: 32%;
    }
    .content{
        padding: 0 11px;
    }
    .searchbtn{
        margin: 0 auto;
        border: none;
        outline: none;
    }
    .el-radio+.el-radio {
        margin-left: 15px;
    }
}
@media screen and (max-width:600px) {
    .group{
        width: 100%;
    }
    .genealogySearch{
        padding-top: 72px;
    }
    .searchNav{
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        z-index: 100;
    }
    .center{
        width: 100%;
        margin-top: 0;
    }
    .searchIcon{
        font-size: 30px;
        color: #fff;
        cursor: pointer;
        position: fixed;
        top: 21px;
        right: 50px;
        display: block;
        z-index: 200;
    }
    .bg{
        p{
            width: 100%;
            padding-left: 10px;
        }
    }
    .titleWrap{
        .titleWrap_left{
            width:100%;
        }
        .titleWrap_right{
            display: none;
        }
    }
    .input{
        width: 32%;
        height: 36px;
        line-height: 36px;
        margin-bottom: 10px;
        font-size: 18px;
    }
    .searchWrap{
        position: fixed;
        top: 72px;
        right: 0;
        bottom: 0;
        right: 0;
        background: rgba(0,0,0,0.6);
        z-index: 100000;
        padding: 0;
    }
    .searchBox{
        // margin-top: 72px;
        padding: 10px;
        background: #fff;
        width: calc(100% - 20px);
        .inputGroup{
            // display: block;
            flex-wrap: wrap;
            width: calc(100% - 20px);
        }
        .btnWrap{
            display: block;
        }
        button{
            width: 100%;
            float: none;
            margin-top: 10px;
        }
    }
    .square{
        display: none;
        height: 15px;
    }
    .titleWrap{
        margin: 30px 10px;
        .title{
            margin-left: 5px;
        }
        .titleType{
          li{
              margin-left: 5px;
              span{
                  margin-left: 0;
              }
          }
        }
    }
    .content{
        padding: 0 11px;
        // width: calc(100% - 22px);
        .genealogyList{
            margin: 0 auto;
        }
        .facet{
            display: none;
        }
    }
    .hide{
        display: none;
    }
    // .isHide{
    //     display: block;
    //     width: 32%;
    //     height: 38px;
    // }
    .marginTop10{
        margin-top: 0;
    }
}
</style>

