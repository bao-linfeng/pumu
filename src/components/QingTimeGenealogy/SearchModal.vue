<template>
    <div class="search-modal-wrap">
        <h3 class="search-modal-title">家谱资源</h3>
        <div class="search-modal-box">
            <InputSearchModal class="w15 marginB10" v-for="(item,index) in fieldFilters" :key="'fieldFilters'+index" :inputLabel="item.label" :inputType="item.value" v-on:change-value="changeValue" v-on:key-up="handleKeyUp" />
            <el-select v-model="parameters.noBuyCatalog" placeholder="请选择谱目家谱" class="w15 marginB10">
                <el-option
                    v-for="item in noBuyCatalog"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select v-model="parameters.noBuyImage" placeholder="请选择家谱" class="w15 marginB10">
                <el-option
                    v-for="item in noBuyImage"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select v-model="parameters.hasImage" placeholder="请选择影像" class="w15 marginB10">
                <el-option
                    v-for="item in imageList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <div class="w15 marginB10"></div>
            <div class="search-button-modal" @click="getGenealogy">
                <span>搜索</span>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import InputSearchModal from "../../components/common/InputSearchModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "searchModal",
    props:{
        fieldFilters:{
            type: Array,
        }
    },
    components: {
        InputSearchModal
    },
    data: () => {
        return {
            parameters:{
                noBuyCatalog: 2,
                noBuyImage: 2,
                hasImage: 2,
            },
            noBuyCatalog: [{'label':'全部谱目','value':2},{'label':'已购谱目','value':1},{'label':'未购谱目','value':0}],
            noBuyImage: [{'label':'全部影像','value':2},{'label':'已购影像','value':1},{'label':'未购影像','value':0}],
            imageList: [{'label':'影像资料','value':2},{'label':'有影像','value':1},{'label':'无影像','value':0}],
        };
    },
    created:function(){
        
    },
    mounted:function(){
        
    },
    methods:{
        changeValue(data){
            this.parameters[data.label] = data.value;
        },
        getGenealogy(){
            this.$emit('get-genealogy',this.parameters);
        },
        handleKeyUp(data){
            this.parameters[data.label] = data.value;
            this.$emit('get-genealogy',this.parameters);
        },
    },
    computed: {
        ...mapState({
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
        })
    },
    watch:{
        
    }
};
</script>

<style scoped lang="scss">
.search-modal-wrap{
    position: relative;
    background: #fff;
    padding:30px 20px 20px 20px;
    margin: 20px;
    width: calc(100% - 80px);
    .search-modal-title{
        position: absolute;
        top: 10px;
        left: 0;
        font-size: 16px;
        color: #344B5A;
        height: 16px;
        line-height: 16px;
        border-left: 2px solid #4C95FF;
        padding-left: 20px;
    }
    .search-modal-box{
        position: relative;
        margin: 10px auto;
        display: flex;
        justify-content: space-between;
        flex-wrap:wrap;
    }
}
.search-button-modal{
    width: 15%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #fff;
    background: #4C95FF;
    border: none;
    outline: none;
    border-radius: 20px;
    cursor: pointer;
    margin: 0;
}
.w15{
    width: 15%;
}
.marginB10{
    margin-bottom: 10px;
}
</style>

