<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'拍机编号管理'">
                <div class="toolbar">
                    <vxe-button v-if="role >= 1 && role <= 2" icon="fa fa-plus" content="新增" @click="insertEvent()"></vxe-button>
                </div>
            </NavModal>
            <div class="select-wrap" v-if="role >= 1 && role <= 3 && !orgAdmin">
                <vxe-select v-model="orgKey" placeholder="机构">
                    <vxe-option v-for="(item,index) in orgList" :key="index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-button icon="fa fa-save" content="检索" @click="getDeviceList"></vxe-button>
            </div>
            <div class="vex-table-box">
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    row-key
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                    @edit-closed="editClosedEvent">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin != 'admin'" field="cameraModel" title="相机型号" :edit-render="{name: '$select', options: cameraModelList}"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin == 'admin'" field="cameraModel" title="相机型号"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin != 'admin'" field="device" title="相机编号" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin == 'admin'" field="device" title="相机编号"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin != 'admin'" field="lensNumber" title="镜头编号" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin == 'admin'" field="lensNumber" title="镜头编号"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin != 'admin'" field="hostNumber" title="主机编号" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin == 'admin'" field="hostNumber" title="主机编号"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin == 'admin'" field="projectID" title="projectID" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin != 'admin'" field="projectID" title="projectID"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin != 'admin'" field="orgKey" title="机构" :edit-render="{name: '$select', options: orgList}"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin == 'admin'" field="orgName" title="机构"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin != 'admin'" field="userName" title="拍机人员"></vxe-table-column>
                    <vxe-table-column v-if="orgAdmin == 'admin'" field="userKey" title="拍机人员" :edit-render="{name: '$select', options: userList}"></vxe-table-column>
                    <vxe-table-column field="createTimeO" title="创建时间"></vxe-table-column>
                    <vxe-table-column v-if="userId == '109605770'" title="操作" width="100" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'删除','value':'remove'}]},events:{'remove':removeSigleEvent}}"></vxe-table-column>
                </vxe-table>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "CameraDevice",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            cameraModelList: [{'label': 'NikonD800E', 'value': 'NikonD800E'}, {'label': 'NikonD810', 'value': 'NikonD810'}, {'label': 'NikonD850', 'value': 'NikonD850'}],
            tableData: [],
            userList: [],
            userKey: '',
            orgList: [],
            orgKey: '',
            h:300,
        };
    },
    created(){
        this.h = window.innerHeight - 132;
    },
    mounted:function(){
        this.getOrgList();
        if(this.role <=3 && this.role >=1){
            
        }else{
            this.orgKey = this.orgId;
        }
        if(this.orgAdmin == 'admin'){
            this.orgKey = this.orgId;
            this.getOrgMember(this.orgId);
        }
        this.getDeviceList();
    },
    beforeDestroy(){
        
    },
    methods:{
        async getOrgList(){
            let result = await api.getAxios('org?orgKey=&name=&siteKey='+this.stationKey);
            if(result.status == 200){
                this.orgList = result.data.map((ele) => {
                    ele.label = ele.name;
                    ele.value = ele._key;
                    return ele;
                });
                this.orgList.unshift({'label': '全部', 'value': ''});
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        async getOrgMember(orgKey){
            let result = await api.getAxios('org/member?orgKey='+orgKey);
            if(result.status == 200){
                this.userList = result.data.map((ele) => {
                    ele.label = ele.userName+'('+(ele.mobile || ele.email)+')';
                    ele.value = ele._key;
                    return ele;
                });
                this.userList.unshift({'label': '全部', 'value': ''});
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        async getDeviceList(){
            let result = await api.getAxios('v2/camera/device/list?siteKey='+this.stationKey+'&userKey=&orgKey='+this.orgKey);
            if(result.status == 200){
                this.tableData = result.data.map((ele)=>{
                    ele.createTimeO = ADS.getLocalTime(ele.createTime);
                    return ele;
                });
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        activeCellMethod({row,column}){
            if(this.role <= 3 && this.role >= 1){
                if(this.orgAdmin == 'admin'){
                    return true;
                }else{
                    if(!row._key){
                        return true;
                    }
                }
            }else{
                if(this.orgAdmin == 'admin'){
                    return true;
                }
            }
            return false;
        },
        async insertEvent(row){
            let record = {
                
            }
            let { row: newRow } = await this.$refs.xTable.insertAt(record, row);
            await this.$refs.xTable.setActiveCell(newRow, 'type');
        },
        editClosedEvent({ row, column }){
            if(row._key){
                if(this.orgAdmin == 'admin'){
                    this.editDevice(row);
                }
            }else{
                this.addDevice(row);
            }
        },
        async addDevice(row){
            let result = await api.postAxios('v2/camera/device/fs',{'siteKey': this.stationKey, 'userKey': this.userId, 'orgKey': row.orgKey, 'device': row.device, 'cameraModel': row.cameraModel, 'lensNumber': row.lensNumber, 'hostNumber': row.hostNumber, 'projectID': row.projectID});
            if(result.status == 200){
                this.getDeviceList();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async editDevice(row){// 相机关联拍机人员
            let result = await api.patchAxios('v2/camera/device/org',{'deviceKey': row._key, 'adminUserKey': this.userId, 'userKey': row.userKey, 'projectID': row.projectID});
            if(result.status == 200){
                this.getDeviceList();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        removeSigleEvent({row}){
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                if(row.device == 'admin'){
                    this.$XModal.message({ message: '机构管理员的拍机号不能删除', status: 'warning' });
                }else{
                    this.removeDevice(row);
                }
            }).catch(() => {});
        },
        async removeDevice(row){
            let result = await api.deleteAxios('camera/device/fs',{'siteKey': this.stationKey, 'userKey': this.userId, 'deviceKey': row._key});
            if(result.status == 200){
                this.getDeviceList();
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
            orgId: state => state.nav.orgId,
            orgAdmin: state => state.nav.orgAdmin,
        })
    },
    watch:{
        'userKey':function(nv, ov){
            this.getDeviceList();
        },
    },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    padding-left: 200px;
    text-align: left;
    .content{
        position: relative;
        width: 100%;
        height: calc(100% - 20px);
        background: #EFF1F5;
        padding-bottom: 20px;
        .select-wrap{
            padding: 10px 20px;
            width: calc(100% - 40px);
            display: flex;
            align-items: center;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            height: calc(100% - 120px);
            margin: 0 auto;
        }
    }
}
.toolbar{
    display: flex;
    align-items: center;
}
</style>

