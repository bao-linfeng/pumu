<template>
    <div class="leadModal">
        <div class="form">
            <h3>批量导入谱目</h3>
            <i class="el-icon-close" @click="close"></i>
            <div class="box">
                <el-upload
                    class="upload-demo"
                    :action="'https://pukudata.qingtime.cn/upload'"
                    :limit="1"
                    :accept="'.xlsx'"
                    :show-file-list="false"
                    :on-success="handleSuccess"
                    >
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传excel文件</div>
                </el-upload>
                <a :href="'https://pukudata.qingtime.cn/'+templateDownload" v-show="templateDownload">模板文件下载</a>
                <!-- <el-checkbox v-model="checkDuplicate">自动查重</el-checkbox> -->
            </div>
            <!-- <input class="btn" type="button" value="确定" @click="save" /> -->
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "leadModal",
    props:{
        data:{
            type:Array,
        },
    },
    data: () => {
        return {
            userKey:'',
            siteKey:'',
            checkDuplicate:true,
            templateDownload:'',
        };
    },
    mounted:function(){
       this.userKey = window.localStorage.getItem('userId') || '';
       this.siteKey = window.localStorage.getItem('stationKey') || '';
       this.getModal();
    },
    methods:{
        close(){
            this.$emit('close-lead',false);
        },
        save(){
            this.$emit('save-lead',false);
        },
        handleSuccess(response, file, fileList){
            this.linkSource(response.filePath,response.originalName);
        },
        linkSource:async function(filePath,fileName){//文件关联家谱
            let data=await api.postAxios('catalog/import',{'filePath':filePath,'userKey':this.userKey,'siteKey':this.siteKey,'checkDuplicate':this.checkDuplicate ? 1 : ''});
            if(data.status == 200){
                this.$notify({
                    title: '提示',
                    message: '批量上传家谱成功,批次号为：'+data.batch,
                    duration: 5,
                    type: 'success'
                });
                this.save();
            }
        },
        getModal:async function(){
            let data=await api.getAxios('catalog/templateDownload');
            if(data.status == 200){
                this.templateDownload = data.result;
            }
        }
    },
    computed: {
        ...mapState({
            APIURL: state => state.nav.APIURL,
        })
    },
};
</script>
<style scoped lang="scss">
.leadModal{
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
        width: 400px;
        padding-bottom: 20px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        h3{
            margin: 20px 0 15px 0;
        }
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .box{
            width: 224px;
            margin: 0 auto;
            text-align: left;
        }
        a{
            color: #409EFF;
            margin: 5px 0 10px 0;
            display: block;
        }
        .rootSelect{
            margin-top: 15px;
        }
        .btn{
            width: 224px;
            height: 48px;
            line-height: 48px;
            text-align: center;
            border-radius: 24px;
            background: #4C95FF;
            border-radius: 24px;
            display: block;
            margin: 20px auto;
            outline: none;
            border: none;
            color: #fff;
            cursor: pointer;
        }
    }
}
</style>

