<template>
  <div class="wrap">
    <Sidebar />
    <div class="content">
      <NavModal title="购买记录" />
      <div class="coupon">
        <div class="title">
          <h3>购买记录</h3>
          <span>共检索出{{total}}条记录</span>
        </div>
        <table class="mytable">
          <thead>
          <tr>
              <th v-for="(item,index) in label" :key="'th'+index">
                  <span>{{item}}</span>
              </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item,index) in list" :key="'tr'+index">
              <td><span>{{item.time | getLocalTime}}</span></td>
              <td><span>{{item.user}}</span></td>
              <td><span>{{item.payContent}}</span></td>
              <td><span>{{item.amount+'元'+(item.payCoupon ? ('+'+item.payCoupon+'谱劵') : '')}}</span></td>
          </tr>
          </tbody>
        </table>
        <PageTurn v-if="pages > 1" :total="total" :pages="pages" :curPage="page" :label="'条记录'" v-on:click-page="getGenealogyListForPage" :style="{left:'20px',right:'20px',width: 'calc(100% - 40px)'}" />
      </div>
    </div>
    <Loading v-show="loading" />
  </div>
</template>

<script>
import api from "../../api.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import PageTurn from "../../components/genealogySearch/PageTurn.vue";
export default {
  name: "purchaseHistory",
  components: {
    Sidebar,
    PageTurn,NavModal,
  },
  data: () => {
    return {
      list:[],
      label:['时间','采购人','内容','金额'],
      page:1,
      total:0,
      pages:0,
      limit:10,
      loading:false,
      siteKey:'',
      stationName:'',
      stationlogo:'',
      sideShow:true,
    };
  },
  mounted:function(){
    this.stationName = window.localStorage.getItem('stationName') || '';
    this.stationlogo = window.localStorage.getItem('stationlogo') || '';
    this.siteKey = window.localStorage.getItem('stationKey') || '';
    this.getGenealogy();
  },
  methods:{
    getGenealogy:async function(type=true){//列表
      this.loading = true;
      type ? this.page=1 : null;
      let data=await api.getAxios('pay/record?siteKey='+this.siteKey+'&page='+this.page+'&limit='+this.limit);
      this.loading = false;
      if(data.status && data.result){
        let list = data.result.list;
        this.list = list;
        if(type){
          this.pages = data.result.pageNum;
          this.total = data.result.total;
        }
      }
    },
    getGenealogyListForPage(page){//分页
        this.page=page;
        this.getGenealogy(false);
    },
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
    min-height: 100%;
    padding-left: 200px;
    background: #EFF1F5;
    .content{
      position: relative;
      height: 100%;
      font-size: 14px;
    }
    .coupon{
      position: relative;
      background: #fff;
      box-shadow: 0 2px 12px 0 #DDE3EA;
      text-align: left;
      width: calc(100% - 40px);
      height: calc(100% - 80px);
      margin: 20px auto;
      padding: 10px 0 60px 0;
      .title{
          font-size: 16px;
          color: #344B5A;
          height: 16px;
          line-height: 16px;
          border-left: 2px solid #4C95FF;
          padding-left: 20px;
          display: flex;
          justify-content: space-between;
          span{
            color: #7E8E98;
            font-size: 14px;
            margin-right: 20px;
          }
      }
      .mytable{
        margin: 20px;
        width: calc(100% - 40px);
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
      .coupon{
        margin: 0;
        width: 100%;
      }
    }
  }
  .hide{
    display: none;
  }
}
</style>

