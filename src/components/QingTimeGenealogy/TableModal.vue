<template>  
    <div class="jiapu-table-modal">
        <div class="jiapu-table-title">
          <h3>检索结果</h3>
          <div>
            <span>共检索出<i>{{total}}</i>部家谱</span>
          </div>
        </div>
        <vxe-table
            border
            resizable
            stripe
            show-overflow
            highlight-hover-row
            ref="xTable"
            @checkbox-change = "checkboxChange"
            @checkbox-all = "checkboxChange"
            :align="'center'"
            :data="list"
            @cell-click="cellClickEvent">
            <vxe-table-column type="checkbox" width="60"></vxe-table-column>
            <vxe-table-column v-for="(item,index) in fieldFilters" :key="'fieldFilters'+index" :field="item.value" :title="item.label"></vxe-table-column>
            <vxe-table-column field="hasImage" title="影像"></vxe-table-column>
            <vxe-table-column field="pages" title="书本页数"></vxe-table-column>
            <vxe-table-column field="imagePages" title="影像页数"></vxe-table-column>
            <vxe-table-column field="buyCatalog" title="已购谱目"></vxe-table-column>
            <vxe-table-column field="buyImage" title="已购影像"></vxe-table-column>
        </vxe-table>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "tableModal",
    props:{
        list:{
            type: Array
        },
        total:{
            type: Number,
        },
        fieldFilters:{
            type: Array
        },
    },
    components: {
        
    },
    data: () => {
        return {
            gid: '',
            w: 300,
        };
    },
    created:function(){
        
    },
    mounted:function(){
        
    },
    methods:{
        checkboxChange({records}){
            records.map((item)=>{
                item.select = true;
            });
            this.$emit('checkbox-change',records);
        },
        cellClickEvent({row,column}){
            if(row.hasImage == 1){
                this.$router.push('/'+window.localStorage.getItem('pathname')+'/view?gid='+row._key+'&volume=1&page=1');
            }else{
                this.$XModal.message({ message: '暂无家谱', status: 'warning' });
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
        })
    },
};
</script>
<style scoped lang="scss">
.jiapu-table-modal{
    width: calc(100% - 40px);
    margin: 20px;
    background-color: #fff;
    .jiapu-table-title{
        display: flex;
        justify-content: space-between;
        padding: 15px 0;
        h3{
            color: #344B5A;
            height: 16px;
            line-height: 16px;
            border-left: 2px solid #4C95FF;
            padding-left: 20px;
        }
        span{
            color: #7E8E98;
            margin-right: 20px;
            margin-left: 10px;
            letter-spacing: 1px;
            i{
                font-style: normal;
                letter-spacing: 0px;
                margin: 0 5px;
            }
        }
    }
}
</style>

