<template>
    <div class="reshoot-wrap" @keyup.stop="">
        <div class="head-box">
            <h3 class="title">影像补拍</h3>
            <img class="close" @click="close(false)" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <div class="box">
                <label class="label" for="">拍数</label>
                <el-input class="width200" v-model="index" placeholder="请输入拍数"></el-input>
            </div>
            <div class="box">
                <el-radio-group v-model="type">
                    <el-radio :label="1">向前插入</el-radio>
                    <el-radio :label="2">覆盖</el-radio>
                    <el-radio :label="3">向后插入</el-radio>
                </el-radio-group>
            </div>
            <div class="box active">
                <div class="update-box">
                    <input class="input" type="file" accept="image/*" @change="uploadImage" />
                    <i class="i">上传影像</i>
                </div>
                <div class="img-box">
                    <img :src="url" alt="" />
                </div>
            </div>
        </div>
        <div class="foot-box">
            <el-button type="primary" size="medium" @click="save">提交</el-button>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "reshootImages",
    components: {
        
    },
    props:{
        gid: String,
        vid: String,
        device: String,
        page: Number,
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
        // let baseURL = 'https://pumudata.qingtime.cn';
        this.uploadFileURL = 'https://sync.qingtime.cn';
        if(window.location.origin.indexOf('camera.1jiapu.com') > -1){
            // baseURL = 'http://genealogydata.1jiapu.com';
            this.uploadFileURL = 'http://223.111.180.111:8085';
        }
        this.index = this.page;
    },
    methods:{
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
            if(!this.index){
                return ADS.message('请输入拍数！');
            }
            if(!this.url){
                return ADS.message('请上传影像！');
            }
            this.linkImageApi();
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
        }
    }
};
</script>

<style scoped lang="scss">
.reshoot-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #ddd;
    padding: 0 50px 20px 50px;
    background: #fff;
    color: #333;
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
            display: flex;
            align-items: center;
            &.active{
                align-items: flex-start;
            }
            .label{
                margin-right: 10px;
            }
        }
    }
}
.update-box{
    position: relative;
    width: 120px;
    height: 40px;
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
    width: 100px;
    height: 100px;
    border: 1px solid #ddd;
    margin-left: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    img{
        max-width: 100%;
        max-height: 100%;
    }
}
.width200{
    width: 200px;
}
</style>

