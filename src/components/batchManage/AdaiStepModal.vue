<template>  
    <div class="adai-step-wrap">
        <div class="adai-step-box" :class="{actives:(i-1) >= index}" v-for="(item,index) in list" :key="'step'+index" @click="next(index)">
            <div class="adai-step-left">
                <i :class="(i-1) >= index ? 'el-icon-circle-check' : 'el-icon-time'"></i>
                <span>{{index+1}} {{item}}</span>    
            </div>
            <div class="adai-step-right" v-show="i >= index && index < (list.length - 1)">
                <i class="el-icon-arrow-right"></i>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "adaiStepModal",
    props:{
        list:{
            type: Array
        },
        step:{
            type: Number
        },
    },
    data: () => {
        return {
            i: 0,
        };
    },
    mounted:function(){
        this.i = this.step;
    },
    methods:{
        next(i){
            this.$emit('next-step',i);
        },
    },
    watch:{
        'step':function(nv,ov){
            console.log(nv);
            this.i = nv;
        }
    }
};
</script>
<style scoped lang="scss">
.adai-step-wrap{
    padding: 0 10px;
    width: calc(100% - 20px);
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #999;
    .adai-step-box{
        position: relative;
        width: 20%;
        height: 40px;
        line-height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        font-weight: bold;
        .adai-step-left{
            display: flex;
            align-items: center;
            i{
                margin-right: 5px;
                font-size: 20px;
            }
        }
        .adai-step-right{
            display: flex;
            align-items: center;
            i{
                font-size: 58px;
                color: #fff;
            }
        }
        &:hover{
            color: #358acd;
        }
        &.actives{
            color: #fff;
            cursor: default;
            background-color: #358acd;
        }
    }
}
</style>

