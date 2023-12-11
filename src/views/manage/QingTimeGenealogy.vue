<template>
  <div class="wrap">
      <!-- 侧边栏 -->
    <Sidebar />
    <div class="content">
        <!-- 导航 -->
        <NavModal :title="'时光家谱'" />
        <!-- 家谱检索 -->
        <SearchModal :fieldFilters="fieldFilters" v-on:get-genealogy="getGenealogy" />
        <!-- 操作按钮 -->
        <ButtonModal v-if="role >= 1 && role <= 3" v-on:open-payment-modal="openPaymentModal" />
        <!-- 家谱列表 -->
        <TableModal :list="list" :total="total" :fieldFilters="fieldFilters" />
        <!-- 分页 -->
        <vxe-pager
            align="center"
            @page-change = "changePage"
            :current-page.sync="page"
            :page-size.sync="limit"
            :total="total"
            :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total']">
        </vxe-pager>
    </div>
    <!-- 购买家谱 -->
    <PaymentModal v-if="isOpenPaymentModal" :data="list"  v-on:close-source="isOpenPaymentModal=false" />
    <!-- loading -->
    <Loading v-show="loading" />
  </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import SearchModal from "../../components/QingTimeGenealogy/SearchModal.vue";
import ButtonModal from "../../components/QingTimeGenealogy/ButtonModal.vue";
import TableModal from "../../components/QingTimeGenealogy/TableModal.vue";
import PaymentModal from "../../components/qtGenealogy/PaymentModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "qtjiapu",
    components: {
        Sidebar,NavModal,SearchModal,ButtonModal,PaymentModal,TableModal,
    },
    data: () => {
        return {
            loading: false,
            fieldFilters: [],
            list: [],
            page: 1,
            limit: 20,
            pages: 1,
            total: 0,
            isOpenPaymentModal: false,
        };
    },
    mounted:function(){
        this.getFieldFilterList();
        this.getGenealogy({});
    },
    methods:{
        getFieldFilterList:async function(){// 检索字段列表
            let data=await api.getAxios('field/filter?type=家谱&asSearch=1');
            if(data.status == 200){
                let fieldFilters = [];
                data.data.map((item)=>{fieldFilters.push({'label':item.fieldMeans,'value':item.fieldName})});
                this.fieldFilters = fieldFilters;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.getGenealogy();
        },
        getGenealogy:async function(params){
            console.log(params);
            let param = '';
            for(let key in params){
                param = param + '&' + key + '=' + params[key];
            }
            this.loading = true;
            let data = await api.getAxios('catalog/sg?siteKey='+this.stationKey+param+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                this.list = data.result.list;
                this.list.map((item)=>{
                    item.hasImage = (item.hasImage == 1 ? '有' : '无')
                    item.buyCatalog = (item.buyCatalog == 1 ? '是' : '否')
                    item.buyImage = (item.buyImage == 1 ? '是' : '否')
                })
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }
        },
        openPaymentModal(){
            this.isOpenPaymentModal = true;
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
        })
    },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: calc(100% - 200px);
    min-height: 100%;
    padding-left: 200px;
    text-align: left;
    background: #EFF1F5;
    .content{
        position: relative;
        width: 100%;
        font-size: 14px;
    }
}
</style>

