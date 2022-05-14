<template>  
    <div class="lib-wrap">
        <div class="select-wrap">
            <vxe-select v-model="type" placeholder="数据类型">
                <vxe-option v-for="(item,index) in dataType" :key="'type'+index" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
            <vxe-select v-model="libKey" placeholder="数据源">
                <vxe-option v-for="(item,index) in lib" :key="'lib'+index" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
            <vxe-select v-model="templateKey" placeholder="模板">
                <vxe-option v-for="(item,index) in template" :key="'template'+index" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
        </div>
        <vxe-table
            ref="xTable"
            :align="'center'"
            :data="tableData"
            :max-height="400"
            border
            resizable
            stripe
            keep-source
            show-overflow
            highlight-hover-row>
            <vxe-table-column field="columnName" title="模板表头" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
            <vxe-table-column field="fieldKey" title="对应字段" :edit-render="{name: '$select', options: field}"></vxe-table-column>
        </vxe-table>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "libmodal",
    components: {
        
    },
    data: () => {
        return {
            type:'',
            dataType:[],
            tableData: [],
            libKey:'',
            lib:[],
            templateKey:'',
            template:[],
            field:[],
            isFirst:true,
        };
    },
    mounted:function(){
        this.getDataType();
        this.getField();
    },
    methods:{
        getDataType:async function(){
            let data=await api.getAxios('dataType');
            if(data.status == 200){
                let dataType = [];
                data.data.map((item)=>{dataType.push({'label':item.showName,'value':item.type})});
                this.type = dataType.length ? dataType[0].value : '';
                this.dataType = dataType;
                this.getLib();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getField:async function(){
            let data=await api.getAxios('field?type='+this.type);
            if(data.status == 200){
                let field = [];
                data.data.map((item)=>{field.push({'label':item.fieldName,'value':item._key})});
                this.field = field;
                this.getLib();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getLib:async function(){
            let data=await api.getAxios('lib?siteKey='+this.stationKey);
            if(data.status == 200){
                let lib = [];
                data.data.map((item)=>{lib.push({'label':item.libCode,'value':item._key})});
                this.libKey = lib.length ? lib[0].value : '';
                this.lib = lib;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getTemplate:async function(){
            let data=await api.getAxios('template?type='+this.type+'&libKey='+this.libKey+'&siteKey=');
            if(data.status == 200){
                let template = [];
                data.data.map((item)=>{template.push({'label':item.templateName,'value':item._key})});
                this.templateKey = template.length ? template[0].value : '';
                this.isFirst = false;
                this.template = template;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getTemplateDetail:async function(){
            let data=await api.getAxios('template/detail?templateKey='+this.templateKey);
            if(data.status == 200){
                data.data.map((item)=>{
                    item.createTime = ADS.getLocalTime(item.createTime);
                })
                this.tableData = data.data;
                this.$emit('get-detail', data.data);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
        })
    },
    watch:{
        'type':function(newV,oldV){
            this.isFirst ? null : this.getTemplate()
        },
        'libKey':function(newV,oldV){
            this.getTemplate();
        },
        'templateKey':function(newV,oldV){
            this.$emit('get-data',{'type':this.type,'libKey':this.libKey,'templateKey':newV});
            newV ? this.getTemplateDetail() : this.tableData = [];
        },
    },
};
</script>
<style scoped lang="scss">
.lib-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    text-align: left;
    .select-wrap{
        display: flex;
        margin-bottom: 20px;
    }
}
</style>

