<template>  
    <div class="group">
        <input class="search" type="text" :placeholder="'请输入'+name" v-model.trim="value" @keyup.enter="handleKeyUp" />
        <div class="tag_close" v-show="value" @click="clear()"><i class="el-icon-close"></i></div>
    </div>
</template>

<script>
export default {
    name: "search",
    props:{
        defaultValue:{
            type: String,
        },
        name:{
            type: String,
        },
        type:{
            type: String,
        },
    },
    data: () => {
        return {
            value:'',
        };
    },
    mounted:function(){
        this.value = this.defaultValue;
    },
    methods:{
        clear(){
            this.value = '';
            this.$emit('get-value',{'type':this.type,'value':''});
        },
        handleKeyUp(){
            this.$emit('key-up',true);
        },
    },
    watch:{
        'value':function(newV,oldV){
            this.$emit('get-value',{'type':this.type,'value':newV});
        }
    }
};
</script>
<style scoped lang="scss">
.group{
    position: relative;
    width: 15%;
    height: 40px;
    line-height: 40px;
    margin-top: 10px;
    .search{
        width: 100%;
        height: 38px;
        line-height: 38px;
        text-indent: 10px;
        border: none;
        outline: none;
        background: #F6FAFD;
        border: 1px solid #D6E7F3;
    }
    .tag_close{
        position: absolute;
        top: 12px;
        right: 10px;
        width: 16px;
        height: 16px;
        line-height: 16px;
        font-size: 12px;
        text-align: center;
        color: #fff;
        background: #4C95FF;
        cursor: pointer;
    }
}
</style>

