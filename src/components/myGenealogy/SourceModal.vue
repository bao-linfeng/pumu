<template>
    <div class="sourceModal">
        <div class="form">
            <div class="tab_wrap">
                <span v-for="(item,index) in tab" :key="'tab'+index" :class="{active:tabIndex==index}" @click="tabIndex=index">{{item}}</span>
            </div>
            <i class="el-icon-close close" @click="close"></i>
            <div class="fileSource" v-show="tabIndex===0">
                <div class="box">
                    <el-upload
                        class="upload-demo"
                        :action="'https://pumudata.qingtime.cn/upload'"
                        name="file"
                        accept=".zip,.rar"
                        :show-file-list="false"
                        :on-success="handleSuccess"
                        :before-upload="beforeAvatarUpload"
                        >
                        <el-button size="small" type="primary">选择上传文件</el-button>
                        <div>只能上传zip,rar文件，且不超过100M</div>
                    </el-upload>
                </div>
                <p class="label">已上传影像资源:</p>
                <div class="source_wrap">
                    <div v-for="(item,index) in sourceList" :key="'sourceList'+index">
                        <a :href="'https://pumudata.qingtime.cn'+item.filePath" target="_blank">{{item.fileName}}</a>
                        <i class="el-icon-close" @click="deleteSource(index,item._key)"></i>
                    </div>
                </div>
            </div>
            <div class="imageSource" v-show="tabIndex===1"> 
                <div class="toolbar">
                    <el-select :value="volume" @change="changeVolume" placeholder="请选择">
                        <el-option
                            v-for="item in volumes"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <div class="toolbar_right">
                        <el-checkbox :value="allCheck" @change="allCheckbox(allCheck)">全选</el-checkbox>
                        <div class="upload_wrap">
                            <i class="el-icon-plus"></i>
                            <span>上传</span>
                            <input type="file" name="avatar" accept="image/png,image/jpeg,image/jpg" @change="uploadImg" multiple   />
                        </div>
                        <el-button icon="el-icon-delete" round @click="deleteImage">删除</el-button>
                    </div>
                </div>
                <div class="image_wrap style1">
                    <div class="image_box" v-for="(item,index) in imagesList" :key="'imagesList'+index" @click="changeCheckbox(item.select,index)">
                        <img :src="item.myURL+'?imageMogr2/auto-orient/thumbnail/150x80/format/jpeg'" alt="影像资料" @change="changeCheckbox(item.select,index)" />
                        <i v-show="item['select']" class="el-icon-success"></i>
                    </div>
                </div>
                <el-button type="primary" class="btn" round @click="linkImage">提交</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import uploadFile from "../upload/upload.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "sourceModal",
    props:{
        gid:{
            type:String,
        },
        gvolume:{
            type:Number,
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
            limit:100,
            pages:0,
            total:0,
            volume:1,
            allCheck:false,
            volumes:[{label:'第一卷',value:1},{label:'第二卷',value:2},{label:'第三卷',value:3},{label:'第四卷',value:4},{label:'第五卷',value:5},{label:'第六卷',value:6},{label:'第七卷',value:7},{label:'第八卷',value:8},{label:'第九卷',value:9},{label:'第十卷',value:10}],
            imagesList:[],
            qiniuToken:'',
        };
    },
    mounted:function(){
        let volumes = [];
       this.token= window.localStorage.getItem('token') || '';
       this.userKey = window.localStorage.getItem('userId') || '';
       this.siteKey = window.localStorage.getItem('stationKey') || '';
       this.getSource();
       this.getImage();
       this.qiniuToken ? null : this.getToken();
       for(let i=0;i<this.gvolume;i++){
           volumes.push({label:'第'+(i+1)+'卷',value:i+1});
       }
       this.volumes = volumes;
    },
    methods:{
        changeVolume(data){
            // console.log(data);
            this.volume = data;
            this.getImage();
        },
        beforeAvatarUpload(file) {
            const isLt2M = file.size / 1024 / 1024 < 100;
            if (!isLt2M) {
                this.$message.error('上传文件大小不能超过 100MB!');
            }
            return isLt2M;
        },
        uploadImg: async function(e) {
            let files = Array.from(e.target.files);
            this.uploadImage(files);
        },
        uploadImage(files){
            if(files && files.length){
                let file = files.shift();
                uploadFile.uploadImg(file,(str)=>{
                    console.log(str);
                    this.imagesList.push({'myURL':str,'select':false});
                    this.uploadImage(files);
                },this.qiniuToken);
            }
        },
        getToken: async function(){
            let data=await api.getAxios('https://baokudata.qingtime.cn/sgbh/upTokenQiniu/getQiNiuUpToken?token='+this.token,true);
            this.qiniuToken = data.result || '';
        },
        close(){
            this.$emit('close-source',false);
        },
        save(){
            this.$emit('save-source',false);
        },
        handleSuccess(response, file, fileList){
            this.linkSource(response.filePath,response.originalName,response.simplePath);
        },
        allCheckbox(flag){//全选、全部选
            if(this.imagesList && this.imagesList.length){
                this.allCheck = !flag;
                if(this.allCheck){
                this.imagesList.map((item)=>{item['select']=true});
                }else{
                this.imagesList.map((item)=>{item['select']=false});
                }
            }
        },
        changeCheckbox(flag,index){
            this.imagesList[index].select = !flag;
        },
        deleteImage(){//删除图片
            let imagesList=[];
            if(this.imagesList && this.imagesList.length){
                this.imagesList.map((item,index)=>{
                    if(!item.select){
                        imagesList.push(item);
                    }
                });
                this.imagesList = imagesList;
            }
        },
        linkSource:async function(filePath,fileName,simplePath){//文件关联家谱
            let data=await api.postAxios('catalog/file',{'catalogKey':this.gid,'userKey':this.userKey,'siteKey':this.siteKey,'filePath':filePath,'fileName':fileName});
            if(data.status == 200){
                this.$message({message: '影像资料关联成功',type: 'success'});
                this.sourceList.push({'filePath':simplePath,'fileName':fileName,'_key':data.result});
            }else{
                this.$message({message: '影像资料关联失败，请重新关联',type: 'warning'});
            }
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
            let data=await api.getAxios('catalog/image?page='+this.page+'&limit='+this.limit+'&catalogKey='+this.gid+'&volume='+this.volume);
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
        linkImage:async function(filePath,fileName){//影像关联家谱 单谱 七牛
            let imageArr = [];
            if(this.imagesList && this.imagesList.length){
                this.imagesList.map((item)=>{
                    imageArr.push(item.myURL);
                });
            }
            let data=await api.postAxios('catalog/image',{'catalogKey':this.gid,'userKey':this.userKey,'siteKey':this.siteKey,'imageArr':imageArr,'volume':this.volume});
            if(data.status == 200){
                this.$message({message: '影像资料关联成功',type: 'success'});
                //this.sourceList.push({'filePath':filePath,'fileName':fileName,'_key':data.result});
            }else{
                this.$message({message: '影像资料关联失败，请重新关联',type: 'warning'});
            }
        },
        deleteSource:async function(index,fileKey){//删除
            let data=await api.deleteAxios('catalog/file',{'fileKey':fileKey,'userKey':this.userKey,'siteKey':this.siteKey});
            if(data.status == 200){
                this.sourceList.splice(index,1);
            }else{
                this.$message({message: '删除影像关联出错，请重新删除',type: 'warning'});
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
.sourceModal{
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
        .box{
            width: 300px;
            margin: 20px auto;
        }
        .label{
            color: #344B5A;
            padding: 10px 0;
            text-align: left;
        }
        .source_wrap{
            display: flex;
            flex-wrap:wrap;
            div{
                position: relative;
                display: inline-block;
                width: 108px;
                height: 38px;
                line-height: 38px;
                background: #DEF1FF;
                border: 1px solid #4C95FF;
                border-radius: 6px;
                margin-bottom: 10px;
                margin-right: 10px;
                color: #4C95FF;
                font-size: 14px;
                overflow: hidden;
                padding-right: 20px;
                a{
                    color: #4C95FF;
                }
                i{
                    position: absolute;
                    top: 12px;
                    right: 5px;
                    cursor: pointer;
                }
                &:nth-of-type(6n){
                    margin-right: 0;
                }
            }
        }
        .imageSource{
            .toolbar{
                display: flex;
                justify-content: space-between;
                .toolbar_right{
                    display: flex;
                    height: 40px;
                    line-height: 40px;
                    .upload_wrap{
                        position: relative;
                        width: 100px;
                        height: 40px;
                        line-height: 40px;
                        border-radius: 20px;
                        background: #4C95FF;
                        color: #fff;
                        cursor: pointer;
                        margin: 0 20px;
                        overflow: hidden;
                        input{
                            opacity: 0;
                            position: absolute;
                            top: 0;
                            right: 0;
                            bottom: 0;
                            left: 0;
                        }
                        i{
                            margin-right: 5px;
                        }
                    }
                }
            }
            .image_wrap{
                background: #F6FAFD;
                padding: 10px;
                text-align: left;
                margin: 20px auto;
                max-height: 300px;
                overflow-y: auto;
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
                    }
                    i{
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%,-50%);
                        color: #4C95FF;
                    }
                }
            }
        }
        .btn{
            width: 224px;
            // height: 40px;
            // line-height: 40px;
            // text-align: center;
            // border-radius: 20px;
            // background: #4C95FF;
            // display: block;
            // margin: 20px auto;
            // outline: none;
            // border: none;
            // color: #fff;
            // cursor: pointer;
        }
    }
}
</style>

