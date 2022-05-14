<template>  
    <div class="jiapu-table-modal">
        <div class="jiapu-table-title">
          <h3>检索结果</h3>
          <div>
            <span>共检索出<i>{{total}}</i>部家谱</span>
          </div>
        </div>
        <vxe-table
            border
            resizable
            stripe
            show-overflow
            highlight-hover-row
            ref="xTable"
            @checkbox-change = "checkboxChange"
            @checkbox-all = "checkboxChange"
            :align="'center'"
            :data="list">
            <vxe-table-column type="checkbox" width="60"></vxe-table-column>
            <vxe-table-column field="batch" title="批次号"></vxe-table-column>
            <vxe-table-column field="_key" title="编码"></vxe-table-column>
            <vxe-table-column v-for="(item,index) in fieldFilters" :key="'fieldFilters'+index" :field="item.value" :title="item.label"></vxe-table-column>
            <vxe-table-column field="libsStr" title="来源"></vxe-table-column>
            <vxe-table-column field="creator" title="上传者"></vxe-table-column>
            <vxe-table-column field="hasImage" title="影像"></vxe-table-column>
            <vxe-table-column title="操作" :width="w" :cell-render="{name:'AdaiActionButton',attr:{data:actionButton},events:{'editBook':editBook,'editImage':editImage,'removeBook':removeBook,'readBook':readBook}}"></vxe-table-column>
        </vxe-table>
        <SourceModal v-if="isEditImage" v-on:close-source="isEditImage=false" :gid="gid" :gvolume="volume" />
        <EditGenealogyModal v-if="isEdit" :isShow="isShow" :gid="gid" :pumu="pumu" v-on:close-edit="closeEdit" />
    </div>
</template>

<script>
import api from "../../api.js";
import SourceModal from "./SourceModal.vue";
import EditGenealogyModal from "./EditGenealogyModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogyTableModal",
    props:{
        list:{
            type: Array
        },
        total:{
            type: Number,
        },
        fieldFilters:{
            type: Array
        },
        isShow: {
            type: Boolean,
            default: false
        },
    },
    components: {
        SourceModal,EditGenealogyModal,
    },
    data: () => {
        return {
            gid: '',
            volume: 10,
            isEditImage: false,
            w: 300,
            actionButton: [{'label':'编辑谱目','value':'editBook'},
            {'label':'编辑影像','value':'editImage'},
            {'label':'删除','value':'removeBook'},
            {'label':'阅读','value':'readBook'}],
            isEdit: false,
            pumu:'',
        };
    },
    created:function(){
        
    },
    mounted:function(){
        if(this.role < 1 || this.role > 3){
            this.w = 80;
            this.actionButton = [{'label':'阅读','value':'readBook'}];
        }
        if(this.isShow){
            this.w = 160;
            this.actionButton = [{'label':'查看','value':'editBook'},{'label':'阅读','value':'readBook'}];
        }
    },
    methods:{
        closeEdit(flag){
            this.isEdit = false;
            flag ? this.$emit('get-genealogy','') : null;
        },
        checkboxChange({records}){
            records.map((item)=>{
                item.select = true;
            });
            this.$emit('checkbox-change',records);
        },
        editBook({row}){// 编辑谱目
            // if(row.resource < 3){
            //     this.gid = row._key;
            //     this.pumu = row;
            //     this.isEdit = true;
            // }
            this.gid = row._key;
            this.pumu = row;
            this.isEdit = true;
        },
        editImage({row}){// 编辑影像资料
            // if(row.resource == 1){
            //     this.gid = row._key;
            //     this.isEditImage = true;
            // }
            this.gid = row._key;
            this.isEditImage = true;
        },
        removeBook({row}){// 删除谱目或退出共享
            this.$confirm('此操作将永久'+(row.siteKey == this.stationKey ? '删除该谱目数据' : '退出分享')+',是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                if(row.siteKey == this.stationKey){
                    this.deleteGenealogy([row._key]);
                }else{
                    this.deleteShare(row._key);
                }
            }).catch(() => {});
        },
        deleteGenealogy:async function(checkList){//删除
            let data=await api.deleteAxios('catalog',{'catalogKeyArr':checkList,'userKey':this.userId,'siteKey':this.stationKey});
            if(data.status == 200){
                this.$emit('get-genealogy','');
            }else{
                this.$message({message: '删除家谱出错，请重新删除',type: 'warning'});
            }
        },
        deleteShare:async function(gid){// 退出共享
            let data=await api.deleteAxios('catalog/exitShare',{'catalogKey':gid,'userKey':this.userId,'siteKey':this.stationKey});
            if(data.status == 200){
                this.$message({message: '退出共享成功',type: 'success'});
                this.$emit('get-genealogy','');
            }else{
                this.$message({message: '退出共享出错，请重新退出',type: 'warning'});
            }
        },
        readBook({row}){// 阅读影像
        // row.resource == 1 || 
            if(row.hasImage){
                if(row.readType === 'jump'){
                    window.open(row.imageLink);
                }else{
                    this.$router.push('/'+window.localStorage.getItem('pathname')+'/view?gid='+row._key+'&volume=1&page=1');
                }
            }else{
                this.$XModal.message({ message: '暂无影像', status: 'warning' });
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
        })
    },
};
</script>
<style scoped lang="scss">
.jiapu-table-modal{
    width: calc(100% - 40px);
    margin: 20px;
    background-color: #fff;
    .jiapu-table-title{
        display: flex;
        justify-content: space-between;
        padding: 15px 0;
        h3{
            color: #344B5A;
            height: 16px;
            line-height: 16px;
            border-left: 2px solid #4C95FF;
            padding-left: 20px;
        }
        span{
            color: #7E8E98;
            margin-right: 20px;
            margin-left: 10px;
            letter-spacing: 1px;
            i{
                font-style: normal;
                letter-spacing: 0px;
                margin: 0 5px;
            }
        }
    }
}
</style>

