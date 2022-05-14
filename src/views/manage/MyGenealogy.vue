<template>
  <div class="wrap">
    <Sidebar />
    <div class="content">
      <div class="nav">
        <span class="logo"><img :src="stationlogo" @error="picError" alt="微站图标" />{{stationName}}</span>
        <span class="logout" @click="logout()">退出</span>
      </div>
      <div class="search_wrap" v-show="isUnique==1">
        <h3 class="title">家谱检索</h3>
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
            <input class="search" type="text" placeholder="请输入字辈" v-model.trim="poem" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="poem" @click="clear('poem')"><i class="el-icon-close"></i></div>
          </div>
          <el-select v-model="batch" placeholder="请选择批次" class="rootSelect marginbottom10">
            <el-option
                v-for="(item,index) in batchArr"
                :key="index"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <div class="group">
            <input class="search" type="text" placeholder="请输版本类型" v-model.trim="version" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="version" @click="clear('version')"><i class="el-icon-close"></i></div>
          </div>
          <div class="group">
            <input class="search" type="text" placeholder="修撰时间" v-model.trim="writeTime" @keyup="handleKeyUp" />
            <div class="tag_close" v-show="writeTime" @click="clear('writeTime')"><i class="el-icon-close"></i></div>
          </div>
          <el-select v-model="isImage" placeholder="请选择" class="rootSelect marginbottom10">
            <el-option
                v-for="item in [{'label':'影像资料','value':2},{'label':'有影像','value':1},{'label':'无影像','value':0}]"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <el-select v-model="source" placeholder="请选择机构" class="rootSelect marginbottom10">
            <el-option
                v-for="item in sourcelist"
                :key="item"
                :label="item"
                :value="item">
            </el-option>
          </el-select>
          <el-select v-model="hasCheck" placeholder="请选择对比数据" class="rootSelect marginbottom10">
            <el-option
                v-for="item in [{'label':'全部数据','value':''},{'label':'已查重过的数据','value':1}]"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <el-select v-model="creator" placeholder="请选择创建者" class="rootSelect marginbottom10">
            <el-option
                v-for="item in userList"
                :key="item._key"
                :label="item.userName"
                :value="item._key">
            </el-option>
          </el-select>
          <div class="group hidediv"></div>
          <div class="btn" @click="getGenealogy">
            <span>搜索</span>
          </div>
        </div>
      </div>
      <div class="btn_wrap">
        <div class="btn_wrap_left">
          <input class="btn root" type="button" value="分级公开" @click="openRootModal" />
          <input v-if="siteKey == '1379194999'" class="btn swap" type="button" value="家谱分发" @click="handleClickToolbar(1)" />
          <input v-else class="btn swap" type="button" value="交换家谱" @click="openSwapModal" />
        </div>
      </div>
      <div class="table_wrap">
        <div class="title">
          <h3>检索结果</h3>
          <div>
            <span>共检索出<i>{{total}}</i>部家谱</span>
          </div>
        </div>
        <div class="table_box style1">
          <table class="mytable">
            <thead>
              <tr>
                <th v-for="(item,index) in label" :key="'th'+index">
                  <el-checkbox class="marginLeft10" v-if="index === 0" :value="allCheck" @change="allCheckbox(allCheck)"></el-checkbox>
                  <span v-else @click="filterGenealogy(index)" class="el_span_adai">{{item}}<img class="el_icon_adai" v-show="prop == filterObj[index]" :src="require('../../assets/myGenealogy/el_icon_'+(order == 'asc' ? 'bottom' : 'top')+'.svg')" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item,index) in list" :key="'tr'+index">
                <td>
                  <el-checkbox class="marginLeft10" :value="item.select" @change="changeCheckbox(item.select,index)"></el-checkbox>
                </td>
                <td><span>{{item._key}}</span></td>
                <td><span>{{root[item.catalogLevel]}}</span></td>
                <td class="width200"><span>{{item.genealogyName}}</span></td>
                <td><span>{{item.surname}}</span></td>
                <td><span>{{item.place}}</span></td>
                <td><span>{{item.hall}}</span></td>
                <td class="width200"><span>{{item.ancestor}}</span></td>
                <td class="width200"><span>{{item.publish}}</span></td>
                <td><span>{{item.writeTime}}</span></td>
                <td class="width200"><span>{{item.author}}</span></td>
                <td><span>{{item.volume}}</span></td>
                <td><span>{{item.siteKey == siteKey ? stationName : '时光科技'}}</span></td>
                <td><span>{{root[item.imageLevel]}}</span></td>
                <td><span>{{item.pages}}</span></td>
                <td><span>{{item.imagePages || 0}}</span></td>
                <td><span>{{item.sgImageGiven == 1 ? '是' : '-'}}</span></td>
                <td><span>{{item.batch || '-'}}</span></td>
                <td>{{item.creator || '-'}}</td>
                <td><span>{{item.createTime | getLocalTime}}</span></td>
                <td>
                  <span v-if="item.resource < 3" class="blue" @click="editGenealogy(item,index)">修改谱目</span>
                  <i v-if="item.resource < 3">|</i>
                  <span v-if="item.resource == 1" class="greenColor" @click="openSourceModal(item._key,item.volume)">编辑影像</span>
                  <i v-if="item.resource == 1">|</i>
                  <span class="greenColor" @click="deleteAction(item._key,item.siteKey == siteKey)">{{item.siteKey == siteKey ? '删除' : '退出共享'}}</span>
                  <i v-if="item.resource == 1 || item.sgImageGiven">|</i>
                  <span class="greenColor" @click="openSourcePrevModal(item._key)" v-if="item.resource == 1 || item.sgImageGiven">阅读</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageTurn v-if="pages > 1" :total="total" :pages="pages" :curPage="curPage" :label="'本家谱'" v-on:click-page="getGenealogyListForPage" :style="{left:'20px',right:'20px',width: 'calc(100% - 40px)'}" />
      </div>
    </div>
    <RootModal v-if="isRootShow" :data="checkList" :result="list" :siteKey="siteKey" v-on:close-root="isRootShow=false" v-on:save-root="saveRoot" />
    <SwapModal v-if="isSwapModal" :data="allSitePerspective ? alllist : list" v-on:close-site="isSwapModal=false" v-on:save-site="isSwapModal=false" />
    <SitePerspectiveModal v-if="isSitePerspective" :data="allSitePerspective ? alllist : list" v-on:close-site="isSitePerspective=false" v-on:save-site="saveSitePerspective" />
    <Loading v-show="loading" />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import RootModal from "../../components/myGenealogy/RootModal.vue";
import SwapModal from "../../components/myGenealogy/SwapModal.vue";
import SitePerspectiveModal from "../../components/myGenealogy/SitePerspectiveModal.vue";
import PageTurn from "../../components/genealogySearch/PageTurn.vue";
export default {
  name: "myGenealogy",
  components: {
    Sidebar,
    RootModal,
    SitePerspectiveModal,
    PageTurn,
    SwapModal,
  },
  data: () => {
    return {
      creator:'',
      stationName:'',
      stationlogo:'',
      userKey:'',
      surname:'',
      genealogyName:'',
      place:'',
      hall:'',
      celebrity:'',
      poem:'',
      keyword:'',
      batch:'',
      version:'',
      writeTime:'',
      author:'',
      isImage:2,
      isHasPerson:2,
      allCheck:false,
      checkList:[],
      list:[],
      label:['','家谱编号','公开谱目','谱名','姓氏','谱籍地','堂号','始祖','版本年号','修撰时间','修撰者','卷数','数据来源','公开影像','书本页数','影像页数','时光影像权限','批次','创建者','创建时间','操作'],
      isRootShow:false,
      isLeadShow:false,
      isGenealogyShow:false,
      isSitePerspective:false,
      isPerspectiveList:false,
      isSourceModal:false,
      isSourcePrevModal:false,
      isImportModal:false,
      isSwapModal:false,
      isSwapListModal:false,
      curPage:1,
      limit:100,
      pages:0,
      total:0,
      siteKey:'',
      root:{0:'游客',21:'粉丝',20:'付费订阅者',5:'成员',4:'作者',3:'编辑',2:'管理员',1:'超管'},
      loading:false,
      isEdit:-1,
      toolbar:['交换记录','家谱分发','分发历史'],
      toolbarIndex:0,
      gid:'',
      allSitePerspective:false,
      alllist:[],
      swapKey:'',
      isUnique:1,
      source:'全部机构',
      sourcelist:'',
      hasCheck:'',
      catalogArr:[],
      checkDuplication:[],
      checkDuplicationCount:0,
      userList:[],
      destArr:[],
      originFilter:'',
      destFilter:'',
      prop:'',
      order:'',
      gvolume:10,
      batchArr:[],
      filterObj:{0:'',1:'_key',2:'imagePages',3:'genealogyName',4:'surname',5:'place',6:'hall',7:'celebrity',8:'version',9:'writeTime',10:'author',11:'volume',12:'a',13:'a',14:'pages',15:'imagePages',16:'a',17:'batch',18:'creator',19:'createTime',20:'a'},
      unique_surname:true,unique_name:true,unique_place:true,unique_hall:true,unique_shizu:'',unique_version:'',unique_author:'',unique_time:'',unique_volume:'',unique_page:'',
    };
  },
  created:function(){
    this.getBatchList();
  },
  mounted:function(){
    this.stationName = window.localStorage.getItem('stationName') || '';
    this.stationlogo = window.localStorage.getItem('stationlogo') || '';
    this.userKey = window.localStorage.getItem('userId') || '';
    this.siteKey = window.localStorage.getItem('stationKey') || '';
    this.getGenealogy();
    this.getSource();
    this.getUserList();
  },
  methods:{
    getBatchList:async function(){// 批次号列表
        let data=await api.getAxios('batch/simple?siteKey=');
        if(data.status == 200){
            let batchArr = [{'label':'全部','value':''}];
            data.data.map((item)=>{batchArr.push({'label':item,'value':item})});
            this.batchArr = batchArr;
        }else{
            this.$XModal.message({ message: data.msg, status: 'warning' })
        }
    },
    exportReport(){
      
    },
    filterGenealogy(index){
      if(index == 3 || index == 4 || index == 8){
        this.prop = this.filterObj[index];
        this.order = this.order == 'asc' ? 'desc' : 'asc';
        this.getGenealogy();
      }
    },
    goBackMyGenealogy(){
      this.isUnique=1;
      this.originFilter='';
      this.destFilter = '';
    },
    getUserList:async function(flag=true){
        let data=await api.getAxios('user?userName='+this.creator+'&page=1&limit=1000');
        if(data.status && data.result){
            let userList = data.result.list;
            this.userList = [{'_key':'','userName':'全部创建者'}].concat(userList);
        }
    },
    setRepeat:async function(item,isRepeat){
      if(item.isRepeat === isRepeat){
        
      }else{
        let data=await api.patchAxios('catalog/setRepeat',{'catalogKey':item._key,'isRepeat':isRepeat});
        if(data.status == 200){
          this.getCheckDuplication();
        }else{
          this.$message({message: '标记出错，请重新标记',type: 'warning'});
        }
      }
    },
    getSource:async function(){
      let data=await api.getAxios('catalog/source');
      if(data.status == 200 && data.data){
        this.sourcelist = ['全部机构'].concat(data.data);
      }
    },
    readView(item){
      if(item.hasImage){
        this.$router.push('/'+window.localStorage.getItem('pathname')+'/view?gid='+item._key+'&volume=1&page=1');
      }
    },
    getCheckDuplication:async function(){//家谱查重列表
      let checkList=[],checkAllList=[];
      this.list.map((item)=>{
        if(item.select){
          checkList.push(item._key);
        }
      });
      if(this.alllist.length){
        this.alllist.map((item)=>{
          checkAllList.push(item._key);
        });
      }
      
      if(checkList.length){
        this.destArr = checkList;
        this.isUnique = 3;
      }else if(checkAllList.length){
        this.destArr = checkAllList;
        this.isUnique = 3;
      }else{
        this.$message({message: '请勾选家谱',type: 'warning'});
      }

      let checkDuplicationCount = 0,checkDuplication=[];
      this.loading = true;
      let data=await api.postAxios('catalog/checkDuplication',{originFilter:this.originFilter,destFilter:this.destFilter,source:(this.source == '全部机构' ? '' : this.source),hasCheck:this.hasCheck,surname:this.unique_surname,genealogyName:this.unique_name,place:this.unique_place,hall:this.unique_hall,ancestor:this.unique_shizu,publish:this.unique_version,author:this.unique_author,writeTime:this.unique_time,volume:this.unique_volume,pages:this.unique_page,catalogArr:(this.originFilter ? '' : this.catalogArr),destArr:(this.destFilter ? '' : this.destArr)});
      this.loading = false;
      if(data.status == 200 && data.data){
        data.data.map((item)=>{
          checkDuplicationCount = checkDuplicationCount + item.similar.length;
          if(item.similar.length){
            checkDuplication.push(item);
          }
        });
        this.checkDuplicationCount = checkDuplicationCount;
        this.checkDuplication = checkDuplication;
      }
    },
    getSwap(key){
      this.swapKey = key;
      this.getSwapGenealogy();
    },
    getSwapGenealogy:async function(type=true){//交换家谱列表
      this.alllist = [];
      this.allSitePerspective = false;
      this.allCheck = false;
      this.loading = true;
      type ? this.curPage=1 : null;
      let data=await api.getAxios('exchangeDetail?exchangeId='+this.swapKey+'&siteKey='+this.siteKey+'&page='+this.curPage+'&limit='+this.limit);
      this.loading = false;
      if(data.status == 200 && data.result){
        let list = data.result.list;
        list && list.length ? list.map((item)=>{item['select']=false;item['resource']=1;}) : null;
        this.list = list;
        if(type){
          this.pages = data.result.pageNum;
          this.total = data.result.total;
        }
      }
    },
    openSwapListModal(){
      this.isSwapListModal = true;
    },
    clear(key){
      this[key] = '';
    },
    getGenealogy:async function(type=true){//列表
      if(this.isUnique==3){this.isUnique=2;this.destFilter = '';}
      this.alllist = [];
      this.allSitePerspective = false;
      this.allCheck = false;
      this.loading = true;
      type ? this.curPage=1 : null;
      let data=await api.getAxios('catalog/back?surname='+this.surname+'&genealogyName='+this.genealogyName+'&prop='+this.prop+'&order='+this.order+'&place='+this.place+'&hall='+this.hall+'&celebrity='+this.celebrity+'&generationName='+this.poem+'&batch='+this.batch+'&version='+this.version+'&writeTime='+this.writeTime+'&author='+this.author+'&hasImage='+this.isImage+'&hasPerson='+this.isHasPerson+'&siteKey='+this.siteKey+'&page='+this.curPage+'&limit='+this.limit+'&source='+(this.source == '全部机构' ? '' : this.source)+'&hasCheck='+this.hasCheck+'&creator='+this.creator);
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
    getGenealogyAll:async function(){//全部
      this.loading = true
      let url='catalog/sgAll?surname='+this.surname+'&genealogyName='+this.genealogyName+'&place='+this.place+'&hall='+this.hall+'&celebrity='+this.celebrity+'&generationName='+this.poem+'&batch='+this.batch+'&version='+this.version+'&writeTime='+this.writeTime+'&author='+this.author+'&hasImage='+this.isImage+'&siteKey='+this.siteKey+'&source='+(this.source == '全部机构' ? '' : this.source)+'&hasCheck='+this.hasCheck+'&creator='+this.creator;
      
      let data=await api.getAxios(url);
      this.loading = false;
      if(data.status == 200 && data.result){
        let list = data.result;
        list && list.length ? list.map((item)=>{item['select']=true}) : null;
        this.alllist = list;
        // console.log(alllist);
        // this.isSitePerspective = true;
      }
    },
    getGenealogyListForPage(page){//分页
        this.curPage=page;
        if(this.isSwapListModal && this.swapKey){
          this.getSwapGenealogy(false);
        }else{
          this.getGenealogy(false);
        }
    },
    editGenealogy(item,index){//编辑
      this.isEdit = index;
      this.isGenealogyShow = true;
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
    allSitePerspectiveCheck(flag){
      this.allSitePerspective = !flag;
      if(this.allSitePerspective){
        this.getGenealogyAll();
        if(this.isUnique == 1){
          this.originFilter = '';
          this.originFilter = {surname:this.surname,genealogyName:this.genealogyName,place:this.place,hall:this.hall,celebrity:this.celebrity,generationName:this.poem,batch:this.batch,version:this.version,writeTime:this.writeTime,author:this.author,hasImage:this.isImage,siteKey:this.siteKey,source:(this.source == '全部机构' ? '' : this.source),hasCheck:this.hasCheck,creator:this.creator};
        }else if(this.isUnique == 2){
          this.destFilter = '';
          this.destFilter = {surname:this.surname,genealogyName:this.genealogyName,place:this.place,hall:this.hall,celebrity:this.celebrity,generationName:this.poem,batch:this.batch,version:this.version,writeTime:this.writeTime,author:this.author,hasImage:this.isImage,siteKey:this.siteKey,source:(this.source == '全部机构' ? '' : this.source),hasCheck:this.hasCheck,creator:this.creator};
        }
        
      }else{
        this.alllist = [];
      }
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
    saveRoot(root){//分级公开
      this.isRootShow = false;
      this.getGenealogy();
    },
    openRootModal(){//打开分级模块
      if(this.role < 1 || this.role > 4){
        this.$message({message: '暂无权限操作',type: 'warning'});
        return false;
      }
      let checkList=[],list=this.list;
      this.allSitePerspective ? list = this.alllist : null;
      list.map((item)=>{
        if(item.select){
          checkList.push(item._key);
        }
      });
      this.checkList = checkList;
      if(this.checkList && this.checkList.length && this.siteKey){
        this.isRootShow = true 
      }else{
        this.$message({message: '请勾选家谱',type: 'warning'});
      }
    },
    openSwapModal(){//打开交换家谱
      if(this.role < 1 || this.role > 2){
        this.$message({message: '暂无权限',type: 'warning'});
        return false;
      }
      let checkList=[],list=this.list;
      this.allSitePerspective ? list = this.alllist : null;
      list.map((item)=>{
        if(item.select){
          checkList.push(item._key);
        }
      });
      this.checkList = checkList;
      if(this.checkList && this.checkList.length && this.siteKey){
        this.isSwapModal = true 
      }else{
        this.$message({message: '请勾选家谱',type: 'warning'});
      }
    },
    saveLead(){//批量导入
      this.isLeadShow = false;
      this.getGenealogy();
    },
    openSiteModal(){//打开站点透视
      let checkList=[],list=this.list;
      this.allSitePerspective ? list = this.alllist : null;
      list.map((item)=>{
        if(item.select){
          checkList.push(item._key);
        }
      });
      this.checkList = checkList;
      if(this.checkList && this.checkList.length && this.siteKey){
        this.isSitePerspective = true; 
      }else{
        this.$message({message: '请勾选家谱',type: 'warning'});
      }
    },
    openSourceModal(id,volume){//打开上传资源模块
      this.gid = id;
      this.gvolume = volume;
      this.isSourceModal = true;
    },
    deleteAction(gid,flag){//删除、退出共享
      this.$confirm('此操作将永久删除该家谱, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if(flag){
          this.deleteGenealogy([gid]);
        }else{
          this.deleteShare(gid);
        }
      }).catch(() => {});
    },
    openSourcePrevModal(gid){//打开影像预览
      // this.gid = gid;
      // this.isSourcePrevModal = true;
      this.$router.push('/'+window.localStorage.getItem('pathname')+'/view?gid='+gid+'&volume=1&page=1');
    },
    saveSitePerspective(){
      this.isSitePerspective = false;
    },
    saveGenealogy(){//家谱编辑页面
      this.isEdit = -1;
      this.isGenealogyShow = false;
      this.getGenealogy();
    },
    clickToolbar(index){
      switch(index){
        case 0:
          this.isGenealogyShow = true;
          break;
        case 1:
          this.isLeadShow = true
          break;
        case 2:
          this.catalogArr = [];
          this.destArr = [];
          let checkList=[],checkAllList=[];
          this.list.map((item)=>{
            if(item.select){
              checkList.push(item._key);
            }
          });
          if(this.alllist.length){
            this.alllist.map((item)=>{
              checkAllList.push(item._key);
            });
          }
          
          if(checkList.length){
            this.catalogArr = checkList;
            this.isUnique = 2;
            this.list = [];
            this.pages = 1;
            this.total = 0;
          }else if(checkAllList.length){
            this.catalogArr = checkAllList;
            this.isUnique = 2;
            this.list = [];
            this.pages = 1;
            this.total = 0;
            this.alllist = [];
            this.allSitePerspective = false;
          }else{
            this.$message({message: '请勾选家谱',type: 'warning'});
          }
          break;
        case 3:
          if(this.list && this.list.length){
            this.$confirm('此操作将永久删除该家谱, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.delete()
            }).catch(() => {});
          }
          break;
      }
    },
    deleteGenealogy:async function(checkList){//删除
      let data=await api.deleteAxios('catalog',{'catalogKeyArr':checkList,'userKey':this.userKey,'siteKey':this.siteKey});
        if(data.status == 200){
          this.getGenealogy();
        }else{
          this.$message({message: '删除家谱出错，请重新删除',type: 'warning'});
        }
    },
    deleteShare:async function(gid){// 退出共享
      let data=await api.deleteAxios('catalog/exitShare',{'catalogKey':gid,'userKey':this.userKey,'siteKey':this.siteKey});
        if(data.status == 200){
          this.$message({message: '退出共享成功',type: 'success'});
          this.getGenealogy();
        }else{
            this.$message({message: '退出共享出错，请重新退出',type: 'warning'});
        }
    },
    delete:async function(){// 删除
      let checkList=[],shareList=[],allCheckList=[];
      this.list.map((item)=>{
        if(item.select && item.resource < 3){
          checkList.push(item._key);
        }
        if(item.select && item.resource == 3){
          shareList.push(item.genealogyName);
        }
      });
      if(this.alllist.length){
        this.alllist.map((item)=>{
          allCheckList.push(item._key);
        });
      }
      if(shareList && shareList.length){
        this.$message({message: (shareList.join()+'你无权删除'),type: 'warning'});
        return false;
      }
      if(checkList.length){
        let data=await api.deleteAxios('catalog',{'catalogKeyArr':checkList,'userKey':this.userKey,'siteKey':this.siteKey});
          if(data.status == 200){
              this.getGenealogy();
          }else{
              this.$message({message: '删除家谱出错，请重新删除',type: 'warning'});
          }
      }else if(allCheckList.length){
        let data=await api.deleteAxios('catalog',{'catalogKeyArr':allCheckList,'userKey':this.userKey,'siteKey':this.siteKey});
        if(data.status == 200){
            this.getGenealogy();
        }else{
            this.$message({message: '删除家谱出错，请重新删除',type: 'warning'});
        }
      }else{
        this.$message({message: '请勾选家谱',type: 'warning'});
      }
    },
    handleClickToolbar(index){//工具栏
      switch(index){
        case 0:
          this.openSwapListModal();
          break;
        case 1:
          this.openSiteModal();
          break;
        case 2:
          this.isPerspectiveList = true;
          break;
      }
    },
  },
  computed: {
    ...mapState({
      userName: state => state.nav.userName,
      userId: state => state.nav.userId,
      stationKey: state => state.nav.stationKey,
      role: state => state.nav.role,
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
	height: 10px;
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
      background: #353D51;
      padding: 0 20px;
      color: #fff;
      display: flex;
      align-items:center;
      justify-content: space-between;
      .logo{
          height: 40px;
          line-height: 40px;
          border-radius: 50%;
          // padding-left: 50px;
          font-size: 22px;
          letter-spacing: 2px;
          img{
              height: 40px;
              // width: 40px;
              // border-radius: 50%;
              float: left;
              margin-right: 15px;
              // margin-left: -50px;
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
      h3{
        i{
          font-style: normal;
        }
        span{
          color: #4C95FF;
        }
      }
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
        height: 38px;
        line-height: 38px;
        text-indent: 10px;
        border: none;
        outline: none;
        background: #F6FAFD;
        border: 1px solid #D6E7F3;
        // border-radius: 5px;
      }
      .rootSelect{
        // height: 40px;
        width: 15%;
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
        background: #4C95FF;
        border: none;
        outline: none;
        border-radius: 20px;
        cursor: pointer;
        margin: 0;
      }
      .width100{
        margin-left: 20px;
        width: 120px;
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
        // color: #4C95FF;
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
    .root{
      background:#fff url('../../assets/icon/root.svg') 35px 50% no-repeat;
      background-size: 16px;
      text-indent: 20px;
    }
    .root:hover{
      background-image: url('../../assets/icon/rootActive.svg');
      color: #4C95FF;
    }
    .swap{
      background:#fff url('../../assets/icon/swap.svg') 35px 50% no-repeat;
      background-size: 16px;
      text-indent: 20px;
    }
    .swap:hover{
      background-image: url('../../assets/icon/swapActive.svg');
      color: #4C95FF;
    }
    .checkRepeat{
      width: 160px;
      background:#fff url('../../assets/icon/checkRepeat.svg') 20px 50% no-repeat;
      background-size: 16px;
      text-indent: 20px;
    }
    .btn_wrap{
      text-align: left;
      padding: 20px 0;
      display: flex;
      justify-content: space-between;
      .btn_wrap_left{
        display: flex;
      }
      .btn_wrap_toolbar{
        width: 240px;
        height: 40px;
        border-radius: 20px;
        overflow: hidden;
        background: #fff;
        display: flex;
        margin-right: 20px;
        span{
          position: relative;
          width: 80px;
          background: url('../../assets/icon/add.svg') 15px 50% no-repeat;
          background-size: 16px;
          text-indent: 15px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          cursor: pointer;
          &.hide{
            display: none;
          }
          &.icon1{
            background-image: url('../../assets/icon/import.svg');
          }
          &.icon2{
            background-image: url('../../assets/icon/unique.svg');
          }
          &.icon3{
            background-image: url('../../assets/icon/delete.svg');
          }
          &:hover{
            color: #4C95FF;
            background-image: url('../../assets/icon/addActive.svg');
          }
          &.icon1:hover{
            background-image: url('../../assets/icon/importActive.svg');
          }
          &.icon2:hover{
            background-image: url('../../assets/icon/uniqueActive.svg');
          }
          &.icon3:hover{
            background-image: url('../../assets/icon/deleteActive.svg');
          }
          &:nth-of-type(1)::after{
            content: '';
            position:absolute;
            height: 14px;
            top: 13px;
            left: 0;
            border-left: 1px solid #ddd;
          }
          &:nth-of-type(3)::before{
            content: '';
            position:absolute;
            height: 14px;
            top: 13px;
            left: 0;
            border-left: 1px solid #ddd;
          }
          &:nth-of-type(3)::after{
            content: '';
            position:absolute;
            height: 14px;
            top: 13px;
            right: 0;
            border-right: 1px solid #ddd;
          }
        }
      }
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
              margin-left: 10px;
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
        font-size: 14px;
        margin: 0 auto;
        overflow-x: auto;
        overflow-y: auto;
      }
    }
  }
}
.mytable{
  width: 2200px;
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
.el-radio+.el-radio {
  margin-left: 10px;
}
.el-radio {
  margin-top: 12px;
}
.toolbar{
  position: fixed;
  right: 10px;
  bottom: 50px;
  width: 50px;
  // height: 170px;
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
      margin: 10px 0;
    }
    &:nth-of-type(3){
      background-position-y: -100px;
    }
    &:hover{
      background-position-x: -50px;
    }
  }
}
.group{
  position: relative;
  width: 15%;
  height: 40px;
  line-height: 40px;
  margin-bottom: 10px;
  .tag_close{
    position: absolute;
    top: 12px;
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
.el-select .el-input__inner{
  height: 42px;
}
.marginLeft10{
    margin-left: 10px;
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
  .marginbottom10{
    margin-bottom: 10px;
  }
  .group{
    width: 100%;
    margin-bottom: 10px;
  }
}
.margintop20{
  margin-top: 20px;
}
.redColor{
  color: #f00;
}
.search_box2{
  color: #7E8E98;
  font-size: 14px;
  padding-top: 20px;
  .search_box2_top{
    margin-bottom: 20px;
  }
  .search_box2_bottom{
    height: 40px;
    line-height: 40px;
    display: flex;
    justify-content: space-between;
  }
  .label_2{
    width: 70px;
    display: inline-block;
  }
}
.marginleft80{
  margin-left: 80px;
}
.disabled{
  color: #c9c9c9;
}
.checkDuplication_wrap{
  width: 2000px;
  .checkDuplication_thead{
    height: 50px;
    line-height: 50px;
    background:#353D51;
    color:#fff;
    span{
      display: inline-block;
      width: 100px;
      text-align: center;
      &.width200{
          width: 200px;
        }
    }
  }
  .checkDuplication_body_ul{
    width: 100%;
    display: block;
    .checkDuplication_body_li{
      background: #4C95FF;
      // padding-top: 10px;
      color: #fff;
      >span{
        display: inline-block;
        width: 100px;
        text-align: center;
        padding-bottom: 10px;
        &.width200{
          width: 200px;
        }
      }
      >p{
        display: inline-block;
        width: 200px;
        text-align: center;
        cursor: pointer;
        padding-bottom: 10px;
      }
    }
    // .checkDuplication_body_li:nth-of-type(2n){
    //   background: #DEF1FF;
    //   &.redbColor{
    //     background: #FAEFF1;
    //   }
    //   &.greenbColor{
    //     background: #EDFFEC;
    //   }
    // }
    .redbColor{
      background: #FAEFF1;
      color: #333;
    }
    .greenbColor{
      background: #EDFFEC;
    }
    .checkDuplication_body_li2{
      padding-top: 10px;
      background: #fff;
      color: #333;
    }
  }
}
.marginright20{
  margin-right: 20px;
}
.marginBottom20{
  margin-bottom: 20px;
}
.el_span_adai{
  position: relative;
}
.el_icon_adai{
  position: absolute;
  top: 1px;
}
.width200{
  width: 180px;
  overflow: hidden;
}
</style>

