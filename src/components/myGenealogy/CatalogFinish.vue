<template>
    <div class="catalogFinish-wrap" @keyup.stop="">
        <div class="head-box">
            <h3 class="title">{{catalog.takeStatus == 7 ? '取消' : ''}}谱目完结</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <h4>当前已选择谱信息：</h4>
            <p>谱名：{{catalog.genealogyName}}；谱ID：{{catalog._key}}；谱审核状态：{{catalog.condition}}；谱状态：{{catalogStatusO[catalog.gcStatus]}}；应拍卷(册)数：{{catalog.hasVolume}}；卷(册)说明：{{catalog.volume}}；实拍卷册：{{catalog.actualVolumes}}；缺卷(册)说明：{{catalog.lostVolume}}；</p>
            <span>注意：{{catalog.takeStatus == 7 ? '你正在执行 谱目 反完结 操作，点击确认后，该谱将开放上传影像功能！' : '你正在执行 谱目 完结 操作，点击确认后，将无法新建卷册及上传新影像页，请确认！'}}</span>
            <i class="red" v-if="catalog.takeStatus != 7">建议：{{catalog.canPass === 0 ? '该谱目暂时不支持完结功能！' : catalog.canPass === 1 ? '该谱目实拍卷册数和应拍卷册数不一致，请慎重该完结操作' : '该谱目可进行完结！'}}</i>
        </div>
        <div class="foot-box" v-if="catalog.takeStatus == 7 || (catalog.takeStatus != 7 && catalog.canPass != 0)">
            <el-button type="primary" size="mini" @click="saveData">确认</el-button>
            <el-button size="mini" @click="close">取消</el-button>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "catalogFinish",
    props:{
        dataKey: String,
    },
    data: () => {
        return {
            catalog: {},
        };
    },
    mounted: function(){
        this.getGenealogyDetail();
    },
    methods:{
        async getGenealogyDetail(){
            const result = await api.getAxios('catalog/detail?catalogKey='+this.dataKey);
            if(result.status == 200){
                this.catalog = result.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        close(){
            this.$emit('close', false);
        },
        saveData(){
            this.catalogPassApi(this.catalog._key);
            // this.$confirm('请确认是否'+(this.catalog.takeStatus == 7 ? '取消' : '')+'完结此谱目?', '提示', {
            //     confirmButtonText: '确定',
            //     cancelButtonText: '取消',
            //     type: 'warning'
            // }).then(() => {
            //     this.catalog.takeStatus == 7 ? this.catalogPassApi(this.catalog._key) : this.catalogPassCheck(this.catalog._key);
            // }).catch(() => {});
        },
        async catalogPassCheck(catalogKey){//完结家谱判断
            let data = await api.getAxios('v3/camera/catalog/catalogCanPass?catalogKey='+catalogKey);
            if(data.status == 200){
                this.catalogPassApi(catalogKey);
            }else if(data.status == 301){
                this.$confirm('该谱目应有卷册和实拍卷册不一致, 是否继续完结此家谱任务?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.catalogPassApi(catalogKey);
                }).catch(() => {});
            }else{
                this.$message({message: data.msg, type: 'warning'});
            }
        },
        async catalogPassApi(catalogKey){//完结家谱
            let data = await api.patchAxios('v3/camera/catalog/catalogPass2',{'catalogKey': catalogKey, 'status': this.catalog.takeStatus == 7 ? 1 : 7, 'userKey':this.userId, 'siteKey':this.stationKey, 'orgKey': this.orgId});
            if(data.status == 200){
                this.$emit('save', {});
            }else{
                this.$message({message: data.msg, type: 'warning'});
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
            catalogStatusO: state => state.nav.catalogStatusO,
        })
    },
    watch:{
        
    }
};
</script>

<style scoped lang="scss">
.catalogFinish-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 600px;
    background: #fff;
    font-size: 14px;
    color: #000;
    box-shadow: 0 0 1px 1px #ddd;
    z-index: 1000;
    padding: 20px 50px;
    .head-box{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            cursor: pointer;
        }
    }
    .content-box{
        position: relative;
        width: 100%;
        p{
            margin: 30px 0;
        }
        span{
            color: #999;
        }
        .red{
            color: #f00;
            display: block;
            font-style: normal;
        }
    }
    .foot-box{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
    }
}
</style>