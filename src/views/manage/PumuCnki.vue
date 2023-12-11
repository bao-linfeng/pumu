<template>
  <div class="wrap">
    <Sidebar />
    <div class="content">
      <NavModal />
      <div class="pumu-cnki-wrap">
        <SearchModal :siteKey="siteKey" v-on:get-result="getResult" />
        <div class="button-wrap fontSize16 marginT20">
          <button class="marginR10" v-for="(item,index) in ['导入','自查重','表查重','库查重']" :key="'button'+index" @click="cnki(index)">{{item}}</button>
        </div>
        <TableList :list="list" :total="total"  />
      </div>
    </div>
    <!-- <LeadExcelModal v-if="isLeadExcel" v-on:close-lead-excel="closeLeadExcel" /> -->
    <Loading v-show="loading" />
  </div>
</template>

<script>
import api from "../../api.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/myGenealogy/NavModal.vue";
import SearchModal from "../../components/pumuCnki/SearchModal.vue";
import TableList from "../../components/pumuCnki/TableList.vue";
// import LeadExcelModal from "../../components/pumuCnki/LeadExcelModal.vue";
export default {
  name: "pumucnki",
  components: {
    Sidebar,NavModal,SearchModal,TableList,
  },
  data: () => {
    return {
      loading:false,
      siteKey:'',
      stationName:'',
      stationlogo:'',
      list:[],
      total:0,
      isLeadExcel:false,
    };
  },
  mounted:function(){
    this.stationName = window.localStorage.getItem('stationName') || '';
    this.stationlogo = window.localStorage.getItem('stationlogo') || '';
    this.siteKey = window.localStorage.getItem('stationKey') || '';
  },
  methods:{
    closeLeadExcel(){
      this.isLeadExcel = false;
    },
    cnki(i){
      switch(i){
        case 0:
          this.isLeadExcel = true;
          break;
        case 1:
          break;
        case 2:
          break;
        default:
          break;
      }
    },
    picError(){
      this.stationlogo = require('../../assets/nav/avatar.svg');
    },
    getResult(data){
      this.total = data.total;
      this.list = data.list;
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
  .content{
    position: relative;
    width: 100%;
    min-height: calc(100% - 20px);
    font-size: 14px;
    background: #EFF1F5;
    padding-bottom: 20px;
  }
}
.pumu-cnki-wrap{
  margin: 20px 20px 0 20px;
  width: calc(100% - 40px);
}
.button-wrap{
  text-align: left;
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

