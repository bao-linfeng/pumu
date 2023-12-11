<template>
    <div class="titleWrap">
        <div class="line"></div>
        <div class="title"><span v-for="(char,index) in title" :key="'char'+index">{{char}}</span></div>
        <!-- <a class="xs_more" :href="url">更多</a> -->
    </div>
</template>

<script>
export default {
    name: "titleVue",
    props:{
        title:{
            type:[String],
            required:true
        },
        url:{
            type:[String],
            required:true
        },
    },
};
</script>
<style scoped lang="scss">
.titleWrap{
    width: 100%;
    position: relative;
    padding: 30px 0;
    height: 91px;
    text-align: center;
    .title{
        position: absolute;
        top: 30px;
        left: 50%;
        margin-left: -203px;
        width: 405px;
        height: 91px;
        line-height: 91px;
        // z-index: 10;
        background:url('../../assets/person/charBox.png') 50% 50% no-repeat,url('../../assets/home/left.svg') 0 50% no-repeat,url('../../assets/home/right.svg') 100% 50% no-repeat;
        background-color: #f2f2f2;
        font-size: 50px;
        font-family: 'FZQKBYSJW--GB1-0';
        color: #666;
        span{
            display: inline-block;
            width: 80px;
            height: 80px;
        }
    }
    .line{
        width: 100%;
        height: 45px;
        border-bottom: 1px solid #ddd;
    }
}
.xs_more{
    position: absolute;
    right: 0;
    top: 55px;
    display: block;
    width: 81px;
    height: 41px;
    line-height: 41px;
    background:url('../../assets/person/more.png') 0 0 no-repeat;
    background-color: #f2f2f2;
    font-size: 14px;
    color: #666;
    &:hover{
        color: #9D7747;
        background-position-x: -82px;
    }
}
@media screen and (max-width: 768px) {
    .titleWrap{
        padding: 15px 0;
        height: 31px;
        .line{
            height: 16px;
        }
        .title{
            width: 200px;
            height: 31px;
            top: 15px;
            line-height: 31px;
            margin-left: -100px;
            font-size: 24px;
            span{
                width: 31px;
                height: 31px;
            }
        }
    }
    .xs_more{
        display: none;
    }
}
</style>

