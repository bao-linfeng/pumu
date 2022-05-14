<template>  
    <div class="jiapu-edit-modal">
        <div class="jiapu-edit-title-wrap">
            <h3>编辑的家谱列表</h3>
            <span  @click="close">关闭</span>
        </div>
        <div class="jiapu-eidt-list">
            <table class="edit-list-table" border="1">
                <thead>
                    <tr>
                        <th v-for="(item,index) in fieldFilters" :key="index">{{item.label}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item) in editList" :key="item._key">
                        <td :class="{active: item.changeFieldArr.indexOf(item2.value) > -1}" v-for="(item2,index) in fieldFilters" :key="index">{{item[item2.value]}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogyEditListTableModal",
    props:{
        fieldFilters:{
            type: Array
        },
    },
    components: {
        
    },
    data: () => {
        return {
            editList: [],
            begTime: '', 
            endTime: '', 
            page: 1, 
            limit: 20,
            total: 0,
        };
    },
    created:function(){
        
    },
    mounted:function(){
        this.getDataChanged();
    },
    methods:{
        getDataChanged:async function(){
            let data = await api.getAxios('data/changed?siteKey='+this.stationKey+'&begTime='+this.begTime+'&endTime='+this.endTime+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.editList = data.result.list;
                this.total = data.result.total;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        close(){
            this.$emit('close-edit-list', false);
        }
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
.jiapu-edit-modal{
    position: fixed;
    top: 0;
    left: 0;
    width: calc(100% - 40px);
    height: calc(100% - 40px);
    padding: 20px;
    background-color: #fff;
    z-index: 100000;
    .jiapu-edit-title-wrap{
        height: 60px;
        line-height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        span{
            cursor: pointer;
        }
    }
}
.jiapu-eidt-list{
    position: relative;
    width: 100%;
    height: calc(100% - 60px);
}
.edit-list-table{
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    td{
        &.active{
            border: 1px solid #f00;
            color: #f00;
        }
    }
}
</style>

