<template>
    <div class="over-time-wrap">
        <div class="over-time-box">
            <div class="head-box">
                <h3 class="title">批量修改影像类型</h3>
            </div>
            <div class="content-box">
                <p class="content">当前选中 {{list.length}}条数据, 请选择更改后的卷属性信息。更改后，更改信息可在系统日志中查重！:</p>
                <div class="property-wrap">
                    <label class="label" for="">影像类型：</label>
                    <el-select class="width150 marginR10" v-model="property" placeholder="影像类型" size="small">
                        <el-option
                            v-for="item in propertyList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </div>
                <!-- <div class="input-box">
                    <label class="label">请输入以下字符"pipeline" 以便确认:</label>
                    <input class="input" v-model="name" type="text" placeholder="" />
                </div> -->
            </div>
            <div class="foot-box">
                <el-button size="medium" @click="close(false)">取消</el-button>
                <el-button type="primary" size="medium" @click="saveData">确认</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "updateVolumeProperty",
    props:{
        dataKey: String,
        list: Array,
    },
    data: () => {
        return {
            name: 'pipeline',
            property: '0',
            propertyList: [
                {'label': '电子谱', 'value': '1'}, 
                {'label': '纸质谱', 'value': '0'}
            ],
        };
    },
    mounted: function(){
        
    },
    methods:{
        close(f = true){
            this.$emit('close', f);
        },
        saveData(){
            if(this.name == 'pipeline'){
                this.$confirm('确认批量修改卷册属性吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.updateVolumePropertyBatch({'isLeadImages': this.property});
                }).catch(() => {});
            }else{
                this.$XModal.message({ message: '请输入pipeline确认', status: 'warning' })
            }
        },
        async updateVolumePropertyBatch(patchData){
            let result = await api.patchAxios('v3/review/catalog/updateVolumePropertyBatch', {'volumeKeyArray': this.list, 'patchData': patchData, 'orgKey': this.orgId, 'siteKey': this.stationKey, 'userKey': this.userId});
            if(result.status == 200){
                this.$XModal.message({message: '批量修改卷册信息成功', status: 'success'});
                this.$emit('save', true);
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
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
        })
    },
    watch:{
        
    }
};
</script>

<style scoped lang="scss">
.over-time-wrap{
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    font-size: 14px;
    color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    .over-time-box{
        position: relative;
        padding: 30px;
        background: #fff;
        border-radius: 5px;
        width: 400px;
        .head-box{
            position: relative;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .content-box{
            margin: 20px 0;
            .content{
                margin: 30px 0;
            }
            .input-box{
                position: relative;
                display: flex;
                align-items: center;
                .input{
                    border-radius: 3px;
                    border: 1px solid #ddd;
                    text-indent: 10px;
                    width: 100px;
                    height: 30px;
                    line-height: 30px;
                    outline: none;
                    margin-left: 20px;
                }
            }
            .property-wrap{
                display: flex;
                justify-content: center;
                align-items: center;
                .label{
                    margin-right: 20px;
                }
            }
        }
        .foot-box{
            display: flex;
            justify-content: space-around;
            align-items: center;
        }
    }
}
</style>

