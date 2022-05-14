<template>
  <div class="wrap">
    <Sidebar />
    <div class="content" @click="sideShow=!sideShow">
        <img src="../../assets/nav/logo_side.svg" alt="logo" />
        <div class="rules">
            <p v-for="(item,index) in rules" :key="'rule'+index">{{item}}</p>
        </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../../components/sidebar/Sidebar.vue";
export default {
  name: "about",
  components: {
    Sidebar,
  },
  data: () => {
    return {
      sideShow:true,
      rules:['1、客户可自行上传家谱，或委托时光代为上传客户上传的家谱，如共享给时光，且无重复，可以获得相应共享谱券','2、客户可用获得的谱券，从时光获取家谱资源'],
    };
  },
  mounted:function(){
    
  },
  methods:{
    
  },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    padding-left: 200px;
    .content{
        position: relative;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
        background: #fff url('../../assets/home/bg.png') 50% 50% no-repeat;
        font-size: 14px;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items:center;
        img{
          margin-right: 50px;
          height: 110px;
        }
        i{
          width: 1px;
          height: 200px;
          margin: 0 100px;
          background: #fff;
        }
        .rules{
          width: 360px;
          text-align: left;
          color: #fff;
          display: inline-block;
          line-height: 30px;
          p{
            margin-bottom: 10px;
          }
        }
    }
}
@media screen and (max-width:600px) {
  .wrap{
    padding-left: 30px;
    width: calc(100% - 30px);
    .content{
      padding: 100px 0 0 0;
      width: 100%;
      height: calc(100% - 100px);
      display: block;
      img{
        display: block;
        margin: 0 auto;
      }
      i{
        display: none;
      }
      .rules{
        margin: 50px auto 0 auto;
      }
    }
  }
  .hide{
    display: none;
  }
}
</style>

