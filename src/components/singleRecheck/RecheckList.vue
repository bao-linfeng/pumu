<template>
    <DragModule>
        <div class="log-box">
            <div class="head-box">
                <h3 class="title">命中规则谱目列表</h3>
                <img class="close" @click="close(false)" src="../../assets/close.svg" alt="">
            </div>
            <div class="content-box">
                <!-- show-overflow -->
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    highlight-hover-row
                    row-key
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData">
                    <vxe-table-column field="ruleMemo" title="命中规则"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名"></vxe-table-column>
                    <vxe-table-column field="repeatOSBN" title="谱ID"></vxe-table-column>
                    <vxe-table-column field="hall" title="堂号"></vxe-table-column>
                    <vxe-table-column field="place" title="谱籍现代地名"></vxe-table-column>
                    <vxe-table-column field="publish" title="出版年"></vxe-table-column>
                    <vxe-table-column field="surname" title="姓氏"></vxe-table-column>
                    <vxe-table-column field="authors" title="作者"></vxe-table-column>
                    <vxe-table-column field="condition" title="状态"></vxe-table-column>
                    <vxe-table-column field="orgName" title="上传机构"></vxe-table-column>
                    <vxe-table-column title="操作" width="100" :cell-render="{name:'AdaiActionButton', attr:{data: actionData}, events:{'lookBook': lookBook}}"></vxe-table-column>
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
        </div>
        <!-- 查看谱目 -->
        <CatalogView v-if="isShow == 2" :read="isRead" :dataKey="dataKey" :vid="''" v-on:close="isShow = 0" />
    </DragModule>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
import DragModule from '../../components/dragModule/DragModule.vue';
import CatalogView from '../../components/takeCamera/CatalogView.vue';
export default {
    name: "recheckList",
    props:{
        id:{
            type: String
        },
    },
    components: {
        DragModule, CatalogView,
    },
    data: () => {
        return {
            tableData: [],
            h:300,
            page: 1,
            pages: 0,
            limit: 20,
            total: 0,
            actionData: [
                {'label': '详情', 'value': 'lookBook'}
            ],
            isShow: 1,
            isRead: true,
            dataKey: '',
        };
    },
    mounted:function(){
        this.h = window.innerHeight - 100 - 60 - 50;
        this.getDataList();
    },
    methods:{
        lookBook({ row }){
            console.log(row);
            this.dataKey = row.gcKey;
            this.isShow = 2;
        },
        close(flag){
            this.$emit('close', flag);
        },
        async getDataList(){
            let result = await api.getAxios('data/editGCCheckLog?checkTaskKey='+this.id+'&page='+this.page+'&limit='+this.limit);
            if(result.status == 200){
                this.tableData = result.result.list.map((ele)=>{
                    ele.timeO = ADS.getLocalTime(ele.time);
                    return ele;
                });
                this.pages = 1;
                this.total = result.result.list.length;
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
.log-box{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 0 20px;
    background: #fff;
    z-index: 100;
    .head-box{
        position: relative;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
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
.width200{
    width: 200px;
}
.marginL10{
    margin-right: 10px;
}
</style>

