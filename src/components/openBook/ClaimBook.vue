<template>
    <div class="edit-wrap style1">
        <div class="edit-box">
            <div class="head-box">
                <h3 class="title">领取</h3>
            </div>
            <div class="content-box">
                <p v-if="list.length">当前选中 {{list.length}} 条数据！</p>
                <div class="edit-list">
                    <label class="label" for="">认领拍机:</label>
                    <el-select v-model="device" placeholder="请选择拍机" size="small">
                        <el-option
                            v-for="item in deviceList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </div> 
            </div>
            <div class="foot-box">
                <el-button size="medium" @click="close">取消</el-button>
                <el-button type="primary" size="medium" @click="save">领取</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import ADS from "../../ADS.js";
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "ClaimBook",
    props:{
        detail: {
            type: Object
        },
        list: {
            type: Array
        }
    },
    data: () => {
        return {
            deviceList: [],
            device: '', 
        };
    },
    mounted: function(){
        this.getDeviceList();
    },
    methods:{
        close(){
            this.$emit('close', false);
        },
        save(){
            if(!this.device){
                return ADS.message('请选择拍机！');
            }
            this.$confirm('当前选中 '+(this.role >= 1 && this.role <= 3 ? this.list.length : 1)+' 条数据, 请确认是否设置拍机领取?', '提示', {
                confirmButtonText: '确定开放',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.patchClaimGC(this.role >= 1 && this.role <= 3 ? this.list : [this.detail._key]);
            }).catch(() => {});
        },
        async getDeviceList(){// 拍机列表
            let result = await api.getAxios('v2/camera/device/list?siteKey='+this.stationKey+'&userKey=&orgKey='+(this.role >= 1 && this.role <= 3 ? '' : this.orgId));
            if(result.status == 200){
                this.deviceList = result.data.map((ele)=>{
                    return {'label': ele.device+'('+ele.userName+')', 'value': ele._key};
                });
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        async patchClaimGC(catalogKeyArray){// 批量认领 api
            let result = await api.patchAxios('v3/review/catalog/claimGC', {
                'userKey': this.userId, 
                'siteKey': this.stationKey, 
                'orgKey': (this.role >= 1 && this.role <= 3 ? '' : this.orgId),
                'deviceKey': this.device,
                'catalogKeyArray': catalogKeyArray
            });
            if(result.status == 200){
                if(result.data && result.data.length){
                    this.$alert(result.data.join(), '错误提示', {
                        confirmButtonText: '确定',
                        callback: action => {
                            this.$emit('save', true);
                        }
                    });
                }else{
                    this.$emit('save', true);
                }
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
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
            orgId: state => state.nav.orgId,
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
    margin-bottom: 15px;
    .label{
        width: 100px;
        margin-right: 10px;
    }
}
.width208{
    width: 208px;
}
.width140{
    width: 130px;
}
.width68{
    width: 78px;
}
</style>

