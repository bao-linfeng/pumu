<template>
    <div class="titleWrap">
        <div class="title"><span v-for="(char,index) in title" :key="'char'+index">{{char}}</span></div>
    </div>
</template>

<script>
export default {
    name: "headTitle",
    props:{
        title:{
            type:[String],
            required:true
        },
    },
};
</script>
<style scoped lang="scss">
.titleWrap{
    display: inline-block;
    padding: 10px 0;
    height: 36px;
    text-align: center;
    color: #333;
    .title{
        margin: 0 auto;
        padding: 0 35px;
        height: 36px;
        line-height: 36px;
        z-index: 10000;
        background:url('../../assets/home/left.svg') 0 50% no-repeat,url('../../assets/home/right.svg') 100% 50% no-repeat;
        font-size: 24px;
        font-family: 'FZQKBYSJW--GB1-0';
        span{
            display: inline-block;
            width: 36px;
            height: 36px;
        }
    }
}
</style>

