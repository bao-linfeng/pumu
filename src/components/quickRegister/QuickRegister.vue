<template>
    <div class="edit-wrap style1">
        <div class="edit-box">
            <div class="head-box">
                <h3 class="title">一键注册</h3>
            </div>
            <div class="content-box">
                <div class="edit-list">
                    <label class="label" for="">手机号:</label>
                    <el-select class="width68" v-model="mobileArea" placeholder="请选择区号" size="small">
                        <el-option
                            v-for="item in mobileAreaList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-input class="width140" v-model="mobile" placeholder="请输入手机号" size="small"></el-input>
                </div> 
                <div class="edit-list">
                    <label class="label" for="">邮箱:</label>
                    <el-input class="width208" v-model="email" placeholder="请输入邮箱" size="small"></el-input>
                </div>
                <div class="edit-list">
                    <label class="label" for="">密码:</label>
                    <el-input class="width208" v-model="password" placeholder="请输入密码" size="small"></el-input>
                </div>
                <div class="edit-list">
                    <label class="label" for="">昵称:</label>
                    <el-input class="width208" v-model="nickName" placeholder="请输入昵称" size="small"></el-input>
                </div>
                <div class="edit-list">
                    <label class="label" for="">性别:</label>
                    <el-radio v-model="gender" :label="1">女</el-radio>
                    <el-radio v-model="gender" :label="0">男</el-radio>
                </div>
                <div class="edit-list">
                    <label class="label" for="">微站权限:</label>
                    <el-select v-model="targetRole" placeholder="请选择权限" size="small">
                        <el-option
                            v-for="item in targetRoleList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </div> 
            </div>
            <div class="foot-box">
                <el-button size="medium" @click="close">取消</el-button>
                <el-button type="primary" size="medium" @click="save">注册</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import ADS from "../../ADS.js";
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "quickRegister",
    props:{
        detail: {
            type: Object
        }
    },
    data: () => {
        return {
            targetRoleList: [],
            targetRole: '', 
            mobileArea: '86', 
            mobileAreaList: [
                {'label': '中国', 'value': '86'},
                {'label': '香港', 'value': '852'},
                {'label': '澳门', 'value': '853'},
                {'label': '台湾', 'value': '886'},
                {'label': '英国', 'value': '44'},
                {'label': '美国/加拿大', 'value': '1'},
            ],
            mobile: '', 
            email: '', 
            password: '', 
            gender: 0, 
            nickName: '',
        };
    },
    mounted: function(){
        if(this.role >= 1 && this.role <= 3){
            if(this.role == 1){
                this.targetRoleList = [
                    {'label': '管理员', 'value': '2'},
                    {'label': '编辑', 'value': '3'},
                    {'label': '作者', 'value': '4'},
                    {'label': '成员', 'value': '5'},
                ];
                this.targetRole = '5';
            }
            if(this.role == 2){
                this.targetRoleList = [
                    {'label': '编辑', 'value': '3'},
                    {'label': '作者', 'value': '4'},
                    {'label': '成员', 'value': '5'},
                ];
                this.targetRole = '5';
            }
        }else{
            if(this.orgAdmin == 'admin'){
                this.targetRoleList = [
                    {'label': '成员', 'value': '5'},
                ];
                this.targetRole = '5';
            }
        }
    },
    methods:{
        close(){
            this.$emit('close', false);
        },
        save(){
            if((this.role >= 1 && this.role <= 2) || this.orgAdmin == 'admin'){
                this.$confirm('请确认是否一键注册该账号?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.addUser();
                }).catch(() => {});
            }else{
                this.$XModal.message({message: '微站超管、管理员、机构管理员才能一键注册', status: 'warning'})
            }
        },
        async addUser(){
            let result = await api.postAxios('site/addUser', {
                "siteKey": this.stationKey,
                'orgKey': this.orgId,
                "userKey": this.userId,
                'targetRole': Number(this.targetRole),
                'mobileArea': '+'+this.mobileArea,
                'mobile': this.mobile.trim(),
                'email': this.email.trim(),
                'password': this.password.trim(),
                'gender': this.gender,
                'nickName': this.nickName,
                'myToken': this.TOKEN,
            });
            if(result.status == 200){
                ADS.message('一键注册成功！', true);
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

