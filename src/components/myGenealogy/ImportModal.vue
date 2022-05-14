<template>
    <div class="importModal">
        <div class="form">
            <h3>批量导入</h3>
            <i class="el-icon-close close" @click="close"></i>
            <div class="fileSource">
                <div class="box">
                    <el-upload
                        class="upload-demo"
                        action="https://pukudata.qingtime.cn/upload"
                        name="file"
                        :accept="'.xlsx'"
                        :show-file-list="false"
                        :on-success="handleSuccess"
                        >
                        <el-button size="small" type="primary">选择上传文件</el-button>
                    </el-upload>
                </div>
            </div>
            <!-- <input class="btn" type="button" value="确定" @click="save" /> -->
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "importModal",
    props:{
        data:{
            type:Array,
        },
        gid:{
            type:String,
        },
    },
    data: () => {
        return {
            sourceList:[],
            userKey:'',
            siteKey:'',
        };
    },
    mounted:function(){
       this.token= window.localStorage.getItem('token') || '';
       this.userKey = window.localStorage.getItem('userId') || '';
       this.siteKey = window.localStorage.getItem('stationKey') || '';
    },
    methods:{
        close(){
            this.$emit('close-source',false);
        },
        save(){
            this.$emit('save-source',false);
        },
        handleSuccess(response, file, fileList){
            this.linkSource(response.filePath,response.originalName);
        },
        linkSource:async function(filePath,fileName){//文件关联家谱
            let data=await api.postAxios('catalog/import',{'filePath':filePath,'userKey':this.userKey,'siteKey':this.siteKey});
            if(data.status == 200){
                this.$message({message: '批量上传家谱成功',type: 'success'});
                this.save();
            }else{
                this.$message({message: '批量上传家谱失败，请重新上传',type: 'warning'});
            }
        },
    },
};
</script>
<style scoped lang="scss">
.importModal{
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
        width: 320px;
        padding: 20px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        i.close{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .box{
            width: 224px;
            margin: 20px auto;
        }
        .label{
            color: #344B5A;
            padding: 10px 0;
            text-align: left;
        }
        .btn{
            width: 224px;
        }
    }
}
</style>

