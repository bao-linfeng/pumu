<template>
  <div class="wrap">
    <div class="center width100">
        <div class="main style1" :class="{scroll:isIphone}">
            <img class="view" :style="'transform:scale('+(1+scaleIndex*0.1)+') translate('+x+'px,'+y+'px)'" @load="loadImg" :src="base64 ? base64 : 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs='" alt="影像" />
            <div class="view_wrap" @mousedown="dragStart" @touchstart.prevent="start"></div>
            <span @click="prevPage" class="prev" :class="{active:page>1}"><i class="el-icon-arrow-left"></i></span>
            <span @click="nextPage" class="prev next" :class="{active:page < viewList.length}"><i class="el-icon-arrow-right"></i></span>
        </div>
        <div v-if="menuShow" class="viewList style1" @scroll.passive="onScroll">
            <img v-for="(item,index) in thumbnail" :key="index" :id="index" :class="{active: page == index+1}" :src="item" @click="changePage(index+1)" alt="">
        </div>
        <div class="sidebar">
            <div class="sidebar_left">
                <div class="volume_wrap">
                    <i class="el-icon-back back" title="返回" @click="goback"></i>
                    <el-select class="select" v-model="volume" placeholder="请选择" style="width:120px">
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </div>
                <div class="sliderBox">
                    <el-slider v-model="page" :min="1" :max="total"></el-slider>
                </div>
                <el-input-number class="pageInput" v-model="page" :min="1" :max="total" label="请输入页码"></el-input-number>
                <div class="total">/{{total}}页</div>
            </div>
            <div class="sidebar_right">
                <i class="el-icon-zoom-out" @click="zoomIn"></i>
                <i class="el-icon-zoom-in" @click="zoomOut"></i>
                <i class="el-icon-menu" @click="toggleThumbnail"></i>
            </div>
        </div>
    </div>
    <Loading v-show="flag" />
    <div class="codeText-wrap" v-if="codeImage">
        <div class="codeText-box">
            <h3>验证码</h3>
            <div class="codeText" v-html="codeImage"></div>
            <div class="codeText-btn">
                <input type="text" placeholder="请输入验证码" v-model="codeText" />
                <button @click="reshVertifyCode">刷新</button>
                <button @click="postVertifyCode">提交</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import api from "../api.js";
import ADS from "../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "gview",
    components: {

    },
    data: () => {
        return {
            options: [{value: 1,label: '卷数1'}],
            flag:false,
            gid:'',
            page: 1,
            limit:10000,
            volume:1,
            total:10000,
            viewList:'',
            menuShow:false,
            scaleIndex:0,
            x:0,
            y:0,
            isIphone:false,
            pathname:'',
            pointerX:0,
            pointerY:0,
            isShowSlider:false,
            qiniuModel:2,
            base64: '',
            curPage: 1,
            thumbnailPages: 0,
            thumbnail: [],
            codeText: '',
            codeImage: '',
        };
    },
    mounted:function(){
        let search=window.location.search,params=ADS.params(search),gid=params['gid'] || '',volume=params['volume'] || 1,page=params['page'] || 1;
        this.gid = gid;
        this.volume = Number(volume) || 1;
        this.page = Number(page) || 1;
        this.pathname = window.localStorage.getItem('pathname') || '';
        if(window.innerWidth < 1200){
            this.isIphone = true;
            this.qiniuModel = 0;
        }
        window.prev = Date.now(); 
        this.getImage();
    },
    methods:{
        loadImg(){
            let w = window.innerWidth;
            // this.flag = false;
        },
        goback(){
            this.$router.push('/'+this.pathname+'/gd/'+this.gid);
        },
        dragStart(ev){
            this.pointerX=ev.clientX;
            this.pointerY=ev.clientY;
            document.onmousemove = (e)=>{
                let nowX = 0,nowY=0;
                nowX = e.clientX - this.pointerX;
                nowY = e.clientY - this.pointerY;
                this.x = this.x + nowX;
                this.y = this.y + nowY;
                this.pointerX=e.clientX;
                this.pointerY=e.clientY;
            };
            document.onmouseup = (e) => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        },
        start(ev){
            let pointerX=ev.touches[0].clientX,dosX=0,self=this;
            let pointerY=ev.touches[0].clientY;
            document.ontouchmove = (e)=>{
                dosX = e.touches[0].clientX - pointerX;
            };
            document.ontouchend = (e) => {
                document.ontouchmove = null;
                document.ontouchend = null;
                if(dosX > 0){
                    self.prevPage();
                }else{
                    self.nextPage();
                }
            };
        },
        zoomIn(){//缩小
            this.scaleIndex = this.scaleIndex - 1;
        },
        zoomOut(){//放大
            this.scaleIndex = this.scaleIndex + 1;
        },
        getImage:async function(){//图片列表
            let data=await api.getAxios('catalog/imageList?catalogKey='+this.gid+'&volume=&siteKey='+this.stationKey+'&userRole='+this.role+'&userKey='+this.userId);
            if(data.status == 200){
                this.viewList = data.result;
                this.total = data.result.length;
                this.getImageDetail();
            }
        },
        getImageDetail:async function(){//图片详情
            this.flag = true;
            let data = await api.getAxios('catalog/image/detail?imageKey='+this.viewList[this.page-1]+'&userKey='+this.userId+'&siteKey='+this.stationKey);
            this.flag = false;
            if(data.status == 200){
                this.base64 = data.result.image;
            }else if(data.status == 301){
                this.codeImage = data.result;
            }else{
                this.$message({message: data.msg, type: 'warning'});
            }
        },
        async reshVertifyCode(){
            this.flag = true;
            let data = await api.getAxios('catalog/image/detail?imageKey='+this.viewList[this.page-1]+'&userKey='+this.userId);
            this.flag = false;
            if(data.status == 200){
                this.base64 = data.result.image;
            }else if(data.status == 301){
                this.codeImage = data.result;
            }else{
                this.$message({message: data.msg, type: 'warning'});
            }
        },
        async postVertifyCode(){//验证码校验
            let data = await api.postAxios('vertifyCode', {'userKey': this.userId, 'codeText': this.codeText});
            if(data.status == 200){
                this.getImageDetail();
                this.codeImage = '';
                this.codeText = '';
            }else{
                this.$message({message: data.msg, type: 'warning'});
            }
        },
        getThumbnail:async function(){//缩略图
            this.flag = true;
            let data = await api.getAxios('catalog/cutImage?catalogKey='+this.gid+'&volume='+this.volume+'&siteKey='+this.stationKey+'&userRole='+this.role+'&page='+this.curPage+'&limit=30');
            this.flag = false;
            if(data.status == 200){
                if(this.curPage == 1){
                    this.thumbnail = data.result.list;
                    this.thumbnailPages = data.result.pageNum;
                }else{
                    this.thumbnail = this.thumbnail.concat(data.result.list);
                }
            }
        },
        toggleThumbnail(){
            this.menuShow = !this.menuShow;
            if(this.menuShow && !this.thumbnail.length){
                this.getThumbnail()
            }
        },
        onScroll(e){
            if(Math.ceil(e.target.clientWidth + e.target.scrollLeft) >= e.target.scrollWidth){
                if(this.curPage < this.thumbnailPages){
                    console.log('到底了');
                    this.curPage = this.curPage + 1;
                    this.getThumbnail();
                }
            }
        },
        nextPage(){
            if(this.page < this.total){
                this.flag=true;
                this.page=this.page+1
            }
        },
        changePage(page){
            this.flag=true;
            this.page = page;
        },
        prevPage(){
            if(this.page > 1){
                this.flag=true;
                this.page=this.page-1
            }
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
        })
    },
    watch:{
        page(nv,ov){  
            if(Date.now() - window.prev >= 300){
                setTimeout(() => {
                    console.log(nv);
                    this.getImageDetail();
                    window.prev = Date.now();
                },300); 
            }
        },
    },
};
</script>
<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: rgba(0,0,0,.8);
}
.style1::-webkit-scrollbar{
    height: 4px;
	background-color: rgba(0,0,0,.8);
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: rgba(0,0,0,.8);
}

.style2::-webkit-scrollbar-track{
	border-radius: 5px;
	background-color: #fff;
}
.style2::-webkit-scrollbar{
	width: 4px;
	background-color: #fff;
}
.style2::-webkit-scrollbar-thumb{
	border-radius: 5px;
	background: #888;
}
.style2::-webkit-scrollbar-corner{
	background-color: #fff;
}
.wrap{
    position: fixed;
    top:0;
    right: 0;
    bottom: 0;
    left:0;
    // width: 100%;
    // height: 100%;
    background: #3f3f3f;
    font-size: 16px;
    text-align: left;
}
.center{
    height: 100%;
    margin: 0 auto;
}
.viewList{
    width: 100%;
    height: 100px;
    position: absolute;
    bottom: 50px;
    left: 0;
    background: rgba(0,0,0,.8);
    overflow-y: hidden;
    overflow-x: auto;
    display: flex;
    align-items: center;
    img{
        width: auto;
        height: 80px;
        padding: 5px;
        background: #fff;
        margin: 5px 10px;
        &.active{
            background: #358acd;
        }
    }
}
.sidebar{
    height: 50px;
    line-height: 50px;
    display: flex;
    justify-content: space-between;
    .sidebar_left{
        display: flex;
        width: calc(100% - 120px);
        .sliderBox{
            padding-top: 6px;
            width: calc(100% - 350px);
            margin-left: 20px;
            margin-right: 20px;
        }
        .total{
            height: 50px;
            line-height: 50px;
            color: #fff;
            margin-left: 20px;
        }
        .pageInput{
            margin-top: 6px;
            width: 150px;
        }
    }
    .sidebar_right{
        height: 50px;
        line-height: 50px;
        font-size: 30px;
        color: #fff;
        display: flex;
        align-content: center;
        padding-top: 10px;
        i{
            margin-left: 10px;
            cursor: pointer;
            &.active{
                color: #358acd;
            }
        }
        .btn{
            border: none;
            outline: none;
            height: 20px;
            line-height: 20px;
            color: #333;
            cursor: pointer;
            border-radius: 3px;
            background: #fff;
            margin-left: 10px;
            margin-top: 5px;
        }
    }
}
.main{
    position: relative;
    height: calc(100% - 50px);
    overflow: hidden;
    .view{
        height: 100%;
        display: block;
        margin: 0 auto;
    }
    .view_wrap{
        position: fixed;
        top: 0;
        right: 0;
        bottom: 100px;
        left: 0;
    }
    .prev{
        position: fixed;
        top: 50%;
        left: 10px;
        margin-top: -60px;
        cursor: pointer;
        width: 60px;
        height: 60px;
        line-height: 60px;
        border-radius: 50%;
        text-align: center;
        font-size: 60px;
        border: 1px solid #ddd;
        color: #ddd;
        i{
            font-size: 50px;
        }
        &.active{
            border: 1px solid #358acd;
            color: #358acd;
        }
    }
    .next{
        left: auto;
        right: 10px;
    }
}
.width100{
    width: 90%;
}
.viewList_xs{
    height: 100px;
}
.scroll{
    overflow-x: scroll;
}
.volume_wrap{
    height: 50px;
    line-height: 50px;
    display: inline-block;
}
.back{
    display: none;
}
.ocr_wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 60px;
    width: 200px;
    background: rgba(0,0,0,0.6);
    text-align: center;
    color: #fff;
    font-size: 12px;
    i{
        display: none;
        margin: 10px auto 0 auto;
        width: 60px;
        height: 6px;
        background: #ddd;
        border-radius: 3px;
        cursor: pointer;
        &.goBack{
            position: absolute;
            top: 20px;
            right: 20px;
            cursor: pointer;
            font-size: 20px;
            color: #fff;
            display: block;
            background: transparent;
            width: auto;
            height: auto;
            border-radius: 0;
            margin-top: 0;
        }
    }
    h3{
        font-weight: normal;
        font-size: 14px;
        margin: 20px 0 5px 0; 
    }
    .btn{
        color: #358acd;
        border: none;
        outline: none;
        background: transparent;
        font-size: 12px;
    }
    textarea{
        width: calc(100% - 20px);
        height: calc(100% - 100px);
        padding: 10px;
        border: none;
        outline: none;
        background: transparent;
        color: #fff;
        overflow-y: auto;
    }
}
@media screen and (max-width:1199px) and (min-width:600px){
    .back{
        display: block;
        margin: 5px 10px 0 10px;
        cursor: pointer;
        color: #358acd;
        font-size: 40px;
    }
    .width100{
        width: 100%;
    }
    .select{
        display: none;
    }
    .sliderBox{
        display: none;
    }
    .sidebar{
        .sidebar_right{
            margin-right: 10px;
        }
    }
}

@media screen and (max-width: 600px) {
    .back{
        display: block;
        margin: 5px 10px 0 10px;
        cursor: pointer;
        color: #358acd;
        font-size: 40px;
    }
    .width100{
        width: 100%;
    }
    .select{
        display: none;
    }
    .sliderBox{
        display: none;
    }
    img {
        max-width: 500%;
    }
    .sidebar{
        // display: none;
        padding: 0 5px;
        .total{
            margin-left: 5px;
        }
        .sidebar_left{
            .pageInput{
                width: 120px;
            }
        }
    }
    .viewList{
        img{
            margin: 5px 2px;
        }
    }
    .viewList_xs{
        max-width: 1700px;
        min-width: 800px;
    }
    .main{
        .prev{
            // display: none;
        }
        .next{
            right: 0;
        }
        .view_wrap{
            display: none
        }
    }
    .ocr_wrap{
        position: fixed;
        top: auto;
        right: 0;
        bottom: 60px;
        left:0;
        width: 100%;
        display: none;
        i{
            display: block;
        }
        h3{
            margin-top: 5px;
        }
        textarea{
            height: 200px;
        }
    }
    .el-icon-menu{
        display: none;
    }
}

// 验证码
.codeText-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100000;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    .codeText-box{
        background: #fff;
        border-radius: 5px;
        padding: 20px;
        .codeText{
            display: block;
            margin: 10px auto;
        }
        .codeText-btn{
            display: flex;
            align-items: center;
            input{
                width: 100px;
                height: 30px;
                line-height: 30px;
                border: 1px solid #ddd;
                outline: none;
                text-indent: 10px;
                border-radius: 3px;
            }
            button{
                outline: none;
                border: none;
                color: #fff;
                width: 60px;
                height: 30px;
                line-height: 30px;
                cursor: pointer;
                background: #358acd;
                margin-left: 10px;
                border-radius: 3px;
            }
        }
    }
}
</style>

