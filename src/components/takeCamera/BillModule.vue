<template>
    <div class="disk-manage-wrap">
        <div class="disk-manage-head">
            <h3 class="title">付款单</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </div>
        <div class="disk-manage-content style1">
            <h3 class="title">发票记录</h3>
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{item}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2" @click="singleClick(item, item2)">
                            <div v-if="item2 === 'action'">
                                <button v-if="item.status === 0" class="btn marginR10" @click="updateCollection(item._key)">结算</button>
                                <button class="btn" @click="goBill(item._key)">查看发票</button>
                            </div>
                            <i :class="{active: item2 === 'gcNum'}" v-else>{{item[item2]}}</i>
                            <table class="task-table" v-if="item2 === 'gcNum' && catalogKey == item._key" @click.stop="">
                                <thead>
                                    <tr>
                                        <td>ID</td>
                                        <td>谱名<img class="task-close" @click="taskClose" src="../../assets/close.svg" alt=""></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item3, index3) in billDetailList" :key="index3">
                                        <td>{{item3._key}}</td>
                                        <td>{{item3.genealogyName}}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "BillModule",
    props:{
        
    },
    data: () => {
        return {
            theadV: ['创建日期', '谱数', '卷册', '页册', '金额', '状态', '操作'],
            parameterV: ['timeO', 'gcNum', 'volumeNum', 'imageNum', 'fee', 'statusO', 'action'],
            tbody: [],
            billDetailList: [],
            catalogKey: '',
        };
    },
    mounted: function(){
        this.getCameraBill();
    },
    methods:{
        taskClose(){
            this.catalogKey = '';
                this.billDetailList = [];
        },
        goBill(key){
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/bill?k='+key);
        },
        async getCameraBill(){
            const result = await api.getAxios('review/bill?siteKey='+this.stationKey);
            if(result.status == 200){
                this.tbody = result.data.map((ele) => {
                    ele.fee = (ele.fee).toFixed(2);
                    ele.timeO = ADS.getLocalTime(ele.time);
                    ele.statusO = ele.status == 3 ? '已归档' : ele.status == 2 ? '已收款' : ele.status == 1 ? '已结算' : '已开发票';
                    return ele;
                });
            }else{
                ADS.message(result.msg);
            }
        },
        async getBillDetail(key) {
            const result = await api.getAxios('review/bill/detail?siteKey='+this.stationKey+'&billKey='+key);
            if(result.status == 200){
                this.billDetailList = result.data.catalogList;
            }else{
                ADS.message(result.msg);
            }
        },
        singleClick(item, item2){
            if(this.catalogKey == item._key){
                this.catalogKey = '';
                this.billDetailList = [];
            }else{
                if(item2 === 'gcNum'){
                    this.catalogKey = item._key;
                    this.getBillDetail(item._key);
                }
            }
        },
        updateCollection(key){
            this.$confirm('是否进行此操作?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.updateBillCollection(key);
            }).catch(() => {});
        },
        async updateBillCollection(key) {
            const result = await api.patchAxios('review/settlement', {'siteKey': this.stationKey, 'billKey': key});
            if(result.status == 200){
                this.getCameraBill();
            }else{
                ADS.message(result.msg);
            }
        },
        close() {
            this.$emit('close', false);
        }
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
        })
    },
    watch:{
        
    }
};
</script>
<style lang="scss" scoped>
.disk-manage-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 700px;
    height: calc(100% - 50px);
    padding: 0 30px 30px 30px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 1px 10px 0px rgba(114,114,114,0.50); 
    z-index: 100;
    .disk-manage-head{
        position: relative;
        height: 40px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            cursor: pointer;
            transform: translateY(-50%);
        }
    }
    .disk-manage-content{
        position: relative;
        width: 100%;
        height: calc(100% - 40px);
        overflow-y: auto;
    }
    .disk-manage-foot{
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .title{
        height: 40px;
        line-height: 40px;
        font-size: 14px;
    }
}
.table{
    position: relative;
    width: 100%;
    height: calc(100% - 50px);
    text-align: center;
    border: none;
    border-collapse: collapse;
    color: #000;
    overflow-y: auto;
    .thead{
        position: relative;
        width: 100%;
        height: 40px;
        background: #D1D1D1;
        position: sticky;
        top: 0;
        z-index: 2;
        tr{
            th{
                padding: 5px 0;
                min-width: 80px;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 42px);
        tr{
            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            td{
                position: relative;
                padding: 5px 0;
                min-width: 80px;
                i{
                    color: #333;
                    font-style: normal;
                    &.active{
                        cursor: pointer;
                        color: #85B83E;
                    }
                }
            }
        }
    }
    .btn{
        outline: none;
        border: none;
        cursor: pointer;
        line-height: 40px;
        border-radius: 20px;
        background: #85B83E;
        color: #fff;
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
    }
    .marginR10{
        margin-right: 10px;
    }
}
.task-table{
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    width: 350px;
    background: rgba(216,216,216,0.70);
    box-shadow: 0px 0px 7px 0px rgba(27,27,27,0.50); 
    backdrop-filter: blur(10px);
    z-index: 100;
    &::before{
        content: '';
        position: absolute;
        top: 50%;
        left: -30px;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 15px solid transparent;
        border-right: 15px solid rgba(216,216,216,0.70);
        border-bottom: 15px solid transparent;
        border-left: 15px solid transparent;
    }
    thead{
        font-weight: bold;
        tr{
            td{
                position: absolute;
                .task-close{
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    right: 10px;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>