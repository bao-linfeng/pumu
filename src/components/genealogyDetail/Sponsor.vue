<template>
    <div class="wrap">
        <div class="content">
            <h3 class="title">机构赞助</h3>
            <p class="label">感谢以下机构的赞助:</p>
            <div class="company">
                <router-link v-if="!siteList.length" :to="'/payment?gid='+this.gid+'&gname='+this.gname"><img src="../../assets/icon/banner.png" alt="" /></router-link>
                <img class="avatar" :title="item.siteName" v-for="(item,index) in siteList" :key="'site'+index" :src="item.siteLogo || require('../../assets/nav/avatar.svg')" alt="" />
            </div>
            <h3 class="title">个人赞助</h3>
            <p class="label">感谢以下宗亲与朋友的赞助:</p>
            <div class="person">
                <router-link v-if="!userList.length" :to="'/payment?gid='+this.gid+'&gname='+this.gname"><img src="../../assets/icon/banner.png" alt="" /></router-link>
                <img class="avatar" :title="item.userName" v-for="(item,index) in userList" :key="'person'+index" :src="item.userAvatar || require('../../assets/nav/avatar.svg')" alt="" />
            </div>
            <h3 class="title">家谱数字化经费募集进度:{{amount}}</h3>
            <router-link :to="'/payment?gid='+this.gid+'&gname='+this.gname" class="btn">参与赞助</router-link>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "sponsor",
    props:{
        gid:{
            type:[String],
            required:true
        },
        gname:{
            type:[String]
        },
    },
    data: () => {
        return {
            amount:0,
            siteList:[],
            userList:[],
        };
    },
    mounted:function(){
        let token=window.localStorage.getItem('token') || '';
        this.token = token;
        this.getDonationDetail();
    },
    methods:{
        getDonationDetail: async function(){
            let data = await api.getAxios('donateList?catalogKey='+this.gid);
            let result = data.result;
            this.amount = result.amount || 0;
            this.siteList = result.siteList;
            this.userList = result.userList;
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
.wrap{
    width: 100%;
    min-height: 400px;
    font-size: 18px;
    box-sizing: border-box;
    background: #fff;
}
.content{
    padding: 30px;
    color: #666;
}
.title{
    font-size: 24px;
    text-align: center;
    margin-bottom: 20px;
}
.label{
    font-size: 18px;
    text-align: center;
    margin-bottom: 20px;
}
.company{
    margin-bottom: 40px;
    text-align: center;
    img{
        max-width: 100%;
    }
}
.person{
    margin-bottom: 40px;
    text-align: center;
    img{
        max-width: 100%;
    }
}
.sponsor{
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    color: #999;
    text-align: right;
    .money{
        font-size: 72px;
        text-align: left;
    }
    p{
        padding-top: 20px;
    }
    span{
        color: #3285FF;
    }
}
.process{
    width: 100%;
    height: 10px;
    background: #3285FF;
    border-radius: 5px;
    overflow: hidden;
    i{
        display: block;
        width: 200px;
        height: 10px;
        background: #67d000;
    }
}
.bar{
    display: flex;
    justify-content: space-between;
    margin: 20px 0 40px 0;
    p{
        color: #3285FF;
    }
}
.btn{
    background: #3285FF;
    color: #fff;
    width: 424px;
    height: 56px;
    line-height: 56px;
    text-align: center;
    border-radius: 5px;
    display: block;
    margin: 0 auto;
}
.avatar{
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
}
@media screen and (max-width: 768px) {
    .wrap{
        min-height: 600px;
    }
    .content{
        padding: 20px 10px;
    }
    .sponsor{
        .money{
            font-size: 30px;
        }
        p{
            padding-top: 0;
        }
    }
    .btn{
        width: 300px;
    }
}
</style>

