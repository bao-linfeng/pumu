<template>
    <div class="attachment-wrap">
        <div class="attachment-box">
            <div class="head-box">
                <h3 class="title">{{role >= 1 && role <= 3 ? '审核' : '补充'}}</h3>
                <img class="close" @click="close(false)" src="../../assets/close.svg" alt="">
            </div>
            <div class="content-box">
                <div class="memo-box">
                    <h3 class="title">{{role >= 1 && role <= 3 ? '补充说明资料' : '补充说明'}}</h3>
                    <p>{{needFillFields.join()}}</p>
                </div>
                <div class="memo-box">
                    <div class="memo-left">
                        <h3 class="title marginR20">备注</h3>
                        <el-button v-if="role < 1 || role > 3" type="primary" size="medium" @click="saveRemark">保存</el-button>
                    </div>
                    <textarea class="memo" v-model="remark" :disabled="role >= 1 && role <= 3"></textarea>
                </div>
                <div class="content-head">
                    <h3 class="title">{{role >= 1 && role <= 3 ? '补充影像列表' : '补充影像'}} ({{imageList.length}})</h3>
                    <div class="head-left" v-if="role < 1 || role > 3">
                        <div class="upload-input">
                            <input type="file" accept="image/*" multiple @change="upload" />
                        </div>
                        <!-- <vxe-button v-if="imageList.length" content="关联影像" @click="linkSource"></vxe-button> -->
                    </div>
                </div>
                <div class="img-wrap style1" :class="{active: needFillFields.length}">
                    <div class="img-box" v-for="(item, index) in imageList" :key="index" @click="openURL(item)">
                        <img class="image" v-if="item.fileName.indexOf('.pdf') > -1 || item.fileName.indexOf('.doc') > -1 || item.fileName.indexOf('.docx') > -1" :src="require('../../assets/'+(item.fileName.indexOf('.pdf') > -1 ? 'pdf' : 'word')+'.svg')" alt="">
                        <img v-else class="image" @click="previewImages(index)" :src="item.gcFile && item.gcFile.indexOf('https://cdn-icare.qingtime.cn') > -1 ? item.gcFile : (baseURL+item.filePath)" alt="" />
                        <i class="el-icon-delete" v-if="role < 1 || role > 3" @click.stop="deleteSource(index, item)"></i>
                        <p class="name">{{item.fileName}}</p>
                    </div>
                </div>
                <div class="condition-wrap" v-if="role >= 1 && role <= 3 && detail.gcStatus == '23'">
                    <div class="condition-left">
                        <h3 class="title">谱状态更新<i class="red">*</i></h3>
                        <el-select class="width150 marginR10" v-model="condition" placeholder="谱目状态" size="small">
                            <el-option
                                v-for="item in conditionList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                    <textarea class="memo" v-model="gcStatusRemark" placeholder="此处填写谱状态更改说明信息"></textarea>
                </div>
            </div>
            <div class="foot-box" v-if="(role >= 1 && role <= 3 && detail.gcStatus == '23') || ((role < 1 || role > 3) && detail.gcStatus == '20')">
                <el-button size="medium" @click="close(false)">取消</el-button>
                <el-button type="primary" size="medium" @click="saveData">{{role >= 1 && role <= 3 ? '审核' : '提交审核'}}</el-button>
            </div>
        </div>
        <div class="preview-images-wrap" v-if="simplePath">
            <div class="large-image-box">
                <div v-if="currentIndex >= 1" class="prev-box" @click="prevImage">
                    <i class="prev el-icon-arrow-left"></i>
                </div>
                <img class="large-image" :src="imageList[currentIndex].gcFile && imageList[currentIndex].gcFile.indexOf('https://cdn-icare.qingtime.cn') > -1 ? imageList[currentIndex].gcFile : baseURL+simplePath" alt="" />
                <div v-if="currentIndex <= imageList.length - 2" class="prev-box next-box" @click="nextImage">
                    <i class="prev el-icon-arrow-right"></i>
                </div>
                <i class="close el-icon-close" @click="closePreview"></i>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "attachmentModule",
    props:{
        gid:{
            type: String
        },
    },
    components: {

    },
    data: () => {
        return {
            needFillFields: [],
            remark: '',
            imageList: [],
            currentIndex: -1,
            simplePath: '',
            gcStatusRemark: '',
            conditionList: [{'label': 'nf|可拍', 'value': 'nf'}, {'label': 'm|待议', 'value': 'm'}, {'label': 'd|重复', 'value': 'd'}, {'label': 'r|无效', 'value': 'r'}],
            condition: '',
            detail: {},
            gcStatusO: {
                '0': '', //无状态 初始提交时，此字段为0（非null）
                '10': 'r', // 无效普 r
                '15': 'd', // 重复谱 d
                '20': 'm', // 待议谱 m
                '23': '', // 待议复审 待议谱被重新提交
                '25': '', // 只针对待议谱，逾期后，设置此值，设置后不再进行调整
                '30': 'nf', // 是指审核通过后，可拍摄的谱 nf
                '32': '', // 拍摄过程中，因为修改敏感字段被重新复审，复合后，可重置 此谱为有效（30）或无效
                '35': '', // 开放时，设置此值，被认领后，则调整此值为 40
                '40': '', // 开放谱被认领
                '50': '', // 整谱全部拍摄结束（为最终状态，入库封存）
                '': '',
            },
            statusO: {
                'r': '10',
                'd': '15',
                'm': '20',
                'nf': '30'
            }
        };
    },
    mounted:function(){
        this.getGenealogyDetail();
        this.getImage();
    },
    methods:{
        openURL(data){
            if(data.gcFile && data.gcFile.indexOf('https://cdn-icare.qingtime.cn') > -1){
                if(data.gcFile.indexOf('.pdf') > -1){
                    window.open(data.gcFile);
                }
                if(data.gcFile.indexOf('.doc') > -1 || data.gcFile.indexOf('.docx') > -1){
                    // window.open(data.gcFile);
                    window.open('https://view.officeapps.live.com/op/view.aspx?src='+data.gcFile);
                }
            }else{
                if(data.filePath.indexOf('.pdf') > -1){
                    window.open(this.baseURL+data.filePath);
                }
                if(data.filePath.indexOf('.doc') > -1 || data.filePath.indexOf('.docx') > -1){
                    // window.open(this.baseURL+data.filePath);
                    window.open('https://view.officeapps.live.com/op/view.aspx?src='+(this.baseURL+data.filePath));
                }
            }
        },
        saveData(){
            if(this.role >= 1 && this.role <= 3){
                if(!this.condition){
                    return this.$XModal.message({ message: '请选择谱目状态，在审核', status: 'warning' });
                }
            }
            this.$confirm(this.role >= 1 && this.role <= 3 ? '确认要审核该谱目吗?' : '确认要提交该谱目吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.patchStatus(this.role >= 1 && this.role <= 3 ? this.statusO[this.condition] : '23');
            }).catch(() => {});
        },
        async patchStatus(gcStatus){//待议谱修改
            let result = await api.patchAxios('v3/review/catalog/status',{'catalogKey': this.gid, 'gcStatus': gcStatus, 'condition': this.condition, 'gcStatusRemark': this.gcStatusRemark,'orgKey': this.orgId, 'userKey': this.userId, 'siteKey': this.stationKey});
            if(result.status == 200){
                this.$XModal.message({ message: this.role >= 1 && this.role <= 3 ? '审核成功' : '提交成功', status: 'success' });
                this.close(true);
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        saveRemark(){
            this.$confirm('确认要修改备注信息吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.changeDataStatus();
            }).catch(() => {});
        },
        async changeDataStatus(){//编辑
            let result = await api.patchAxios('data/edit',{'dataKey': this.gid, 'dataObj': {'remark': this.remark}, 'userKey': this.userId, 'siteKey': this.stationKey});
            if(result.status == 200){
                this.$XModal.message({ message: '备注修改成功', status: 'success' });
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        async getImage(){//图片列表
            let data = await api.getAxios('catalog/file?page=1&limit=100&catalogKey='+this.gid);
            if(data.status == 200){
                this.imageList = data.result.list;
            }
        },
        close(flag){
            this.$emit('close', flag);
        },
        async getGenealogyDetail(){
            const result = await api.getAxios('data/detail?dataKey='+this.gid);
            if(result.status == 200){
                this.detail = result.data;
                this.needFillFields = result.data.needFillFields || [];
                this.remark = result.data.remark;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        closePreview(){
            this.simplePath = '';
            this.currentIndex = -1;
        },
        previewImages(i){
            this.currentIndex = i;
            this.simplePath = this.imageList[i].filePath;
        },
        prevImage(){
            if(this.currentIndex >= 1){
                this.currentIndex = this.currentIndex - 1;
                this.simplePath = this.imageList[this.currentIndex].filePath;
            }
        },
        nextImage(){
            if(this.currentIndex <= this.imageList.length - 2){
                this.currentIndex = this.currentIndex + 1;
                this.simplePath = this.imageList[this.currentIndex].filePath;
                console.log(this.currentIndex, this.imageList);
            }
        },
        upload(e){
            let files = Array.from(e.target.files);
            this.uploadImage(files);
        },
        uploadImage(files){
            if(files && files.length){
                let file = files.shift();
                let fd = new FormData();
                fd.append('file', file);
                this.uploadApi(fd, files);
            }
        },
        async uploadApi(fd, files){
            let result = await api.postAxios('upload', fd);
            if(result.statusCode == 200){
                this.linkSource(result.filePath, result.originalName, result.simplePath, files);
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
        async deleteFile(filePath){// 删除文件
            let result = await api.deleteAxios('singleFile',{'filePath': filePath, 'userKey': this.userId, 'siteKey': this.stationKey});
            if(result.status == 200){
                // this.$XModal.message({ message: '图片删除成功', status: 'success' });
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        async linkSource(filePath, originalName, simplePath, files){//文件关联家谱
            let data = await api.postAxios('catalog/file',{'catalogKey': this.gid, 'userKey': this.userId, 'siteKey': this.stationKey, 'filePath': filePath,'fileName': originalName});
            if(data.status == 200){
                this.$message({message: '影像资料关联成功',type: 'success'});
                this.imageList.push({'_key': data.result, 'filePath': simplePath, 'fileName': originalName, 'simplePath': simplePath});
                if(files && files.length){
                    this.uploadImage(files);
                }
            }else{
                this.$message({message: '影像资料关联失败，请重新关联',type: 'warning'});
            }
        },
        async deleteSource(i, data){
            let result = await api.deleteAxios('catalog/file',{'fileKey': data._key,'userKey': this.userId,'siteKey': this.stationKey});
            if(result.status == 200){
                this.imageList.splice(i, 1);
                // this.deleteFile(data.gcFile);
            }else{
                this.$message({message: '删除影像关联出错，请重新删除',type: 'warning'});
            }
        },
    },
    computed: {
        ...mapState({
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
            stationKey: state => state.nav.stationKey,
            userId: state => state.nav.userId,
            baseURL: state => state.nav.baseURL,
            role: state => state.nav.role,
            orgId: state => state.nav.orgId,
        })
    },
    watch: {
        'simplePath': function(nv, ov){
            this.$emit('prev', nv);
        }
    },
};
</script>

<style scoped lang="scss">
.attachment-wrap{
    position: relative;
    height: 100%;
    .attachment-box{
        position: relative;
        width: 600px;
        // max-height: calc(100% - 40px);
        height: calc(100% - 40px);
        padding: 0 20px;
        background: #fff;
        border-radius: 5px;
        margin-top: 20px;
        .head-box{
            position: relative;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            .close{
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                cursor: pointer;
            }
        }
    }
    .content-box{
        position: relative;
        width: 100%;
        height: calc(100% - 110px);
        .memo-box{
            position: relative;
            width: 100%;
            .memo-left{
                position: relative;
                height: 40px;
                display: flex;
                align-items: center;
            }
            .title{
                height: 40px;
                line-height: 40px;
            }
            .memo{
                position: relative;
                width: calc(100% - 12px);
                height: 50px;
                outline: none;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
        }
        .content-head{
            position: relative;
            display: flex;
            align-items: center;
            height: 40px;
            .head-left{
                display: flex;
                align-items: center;
                margin-left: 20px;
            }
        }
        .img-wrap{
            position: relative;
            height: calc(100% - 320px);
            overflow-y: auto;
            display: flex;
            align-content: flex-start;
            flex-wrap: wrap;
            &.active{
                height: calc(100% - 340px);
            }
            .img-box{
                position: relative;
                margin: 0 10px 10px 0;
                background: #ddd;
                padding: 5px;
                .image{
                    position: relative;
                    height: 100px;
                    display: block;
                    cursor: pointer;
                }
                i{
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    cursor: pointer;
                    color: #f00;
                }
                p{
                    font-size: 14px;
                    margin-top: 5px;
                }
            }
        }
        .condition-wrap{
            position: relative;
            width: 100%;
            display: flex;
            margin-top: 10px;
            .condition-left{
                .title{
                    margin-bottom: 20px;
                }
            }
            .memo{
                position: relative;
                width: calc(100% - 232px);
                height: 100px;
                outline: none;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 10px;
            }
        }
    }
    .foot-box{
        position: relative;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.preview-images-wrap{
    position: fixed;
    top: 0;
    right: 0;
    // bottom: 0;
    // left: 0;
    height: calc(100% - 10px);
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    padding: 5px;
    .large-image-box{
        position: relative;
        height: 100%;
        display: inline-block;
    }
    .large-image{
        position: relative;
        height: 100%;
        display: block;
    }
    .prev-box{
        position: absolute;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0,0,0,0.3);
        border-radius: 50%;
        cursor: pointer;
        z-index: 100;
    }
    .next-box{
        left: auto;
        right: 20px;
    }
    .prev{
        font-size: 40px;
        color: #fff;
    }
    .close{
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 40px;
        cursor: pointer;
        color: #f00;
    }
}
.width200{
    width: 200px;
}
.marginL10{
    margin-right: 10px;
}
.marginR20{
    margin-right: 20px;
}
.red{
    color: #f00;
}
</style>

