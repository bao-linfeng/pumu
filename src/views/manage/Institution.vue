<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'组织机构'">
                <div class="tool-bar">
                    <vxe-button v-if="role >= 1 && role <= 2" content="新增" @click="insertEvent(-1)"></vxe-button>
                </div>
            </NavModal>
            <div class="select-wrap" v-if="role >= 1 && role <= 3">
                <input class="name" type="text" v-model="name" @keyup.enter="getOrgList" placeholder="请输入机构名称" />
                <vxe-button status="primary" content="检索" @click="getOrgList"></vxe-button>
            </div>
            <div class="vex-table-box">
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                    @edit-closed="editClosedEvent"
                    :data="tableData">
                    <vxe-table-column field="organizationNo" title="机构序号" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="name" title="机构名称" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="englishName" title="机构英文名" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="memberCount" title="机构人数"></vxe-table-column>
                    <vxe-table-column title="操作" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':navTo,'addUser':addUser,'deleteOrg':deleteOrg}}"></vxe-table-column>
                </vxe-table>
            </div>
        </div>
        <div class="org-user-wrap" v-if="isShow">
            <div class="org-user-box">
                <h3>{{orgKey ? '添加' : ''}}组员</h3>
                <img class="close" @click="closeModel" src="../../assets/close.svg" alt="">
                <input v-if="orgKey && ((role >= 1 && role <= 2) || orgAdmin == 'admin')" type="text" v-model="keyWord" @keyup.enter="getUserSearch" placeholder="请输入手机号或姓名" />
                <ul v-if="orgKey" class="user-search style1">
                    <li v-for="(user,index) in userList" :key="index">
                        <img :src="user.userAvatar+'?imageView2/2/w/40'" @error="error(user._key,0)" alt="">
                        <div class="user-add">
                            <span class="marginR10">{{user.userName}}</span>
                            <button v-if="!user.hasAdd" @click="toggleMember(user)">添加</button>
                        </div>
                    </li>
                </ul>
                <p v-if="orgKey && ((role >= 1 && role <= 2) || orgAdmin == 'admin')">组员</p>
                <ul class="user-search active style1">
                    <li v-for="(user,index) in memberList" :key="index">
                        <img :src="user.userAvatar+'?imageView2/2/w/40'" @error="error(user._key,1)" alt="">
                        <div class="user-add">
                            <span class="marginR10">{{user.userName}}</span>
                            <button class="marginR10" v-if="orgKey && ((role >= 1 && role <= 2) || orgAdmin == 'admin')" @click="deleteMember(user._key)">删除</button>
                            <button class="marginR10" v-if="orgKey && role >= 1 && role <= 2 && !user.role" @click="setOrgAdmin(user._key)">设为管理员</button>
                            <span v-if="user.role == 'admin'">管理员</span>
                        </div>
                    </li>
                </ul>
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
    name: "institution",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            tableData: [],
            actionData: [{'label':'查看', 'value':'look'}],
            page: 1,
            pages: 1,
            limit: 20,
            total: 0,
            name: '',
            h: 0,
            isShow: false,
            userList: [],
            orgKey: '',
            keyWord: '',
            memberList: [],
        };
    },
    created:function(){
        this.h = window.innerHeight - (this.role <= 2 && this.role >= 1 ? 132 : 80);
        if(this.role <= 2 && this.role >= 1){
            this.actionData = [{'label':'查看', 'value':'look'},{'label':'添加组员', 'value':'addUser'},{'label':'删除', 'value':'deleteOrg'}];
        }else{
            if(this.orgAdmin == 'admin'){
                this.actionData = [{'label':'查看', 'value':'look'},{'label':'添加组员', 'value':'addUser'}];
            }
        }
    },
    mounted:function(){
        this.getOrgList();
    },
    methods:{
        getOrgInfo:async function(){
            let data = await api.getAxios('org/member/info?siteKey='+this.stationKey+'&userKey='+this.userId);
            if(data.status == 200){
                this.$store.dispatch('setPropertyValue',{'property':'orgAdmin','value': data.data.role});
                window.localStorage.setItem('orgAdmin',data.data.role);
                this.$store.dispatch('setPropertyValue',{'property':'orgId','value': data.data.orgKey});
                window.localStorage.setItem('orgId',data.data.orgKey);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        closeModel(){
            this.isShow = false;
            this.getOrgList();
        },
        navTo({row}){
            this.isShow = true;
            this.orgKey = '';
            this.getMember(row._key);
        },
        error(id,i){
            this[i ? 'memberList' : 'userList'].map((item)=>{
                if(item._key == id){
                    item.userAvatar = require('../../assets/nav/avatar.svg');
                }
            });
        },
        addUser({row}){
            this.userList = [];
            this.keyWord = '';
            this.orgKey = row._key;
            this.isShow = true;
            this.getMember();
        },
        getUserSearch:async function(){
            let data=await api.getAxios('org/user/search?keyWord='+this.keyWord+'&orgKey='+this.orgKey+'&siteKey='+this.stationKey);
            if(data.status == 200){
                if(!data.data.length){
                    this.$XModal.message({ message: '没有该成员', status: 'warning' })
                }
                this.userList = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        toggleMember(user){
            user.hasAdd ? this.deleteMember(user._key) : this.addMember(user._key);
        },
        deleteMember:async function(userKey){
            let data=await api.deleteAxios('org/member',{orgKey: this.orgKey, userKey: userKey});
            if(data.status == 200){
                this.getMember();
                this.userList.map((item)=>{
                    if(item._key == userKey){
                        item.hasAdd = !item.hasAdd;
                    }
                });
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        addMember:async function(userKey){
            let data=await api.postAxios('org/member',{orgKey: this.orgKey, userKey: userKey});
            if(data.status == 200){
                this.getMember();
                this.userList.map((item)=>{
                    if(item._key == userKey){
                        item.hasAdd = !item.hasAdd;
                    }
                });
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getMember:async function(id){
            this.memberList = [];
            let data=await api.getAxios('org/member?orgKey='+(id || this.orgKey));
            if(data.status == 200){
                this.memberList = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        activeCellMethod({row,column}){
            if(this.role < 1 || this.role > 2){
                return false;
            }
            if(['memberCount'].indexOf(column.property) > -1){
                return false;
            }
            return true;
        },
        editClosedEvent({ row, column }){
            this.addOrg(row);
        },
        async insertEvent(row){
            let record = {
                'createUser': this.userName,
            }
            let { row: newRow } = await this.$refs.xTable.insertAt(record, row)
            await this.$refs.xTable.setActiveCell(newRow, 'type')
        },
        addOrg:async function(row){
            let data=await api.postAxios('org',{orgKey: row._key, name: row.name, 'organizationNo': row.organizationNo, 'englishName': row.englishName, userKey: this.userId, siteKey: this.stationKey});
            if(data.status == 200){
                this.getOrgList();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getOrgList:async function(){
            let data = await api.getAxios('org?siteKey='+this.stationKey+'&name='+this.name+'&orgKey='+(this.role >= 1 && this.role <= 3 ? '' : this.orgId));
            if(data.status == 200){
                this.tableData = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        deleteOrg:async function({row}){
            this.$confirm('此操作将永久删除该谱目数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                let data=await api.deleteAxios('org',{orgKey: row._key});
                if(data.status == 200){
                    this.getOrgList();
                }else{
                    this.$XModal.message({ message: data.msg, status: 'warning' })
                }
            }).catch(() => {});
        },
        setOrgAdmin:async function(userKey){
            let data = await api.patchAxios('org/admin',{orgKey: this.orgKey, userKey: userKey});
            if(data.status == 200){
                this.memberList.map((item)=>{
                    if(item._key == userKey){
                        item.role = 'admin';
                    }else{
                        item.role = '';
                    }
                });
                this.getOrgInfo();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
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
            orgAdmin: state => state.nav.orgAdmin,
            orgId: state => state.nav.orgId,
        })
    },
    watch:{
        
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
        .tool-bar{
            display: flex;
            align-items: center;
        }
        .select-wrap{
            padding: 10px 20px;
            width: calc(100% - 40px);
            display: flex;
            align-items: center;
            .name{
                border: 1px solid #ddd;
                border-radius: 5px;
                width: 300px;
                height: 34px;
                line-height: 34px;
                text-indent: 10px;
                outline: none;
            }
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 140px);
        }
    }
}
.org-user-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;
    .org-user-box{
        position: relative;
        padding: 20px;
        width: 350px;
        max-height: 100%;
        min-height: 300px;
        display: inline-block;
        background-color: #fff;
        border-radius: 30px;
        .close{
            position: absolute;
            top: 15px;
            right: 20px;
            cursor: pointer;
        }
        h3{
            text-align: center;
            margin-bottom: 10px;
        }
        input{
            border: 1px solid #ddd;
            border-radius: 5px;
            width: 100%;
            height: 34px;
            line-height: 34px;
            text-indent: 10px;
            outline: none;
        }
        .user-search{
            max-height: 150px;
            overflow-y: auto;
            margin-top: 10px;
            &.active{
                max-height: 250px;
            }
            li{
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                img{
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 5px;
                }
                .user-add{
                    button{
                        outline: none;
                        border: none;
                        background-color: #358acd;
                        color: #fff;
                        padding: 0 5px;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                }
            }
        }
    }
}
.marginR10{
    margin-right: 10px;
}
</style>

