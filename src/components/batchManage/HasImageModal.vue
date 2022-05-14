<template>  
    <div class="lead-excel-wrap">
        <div class="lead-excel-box">
            <h3>批量关联是否有影像({{batchId}})</h3>
            <i class="el-icon-close" @click="close(false)"></i>
            <div class="lead-excel-button">
                <el-upload
                    :action="'https://pumudata.qingtime.cn/upload'"
                    :limit="1"
                    :accept="'.xlsx'"
                    :show-file-list="false"
                    :on-success="linkSource"
                    >
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传excel文件</div>
                </el-upload>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "hasImageModal",
    props:{
        batchId:{
            type: String
        }
    },
    components: {
        
    },
    data: () => {
        return {
            type:'',
            libKey:'',
            templateKey:'',
        };
    },
    mounted:function(){
        
    },
    methods:{
        close(flag){
            this.$emit('close-has-image',flag);
        },
        linkSource:async function(data){// 文件关联家谱
            // let data=await api.postAxios('data/import',{'originalName':fileName,'filePath':filePath,'userKey':this.userId,'siteKey':this.stationKey,'templateKey':this.templateKey,'type':this.type});
            // if(data.status == 200){
            //     this.$notify({
            //         title: '提示',
            //         message: '批量上传成功,批次号为：'+data.batch,
            //         duration: 0,
            //         type: 'success'
            //     });
            //     this.close(true);
            // }else{
            //     this.$XModal.message({ message: data.msg, status: 'warning' })
            // }
        },
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
        width: 300px;
        padding: 20px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .lead-excel-button{
            position: relative;
            margin-top: 20px;
        }
    }
}
</style>

