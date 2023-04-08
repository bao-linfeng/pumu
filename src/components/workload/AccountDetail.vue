<template>
    <div class="accountDetail-wrap">
        <div class="accountDetail-box">
            <div class="head-box">
                <h3 class="title">记录列表</h3>
                <img class="close" @click="close(false)" src="../../assets/close.svg" alt="">
            </div>
            <div class="content-box">
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
                    :data="tableData">
                    <vxe-table-column field="volumeKey" title="卷册ID"></vxe-table-column>
                    <vxe-table-column field="volumeNumber" title="卷名"></vxe-table-column>
                    <vxe-table-column field="gcKey" title="谱ID"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名"></vxe-table-column>
                    <vxe-table-column field="imageNumber" title="拍机数"></vxe-table-column>
                    <vxe-table-column field="orgName" title="所属机构"></vxe-table-column>
                    <vxe-table-column field="passUserName" title="审核人"></vxe-table-column>
                    <vxe-table-column field="timeO" title="审核时间"></vxe-table-column>
                    <vxe-table-column field="action" title="审核操作"></vxe-table-column>
                </vxe-table>
                <vxe-pager
                    align="right"
                    @page-change = "changePage"
                    :current-page.sync="page"
                    :page-size.sync="limit"
                    :total="total"
                    :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'FullJump', 'Total']">
                </vxe-pager>
            </div>
            <div class="foot-box">
                
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "accountDetail",
    props:{
        row:{
            type: Object
        },
    },
    components: {

    },
    data: () => {
        return {
            tableData: [],
            h: 300,
            page: 1,
            pages: 0,
            limit: 20,
            total: 0,
        };
    },
    mounted:function(){
        this.h = window.innerHeight - 100 - 60 - 50;
        this.getDataList();
    },
    methods:{
        close(flag){
            this.$emit('close', flag);
        },
        async getDataList(){
            let result = await api.getAxios('review/task/workDetail?statisticsType='+this.row.statisticsType+'&startTime='+this.row.startTime+'&endTime='+this.row.endTime+'&takeStatus='+this.row.takeStatus+'&orgKey='+this.row.orgKey+'&page='+this.page+'&limit='+this.limit);
            if(result.status == 200){
                this.tableData = result.result.list.map((ele)=>{
                    ele.timeO = ADS.getLocalTime(ele.time);
                    return ele;
                });
                this.pages = result.result.pageNum;
                this.total = result.result.total;
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.getDataList();
        },
    },
    computed: {
        ...mapState({
            stationKey: state => state.nav.stationKey,
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
            userId: state => state.nav.userId,
        })
    },
};
</script>

<style scoped lang="scss">
.accountDetail-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    .accountDetail-box{
        position: relative;
        width: 1000px;
        height: calc(100% - 100px);
        padding: 0 20px;
        background: #fff;
        border-radius: 5px;
        .head-box{
            position: relative;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            .close{
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                cursor: pointer;
            }
        }
    }
    .content-box{
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        .input-box{
            position: relative;
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            .label{
                width: 100px;
            }
        }
    }
    .foot-box{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 60px;
    }
}
.width200{
    width: 200px;
}
.marginL10{
    margin-right: 10px;
}
</style>

