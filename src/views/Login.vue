<template>
  <div class="wrap">
    <ul class="content">
        <li class="marginBottom50">
            <div class="titleWrap">
                <div class="title"><span v-for="(char,index) in ['时','光','宝','库','账','户','登','录']" :key="'char'+index">{{char}}</span></div>
            </div>
        </li>
        <li class="primary">
            <input type="text" v-model="username" @keyup="loginKeyUp" placeholder="用户名/手机/邮箱" />
        </li>
        <li class="primary marginBottom0">
            <input type="password" v-model="password" @keyup="loginKeyUp" placeholder="密码" />
        </li>
        <li class="marginBottom0 middle"><router-link to='/register'>还没有账号?立即注册</router-link><router-link to='/resetPassword'>忘记密码</router-link></li>
        <li class="primary marginBottom0" @click="login">{{msg}}</li>
    </ul>
    <i class="line"></i>
    <div class="scan">
        <div class="titleWrap">
            <div class="title"><span v-for="(char,index) in ['扫','码','登','录']" :key="'scan'+index">{{char}}</span></div>
        </div>
        <div class="QR_code"></div>
        <div class='desc'>打开<a href=''>时光宝库</a>扫描二维码</div>
    </div>
  </div>
</template>

<script>
import api from "../api.js";
import ADS from "../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "login",
    components: {
        
    },
    data: () => {
        return {
            username:'',
            password:'',
            msg:'登录',
            flag:true,
        };
    },
    mounted:function(){
        
    },
    methods:{
        login: async function(){
            let self=this;
        
            if(!this.username){this.$message({message: '账号不能为空',type: 'warning'});return false;}
            if(!this.password){this.$message({message: '密码不能为空',type: 'warning'});return false;}
            
            this.msg='登陆中...';
            if(this.flag){
                this.flag=false;
                let url = 'https://baokudata.qingtime.cn/sgbh/account?mobileArea=%2B86&mobile='+this.username+'&password='+this.password+'&app=10&deviceType=4&deviceModel=web';
                let data=await api.getAxios(url,true);
                if(data.statusCode == 200){
                    this.flag=true;
                    this.msg='登陆';
                    window.localStorage.setItem('token',data.token);
                    window.localStorage.setItem('userId',data._key);
                    window.localStorage.setItem('profile',JSON.stringify(data.profile));
                    window.localStorage.setItem('mobile',data.mobile);
                    this.$message({
                        message: '恭喜你，登录成功',
                        type: 'success'
                    });
                    self.$router.push({path: '/genealogySearch'});
                }else{
                    this.$message({message: data.msg,type: 'warning'});
                    this.flag=true;
                    this.msg='登陆';
                }
            }
        },
        loginKeyUp(e){
            if(e.keyCode == 13){
                this.login();
            }
        },
    },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: 100%;
    height: 100%;
    font-size: 14px;
    text-align: left;
    background: url('../assets/login/bg.png') 50% 50% no-repeat;
    display: flex;
    justify-content: center;
    align-items:center;
    color: #fff;
}
.content{
    display: block;
    width: 352px;
    li{
        height: 48px;
        line-height: 48px;
        text-align: center;
        color: #fff;
        margin-bottom:18px; 
        cursor: pointer;
        &.marginBottom50{
            margin-bottom: 50px;
        }
        &.primary{
            background: url('../assets/login/inputBg.png') 0 0 no-repeat;
            input::-webkit-input-placeholder {
                /* placeholder颜色  */
                color: #fff;
            }
            input{
                text-align: left;
                display: block;
                border: none;
                outline: none;
                width: 100%;
                height: 48px;
                line-height: 48px;
                text-indent: 20px;
                background: transparent;
                color: #fff;
            }
        }
        &.middle{
            display: flex;
            justify-content: space-between;
        }
        &.marginBottom0{
            margin-bottom: 0;
        }
        a{
            display: block;
            color: #fff;
            text-align: center;
        }
    }
}
.titleWrap{
    width: 100%;
    position: relative;
    padding: 10px 0;
    height: 36px;
    text-align: center;
    .title{
        margin: 0 auto;
        max-width: 230px;
        height: 36px;
        line-height: 36px;
        z-index: 10000;
        background:url('../assets/home/left.svg') 0 50% no-repeat,url('../assets/home/right.svg') 100% 50% no-repeat;
        font-family: 'FZQKBYSJW--GB1-0';
        color: #fff;
        span{
            display: inline-block;
            width: 20px;
            height: 20px;
        }
    }
}
.line{
    width: 1px;
    height: 276px;
    background: #fff;
    margin: 0 150px;
}
.scan{
    .QR_code{
        width:180px;
        height: 180px;
        background: #fff;
        margin:20px 0;
    }
    .desc{
        text-align: center;
        a{
            color: #C9A36F;
            margin: 0 5px;
        }
    }
}
</style>

