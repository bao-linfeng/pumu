<template>
    <DragModule class="reshoot-drag">
        <div class="reshoot-wrap" @keyup.stop="">
            <div class="head-box">
                <h3 class="title">单卷打回快速处理</h3>
                <!-- <img class="close" @click="close(false)" src="../../assets/close.svg" alt=""> -->
            </div>
            <div class="content-box">
                <div class="box">
                    <label class="label" for="">当前已选择影像页序号：</label>
                    <el-input class="width200" v-model="index" placeholder="请输入拍数" disabled></el-input>
                </div>
                <div class="box">
                    <label class="label" for="">当前已选择影像页名称：</label>
                    <i class="image-name">{{imageURL.substr(imageURL.lastIndexOf('/') + 1, imageURL.length)}}</i>
                </div>
                <div class="box">
                    <label class="label block" for="">请选择操作：</label>
                    <el-radio-group v-model="type">
                        <el-radio :label="2">覆盖当前影像页</el-radio>
                        <el-radio :label="1">前插影像页</el-radio>
                        <el-radio :label="3">后插影像页</el-radio>
                        <el-radio :label="4">删除影像页</el-radio>
                    </el-radio-group>
                </div>
                <div class="box active">
                    <div class="update-box" v-if="type != 4">
                        <input class="input" type="file" accept="image/*" @change="uploadImage" />
                        <i class="i">点击上传影像</i>
                    </div>
                    <div class="explain-wrap">
                        <div class="img-box" @click="handleOpenNewView">
                            <img :src="type == 4 ? imageURL : url" alt="" />
                        </div>
                        <div class="explain-box">
                            <h3>操作说明</h3>
                            <p>1.覆盖：新上传的影像页，将直接覆盖当前影像页；</p>
                            <p>2.前/后插：新上传的影像页，插入到当前影像页前/后方；</p>
                            <p>3.删除：直接删除当前影像页，不可恢复；</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="foot-box">
                <el-button type="primary" size="medium" @click="save">确认更改</el-button>
                <el-button size="medium" @click="close(false)">取消更改</el-button>
            </div>
            <div class="memo-wrap">
                <h3>备注</h3>
                <p>1.本页面只处理单个页面删除、替换、前（后）插入等简单错误；</p>
                <p>2.如页面错乱、大范围页面丢失等复杂问题，还需要在拍机客户端处理；</p>
            </div>
        </div>
    </DragModule>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import DragModule from '../dragModule/DragModule.vue';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "reshootImages",
    components: {
        DragModule,
    },
    props:{
        gid: String,
        vid: String,
        imageKey: String,
        device: String,
        page: Number,
        imageURL: String,
    },
    data: () => {
        return {
            type: 3,
            fileName: '',
            index: 1,
            url: '',
            uploadFileURL: 'https://sync.qingtime.cn',
        };
    },
    mounted: function(){
        this.uploadFileURL = 'https://sync.qingtime.cn';
        if(window.location.origin.indexOf('genealogy.1jiapu.com') > -1){
            this.uploadFileURL = 'http://223.111.180.111:8085';
        }
        this.index = this.page;
    },
    methods:{
        handleOpenNewView(){
            if(this.type == 4){
                window.open(this.imageURL+'?v='+Date.now(), '_blank');
            }else{
                this.url ? window.open(this.url+'?v='+Date.now(), '_blank') : null;
            }
        },
        uploadImage(e){
            let oldFile = e.target.files[0];
            this.fileName = Date.now()+oldFile.name.substr(oldFile.name.lastIndexOf('.'), oldFile.name.length);
            let newFile = new File([oldFile], this.device+'_'+this.gid+'_'+this.vid+'_'+this.fileName);
            let fd = new FormData();
            fd.append('file', newFile);

            this.uploadImageApi(fd);
        },
        async uploadImageApi(param){
            let result = await api.postAxios(this.uploadFileURL+'/uploadFile', param, true);
            if(result.statusCode == 200){
                ADS.message('上传成功！', true);
                this.url = this.uploadFileURL+'/photo/'+this.device+'/'+this.gid+'/'+this.vid+'/'+this.fileName;
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        close(f){
            this.$emit('close', f);
        },
        save(){
            if(this.type == 4){
                this.handleDeleteImages();
            }else{
                if(!this.index){
                    return ADS.message('请输入拍数！');
                }
                if(!this.url){
                    return ADS.message('请上传影像！');
                }
                this.linkImageApi();
            }
        },
        async linkImageApi(){
            let result = await api.patchAxios('v3/review/image/retake', {
                siteKey: this.stationKey,
                userKey: this.userId,
                orgKey: this.orgId,
                volumeKey: this.vid,
                type: this.type,
                device: this.device,
                gcKey: this.gid,
                fileName: this.fileName,
                index: this.index - 1,
            });
            if(result.status == 200){
                this.close(true);
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        handleDeleteImages(){
            this.$confirm('确认要删除选中的影像吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteImageList();
            }).catch(() => {});
        },
        async deleteImageList(){// 批量删除图片
            let result = await api.deleteAxios('v3/review/catalog/image', {'volumeKey': this.vid, 'orgKey': this.orgId, 'imageKeyArray': [this.imageKey], 'siteKey': this.stationKey, 'userKey': this.userId});
            if(result.status == 200){
                this.close(true);
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'});
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
            pathname: state => state.nav.pathname,
            orgAdmin: state => state.nav.orgAdmin,
            orgId: state => state.nav.orgId,
        })
    },
    watch:{
        'page': function(nv, ov){
            this.index = nv;
        },
    }
};
</script>

<style scoped lang="scss">
.reshoot-drag{
    width: 700px !important;
    height: 640px !important;
}
.reshoot-wrap{
    position: absolute;
    top: 0;
    left: 0;
    padding: 0 50px 20px 50px;
    color: #333;
    text-align: left;
    cursor: pointer;
    .head-box{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 50px;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            // background: #000;
            cursor: pointer;
        }
    }
    .content-box{
        .box{
            margin-bottom: 20px;
            .label{
                margin-right: 10px;
                &.block{
                    display: block;
                    margin-bottom: 20px;
                }
            }
            .image-name{
                font-style: normal;
            }
        }
    }
}
.foot-box{
    text-align: center;
}
.memo-wrap{
    margin-top: 10px;
}
.update-box{
    position: relative;
    width: 120px;
    height: 30px;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    .input{
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        opacity: 0;
    }
    i{

        color: #358acd;
        font-style: normal;
    }
}
.img-box{
    position: relative;
    width: 200px;
    height: 200px;
    border: 1px solid #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    img{
        max-width: 100%;
        max-height: 100%;
    }
}
.explain-wrap{
    display: flex;
    margin: 20px 0;
    .explain-box{
        margin-left: 20px;
        border: 1px solid #ddd;
        padding: 10px;
    }
}
.width200{
    width: 200px;
}
</style>

