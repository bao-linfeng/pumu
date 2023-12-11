<template>
    <div class="input-search-modal">
        <input type="text" :placeholder="'请输入'+inputLabel" v-model.trim="inputValue" @keyup.enter="handleKeyUp" />
        <div class="tag_close" v-show="inputValue" @click="inputValue = ''"><i class="el-icon-close"></i></div>
    </div>
</template>

<script>
export default {
    name: "inputSearchModal",
    props:{
        inputLabel:{
            type: String,
        },
        inputType:{
            type: String,
        },
        defaultValue:{
            type: String,
        },
    },
    mounted: function(){
        this.defaultValue ? this.inputValue = this.defaultValue : null;
    },
    data: () => {
        return {
            inputValue:'',
        };
    },
    methods:{
        handleKeyUp(){
            this.$emit('key-up',{'label':this.inputType,'value':this.inputValue});
        },
    },
    watch:{
        'inputValue':function(newV,oldV){
            this.$emit('change-value',{'label':this.inputType,'value':newV});
        }
    }
};
</script>

<style scoped lang="scss">
.input-search-modal{
    position: relative;
    width: 100%;
    height: 40px;
    line-height: 40px;
    input{
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

