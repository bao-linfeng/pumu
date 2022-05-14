<template>
  <div class="wrap">
    <Sidebar />
    <div class="content">
        <div class="nav">
            <span class="logo" @click="sideShow=!sideShow"><img src="../../assets/nav/qingtime.png" alt="时光微站" />时光家谱</span>
            <span class="logout" @click="logout()">退出</span>
        </div>
        <div class="search_wrap">
            <h3 class="title">家谱资源</h3>
            <div class="search_box">
                <div class="group">
                    <input class="search" type="text" placeholder="请输入姓氏" v-model.trim="surname" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="surname" @click="clear('surname')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="请输入谱名" v-model.trim="genealogyName" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="genealogyName" @click="clear('genealogyName')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="请输入谱籍地" v-model.trim="place" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="place" @click="clear('place')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="请输入堂号" v-model.trim="hall" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="hall" @click="clear('hall')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="请输入先祖名人" v-model.trim="celebrity" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="celebrity" @click="clear('celebrity')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="请输批次" v-model.trim="batch" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="batch" @click="clear('batch')"><i class="el-icon-close"></i></div>
                </div>

                <div class="group">
                    <input class="search" type="text" placeholder="请输版本类型" v-model.trim="version" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="version" @click="clear('version')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group">
                    <input class="search" type="text" placeholder="修撰时间" v-model.trim="writeTime" @keyup="handleKeyUp" />
                    <div class="tag_close" v-show="writeTime" @click="clear('writeTime')"><i class="el-icon-close"></i></div>
                </div>
                <div class="group"><el-checkbox v-model="noBuyCatalog">不看已购谱目家谱</el-checkbox></div>
                <div class="group"><el-checkbox v-model="noBuyImage">不看已购家谱</el-checkbox></div>
                <div class="group"><el-checkbox v-model="hasImage">有影像</el-checkbox></div>
                <div class="btn" @click="getGenealogy">
                    <span>搜索</span>
                </div>
            </div>
        </div>
        <div class="btn_wrap">
            <input class="btn gray buyGenealogy" type="button" value="购买家谱" @click="openPaymentModal" />
        </div>
        <div class="table_wrap">
            <div class="title">
                <h3>检索结果</h3>
                <div>
                    <el-checkbox :value="allSitePerspective" @change="allSitePerspectiveCheck(allSitePerspective)" class="marginRight10">选择全部检索结果</el-checkbox>
                    <span>共检索出<i>{{total}}</i>部家谱</span>
                </div>
            </div>
            <div class="table_box style1">
                <table class="mytable">
                    <thead>
                        <tr>
                            <th v-for="(item,index) in label" :key="'th'+index">
                                <el-checkbox class="marginLeft10" v-if="index === 0" :value="allCheck" @change="allCheckbox(allCheck)"></el-checkbox>
                                <span v-else>{{item}}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item,index) in list" :key="'tr'+index">
                            <td>
                                <el-checkbox class="marginLeft10" :value="item['select']" @change="changeCheckbox(item.select,index)"></el-checkbox>
                            </td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.genealogyName}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.surname}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.place}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.hall}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.ancestor}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.publish}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.writeTime}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.author}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.volume}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.imageVolumes}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.createTime | getLocalTime}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.pages}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)"><span>{{item.imagePages || 0}}</span></td>
                            <td @click="openPrevModal(item._key,item.imagePages)">{{item.buyCatalog ? '是' : '否'}}</td>
                            <td @click="openPrevModal(item._key,item.imagePages)">{{item.buyImage ? '是' : '否'}}</td>
                            <td @click="openPrevModal(item._key,item.imagePages)">{{item.genealogyName}}后裔</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <PageTurn v-if="pages > 1" :total="total" :pages="pages" :curPage="page" :label="'本家谱'" v-on:click-page="getGenealogyListForPage" :style="{left:'20px',right:'20px',width: 'calc(100% - 40px)'}" />
        </div>
    </div>
    <PaymentModal v-if="ispaymentModal" :data="allSitePerspective ? alllist : list"  v-on:close-source="ispaymentModal=false" />
    <PrevModal v-if="isprevModal" :gid="gid"  v-on:close-source="isprevModal=false" />
    <Loading v-show="loading" />
  </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import PageTurn from "../../components/genealogySearch/PageTurn.vue";
import PaymentModal from "../../components/qtGenealogy/PaymentModal.vue";
import PrevModal from "../../components/qtGenealogy/PrevModal.vue";
export default {
  name: "qtGenealogy",
  components: {
    Sidebar,
    PageTurn,
    PaymentModal,
    PrevModal,
  },
  data: () => {
    return {
        surname:'',
        genealogyName:'',
        place:'',
        hall:'',
        celebrity:'',
        batch:'',
        version:'',
        writeTime:'',
        isImage:2,
        loading:false,
        userKey:'',
        siteKey:'',
        keyword:'',
        noBuyImage:false,
        noBuyCatalog:false,
        hasImage:false,
        page:1,
        limit:10,
        pages:1,
        total:0,
        allCheck:false,
        list:[],
        label:['','谱名','姓氏','谱籍地','堂号','始祖','版本年号','修撰时间','修撰者','书本卷数','影像卷数','上传日期','书本页数','影像页数','已购谱目','已购影像','微站'],
        ispaymentModal:false,
        isprevModal:false,
        gid:'',
        allSitePerspective:false,
        alllist:[],
        sideShow:true,
    };
  },
  mounted:function(){
    this.userKey = window.localStorage.getItem('userId') || '';
    this.siteKey = window.localStorage.getItem('stationKey') || '';
    this.getGenealogy();
  },
  methods:{
    allSitePerspectiveCheck(flag){
        this.allSitePerspective = !flag;
        if(this.allSitePerspective){
            this.getGenealogyAll();
        }
    },
    getGenealogyAll:async function(){//全部
      this.loading = true;
      let noBuyCatalog = this.noBuyCatalog,noBuyImage=this.noBuyImage,hasImage=this.hasImage;
      noBuyCatalog = noBuyCatalog ? 1 : 0;
      noBuyImage = noBuyImage ? 1 : 0;
      hasImage = hasImage ? 1 : 2;
      let data=await api.getAxios('catalog/buyAll?surname='+this.surname+'&genealogyName='+this.genealogyName+'&place='+this.place+'&hall='+this.hall+'&celebrity='+this.celebrity+'&batch='+this.batch+'&version='+this.version+'&writeTime='+this.writeTime+'&noBuyCatalog='+noBuyCatalog+'&noBuyImage='+noBuyImage+'&hasImage='+hasImage);
      this.loading = false;
      if(data.status == 200 && data.result){
        let list = data.result;
        list && list.length ? list.map((item)=>{item['select']=true}) : null;
        this.alllist = list;
      }
    },
    clear(key){
      this[key] = '';
    },
    changeCheckbox(flag,index){
        this.list[index].select = !flag;
    },
    allCheckbox(flag){
        if(this.list && this.list.length){
            this.allCheck = !flag;
            if(this.allCheck){
                this.list.map((item)=>{item['select']=true});
            }else{
                this.list.map((item)=>{item['select']=false});
            }
        }
    },
    handleKeyUp(e){
        if(e.keyCode == 13){
            this.getGenealogy();
        }
    },
    getGenealogy:async function(type=true){//列表
      let noBuyCatalog = this.noBuyCatalog,noBuyImage=this.noBuyImage,hasImage=this.hasImage;
      noBuyCatalog = noBuyCatalog ? 1 : 0;
      noBuyImage = noBuyImage ? 1 : 0;
      hasImage = hasImage ? 1 : 2;
      this.loading = true;
      type ? this.page=1 : null;
      let data=await api.getAxios('catalog/sg?surname='+this.surname+'&genealogyName='+this.genealogyName+'&place='+this.place+'&hall='+this.hall+'&celebrity='+this.celebrity+'&batch='+this.batch+'&version='+this.version+'&writeTime='+this.writeTime+'&noBuyCatalog='+noBuyCatalog+'&noBuyImage='+noBuyImage+'&hasImage='+hasImage+'&siteKey='+this.siteKey+'&page='+this.page+'&limit='+this.limit);
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
        this.page=page;
        this.getGenealogy(false);
    },
    openPaymentModal(){
        let checkList = [],list=this.list;
        this.allSitePerspective ? list = this.alllist : null;
        if(list && list.length){
            list.map((item)=>{
                if(item.select){
                    checkList.push(item._key);
                }
            })
        }
        
        if(checkList && checkList.length){
            this.ispaymentModal = true;
        }else{
            this.$message({message: '请勾选家谱',type: 'warning'});
        }
        
    },
    openPrevModal(gid,imagePages){
        if(imagePages){
            this.gid = gid;
            this.isprevModal = true;
        }else{
            this.$message({message: '该家谱暂无影像资料',type: 'warning'});
        }
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
                padding-left: 85px;
                font-size: 22px;
                img{
                    height: 40px;
                    float: left;
                    margin-left: -85px;
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
                flex-wrap:wrap;
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
            .rootSelect{
                width: calc(15% + 2px);
            }
            .w35{
                width: 32%;
            }
            .btn{
                width: 15%;
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
            .searchIcon{
                background-image: url('../../assets/icon/search.svg');
                background-position: 48px 50%;
                background-repeat: no-repeat;
                background-size: 16px;
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
        .btn_wrap{
            text-align: left;
            padding: 20px 0;
        }
        .checkRepeat{
            background:#fff url('../../assets/icon/checkRepeatActive.svg') 48px 50% no-repeat;
            background-size: 16px;
            text-indent: 20px;
        }
        .buyGenealogy{
            background:#fff url('../../assets/icon/buy.svg') 20px 50% no-repeat;
            background-size: 16px;
            text-indent: 20px;
        }
        .table_wrap{
            position: relative;
            background: #fff;
            padding-bottom: 60px;
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
                    letter-spacing: 1px;
                    i{
                        font-style: normal;
                        letter-spacing: 0px;
                        margin: 0 5px;
                    }
                }
            }
            .table_box{
                padding: 0 0 20px 0;
                width: calc(100% - 40px);
                height: 560px;
                margin: 0 auto;
                overflow-x: auto;
                overflow-y: hidden;
            }
        }
    }
}
.mytable{
    width: 1800px;
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
.group{
  position: relative;
  width: 15%;
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
.marginRight10{
    margin-right: 10px;
}
.marginLeft10{
    margin-left: 10px;
}
.lineHeight{
    height: 20px;
    background: #EFF1F5;
}
@media screen and (max-width:1200px) and (min-width:600px){
  .wrap{
    .content{
      .search_wrap{
        .rootSelect{
          width: 48%;
        }
        .btn{
          width: 100%;
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

