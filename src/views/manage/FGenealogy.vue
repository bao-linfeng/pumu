<template>
  <div class="wrap">
    <Sidebar />
    <div class="content">
      <div class="nav">
        <span class="logo" @click="sideShow=!sideShow"><img :src="stationlogo" @error="picError" alt="微站图标" />{{stationName}}</span>
        <!-- <span class="logout" @click="logout()">退出</span> -->
      </div>
      <div class="search_wrap">
        <h3 class="title">家谱资源</h3>
        <div class="search_box">
          <div class="group">
            <input class="search" type="text" placeholder="姓氏" v-model.trim="surname" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="surname" @click="clear('surname')"><i class="el-icon-close"></i></div>
          </div>
          <div class="group">
            <input class="search" type="text" placeholder="谱名" v-model.trim="genealogyName" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="genealogyName" @click="clear('genealogyName')"><i class="el-icon-close"></i></div>
          </div>
          <div class="group">
            <input class="search" type="text" placeholder="谱籍地" v-model.trim="place" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="place" @click="clear('place')"><i class="el-icon-close"></i></div>
          </div>
          <div class="group">
            <input class="search" type="text" placeholder="堂号" v-model.trim="hall" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="hall" @click="clear('hall')"><i class="el-icon-close"></i></div>
          </div>
          <div class="btn btn_search" @click="getGenealogy">
            <span>搜索</span>
          </div>

          <div class="group">
            <input class="search" type="text" placeholder="修撰者" v-model.trim="author" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="author" @click="clear('author')"><i class="el-icon-close"></i></div>
          </div>
          <div class="group">
            <input class="search" type="text" placeholder="批次" v-model.trim="batch" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="batch" @click="clear('batch')"><i class="el-icon-close"></i></div>
          </div>
          <div class="group">
            <input class="search" type="text" placeholder="版本类型" v-model.trim="version" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="version" @click="clear('version')"><i class="el-icon-close"></i></div>
          </div>
          <div class="group">
            <input class="search" type="text" placeholder="修撰时间" v-model.trim="writeTime" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="writeTime" @click="clear('writeTime')"><i class="el-icon-close"></i></div>
          </div>
          <div class="btn green" @click="issiteModal=true">
            <span>站点透视</span>
          </div>
        </div>
        <SiteModal v-if="issiteModal"   v-on:close-site="issiteModal=false" v-on:save-site="persactive" />
      </div>
      <div class="table_wrap">
        <div class="title">
          <h3>检索结果</h3>
          <span>共检索出{{total}}部家谱</span>
        </div>
        <div class="table_box style1">
          <table class="mytable">
            <thead>
              <tr>
                <th v-for="(item,index) in label" :key="'th'+index">
                  <el-checkbox v-if="index === 0" :value="allCheck" @change="allCheckbox(allCheck)"></el-checkbox>
                  <span v-else>{{item}}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item,index) in list" :key="'tr'+index">
                <td>
                  <el-checkbox :value="item.select" @change="changeCheckbox(item.select,index)"></el-checkbox>
                </td>
                <td><span>{{root[item.catalogLevel]}}</span></td>
                <td><span>{{item.genealogyName}}</span></td>
                <td><span>{{item.surname}}</span></td>
                <td><span>{{item.place}}</span></td>
                <td><span>{{item.hall}}</span></td>
                <td><span>{{item.ancestor}}</span></td>
                <td><span>{{item.publish}}</span></td>
                <td><span>{{item.writeTime}}</span></td>
                <td><span>{{item.author}}</span></td>
                <td><span>{{item.volume}}</span></td>
                <td><span>{{item.siteKey == siteKey ? stationName : '时光科技'}}</span></td>
                <td><span>{{root[item.imageLevel]}}</span></td>
                <td><span>{{item.pages}}</span></td>
                <td><span>{{item.imagePages || 0}}</span></td>
                <td><span>{{item.sgImageGiven == 1 ? '是' : '-'}}</span></td>
                <td><span>{{item.batch || '-'}}</span></td>
                <td><span>{{item.createTime | getLocalTime}}</span></td>
                <td>
                  <span class="greenColor" @click="openSourcePrevModal(item._key,item.imagePages)">阅读</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageTurn v-if="pages > 1" :total="total" :pages="pages" :curPage="curPage" :label="'本家谱'" v-on:click-page="getGenealogyListForPage" :style="{left:'20px',right:'20px',width: 'calc(100% - 40px)'}" />
      </div>
    </div>
    <SourcePrevModal v-if="isSourcePrevModal" v-on:close-source="isSourcePrevModal=false" :gid="gid" :siteId="siteKey" />
    <Loading v-show="loading" />
  </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import PageTurn from "../../components/genealogySearch/PageTurn.vue";
import SiteModal from "../../components/qtGenealogy/SiteModal.vue";
import SourcePrevModal from "../../components/myGenealogy/SourcePrevModal.vue";
export default {
  name: "fGenealogy",
  components: {
    Sidebar,
    PageTurn,
    SiteModal,
    SourcePrevModal,
  },
  data: () => {
    return {
      stationName:'',
      stationlogo:'',
      userKey:'',
      surname:'',
      genealogyName:'',
      place:'',
      hall:'',
      celebrity:'',
      version:'',
      writeTime:'',
      batch:'',
      author:'',
      keyword:'',
      isImage:2,
      isHasPerson:2,
      allCheck:false,
      checkList:[],
      list:[],
      label:['','公开谱目','谱名','姓氏','谱籍地','堂号','始祖','版本年号','修撰时间','修撰者','卷数','数据来源','公开影像','书本页数','影像页数','时光影像权限','批次','创建时间','操作'],
      curPage:1,
      limit:10,
      pages:0,
      total:0,
      siteKey:'',
      root:{99:'公众',10:'粉丝',9:'订阅',5:'嘉宾',3:'编辑',2:'管理员',1:'超管'},
      loading:false,
      gid:'',
      issiteModal:false,
      isSourcePrevModal:false,
      sideShow:true,
    };
  },
  mounted:function(){
    this.userKey = window.localStorage.getItem('userId') || '';
    this.getSite();
  },
  methods:{
    clear(key){
      this[key] = '';
    },
    getGenealogy:async function(type=true){//列表
      let keyWordObj = {
        surname:this.surname,
        genealogyName:this.genealogyName,
        place:this.place,
        hall:this.hall,
        writeTime:this.writeTime,
        authors:this.author,
        batch:this.batch,
        version:this.version
      };
      this.loading = true;
      type ? this.curPage=1 : null;
      let data=await api.getAxios('catalog/back?keyWordObj='+JSON.stringify(keyWordObj)+'&siteKey='+this.siteKey+'&page='+this.curPage+'&limit='+this.limit);
      this.loading = false;
      if(data.status && data.result){
        let list = data.result.list;
        list && list.length ? list.map((item)=>{item['select']=false}) : null;
        this.list = list;
        if(type){
          this.pages = data.result.pageNum;
          this.total = data.result.total;
        }
      }
    },
    getGenealogyListForPage(page){//分页
        this.curPage=page;
        this.getGenealogy(false);
    },
    handleKeyUp(e){//enter
      if(e.keyCode == 13){
        this.getGenealogy();
      }
    },
    picError(){//图片获取报错
      this.stationlogo = require('../../assets/nav/avatar.svg');
    },
    changeCheckbox(flag,index){
      this.list[index].select = !flag;
    },
    allCheckbox(flag){//全选、全部选
      if(this.list && this.list.length){
        this.allCheck = !flag;
        if(this.allCheck){
          this.list.map((item)=>{item['select']=true});
        }else{
          this.list.map((item)=>{item['select']=false});
        }
      }
    },
    openSourcePrevModal(gid,imagePages){//打开影像预览
      if(imagePages){
        this.gid = gid;
        this.isSourcePrevModal = true;
      }else{
        this.$message({message: '该家谱暂无影像资料',type: 'warning'});
      }
    },
    getSite:async function(){//默认微站
      let data=await api.getAxios('site/friend');
      if(data && data.result){
        this.siteKey = data.result.siteKey;
        this.stationName=data.result.siteName;
        this.stationlogo=data.result.siteLogo;
        this.getGenealogy();
      }else{
        this.issiteModal = true;
      }
    },
    persactive(data){//透视
      this.issiteModal = false;
      this.siteKey = data._key;
      this.stationName=data.siteName;
      this.stationlogo=data.siteLogo || '';
      this.getSite();
    },
  },
};
</script>
<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #fff;
}
.style1::-webkit-scrollbar{
	height: 4px;
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
  text-align: left;
  background: #EFF1F5;
  .content{
    position: relative;
    width: calc(100% - 40px);
    font-size: 14px;
    padding: 80px 20px 20px 20px;
    .nav{
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
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
          border-radius: 50%;
          padding-left: 50px;
          font-size: 22px;
          img{
              height: 40px;
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
    .search_wrap{
      position: relative;
      background: #fff;
      padding:30px 20px 20px 20px;
      .title{
          position: absolute;
          top: 10px;
          left: 0;
          font-size: 16px;
          color: #344B5A;
          height: 16px;
          line-height: 16px;
          border-left: 2px solid #4C95FF;
          padding-left: 20px;
      }
      .search_box{
        position: relative;
        margin: 10px auto;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
      }
      .search{
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-indent: 10px;
        border: none;
        outline: none;
        background: #F6FAFD;
        border: 1px solid #D6E7F3;
        // border-radius: 5px;
      }
      .w35{
        width: 32%;
      }
      .btn{
        width: 19%;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #fff;
        background: #358acd;
        border: none;
        outline: none;
        border-radius: 20px;
        cursor: pointer;
        margin: 0;

      }
      .green{
        color: #fff;
        background: #50D0A6;
        span{
          background-image: url('../../assets/icon/persactive.svg');
        }
      }
      .searchIcon{
        background-image: url('../../assets/icon/search.svg');
        background-position: 68px 50%;
        background-repeat: no-repeat;
        background-size: 16px;
        text-indent: 16px;
      }
      .persactive{
        background-image: url('../../assets/icon/persactive.svg');
        background-position: 54px 50%;
        background-repeat: no-repeat;
        background-size: 16px;
        text-indent: 16px;
      }
    }
    .btn{
        width: 140px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #4C95FF;
        background: #fff;
        border: none;
        outline: none;
        border-radius: 20px;
        cursor: pointer;
        margin-right: 20px;
        span{
          display: inline-block;
          padding-left: 20px;
          background: url('../../assets/icon/search.svg') 0 50% no-repeat;
          background-size: 18px 18px;
        }
    }
    .gray{
        color: #344B5A ;
    }
    .green{
      color: #fff;
      background: #50D0A6;
    }
    .table_wrap{
      position: relative;
      background: #fff;
      padding-bottom: 60px;
      margin-top: 20px;
      .title{
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
          h3{
              color: #344B5A;
              height: 16px;
              line-height: 16px;
              border-left: 2px solid #4C95FF;
              padding-left: 20px;
          }
          span{
              color: #7E8E98;
              margin-right: 20px;
          }
      }
      .table_box{
        padding: 10px 0;
        width: calc(100% - 20px);
        height: 560px;
        margin: 0 auto;
        overflow-x: auto;
        overflow-y: hidden;
      }
    }
  }
}
.mytable{
  width: 2000px;
  color: #333;
  text-align: center;
  border-collapse:collapse;
  caption{
      height: 50px;
      line-height: 50px;
      text-align: left;
  }
  thead{
      background: #DEF1FF;
      tr{
          th{
              height: 50px;
              line-height: 50px;
          }
      }
  }
  tbody{
      tr{
          td{
              height: 50px;
              line-height: 50px;
          }
      }
      tr:nth-of-type(even){
          background: #F6FAFD;
      }
  }
}
.blue{
  color: #4C95FF;
  cursor: pointer;
}
.greenColor{
  color: #50D0A6;
  cursor: pointer;
}
.green{
    background: #50D0A6;
}
.el-radio+.el-radio {
  margin-left: 5px;
}
.el-radio {
  margin-top: 12px;
}
.toolbar{
  position: fixed;
  right: 10px;
  bottom: 50px;
  width: 50px;
  height: 110px;
  display: flex;
  flex-direction:column;
  justify-content: space-between;
  li{
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    background: #EAFDF7;
    cursor: pointer;
    background: url('../../assets/myGenealogy/icon.svg') 0 0 no-repeat;
    &:nth-of-type(2){
      background-position-y: -50px;
    }
    &:hover{
      background-position-x: -50px;
    }
  }
}
.group{
  position: relative;
  width: 19%;
  height: 42px;
  line-height: 42px;
  margin-bottom: 10px;
  .tag_close{
    position: absolute;
    top: 13px;
    right: 10px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    font-size: 12px;
    text-align: center;
    color: #fff;
    background: #4C95FF;
    cursor: pointer;
  }
}
@media screen and (max-width:1200px) and (min-width:600px){
  .wrap{
    .content{
      .search_wrap{
        padding-bottom: 40px;
        .rootSelect{
          width: 48%;
        }
        .btn{
          width: 100%;
          margin-bottom: 10px;
        }
        .btn_search{
          position: absolute;
          top: 260px;
          left: 0;
        }
      }
      .root{
        display: block;
        margin: 20px 0 0 10px;
      }
    }
  }
  .group{
    width: 48%;
  }
  .hidediv{
    display: none;
  }
}
@media screen and (max-width:600px) {
  .wrap{
    padding-left: 30px;
    width: calc(100% - 30px);
    .content{
      width: 100%;
      padding: 80px 0 0 0;
      .btn_wrap{
        .btn_wrap_left{
          display: block;
        }
        .btn_wrap_toolbar{
          margin-left: 10px;
        }
      } 
      .search_wrap{
        padding-bottom: 40px;
        .search_box{
          display: block;
          .search{
            width: 100%;
            margin-bottom: 10px;
          }
        }
        .w35{
          width:100%;
        }
        .searchIcon{
          background-size: 60% 50%;
        }
        .btn{
          width: 100%;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .btn_search{
          position: absolute;
          top: 455px;
          left: 0;
        }
        .rootSelect{
          width: 100%;
        }
      }
      .root{
        display: block;
        margin: 20px 0 0 10px;
      }
    }
  }
  .hide{
    display: none;
  }
  .group{
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>

