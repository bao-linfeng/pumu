<template>
    <div class="loading">
        <img src="../../assets/home/loading3.gif" alt="">
    </div>
</template>
<style scoped lang="scss">
.loading{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100000;
    img{
        width: 80px;
        height: 80px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -40px 0 0 -40px;
    }
}
</style>