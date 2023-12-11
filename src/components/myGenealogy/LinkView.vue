<template>
    <el-upload
        class="upload-demo"
        :action="baseURL+'upload'"
        :limit="1"
        :accept="'.xlsx'"
        :show-file-list="false"
        :on-success="handleSuccess"
        >
        <el-button size="small" type="primary">批量关联影像</el-button>
    </el-upload>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "uploadDOR",
    props:{
        
    },
    data: () => {
        return {
            
        };
    },
    mounted:function(){
    },
    methods:{
        handleSuccess(response, file, fileList){
            this.linkView(response.filePath);
        },
        linkView:async function(filePath){//文件关联家谱
            let data=await api.postAxios('bindImageBatch',{'filePath':filePath, 'siteKey': this.stationKey, 'userKey':this.userId});
            if(data.status == 200){
                // this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
                // if(data.errorArr && data.errorArr.length){
                //     let msg = '';
                //     data.errorArr.map((item) => {
                //         msg = msg + '序号：' + item.index + '，原因：' + item.reason;
                //     });
                //     alert(msg);
                // }else{
                //     this.$message({message: '谱目关联影像成功',type: 'success'});
                // }
            }else{
                this.$message({message: '谱目关联影像失败，请重新上传',type: 'warning'});
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

</style>

