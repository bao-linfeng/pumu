<template>
    <div class="edit-wrap style1" @keyup.stop="">
        <div class="edit-box">
            <div class="head-box">
                <h3 class="title">编辑用户权限</h3>
            </div>
            <div class="content-box">
                <div class="edit-list">
                    <label class="label" for="">功能权限设置:</label>
                    <el-select v-model="root" multiple placeholder="请选择权限" size="small">
                        <el-option
                            v-for="item in rootList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </div> 
            </div>
            <div class="foot-box">
                <el-button size="medium" @click="close">取消</el-button>
                <el-button type="primary" size="medium" @click="save">保存</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import ADS from "../../ADS.js";
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "editRoot",
    props:{
        detail: {
            type: Object
        }
    },
    data: () => {
        return {
            root: ['统计审核工作量'],
            rootList: [
                {'label': '统计审核工作量', 'value': '统计审核工作量'},
                // {'label': '开放谱书', 'value': '开放谱书'},
                // {'label': '影像复核', 'value': '影像复核'},
            ],
        };
    },
    mounted: function(){
        // this.root = this.detail.rootStr ? this.detail.rootStr.split(',') : [];
        
        if(this.detail.rootStr){
            this.root = this.detail.rootStr.replace(/,/g, ' ').trim().split(' ');
        }else{
            this.root = [];
        }
        console.log(this.root);
    },
    methods:{
        close(){
            this.$emit('close', false);
        },
        save(){
            if(this.detail.role >= 1 && this.detail.role <= 3){
                this.$confirm('请确认是否编辑权限?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.editData();
                }).catch(() => {});
            }else{
                this.$XModal.message({message: '只能设置微站管理员和审核员', status: 'warning'})
            }
        },
        async editData(){
            console.log(this.root);
            let result = await api.patchAxios('site/setRootStr', {
                "rootStr": this.root ? this.root.join() ? (','+this.root.join()+',') : '' : '',
                "userKey": this.userId,
                'targetUKey': this.detail._key,
                "siteKey": this.stationKey
            });
            if(result.status == 200){
                ADS.message('编辑权限成功！', true);
                this.$emit('save', true);
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        }
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
        })
    },
    watch:{
        
    }
};
</script>

<style scoped lang="scss">
.edit-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.3);
    font-size: 14px;
    color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    .edit-box{
        position: relative;
        background: #fff;
        padding: 20px;
        border-radius: 10px;
        .head-box{
            position: relative;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .content-box{
            position: relative;
            margin: 10px 0;
        }
        .foot-box{
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 40px;
        }
    }
}
.edit-list{
    position: relative;
    display: flex;
    align-items: center;
    .label{
        width: 100px;
        margin-right: 10px;
    }
}
</style>

