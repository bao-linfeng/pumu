<template>
  <div class="wrap">
    <Sidebar />
    <div class="content">
      <NavModal title="分发历史" />
      <div class="box">
        <PerspectiveListModal />
      </div>
    </div>
    <Loading v-show="loading" />
  </div>
</template>

<script>
import api from "../../api.js";
import NavModal from "../../components/dictionary/NavModal.vue";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import PerspectiveListModal from "../../components/myGenealogy/PerspectiveListModal.vue";
export default {
  name: "perspectiveList",
  components: {
    Sidebar,
    PerspectiveListModal,NavModal,
  },
  data: () => {
    return {
      loading:false,
      siteKey:'',
      stationName:'',
      stationlogo:'',
    };
  },
  mounted:function(){
    this.stationName = window.localStorage.getItem('stationName') || '';
    this.stationlogo = window.localStorage.getItem('stationlogo') || '';
    this.siteKey = window.localStorage.getItem('stationKey') || '';
  },
  methods:{
    picError(){
      this.stationlogo = require('../../assets/nav/avatar.svg');
    },
  },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    padding-left: 200px;
    background: #EFF1F5;
    .content{
      position: relative;
      width: 100%;
      height: calc(100% - 20px);
      font-size: 14px;
      padding-bottom: 20px;
      .box{
        width: calc(100% - 40px);
        height: calc(100% - 80px);
        padding: 0 20px;
        margin-top: 20px;
      }
    }
}
@media screen and (max-width:600px) {
  .wrap{
    padding-left: 30px;
    width: calc(100% - 30px);
    .content{
      width: 100%;
      padding: 80px 0 0 0;
      height: auto;
    }
  }
  .hide{
    display: none;
  }
}
</style>

