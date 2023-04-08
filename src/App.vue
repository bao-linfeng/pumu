<template>
  <div id="app">
    <router-view />
    <Loading v-show="loading" />
  </div>
</template>
<script>
import api from "./api.js";
import ADS from "./ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
  name: "app",
  sockets: {
      connect:function() {
        console.log(this.$socket.id);
        this.$store.dispatch("changeSocket",{'socketId':this.$socket.id});
        this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
      },
      reconnect: function(data){
        console.log('重新连接',data);
        this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
      },
      disconnect: function(data){
        console.log('断开连接',data);
        this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
      },
      phraseINPROCESS:function(data){
        this.$store.dispatch("changeSocket",{'percentage':data});
      },
      phraseOk(data){
        console.log('完成',data);
        this.$store.dispatch("changeSocket",{'phraseOk':true,'percentage':1,'allPage':1000});
      },
      unRead:function(data){// 谱目查重 => 谱目打回
        // this.$notify({
        //   title: '提示',
        //   message: data,
        //   duration: 3000,
        //   type: 'success'
        // });
      },
      sumbmitNum:function(data){// 谱目查重 => 提交审核
        console.log('提交审核',data);
        this.$store.dispatch('setPropertyValue',{'property': 'sumbmitNum', 'value': data});
      },
      noBindNum:function(data){// 谱目查重 => 审核通过 
        console.log('审核通过',data);
        this.$store.dispatch('setPropertyValue',{'property': 'noBindNum', 'value': data});
      },
      returnNum:function(data){// 谱目查重 => 打回
        console.log('打回',data);
        this.$store.dispatch('setPropertyValue',{'property': 'returnNum', 'value': data});
      },
      process: function(data){// 谱目查重 => 上传谱目 => 进度
        this.Ptotal ? this.$store.dispatch('setPropertyValue',{'property': 'Ptotal', 'value': data.total}) : null;
        this.$store.dispatch('setPropertyValue',{'property': 'Ppage', 'value': data.page});
      },
      importProcess: function(data){// 谱目查重 => 上传谱目 => 完成
        this.Utotal ? this.$store.dispatch('setPropertyValue',{'property': 'Utotal', 'value': data.total}) : null;
        this.$store.dispatch('setPropertyValue',{'property': 'Upage', 'value': data.page});
      },
      submitReview: function(data){//拍机人员->机构审核
        // this.$notify({
        //   title: '提示',
        //   message: data.log,
        //   onClick: () => {
        //     this.$router.push('/'+this.pathname+'/cameraImage?vid='+data.volumeKey);
        //     // this.$router.push('/'+this.pathname+'/cameraDetail?key='+data.catalogKey);
        //   },
        //   duration: 3000,
        //   type: 'success'
        // });
        this.getWaitReviewNumber();
      },
      complain: function(data){// 申诉 => 微站审核员接收
        // this.$notify({
        //   title: '提示',
        //   message: data.log,
        //   onClick: () => {
        //     this.$router.push('/'+this.pathname+'/cameraImage?vid='+data.volumeKey);
        //   },
        //   duration: 3000,
        //   type: 'success'
        // });
      },
      complainReply: function(data){// 申诉回复 => 机构管理员接收
        // this.$notify({
        //   title: '提示',
        //   message: data.log,
        //   onClick: () => {
        //     this.$router.push('/'+this.pathname+'/cameraImage?vid='+data.volumeKey);
        //   },
        //   duration: 3000,
        //   type: 'success'
        // });
      },
      importOK: function(data){
        this.$store.dispatch('setPropertyValue',{'property': 'Utotal', 'value': 1});
        this.$store.dispatch('setPropertyValue',{'property': 'Upage', 'value': 0});
        this.$notify({
          title: '提示',
          message: '批量上传成功,批次号为：'+data.batch,
          duration: 3000,
          type: 'success'
        });
      },
      checkUpdateVolume: function(data){// 微站审核员-编辑卷册信息
        // this.$notify({
        //   title: '提示',
        //   message: data.log,
        //   duration: 3000,
        //   type: 'success'
        // });
      },
      cleanOK: function(data){
        this.$store.dispatch('setPropertyValue',{'property': 'cleanOk', 'value': true});
      },
      bindProcess: function(data){
        this.bindTotal ? this.$store.dispatch('setPropertyValue',{'property': 'bindTotal', 'value': data.total}) : null;
        this.$store.dispatch('setPropertyValue',{'property': 'bindPage', 'value': data.page});
      },
      bindOK: function(data){
        this.$store.dispatch('setPropertyValue',{'property': 'bindTotal', 'value': 1});
        this.$store.dispatch('setPropertyValue',{'property': 'bindPage', 'value': 0});
        if(data.errorArr && data.errorArr.length){
            let msg = '';
            data.errorArr.map((item) => {
                msg = msg + '序号：' + item.index + '，原因：' + item.reason;
            });
            this.$notify({
              title: '提示',
              message: msg,
              duration: 3000,
              type: 'success'
            });
        }else{
            this.$message({message: '谱目关联影像成功',type: 'success'});
        }
        
      }
  },
  components: {
    
  },
  data:()=>{
    return {
      screenWidth:document.body.clientWidth,
      timer:false,
    }
  },
  mounted:function(){
    
  },
  methods:{
    async getWaitReviewNumber(){//获取等待审核卷数（机构或微站）
        let result = await api.getAxios('v3/review/waitReviewNumber?siteKey='+this.stationKey+'&userKey='+this.userId);
        if(result.status == 200){
            this.$store.dispatch('setPropertyValue',{'property': 'waitReviewNumber', 'value': result.data});
        }else{
            this.$XModal.message({ message: result.msg, status: 'warning' })
        }
    },
    handleOnResize(e){
      if(!this.timer){
        this.timer=true;
        setTimeout(() => {
          window.screenWidth = document.body.clientWidth;
          this.screenWidth = window.screenWidth;
          this.timer=false;
        },400)
      }
    },
  },
  computed: {
    ...mapState({
      userName: state => state.nav.userName,
      userId: state => state.nav.userId,
      stationKey: state => state.nav.stationKey,
      role: state => state.nav.role,
      loading: state => state.nav.loading,
      Ptotal: state => state.nav.Ptotal,
      Utotal: state => state.nav.Ptotal,
      bindTotal: state => state.nav.bindTotal,
      bindPage: state => state.nav.bindPage,
      pathname: state => state.nav.pathname,
    })
  },
};
</script>

<style>
:root{
  --bg-color: #4C95FF;
}
*{
	padding:0;
	margin:0;
}
input,textarea{
  box-shadow:0px 0px 0px rgba(0,0,0,0); 
  -webkit-appearance:none;
  -webkit-tap-highlight-color:transparent;
}
html{
	height: 100%;
  font-family: '微软雅黑','Helvetica Neue','Hiragino Sans GB','WenQuanYi Micro Hei','Microsoft Yahei',sans-serif;
	font-size: 62.5%;
}
body {
	height: 100%;
	font-size: 1.4rem;
  -webkit-tap-highlight-color: transparent;
}
a{
	text-decoration: none;
}
ul{
	list-style: none;
}
table{
    width: 100%;
}
.red{
  color: #f00 !important;
}
.button{
  width: 140px;
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  background-color: #fff;
  color: #333;
  outline: none;
  border: none;
  cursor: pointer;
  text-align: center;
}
.button:hover{
  color: var(--bg-color);
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
.home-footer{
  padding: 25px 0;
  font-size: 12px;
  color: #666;
}
.mytable{
    width: 100%;
    color: #333;
    text-align: center;
    border-collapse:collapse;
}
.mytable caption{
    height: 50px;
    line-height: 50px;
    text-align: left;
}
.mytable thead{
    background: #DEF1FF;
}
.mytable thead tr th{
    height: 50px;
    line-height: 50px;
}
.mytable tbody tr td{
    height: 50px;
    line-height: 50px;
}
.mytable tbody tr:nth-of-type(even){
  background: #F6FAFD;
}
/* 提示信息 */
.msg_wrap{
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  display: block;
  background: #67c23a;
  padding: 5px 15px;
  border-radius: 3px;
  text-align: center;
  color: #333;
  min-width: 80px;
  z-index: 1000000000;
  font-size: 16px;
}
.msg_wrap_ok{
  background: #f0f9eb;
  color: #67c23a;
}
.msg_wrap_warn{
  background:#fdf6ec;
  color: #e6a23c;
}
/*  字号 */
.fontSize14{
  font-size: 14px;
}
.fontSize16{
  font-size: 16px;
}
.fontSize18{
  font-size: 18px;
}
.fontSize20{
  font-size: 20px;
}
/* 外边距 */
.marginR10{
  margin-right: 10px;
}
.marginT20{
  margin-top: 20px;
}
.drag-btn {
  cursor: move;
  width: 30px;
  height: 30px;
  margin-top: 10px;
}
/* 表格 */
.adai-table .vxe-body--row.row-green {
  background-color: #67c23a;
  color: #fff;
}
.adai-table .vxe-body--row.row-red {
  /* background-color: red; */
  color: red;
}
.adai-table .vxe-body--row.row-orange{
  color: orange;
}
.adai-table .vxe-body--row.row--current {
  color: #333;
}
.RuKuModal{
  padding: 2px 10px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  outline: none;
  background-color: #358acd;
  color: #fff;
  margin: 0 2px;
}
.RuKuModal.disabled{
  background-color: #ddd;
}
.AdaiActionButton{
  position: relative;
  padding: 2px 10px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  outline: none;
  background-color: #358acd;
  color: #fff;
  margin-right: 5px;
  z-index: 100;
}
.disabled{
  background-color: #ddd;
}
.el-steps--simple{
  padding: 10px!important;
}
.el-step.is-simple:not(:last-of-type) .el-step__title{
  max-width: 70%!important;
}
.vxe-button{
  background-color: #358acd!important;
  border: none!important;
  color: #fff!important;
}
.AdaiSwitchButton{
  position: relative;
  width: 60px;
  height: 30px;
  border-radius: 15px;
  background-color: #ddd;
  cursor: pointer;
}
.AdaiSwitchButton.active{
  background-color: #67c23a;
}
.AdaiSwitchButton span{
  position: absolute;
  top: 2px;
  left: 2px;
  width: 26px;
  height: 26px;
  border-radius: 13px;
  background-color: #fff;
  cursor: pointer;
}
.AdaiSwitchButton.active span{
  left: auto;
  right: 2px;
}
/* tab */
.AdaiTabButton{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.AdaiTabButton span{
  width: 30px;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  display: inline-block;
}
.AdaiTabButton span.active{
  color: #358acd;
}
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: transparent;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: transparent;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #888;
}
.style1::-webkit-scrollbar-corner{
	background-color: transparent;
}

/*  */
.style3::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: transparent;
}
.style3::-webkit-scrollbar{
	height: 16px;
	background-color: transparent;
}
.style3::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style3::-webkit-scrollbar-corner{
	background-color: transparent;
}

/* 表格滑条 */
/*滚动条整体部分*/
.table-scrollbar ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
/*滚动条的轨道*/
.table-scrollbar ::-webkit-scrollbar-track {
  background-color: #FFFFFF;
}
/*滚动条里面的小方块，能向上向下移动*/
.table-scrollbar ::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 5px;
  border: 1px solid #F1F1F1;
  box-shadow: inset 0 0 6px rgba(0,0,0,.3);
}
.table-scrollbar ::-webkit-scrollbar-thumb:hover {
  background-color: #A8A8A8;
}
.table-scrollbar ::-webkit-scrollbar-thumb:active {
  background-color: #787878;
}
/*边角，即两个滚动条的交汇处*/
.table-scrollbar ::-webkit-scrollbar-corner {
  background-color: #FFFFFF;
}

.process-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}
.reconnect{
    position: absolute;
    top: 20px;
    right: 20px;
}
.row-red{
    color: #f00 !important;
}
.row-blue{
    color: #358BCD;
}
.row-gray{
  color: #ddd;
}
.condition{
    position: absolute;
    top: 40px;
    left: 20px;
    font-size: 8px;
}

.changeActive .el-input__inner{
    color: #358acd;
}
.changeActive .el-textarea__inner{
  color: #358acd;
}
.el-select-dropdown__item{
  color: #000;
  /* font-weight: bold; */
}
.el-select-dropdown__item.active{
  color: #999;
  /* font-weight: normal; */
}
</style>
