<template>
    <div class="annex-modal-wrap">
        <div class="annex-modal-box">
            <div class="annex-modal-title">
                <h3>附件({{gid}})</h3>
                <i class="el-icon-close" @click="close"></i>
            </div>
            <!-- <div class="upload_wrap" v-if="active == 3 && createUser == userId">
                <i class="el-icon-plus"></i>
                <span>上传</span>
                <input type="file" name="avatar" accept="image/png,image/jpeg,image/jpg" @change="uploadImg" multiple  />
            </div> -->
            <p class="title">请前往 待议谱 模块补充资料</p>
            <h3 class="title">补充影像</h3>
            <div class="image_wrap style1">
                <div class="image_box" v-for="(item,index) in sourceList" :key="'sourceList'+index">
                    <!-- <a :href="item.gcFile" target="_blank"></a> -->
                    <img @click="previewImages(index)" :src="item.gcFile && item.gcFile.indexOf('https://cdn-icare.qingtime.cn') > -1 ? item.gcFile : (baseURL+item.filePath)" alt="影像资料" />
                    <!-- <i class="el-icon-close" v-if="active == 3 && createUser == userId" @click="deleteSource(index,item._key)"></i> -->
                </div>
            </div>
            <div v-if="row && row.needFillFields && row.needFill">
                <h3 class="title">补充字段</h3>
                <p>{{row && row.needFillFields && row.needFillFields.join(',')}}</p>
            </div>
            <div v-if="row && row.remark && row.needFill">
                <h3 class="title">打回备注</h3>
                <p>{{row && row.remark}}</p>
            </div>
            <div v-if="row && row.setInReason">
                <h3 class="title">待提交原因</h3>
                <p>{{row && row.setInReason}}</p>
            </div>
        </div>
        <div class="preview-images-wrap" v-if="simplePath">
            <i class="left el-icon-arrow-left" :class="{active: currentIndex === 0}" @click="previewImages(currentIndex - 1)"></i>
            <img class="large-image" :src="simplePath" alt="" />
            <i class="close el-icon-close" @click="closePreview"></i>
            <i class="left right el-icon-arrow-right" :class="{active: currentIndex === sourceList.length - 1}" @click="previewImages(currentIndex + 1)"></i>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import uploadFile from "../upload/upload.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "annexModal",
    props:{
        gid:{
            type: String,
        },
        active:{
            type: Number,
        },
        createUser:{
            type: String,
        },
        row: {
            type: Object,
        }
    },
    data: () => {
        return {
            qiniuToken: '',
            sourceList: [],
            currentIndex: -1,
            simplePath: '',
        };
    },
    mounted:function(){
        this.getImage();
        this.qiniuToken ? null : this.getToken();
    },
    methods:{
        closePreview(){
            this.simplePath = '';
            this.currentIndex = -1;
        },
        previewImages(i){
            console.log(i);
            if(i >= 0 && i <= this.sourceList.length - 1){
                this.currentIndex = i;
                this.simplePath = this.sourceList[i].gcFile;
            }
        },
        getToken: async function(){
            let data=await api.getAxios('https://baokudata.qingtime.cn/sgbh/upTokenQiniu/getQiNiuUpToken?token='+this.TOKEN,true);
            this.qiniuToken = data.result || '';
        },
        close(){
            this.$emit('close-annex',false);
        },
        getImage:async function(type=true){//图片列表
            let data=await api.getAxios('catalog/file?page=1&limit=100&catalogKey='+this.gid);
            if(data.status == 200){
                this.sourceList = data.result.list;
            }
        },
        uploadImg: async function(e) {
            let files = Array.from(e.target.files);
            this.uploadImage(files);
        },
        uploadImage(files){
            if(files && files.length){
                let file = files.shift();
                uploadFile.uploadImg(file,(str)=>{
                    this.linkSource(str,file.name);
                    this.uploadImage(files);
                },this.qiniuToken);
            }
        },
        linkSource:async function(filePath,fileName){//文件关联家谱
            let data=await api.postAxios('catalog/file',{'catalogKey':this.gid,'userKey':this.userId,'siteKey':this.stationKey,'filePath':filePath,'fileName':fileName});
            if(data.status == 200){
                this.$message({message: '影像资料关联成功',type: 'success'});
                this.sourceList.push({'gcFile':filePath,'fileName':fileName,'_key':data.result});
            }else{
                this.$message({message: '影像资料关联失败，请重新关联',type: 'warning'});
            }
        },
        deleteSource:async function(index,fileKey){//删除
            let data=await api.deleteAxios('catalog/file',{'fileKey':fileKey,'userKey':this.userId,'siteKey':this.stationKey});
            if(data.status == 200){
                this.sourceList.splice(index,1);
            }else{
                this.$message({message: '删除影像关联出错，请重新删除',type: 'warning'});
            }
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            baseURL: state => state.nav.baseURL,
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
.annex-modal-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    .annex-modal-box{
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
    }
}
.annex-modal-title{
    position: relative;
    width: 600px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    i{
        position: absolute;
        top: 10px;
        right: 0;
        font-size: 20px;
        cursor: pointer;
    }
}
.upload_wrap{
    position: relative;
    width: 100px;
    height: 40px;
    line-height: 40px;
    border-radius: 20px;
    background: #4C95FF;
    color: #fff;
    cursor: pointer;
    overflow: hidden;
    text-align: center;
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
.image_wrap{
    background: #F6FAFD;
    padding: 10px;
    margin: 0 auto;
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    .image_box{
        position: relative;
        width: 100px;
        height: 100px;
        margin: 10px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        background-color: #f1f1f1;
        img{
            max-width: 100%;
            max-height: 100%;
            cursor: pointer;
        }
        i{
            position: absolute;
            top: 5px;
            right: 5px;
            font-size: 20px;
            cursor: pointer;
        }
    }
}
.title{
    margin: 10px 0 10px 10px;
}
.preview-images-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    .large-image{
        position: relative;
        height: 100%;
        display: block;
        cursor: pointer;
    }
    .close{
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 40px;
        cursor: pointer;
        color: #fff;
    }
    .left{
        position: absolute;
        color: #fff;
        font-size: 40px;
        cursor: pointer;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        &.active{
            display: none;
        }
    }
    .right{
        left: auto;
        right: 20px;
    }
}
</style>

