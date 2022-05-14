<template>
  <div class="genealogyBox">
    <Scroll />
    <div class="main">
        <router-link class="item" :to="'/'+pathname+'/gd?id='+item._key" v-for="(item,index) in data" :key="'genealogy'+index">
            <img src="../../assets/search/coverBg.png" alt="封面" />
            <i>{{item.genealogyName ? item.genealogyName.replace(/[（,）]/,'').substr(0,13) : '不详'}}</i>
            <p class="overflow" :title="item.genealogyName">{{item.genealogyName || '不详'}}</p>
            <span>谱籍地:{{item.place}}</span>
            <span>堂号:{{item.hall}}</span>
            <span class="overflow" :title="item.author || item.authors">撰修者:{{item.author || item.authors}}</span>
        </router-link>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogyBox",
    props:{
        data:{
            type:[String,Array],
            required:true
        },
    },
    components: {
    
    },
    data: () => {
      return {
          pathname:'',
      };
    },
    mounted:function(){
       this.pathname = window.localStorage.getItem('pathname') || '';
    },
    methods:{
    
    },
    computed: {
        ...mapState({
           
        })
    },
};
</script>
<style scoped lang="scss">
.genealogyBox{
    position: relative;
    width: 100%;
    padding: 30px 0 50px 0;
}
.main{
    
}
.item{
    position: relative;
    height: 370px;
    width: 220px;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 3px;
    display: inline-block;
    margin: 20px 20px 0 20px;
    padding: 10px;
    box-sizing: border-box;
    overflow: hidden;
    img{
        width: 200px;
        display: block;
        margin: 0 auto;
    }
    i{
        position: absolute;
        top: 65px;
        right: 70px;
        bottom: 140px;
        font-style: normal;
        font-size: 12px;
        width: 16px;
        color: #fff;
        text-align: center;
        overflow: hidden;
    }
    p{
        font-size: 16px;
        margin: 10px 0 5px 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    span{
        font-size: 14px;
        display: block;
    }
}
.overflow{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space:nowrap;
}
@media screen and (max-width:1400px) and (min-width:1200px){
    .main{
        text-align: center;
        .item{
            margin: 10px 5px 0 5px;
            width: 200px;
            height: 340px;
            text-align: left;
            img{
                width: 180px;
            }
        }
    }
}
@media screen and (max-width:1199px) and (min-width:600px){
    .item{
        margin: 10px 10px 0 10px;
    }
}
@media screen and (max-width:600px) {
    .main{
        text-align: center;
        .item{
            width: 150px;
            height: 300px;
            text-align: left;
            margin: 10px 5px 0 5px;
            padding: 5px;
            img{
                max-width: 100%;
            }
            i{
                top: 55px;
                right: 65px;
                bottom: 170px;
            }
        }
    }
}
</style>

