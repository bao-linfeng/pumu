<template>
  <div class="wrap">
    <img class="left" src="../../assets/search/scrollLeft.png" alt="" />
    <img class="left right" src="../../assets/search/scrollRight.png" alt="" />
  </div>
</template>

<style scoped lang="scss">
.wrap{
    position: absolute;
    top: 0;
    width: 100%;
    height: 25px;
    background: url('../../assets/search/scroll.png') 11px 0 repeat-x;
    .left{
      position: absolute;
      top: 0;
      left: -11px;
    }
    .right{
      right: -11px;
      left: auto;
    }
}
@media screen and (max-width:768px) {
  .wrap{
    // width: calc(100% - 22px);
    // left: 11px;
    left: 0;
  }
}
</style>

