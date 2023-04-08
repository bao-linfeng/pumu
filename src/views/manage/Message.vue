<template>
  <div class="wrap">
    <Sidebar />
    <div class="content">
      <NavModal title="消息中心" />
      <div class="coupon">
        <div class="title">
          <h3>消息记录</h3>
          <span>共{{total}}条记录</span>
        </div>
        <div class="tab_wrap">
            <div class="tab_box">
                <span :class="{active:tabIndex == index}" v-for="(item,index) in tab" :key="'tab'+index" @click="changeTab(index)">{{item}}</span>
            </div>
            <span class="allRead" v-if="tabIndex === 0 && list && list.length" @click="messageOneKeyRead">批量标记为已读</span>
        </div>
        <table class="mytable">
            <thead>
              <tr>
                <th>
                  <span>事件</span>
                </th>
                <th>
                  <span>类型</span>
                </th>
                <th>
                  <span>时间</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item,index) in list" :key="'tr'+index" @click="handleMsg(item)">
                <td :title="item.content">
                  <span>{{item.content}}</span>
                </td>
                <td>
                  <span>{{item.logType}}</span>
                </td>
                <td>
                  <span>{{item.time | getLocalTime}}</span>
                </td>
              </tr>
            </tbody>
        </table>
        <div class="more" v-show="pages > 1 && page < pages" @click="getGenealogyListForPage">更多</div>
      </div>
    </div>
    <Loading v-show="loading" />
  </div>
</template>

<script>
import api from "../../api.js";
import NavModal from "../../components/dictionary/NavModal.vue";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
  name: "purchaseHistory",
  components: {
    Sidebar,NavModal,
  },
  data: () => {
    return {
      list:[],
      page:1,
      total:0,
      pages:0,
      limit:20,
      loading:false,
      siteKey:'',
      stationName:'',
      stationlogo:'',
      userKey:'',
      tab:['未读','已读'],
      tabIndex:0,
      sideShow:true,
    };
  },
  mounted:function(){
    this.stationName = window.localStorage.getItem('stationName') || '';
    this.stationlogo = window.localStorage.getItem('stationlogo') || '';
    this.siteKey = window.localStorage.getItem('stationKey') || '';
    this.userKey = window.localStorage.getItem('userId') || '';
    this.getMessage();
  },
  methods:{
    handleMsg(data){
      if(!data.status){
        if(data.logType == '申诉回复'){
          this.$router.push('/'+this.pathname+'/cameraImage?vid='+data.volumeKey);
        }
        if(data.logType == '申诉'){
          this.$router.push('/'+this.pathname+'/cameraImage?vid='+data.volumeKey);
        }
        if(data.logType == '提交审阅'){
          this.$router.push('/'+this.pathname+'/cameraImage?vid='+data.volumeKey);
        }
        this.messageRead(data);
      }
    },
    async messageRead(data){// 消息已读
      if(data.status === 0){// 未读消息
        const result = await api.patchAxios('message/status', {'messageId': [data._key], 'status': 1});
        if(result.status == 200){
            this.getMessage();
        }else{
            createMsg(result.msg);
        }
      }
    },
    allRead(){
        let ids = [];
        if(this.list && this.list.length){
            this.list.map((item)=>{ids.push(item._key)});
            this.patchMessage(ids);
        }
    },
    changeTab(index){
        this.tabIndex = index;
        this.getMessage();
    },
    getMessage:async function(flag=true){
        this.loading = true;
        flag ? this.page=1 : null;
        let data=await api.getAxios('message?siteKey='+this.siteKey+'&userKey='+this.userId+'&userRole='+this.role+'&status='+this.tabIndex+'&page='+this.page+'&limit='+this.limit);
        this.loading = false;
        if(data.status == 200 && data.result){
            let list = data.result.list;
            if(flag){
                this.list = list;
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }else{
                this.list = this.list.concat(list);
            }
        }
    },
    patchMessage:async function(id){
        let data=await api.patchAxios('message/status',{"messageId":id,"status":1});
        if(data.status == 200){
            this.getMessage();
        }
    },
    async messageOneKeyRead(){
        let data=await api.postAxios('v3/review/messageOneKeyRead',{"siteKey": this.stationKey, "userKey": this.userId});
        if(data.status == 200){
          this.getMessage();
        }
    },
    getGenealogyListForPage(){//分页
        this.page=this.page + 1;
        this.getMessage(false);
    },
    picError(){
      this.stationlogo = require('../../assets/nav/avatar.svg');
    },
  },
  computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            pathname: state => state.nav.pathname,
        })
    },
};
</script>
<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #fff;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #fff;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: #fff;
}
.wrap{
    position: relative;
    width: calc(100% - 200px);
    min-height: 100%;
    padding-left: 200px;
    background: #EFF1F5;
    .content{
      position: relative;
      font-size: 14px;
      padding-bottom: 20px;
    .coupon{
      position: relative;
      background: #fff;
      box-shadow: 0 2px 12px 0 #DDE3EA;
      text-align: left;
      padding: 10px 0 10px 0;
      width: calc(100% - 40px);
      margin: 20px auto 0 auto;
      .title{
          font-size: 16px;
          color: #344B5A;
          height: 16px;
          line-height: 16px;
          border-left: 2px solid #4C95FF;
          padding-left: 20px;
          display: flex;
          justify-content: space-between;
          h3{
            font-size: 16px;
          }
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
}
.tab_wrap{
    margin: 20px 0 30px 0;
    text-align: left;
    display: flex;
    justify-content: space-between;
    .tab_box{
        span{
            display: inline-block;
            width: 80px;
            height: 40px;
            line-height: 40px;
            cursor: pointer;
            text-align: center;
            margin-left: 20px;
            &.active{
                color: #4C95FF;
                border-bottom: 2px solid #4C95FF;
            }
        }
    }
    .allRead{
        display: inline-block;
        color: #4C95FF;
        cursor: pointer;
        margin-right: 20px;
        line-height: 42px;
    }
}
.message_wrap{
    display: block;
    padding: 0 20px;
    li{
        text-align: left;
        // border-bottom: 1px dashed #ddd;
        padding: 10px 0;
        &.more{
            color: #4C95FF;
            cursor: pointer;
            border-bottom: none;
            text-align: center;
        }
        &:nth-last-of-type(2){
            border-bottom: none;
        }
        &:nth-of-type(even){
            background: #F6FAFD;
        }
        .time{
            display: flex;
            justify-content: space-between;
            color: #999;
            font-size: 12px;
            margin-top: 5px;
            .isRead{
                cursor: pointer;
                color: #4C95FF;
            }
        }
    }
}
.more{
    text-align: center;
    height: 40px;
    line-height: 40px;
    color: #4C95FF;
    cursor: pointer;
}
.width60{
  width: 60%;
  span{
    display: inline-block;
    width: 600px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
@media screen and (max-width:600px) {
    .wrap{
        padding-left: 30px;
        width: calc(100% - 30px);
        .content{
            width: 100%;
            padding: 80px 0 0 0;
            .coupon{
                margin-left: 0;
                width: 100%;
            }
        }
    }
    .hide{
        display: none;
    }
    .tab_wrap{
        .tab_box{
            span{
                width: 70px;
            }
        }
    }
  .width60{
    width: 60%;
    span{
      width: 200px;
    }
  }
}
</style>

