<template>
    <div class="SourcePrevModal">
        <div class="form">
            <div class="tab_wrap">
                <span v-for="(item,index) in tab" :key="'tab'+index" :class="{active:tabIndex==index}" @click="tabIndex=index">{{item}}</span>
            </div>
            <i class="el-icon-close close" @click="close"></i>
            <div class="imageSource" v-show="tabIndex===0">
                <div class="image_wrap style1">
                    <a :href="'https://pukudata.qingtime.cn'+item.filePath" v-for="(item,index) in sourceList" :key="'sourceList'+index">{{item.fileName}}</a>
                </div>
            </div>
            <div class="imageSource" v-show="tabIndex===1"> 
                <div class="image_wrap style1">
                    <div class="image_box" v-for="(item,index) in imagesList" :key="'imagesList'+index" @click="prevImage(index)">
                        <img :src="item.myURL+'?imageMogr2/auto-orient/thumbnail/150x80/format/jpeg'" alt="影像资料" />
                    </div>
                </div>
            </div>
        </div>
        <div class="prev_wrap" v-if="isPrev">
            <i class="el-icon-caret-left" @click="prev"></i>
            <img :src="imagesList[prevPage].myURL" alt="影像资料" />
            <i class="el-icon-caret-right right" @click="next"></i>
            <i class="el-icon-close close" @click="isPrev=false"></i>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "SourcePrevModal",
    props:{
        data:{
            type:Array,
        },
        gid:{
            type:String,
        },
        siteId:{
            type:String,
        },
    },
    data: () => {
        return {
            tab:['整体上传','分页上传'],
            tabIndex:0,
            sourceList:[],
            userKey:'',
            siteKey:'',
            page:1,
            limit:1000,
            pages:0,
            total:0,
            imagesList:[],
            isPrev:false,
            prevPage:0,
        };
    },
    mounted:function(){
       this.token= window.localStorage.getItem('token') || '';
       this.userKey = window.localStorage.getItem('userId') || '';
       this.siteKey = this.siteId || window.localStorage.getItem('stationKey') || '';
       this.getSource();
       this.getImage();
    },
    methods:{
        close(){
            this.$emit('close-source',false);
        },
        getSource:async function(type=true){//资源列表
            let data=await api.getAxios('catalog/file?page='+this.page+'&limit='+this.limit+'&catalogKey='+this.gid);
            if(data.status == 200){
                if(type){
                    this.sourceList = data.result.list;
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                }
            }
        },
        getImage:async function(type=true){//图片列表
            let data=await api.getAxios('catalog/image?page='+this.page+'&limit='+this.limit+'&catalogKey='+this.gid);
            if(data.status == 200){
                if(type){
                    let imagesList = data.result.list;
                    imagesList && imagesList.length ? imagesList.map((item)=>{item['select']=false}) : null;
                    this.imagesList = imagesList;
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                }
            }
        },
        prevImage(index){
            this.isPrev = true;
            this.prevPage = index;
        },
        next(){
            let l=this.imagesList.length;
            if(this.prevPage < l){
                this.prevPage = this.prevPage + 1;
            }
        },
        prev(){
            if(this.prevPage > 0){
                this.prevPage = this.prevPage - 1;
            }
        },
    },
    computed: {
        ...mapState({
            APIURL: state => state.nav.APIURL,
        })
    },
};
</script>
<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #F6FAFD;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #F6FAFD;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: #F6FAFD;
}
.SourcePrevModal{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
    .form{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 720px;
        padding: 65px 50px 20px 50px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        .tab_wrap{
            position: absolute;
            top: 0;
            right: 0;
            height: 54px;
            line-height: 54px;
            left: 0;
            font-size: 18px;
            span{
                display: inline-block;
                color: #7E8E98;
                margin: 0 10px;
                cursor: pointer;
                &.active{
                    color: #344B5A;
                    border-bottom: 2px solid #4C95FF;
                }
            }
        }
        i.close{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .imageSource{
            .image_wrap{
                background: #F6FAFD;
                padding: 10px;
                text-align: left;
                margin: 20px auto;
                max-height: 300px;
                overflow-y: auto;
                a{
                    text-align: left;
                    height: 30px;
                    line-height: 30px;
                    color: #4C95FF;
                    display: block;
                }
                .image_box{
                    position: relative;
                    width: 95px;
                    height: 50px;
                    padding: 5px;
                    background: #fff;
                    margin: 5px;
                    display: inline-block;
                    img{
                        width: 100%;
                        height: 100%;
                        cursor: pointer;
                    }
                }
            }
        }
    }
    .prev_wrap{
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        text-align: center;
        i{
            position: absolute;
            font-size: 80px;
            color: #4C95FF;
            top: 50%;
            transform: translateY(-50%);
            left: 20px;
            cursor: pointer;
            &.right{
                left: auto;
                right: 20px;
            }
            &.close{
                top: 20px;
                right: 20px;
                left: auto;
                transform: translateY(0);
                font-size: 40px;
            }
        }
        img{
            height: 100%;
        }
    }
}
</style>

