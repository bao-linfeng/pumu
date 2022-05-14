<template>
    <div class="upload_wrap">
        <span>导入DOR</span>
        <input type="file" name="dor" @change="uploadImg" multiple  />
    </div>
</template>

<script>
import api from "../../api.js";
import uploadFile from "../upload/upload.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "uploadDOR",
    props:{
        
    },
    data: () => {
        return {
            qiniuToken: '',
        };
    },
    mounted:function(){
        this.qiniuToken ? null : this.getToken();
    },
    methods:{
        getToken: async function(){
            let data=await api.getAxios('https://baokudata.qingtime.cn/sgbh/upTokenQiniu/getQiNiuUpToken?token='+this.TOKEN,true);
            this.qiniuToken = data.result || '';
        },
        uploadImg: async function(e) {
            let files = Array.from(e.target.files);
            this.uploadImage(files);
        },
        uploadImage(files){
            if(files && files.length){
                let file = files.shift();
                uploadFile.uploadImg(file,(str)=>{
                    this.linkDOR(str,file.name,files);
                    this.uploadImage(files);
                },this.qiniuToken);
            }
        },
        linkDOR:async function(dorUrl,fileName,files){//文件关联家谱
            let data=await api.postAxios('data/dor',{'userKey':this.userId,'siteKey':this.stationKey,'dorUrl':dorUrl,'fileName':fileName});
            if(data.status == 200){
                this.$message({message: 'DOR上传成功',type: 'success'});
                if(!files.length){
                    this.$emit('get-dor','');
                }
            }else{
                this.$message({message: 'DOR上传失败，请重新上传',type: 'warning'});
            }
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
        })
    },
};
</script>
<style scoped lang="scss">
.upload_wrap{
    position: relative;
    padding: 0 1em;
    height: 34px;
    line-height: 34px;
    border-radius: 5px;
    background: #358acd;
    color: #fff;
    cursor: pointer;
    overflow: hidden;
    text-align: center;
    margin-right: 10px;
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
</style>

