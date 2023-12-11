<template>
    <div class="nav-wrap">
        <span class="logo"><img :src="url" @error="picError" alt="微站图标" />{{sname}}</span>
        <!-- <span class="logout" @click="logout()">退出</span> -->
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "navmodal",
    props:{
        logo:{
            type: String
        },
        name:{
            type: String
        }
    },
    data: () => {
        return {
            url: '',
            sname: '',
        };
    },
    mounted:function(){
        this.url = this.logo || this.stationlogo || require('../../assets/nav/qingtime.png');
        this.sname = this.name || this.stationName;
    },
    methods:{
        picError(){
            this.url = require('../../assets/nav/qingtime.png');
        },
    },
    computed: {
        ...mapState({
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
        })
    },
};
</script>

<style scoped lang="scss">
.nav-wrap{
    width: calc(100% - 40px);
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
            height: 40px;
            width: 40px;
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
</style>

