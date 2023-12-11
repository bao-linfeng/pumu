<template>
    <div class="log-wrap">
        <div class="log-box">
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
                    <vxe-table-column field="log" title="日志内容"></vxe-table-column>
                    <vxe-table-column field="userName" title="操作者"></vxe-table-column>
                    <vxe-table-column field="timeO" title="操作时间"></vxe-table-column>
                </vxe-table>
                <vxe-pager
                    align="right"
                    @page-change = "changePage"
                    :current-page.sync="page"
                    :page-size.sync="limit"
                    :total="total"
                    :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total']">
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
    name: "logModule",
    props:{
        id:{
            type: String
        },
    },
    components: {

    },
    data: () => {
        return {
            tableData: [],
            h:300,
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
            // isGCOrVolume 不传所有，1 只谱的，2 只卷册的
            let result = await api.getAxios('review/volumeOperationLogList?volumeKey='+this.id+'&log=&startTime=&endTime=&page='+this.page+'&limit='+this.limit);
            if(result.status == 200){
                this.tableData = result.data.list.map((ele)=>{
                    ele.timeO = ADS.getLocalTime(ele.time);
                    return ele;
                });
                this.pages = result.data.pageNum;
                this.total = result.data.total;
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
.log-wrap{
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
    .log-box{
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

