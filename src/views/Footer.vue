<template>
  <div class="footer">
    <div class="footerCenter">
        <div class="footerLeft">
            <router-link to="/"><img src="../assets/nav/logo_f.svg"></router-link>
            <ul class="footerTel">
                <li>TEL：400-666-9001</li>
                <li>ADD：常州科教城天润科技大厦A栋2层</li>
            </ul>
        </div>
        <ul class="footerRight">
            <li>苏ICP备15006448 © Copyright江苏时光信息科技有限公司</li>
        </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "navLink",
  components: {
    
  },
  data: () => {
      return {
        
      };
  },
  methods:{
    
  },

};
</script>
<style scoped lang="scss">
.footer{
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height:68px;
    background:rgba(29,38,63,1);
    box-shadow:0px 3px 26px 1px rgba(3,28,48,0.47);
    padding: 15px 0;
    color: #fff;
    font-size: 16px;
    .footerCenter{
        width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .footerLeft{
            display: flex;
            align-items: center;
            img{
                height: 68px;
            }
            .footerTel{
                margin-left: 20px;
            }
        }
    }
}
.footerRight{
    text-align: right;
    li{
        padding: 0 auto;
        &.footerRightNav{
            span{
                margin-left: 10px;
                color: #fff;
            }
        }
    }
}
@media screen and (max-width: 1400px) and (min-width: 768px){
  .footer{
    .footerCenter{
        width: 90%;
    }
  }  
}
@media screen and (max-width: 768px) {
  .footer{
    height: 55px;
    .footerCenter{
        width: calc(100% - 20px);
        .footerLeft{
            .footerTel{
                margin-left: 10px;
                font-size: 14px;
            }
            img{
                height: 55px;
            }
        }
    }
  }  
  .footerRight{
      display: none;
  }
}
</style>

