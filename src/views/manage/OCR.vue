<template>
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal title="OCR识别" />
            <div class="search_wrap">
                <h3 class="title">家谱资源</h3>
                <div class="search_box">
                    <input class="search" type="text" placeholder="请输入谱id" v-model="gcKey" @keyup.enter="getGenealogy" />
                    <input class="search" type="text" placeholder="请输入谱名" v-model="genealogyName" @keyup.enter="getGenealogy" />
                    <input class="search" type="text" placeholder="请输入姓氏" v-model="surname" @keyup.enter="getGenealogy" />
                    <input class="search" type="text" placeholder="请输入谱籍地" v-model="place" @keyup.enter="getGenealogy" />
                    <input class="search" type="text" placeholder="请输入堂号" v-model="hall" @keyup.enter="getGenealogy" />
                    <input class="search" type="text" placeholder="请输入批次" v-model="batch" @keyup.enter="getGenealogy" />
                </div>
                <div class="search_box marginBottom0">
                    <div class="group">
                        <el-checkbox v-model="hasRecognized" class="marginRight5">识别结果</el-checkbox>
                    </div>
                    <div class="group">
                        <el-checkbox v-model="ishigherRate" class="marginRight5">质量优于</el-checkbox>
                        <el-input-number v-show="ishigherRate" :style="{'width':'90px'}" size="mini" v-model="higherRate" controls-position="right" :disabled="!ishigherRate" :min="1" :max="100"></el-input-number>
                    </div>
                    <div class="group">
                        <el-checkbox v-model="islowerRate" class="marginRight5">质量劣与</el-checkbox>
                        <el-input-number v-show="islowerRate" :style="{'width':'90px'}" size="mini" v-model="lowerRate" controls-position="right" :disabled="!islowerRate" :min="1" :max="100"></el-input-number>
                    </div>
                    <div class="group hide">
                        <!-- <el-checkbox v-model="isOCR">已识别</el-checkbox> -->
                    </div>
                    <div class="group hide"></div>
                    <div class="btn" @click="getGenealogy">
                        <span>搜索</span>
                    </div>
                    <!-- <input class="btn searchIcon" type="button" value="搜索" @click="getGenealogy" /> -->
                </div>
            </div>
            <div class="btn_wrap">
                <div class="btn_left">
                    <div class="btn buyGenealogy" @click="linkOCR2">
                        <span>识别家谱  {{checkList.length || ''}}</span>
                    </div>
                    <el-checkbox v-model="isRead" class="marginRight5 marginTop10">跳过已识别页</el-checkbox>
                    <el-checkbox v-model="ocrAgain" class="marginRight5 marginTop10">强制重新识别</el-checkbox>
                </div>
                <!-- <input class="btn gray buyGenealogy" type="button" @click="linkOCR" :value="'识别家谱'+(checkList.length || '')" /> -->
                <div class="tip_wrap" v-if="list && list.length">
                    <span class="tip" v-if="list[tabIndex].surname">姓氏：{{list[tabIndex].surname || ''}}</span>
                    <span class="tip" v-if="list[tabIndex].place">谱籍地：{{list[tabIndex].place || ''}}</span>
                    <span class="tip" v-if="list[tabIndex].hall">堂号：{{list[tabIndex].hall || ''}}</span>
                    <span class="tip" v-if="list[tabIndex].batch">批次：{{list[tabIndex].batch || ''}}</span>
                </div>
                <a class="ocr_admin_wrap" :href="ocrAdminURL" target="_blank">
                    <i class="el-icon-full-screen"></i>
                    <span>识别结果</span>
                </a>
            </div>
            <div class="genealogy_wrap style1" @scroll.passive="onScroll">
                <table class="mytable">
                    <thead>
                        <tr>
                            <th class="width20">
                                <el-checkbox :value="allCheck" @change="allCheckbox(allCheck)"></el-checkbox>
                            </th>
                            <th>谱目</th>
                            <th>页码</th>
                            <th>识别页码</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item,index) in list" :key="'tr'+index" :class="{active:index == tabIndex}">
                            <td class="width20">
                                <el-checkbox :value="item.select" @change="changeCheckbox(item.select,index)"></el-checkbox>
                            </td>
                            <td :title="item.genealogyName"  @click="openOCR(index)"><span class="overflow">{{item.genealogyName}}</span></td>
                            <td><span>{{item.imagePages}}</span></td>
                            <td><span>{{item.phraseImages}}</span></td>
                        </tr>
                    </tbody>
                </table>
                <span class="more" v-show="pages > 1 && curPage < pages" @click="getGenealogyListForPage">更多</span>
            </div>
            <div class="ocr_wrap">
                <div class="text_wrap" :style="{'width':(isIphone ? '100%' : ((left-20)+'px'))}">
                    <div class="text_title" v-if="(list && list.length) && (resultList && resultList.length)">
                        <span class="page">页码</span>
                        <span>内容</span>
                    </div>
                    <div class="text_content_wrap style1" @scroll.passive="onScrollImage">
                        <div class="text_content" :class="{active:index == sourceIndex}" v-for="(item,index) in resultList" :key="'text'+index" @click="openLinkImage(index)">
                            <span class="page">{{index+1}}</span>
                            <span class="text">{{item.ocrResult}}</span>
                        </div>
                        <span class="more" v-show="pages1 > 1 && page1 < pages1" @click="getResultListForPage">更多</span>
                    </div>
                </div>
                <div class="image_wrap" :style="{'left':left+'px'}">
                    <img v-if="resultList && resultList.length" class="cover" :src="resultList[sourceIndex].myURL" alt="影像" />
                    <div class="cursor" @mousedown="dragStart" v-if="(list && list.length) && (resultList && resultList.length)"></div>
                </div>
            </div>
            <!-- <div class="process_wrap">
                <span :style="{'width':(percentage/allPage)*100+'%'}">{{percentage}}/{{allPage}}</span>
            </div> -->
        </div>
        <div class="ocr_parse_wrap" v-show="isShowOCRParse">
            <div class="ocr_parse_box">
                <h3>批量识别确认</h3>
                <div class="ocr_parse_group">
                    <label for="">谱目</label>
                    <p>{{checkList.length}}种</p>
                </div>
                <div class="ocr_parse_group">
                    <label for="">页数</label>
                    <p>{{checkListCount}}种</p>
                </div>
                <div class="ocr_parse_group">
                    <label for="">优先级</label>
                    <div class="ocr_parse_slider">
                        <el-slider v-model="priority" :min="0" :max="5"></el-slider>
                    </div>
                </div>
                <div class="ocr_parse_btn">
                    <el-button @click="isShowOCRParse=false">放弃</el-button>
                    <el-button type="primary" @click="startOCRParse">确定</el-button>
                </div>
            </div>
        </div>
        <Loading v-show="loading" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import NavModal from "../../components/dictionary/NavModal.vue";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "ocr",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            isRead:false,
            stationName:'',
            stationlogo:'',
            userKey:'',
            surname:'',
            genealogyName:'',
            place:'',
            hall:'',
            startTime:'',
            endTime:'',
            lowerRate:50,
            islowerRate:false,
            batch:'',
            higherRate:90,
            ishigherRate:false,
            isImage:1,
            isHasPerson:2,
            isOCR:false,
            allCheck:false,
            checkList:[],
            list:[],
            curPage:1,
            limit:20,
            pages:0,
            total:0,
            siteKey:'',
            loading:false,
            gid:'',
            left:400,
            currentX:0,
            tabIndex:0,
            page1:0,
            pages1:0,
            total1:0,
            resultList:[],
            sourceIndex:0,
            isIphone:false,
            sideShow:true,
            ocrAgain:false,
            priority:0,
            isShowOCRParse:false,
            ocrAdminURL:'',
            checkListCount:0,
            hasRecognized:false,
            gcKey:'',
        };
    },
    mounted:function(){
        this.userKey = window.localStorage.getItem('userId') || '';
        this.stationlogo = window.localStorage.getItem('stationlogo') || '';
        this.stationName = window.localStorage.getItem('stationName') || '';
        this.siteKey = window.localStorage.getItem('stationKey') || '';
        this.getGenealogy();
        if(window.innerWidth < 768){
            this.isIphone = true;
            this.left = 0;
        }
        this.ocrAdminURL = 'https://ocradmin.qingtime.cn/serverBatch?userKey='+window.localStorage.getItem('userId')+'&siteKey='+window.localStorage.getItem('stationKey')+'&appId=1&mobile='+window.localStorage.getItem('mobile');
    },
    methods:{
        onScroll(e){
            if(Math.ceil(e.target.clientHeight + e.target.scrollTop) >= e.target.scrollHeight){
                if(this.curPage < this.pages){
                    console.log('到底了');
                    this.getGenealogyListForPage();
                }
            }
        },
        onScrollImage(e){
            if(Math.ceil(e.target.clientHeight + e.target.scrollTop) >= e.target.scrollHeight){
                if(this.page1 < this.pages1){
                    console.log('到底了');
                    this.getResultListForPage();
                }
            }
        },
        linkOCR(){
            let allPage = 0;
            if(this.checkList && this.checkList.length && this.socketId){
                this.list.map((item)=>{
                    if(item['select']){
                        allPage = allPage + item.imagePages;
                    }
                });
                // this.$store.dispatch("changeSocket",{'allPage':allPage});
                this.ocrPhraseNew();
                //this.$socket.emit('ocrPhrase', {'catalogKeyArr':this.checkList,'socketId':this.id});
            }else{
                if(!this.socketId){this.$message({message: 'socket未连接',type: 'warning'});return false;}
                this.$message({message: '请勾选家谱',type: 'warning'});
            }
        },
        linkOCR2(){
            if(this.checkList.length){
                this.isShowOCRParse = true;
            }else{
                this.$message({message: '请勾选家谱',type: 'warning'});
            }
        },
        startOCRParse(){
            if(this.checkList.length){
                this.$message({message: '家谱识别中...',type: 'success'});
                this.ocrPhraseNew();
            }else{
                this.$message({message: '请勾选家谱',type: 'warning'});
            }
        },
        ocrPhraseNew:async function(){
            let userName = window.localStorage.getItem('profile') && JSON.parse(window.localStorage.getItem('profile')).trueName;
            let data=await api.postAxios('ocr/task',{'catalogKeyArr':this.checkList,'userKey':window.localStorage.getItem('userId'),'isRead':this.isRead,siteKey:window.localStorage.getItem('stationKey'), mobile:window.localStorage.getItem('mobile'), userName:userName,ocrAgain:(this.ocrAgain ? 1 : 0),priority:this.priority});
            this.isShowOCRParse = false;
            if(data.status == 200){
                this.$message({message: '识别任务已提交',type: 'success'});
            }else{
                this.$message({message: '家谱识别出错，请重新识别',type: 'warning'});
            }
        },
        ocrPhrase:async function(){
            this.$store.dispatch("changeSocket",{'percentage':1});
            this.$store.dispatch("changePhraseOk",false);
            let data=await api.postAxios('ocrPhrase',{'catalogKeyArr':this.checkList,'socketId':this.socketId,'isRead':this.isRead});
            if(data.status == 200){
                this.$message({message: '家谱识别中...',type: 'success'});
                this.$store.dispatch("changeSocket",{'allPage':data.total});
            }else{
                this.$message({message: '家谱识别出错，请重新识别',type: 'warning'});
            }
        },
        dragStart(ev){
            this.currentX=ev.clientX;
            document.onmousemove = (e)=>{
                let nowX=e.clientX,disX=nowX-this.currentX;
                this.currentX = nowX;
                this.left = disX + this.left;
            };
            document.onmouseup = (e) => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        },
        openOCR(index){
            this.tabIndex = index;
            this.getResult();
        },
        getGenealogy:async function(type=true){//列表
            this.checkList = [];
            this.resultList = [];
            this.pages1 = 0;
            let lowerRate = '',higherRate='';
            this.islowerRate ? lowerRate = this.lowerRate : null;
            this.ishigherRate ? higherRate = this.higherRate : null;

            this.loading = true;
            type ? this.curPage=1 : null;
            let data=await api.getAxios('ocr/catalog?surname='+this.surname+'&hasRecognized='+(this.hasRecognized ? 1 : 0)+'&gcKey='+this.gcKey+'&genealogyName='+this.genealogyName+'&place='+this.place+'&hall='+this.hall+'&higherRate='+higherRate+'&lowerRate='+lowerRate+'&batch='+this.batch+'&startTime='+this.startTime+'&endTime='+this.endTime+'&page='+this.curPage+'&limit='+this.limit);
            this.loading = false;
            if(data.status && data.result){
                if(type){
                    this.tabIndex = 0;
                    let list = data.result.list;
                    list && list.length ? list.map((item)=>{item['select']=false}) : null;
                    this.list = list;
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                    // this.getResult();
                }else{
                    let list = data.result.list;
                    list && list.length ? list.map((item)=>{item['select']=false}) : null;
                    this.list = this.list.concat(list);
                }
            }
        },
        getGenealogyListForPage(){//分页
            this.curPage=this.curPage + 1;
            this.getGenealogy(false);
        },
        getResultListForPage(){
            this.page1=this.page1 + 1;
            this.getResult(false);
        },
        getResult:async function(type=true){//列表
            this.sourceIndex = 0;
            this.loading = true;
            type ? this.page1=1 : null;
            let data=await api.getAxios('ocr/result?catalogKey='+this.list[this.tabIndex]._key+'&page='+this.page1+'&limit='+this.limit);
            this.loading = false;
            if(data.status && data.result){
                if(type){
                    this.resultList = data.result.list;
                    this.pages1 = data.result.pageNum;
                    this.total1 = data.result.total;
                }else{
                    let list = data.result.list;
                    this.resultList = this.resultList.concat(list);
                }
            }
        },
        openLinkImage(index){
            this.sourceIndex = index;
        },
        picError(){//图片获取报错
            this.stationlogo = require('../../assets/nav/avatar.svg');
        },
        changeCheckbox(flag,index){
            let checkList = [],checkListCount=0;
            this.list[index].select = !flag;
            this.list.map((item)=>{
                if(item['select']){
                    checkList.push(item._key);
                    checkListCount = checkListCount + item.imagePages;
                }
            });
            this.checkList = checkList;
            this.checkListCount = checkListCount;
        },
        allCheckbox(flag){//全选、全部选
            let checkList = [],checkListCount=0;
            if(this.list && this.list.length){
                this.allCheck = !flag;
                if(this.allCheck){
                    this.list.map((item)=>{item['select']=true});
                    this.list.map((item)=>{
                        if(item['select']){
                            checkList.push(item._key);
                            checkListCount = checkListCount + item.imagePages;
                        }
                    });
                }else{
                    this.list.map((item)=>{item['select']=false});
                    this.list.map((item)=>{
                        if(item['select']){
                            checkList.push(item._key);
                        }
                    });
                }
            }
            this.checkList = checkList;
            this.checkListCount = checkListCount;
        },
    },
    computed: {
        ...mapState({
            socketId: state => state.nav.socketId,
            percentage:state => state.nav.percentage,
            phraseOk:state => state.nav.phraseOk,
            allPage:state => state.nav.allPage,
        })
    },
    watch: {
    　　'phraseOk': function (newValue, oldValue) {
            console.log(newValue);
            if(newValue){
                this.$message({message: '家谱识别成功',type: 'success'});
                this.getGenealogy();
            }
    　　}
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
  text-align: left;
  background: #EFF1F5;
  .content{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 200px;
    font-size: 14px;
    padding-bottom: 20px;
    .search_wrap{
      position: relative;
      background: #fff;
      width: calc(100% - 80px);
      margin: 20px auto 0 auto;
      padding:30px 20px 10px 20px;
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
      }
      .marginBottom0{
          margin-bottom: 0;
      }
      .search{
        width: 16%;
        height: 40px;
        line-height: 40px;
        text-indent: 10px;
        border: none;
        outline: none;
        background: #F6FAFD;
        border: 1px solid #D6E7F3;
        border-radius: 5px;
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
    .buyGenealogy{
        background: #358acd;
        color: #fff;
        span{
            display: inline-block;
            padding-left: 18px;
            background: url('../../assets/ocr/icon2.svg') 0 50% no-repeat;
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
    .btn_wrap{
        display: flex;
        justify-content: space-between;
        text-align: left;
        width: calc(100% - 40px);
        margin: 0 auto;
        padding: 10px 0;
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
.genealogy_wrap{
    position: absolute;
    background: #fff;
    top: 280px;
    left: 20px;
    width: 240px;
    bottom: 20px;
    overflow-y: auto;
    padding: 10px;
    font-size: 12px;
}
.ocr_wrap{
    position: absolute;
    background: #fff;
    top: 280px;
    right: 20px;
    left: 290px;
    bottom: 20px;
}
.text_wrap{
    position: absolute;
    top: 0;
    width: 380px;
    bottom: 0;
    padding: 10px;
}
.text_title{
    display: flex;
    background: #ccc; 
    span{
        display: block;
        height: 50px;
        line-height: 50px;
        text-align: center;
        &.page{
            width: 60px;
        }
    }
}
.text_content_wrap{
    position: absolute;
    top: 60px;
    right: 10px;
    bottom: 10px;
    left: 10px;
    overflow-y: auto;
    .text_content{
        background: #fff;
        padding: 5px 0;
        overflow: hidden;
        cursor: pointer;
        &.active{
            // border: 1px solid #358acd;
            background: #DEF1FF;
        }
        &:nth-of-type(even){
            // background: #DEF1FF; 
            background: #F2F2F2;
            &.active{
                // border: 1px solid #358acd;
                background: #DEF1FF;
            }
        }
        span{
            display: block;
            float: left;
            &.page{
                width: 60px;
                text-align: center;
            }
            &.text{
                width: calc(100% - 60px);
            }
        }
    }
}
.image_wrap{
    position: absolute;
    top: 0;
    left: 400px;
    bottom: 0;
    .cover{
        width: 100%;
        height: 100%;
    }
    .cursor{
        position: absolute;
        top: 50%;
        left: -10px;
        width: 20px;
        height: 50px;
        background: #ddd;
        transform: translateY(-50%);
        cursor: pointer;
        background: url('../../assets/ocr/btn.svg') 50% 50% no-repeat;
        box-shadow: 0 0 1px 1px #ddd;
        border-radius: 5px;
    }
}
.overflow{
    max-width: 120px;
    display: block;
    height: 50px;
    line-height: 50px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.group{
    width: 19%;
    height: 40px;
    line-height: 40px;
}
.marginRight5{
    margin-right: 5px;
}
.more{
    display: block;
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    color: #4C95FF;
}
.tip_wrap{
    height: 40px;
    line-height: 40px;
    margin-left: 20px;
    .tip{
        height: 20px;
        font-size: 12px;
        line-height: 20px;
        border-radius: 10px;
        border: 1px solid #ddd;
        margin-right: 10px;
        display: inline-block;
        padding: 0 10px;
        background: #fff;
    }
}
.process_wrap{
    position: absolute;
    left: 20px;
    right: 20px;
    height: 12px;
    line-height: 12px;
    border-radius: 6px;
    bottom: 4px;
    overflow: hidden;
    span{
        display: inline-block;
        background: #4C95FF;
        color: #fff;
        font-size: 10px;
        text-align: center;
    }
}
.buyGenealogy{
    background: #358acd;
    color: #fff;
    span{
        display: inline-block;
        padding-left: 18px;
        background: url('../../assets/ocr/icon.svg') 0 50% no-repeat;
        background-size: 18px 18px;
    }
}
.mytable tbody tr:nth-of-type(even) {
    background: #F2F2F2;
    &.active{
        // border: 1px solid #358acd;
        background: #DEF1FF;
    }
}
.mytable thead {
    background: #ccc;
}
.active{
    // border: 1px solid #358acd;
    background: #DEF1FF;
}
@media screen and (max-width:1200px) and (min-width:600px){
    .wrap{
        .content{
            position: relative;
            top: auto;
            right: auto;
            bottom: auto;
            left: auto;
        }
    }
    .tip_wrap{
        margin-left: 0;
    }
    .genealogy_wrap{
        position: relative;
        width: calc(100% - 20px);
        top: auto;
        right: auto;
        bottom: auto;
        left: auto;
    }
    .ocr_wrap{
        position: relative;
        width: 100%;
        top: auto;
        right: auto;
        bottom: auto;
        left: auto;
        height: 500px;
    }
}

@media screen and (max-width:600px) {
    .wrap{
        padding-left: 30px;
        width: calc(100% - 30px);
        .content{
            position: relative;
            top:auto;
            right:auto;
            left:auto;
            bottom:auto;
            width:100%;
            left: 0;
            padding: 70px 0 0 0;
            .search_wrap{
                padding: 30px 10px 10px 10px;
                .search_box{
                    display: block;
                    .search{
                        width: 100%;
                        margin-bottom: 10px;
                    }
                }
                .btn{
                    width: 100%;
                    margin-top: 10px;
                }
            }
        }
    }
    .hide{
        display: none;
    }
    .genealogy_wrap{
        position: relative;
        top:auto;
        left:auto;
        bottom:auto;
        width:calc(100% - 20px);
    }
    .ocr_wrap{
        position: relative;
        top:auto;
        left:auto;
        right: auto;
        bottom:auto;
        width:100%;
        margin-top: 20px;
    }
    .group{
        width: 100%;
    }
    .text_wrap{
        position: relative;
        top:auto;
        left:auto;
        bottom:auto;
        padding: 10px 0;
    }
    .image_wrap{
        position: relative;
        top:auto;
        left:auto;
        bottom:auto;
        .cursor{
            display: none;
        }
    }
    .text_content_wrap{
        position: relative;
        top:auto;
        left:auto;
        bottom:auto;
        padding: 10px 0;
        right: auto;
    }
    img{
        max-width: 100%;
    }
}
.btn_left{
    display: flex;
    justify-content: space-between;
    .marginTop10{
        margin-top: 10px;
    }
}
.width20{
    width: 40px;
}
.ocr_parse_wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    .ocr_parse_box{
        padding: 20px 30px;
        background: #fff;
        border-radius: 5px;
        h3{
            text-align: center;
        }
        .ocr_parse_group{
            display: flex;
            height: 40px;
            line-height: 40px;
            margin-top: 10px;
            label{
                display: block;
                width: 60px;
                margin-right: 10px;
            }
            .ocr_parse_slider{
                width: 200px;
            }
        }
    }
}
.ocr_admin_wrap{
    height: 40px;
    line-height: 40px;
    color: #333;
    i{
        margin-right: 5px;
    }
}
</style>

