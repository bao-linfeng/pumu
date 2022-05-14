<template>  
    <div class="lead-excel-wrap">
        <div class="lead-excel-box">
            <h3>批量导入谱目</h3>
            <i class="el-icon-close" @click="close"></i>
            <div class="lead-excel-button">
                <el-upload
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
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "leadexcelmodal",
    props:{
        
    },
    components: {
        
    },
    data: () => {
        return {
            templateDownload:'',
        };
    },
    mounted:function(){
        this.getModal();
    },
    methods:{
        close(){
            this.$emit('close-lead-excel',false);
        },
        handleSuccess(response, file, fileList){
            this.linkSource(response.filePath,response.originalName);
        },
        linkSource:async function(filePath,fileName){// 文件关联家谱
            let data=await api.postAxios('catalog/import',{'filePath':filePath,'userKey':this.userId,'siteKey':this.stationKey,'checkDuplicate':1});
            if(data.status == 200){
                this.$notify({
                    title: '提示',
                    message: '批量上传家谱成功,批次号为：'+data.batch,
                    duration: 0,
                    type: 'success'
                });
                this.close();
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
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
        })
    },
};
</script>
<style scoped lang="scss">
.lead-excel-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
    .lead-excel-box{
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
        .lead-excel-button{
            width: 224px;
            margin: 0 auto;
            text-align: left;
        }
        a{
            color: var(--bg-color);
            margin: 5px 0 10px 0;
            display: block;
        }
    }
}
</style>

