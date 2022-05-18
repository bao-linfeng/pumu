<template>
  <div class="home">
    <div class="home_box">
      <img class="logo" src="../assets/home/logo_a.png" alt="logo" />
      <img class="Y" src="../assets/home/btn.png" alt="登录" @click="gotoLink" />
      <img class="X" src="../assets/home/btnX.png" alt="登录" @click="gotoLink" />
    </div>
  </div>
</template>

<script>
import api from "../api.js";
import ADS from "../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
  name: "home",
  components: {
    
  },
  data: () => {
      return {
          pathname:'',
          token:'',
          isIphone:false,
      };
  },
  created:function(){
    this.addPluginClickCount();
    ADS.clearCacheTime();
  },
  mounted:function(){
    let search=window.location.search,params=ADS.params(search),token=params['token'] || '';
    let pathname=window.location.pathname;
    this.token = token;
    if(window.innerWidth < 768){
      this.isIphone = true;
    }

    if(pathname == '/'){
      let origin=window.location.origin,search='genealogySearch';
      let url = 'https://baokulogin.qingtime.cn';
    }else{
      this.pathname = pathname.replace('/','').replace('/','');
      window.localStorage.setItem('pathname',this.pathname);
      token ? window.localStorage.setItem('token',token) : null;
      token ? this.get_user_info(token,this.pathname) : null;
    }
  },
  methods:{
    addPluginClickCount:async function(){
      let data=await api.patchAxios('https://kintime.qingtime.cn/sgbh/plugin/addPluginClickCount',{'url':'https://pumu.qingtime.cn'},true);
    },
    get_user_info: async function(token,domain){//小程序端根据token获取用户数据
      let pluginURL = window.location.origin,self=this,path=window.localStorage.getItem('path');
      pluginURL = 'https://pumu.qingtime.cn';
      
      let data=await api.getAxios('https://kintime.qingtime.cn/sgbh/plugin/userAndStarInfoNew?token='+token+'&domain='+domain +'&pluginURL='+encodeURIComponent(pluginURL),true);
      
      let result='';
      if(data.statusCode == 200){
        this.$message({message: '登录成功', type: 'success'});
        result = data.result;
        window.localStorage.setItem('userId',result.userInfo._key);
        window.localStorage.setItem('userName',result.userInfo.profile && (result.userInfo.profile.trueName || result.userInfo.profile.nickName));
        window.localStorage.setItem('profile',result.userInfo.profile ? JSON.stringify(result.userInfo.profile) : '');
        window.localStorage.setItem('role',result.role || 99);
        window.localStorage.setItem('stationKey',result.siteKey);
        window.localStorage.setItem('stationName',result.starInfo.name);
        window.localStorage.setItem('stationlogo',result.starInfo.logo);
        window.localStorage.setItem('starKey', result.starInfo._key);
        window.localStorage.setItem('pumutime', Date.now());
        this.userKey = result.userInfo._key;
        this.siteKey = result.siteKey;
        this.$store.dispatch("changeProperty",{'token':token,'sitekey':result.siteKey});
        this.$store.dispatch('setPropertyValue',{'property':'role','value': result.role || 99});
        this.$store.dispatch('setPropertyValue',{'property':'userId','value':result.userInfo._key});
        this.$store.dispatch('setPropertyValue',{'property':'userName','value':result.userInfo.profile && (result.userInfo.profile.trueName || result.userInfo.profile.nickName)});
        this.$store.dispatch('setPropertyValue',{'property':'stationKey','value':result.siteKey});
        this.$store.dispatch('setPropertyValue',{'property':'stationName','value':result.starInfo.name});
        this.$store.dispatch('setPropertyValue',{'property':'stationlogo','value':result.starInfo.logo});
        this.saveUser(result.role || 99,token,result.userInfo._key,result.userInfo.profile && (result.userInfo.profile.trueName || result.userInfo.profile.nickName),result.userInfo.mobile,result.siteKey,result.starInfo.name,result.starInfo.cover,result.userInfo.profile && result.userInfo.profile.avatar,domain,result.starInfo.ownerKey);
        this.$router.push({'path': ('/'+domain+'/genealogySearch')});
      }else{
        this.$message({message: data.msg, type: 'warning'});
        this.$router.push({path: '/'+domain});
      }
    },
    saveUser: async function(userRole,token,userKey,userName,mobile,siteKey,siteName,siteLogo,userAvatar,domain,rooterId){
        let data=await api.postAxios('user',{'userRole':userRole,'token':token,'userKey':userKey,'userName':userName || '','mobile':mobile,'siteKey':siteKey,'siteName':siteName,'siteLogo':siteLogo,'userAvatar':userAvatar || '','rooterId':rooterId});
        if(data.status == 200){
          
        }else{
          this.$message({message: data.msg, type: 'warning'});
        }
    },
    gotoLink(){
      let token = window.localStorage.getItem('token') || '',url=window.location.href+'/genealogySearch',siteKey = window.localStorage.getItem('stationKey') || '';
      let origin=window.location.origin,search='genealogySearch';
      let pathname=window.localStorage.getItem('pathname');
      if(token && siteKey){
        if(this.pathname){
          this.$router.push({path: '/'+this.pathname+'/genealogySearch'});
        }else{
          window.location.href = 'https://baokulogin.qingtime.cn?origin='+encodeURI(origin)+'&param='+this.pathname+'&router=genealogySearch';
        }
      }else{
        let pathname=window.localStorage.getItem('pathname'),search=window.localStorage.getItem('path');
        search ? search = search.replace(pathname+'/','') : search = 'genealogySearch';
        let url = 'https://baokulogin.qingtime.cn';
        window.location.href = url+'?origin='+encodeURI(origin)+'&param='+this.pathname+'&router='+(search == 'genealogySearch' ? 'genealogySearch' : '');
      }
    },
  },
  computed: {
    ...mapState({
        TOKEN: state => state.nav.TOKEN,
        SITEKEY: state => state.nav.SITEKEY,
    })
  },
};
</script>
<style scoped lang="scss">
.home{
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(29,38,63,1) url('../assets/home/bg.png') no-repeat 50% 50%;
  text-align: center;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items:center;
  .logo{
    margin-right: 100px;
  }
  i{
    width: 1px;
    height: 276px;
    background: #fff;
    margin: 0 150px;
    display: none;
  }
  input{
    width: 350px;
    height: 46px;
    background: #fff;
    line-height: 46px;
    background: url('../assets/home/btn.svg') no-repeat 50% 50%;
    color: #192B53;
    cursor: pointer;
    border: none;
    outline: none;
    display: none;
  }
  .Y{
    display: block;
    cursor: pointer;
  }
  .X{
    display: none;
    cursor: pointer;
  }
}
.home_box{
  display: flex;
  align-items: flex-start;
}
@media screen and (max-width:768px) {
  .home{
    background-image: url('../assets/home/bg_x.png');
    .logo{
      width: 70%;
      display: block;
      margin-bottom: 120px;
      margin-right: 0;
    }
    input{
      width: 260px;
      background-size: 100% 100%;
    }
    .Y{
      display: none;
    }
    .X{
      width: 70%;
      display: block;
    }
  }
  .home_box{
    flex-direction:column;
    align-items: center;
  }
}
</style>

