<template>
    <div class="prevModal">
        <div class="prev_wrap">
            <i class="el-icon-caret-left" @click="prev"></i>
            <img v-if="imagesList && imagesList.length" :src="imagesList[prevPage].myURL" alt="影像资料" @load="loading=false" />
            <i class="el-icon-caret-right right" @click="next"></i>
        </div>
        <p class="total_wrap">当前第{{prevPage+1}}页，总共{{total}}页影像</p>
        <i class="el-icon-close close" @click="close"></i>
        <Loading v-show="loading" />
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "prevModal",
    props:{
        data:{
            type:Array,
        },
        gid:{
            type:String,
        },
    },
    data: () => {
        return {
            loading:true,
            userKey:'',
            siteKey:'',
            page:1,
            limit:3000,
            pages:0,
            total:0,
            imagesList:[],
            url:'http://192.168.1.101:8092',
            prevPage:0,
            volume:1,
            userRole:'',
        };
    },
    mounted:function(){
       this.token= window.localStorage.getItem('token') || '';
       this.userKey = window.localStorage.getItem('userId') || '';
       this.siteKey = window.localStorage.getItem('stationKey') || '';
       this.userRole = window.localStorage.getItem('role') || '';
       this.getImage();
    },
    methods:{
        close(){
            this.$emit('close-source',false);
        },
        getImage:async function(type=true){//图片列表
            this.loading = true;
            let data=await api.getAxios('catalog/image?siteKey='+this.siteKey+'&userRole='+this.userRole+'&volume='+this.volume+'&catalogKey='+this.gid+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                let imagesList = data.result.list;
                this.imagesList = imagesList;
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }
        },
        prevImage(index){
            this.isPrev = true;
            this.prevPage = index;
        },
        next(){
            let l=this.imagesList.length;
            if(l < this.total && this.prevPage == 4){
                this.$message({message: '体验阅读已结束，请购买家谱影像',type: 'warning'});
                return false;
            }
            if(this.prevPage < l){
                this.loading = true;
                this.prevPage = this.prevPage + 1;
            }
        },
        prev(){
            if(this.prevPage > 0){
                this.loading = true;
                this.prevPage = this.prevPage - 1;
            }
        },
    },
};
</script>
<style scoped lang="scss">
.prevModal{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #000;
    z-index: 100;
    i.close{
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 50px;
        cursor: pointer;
        color: #fff;
    }
    .prev_wrap{
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        text-align: center;
        i{
            position: absolute;
            font-size: 80px;
            color: #4C95FF;
            top: 50%;
            transform: translateY(-50%);
            left: 20px;
            cursor: pointer;
            &.right{
                left: auto;
                right: 20px;
            }
        }
        img{
            height: 100%;
        }
    }
    .total_wrap{
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40px;
        line-height: 40px;
        color: #4C95FF;
        text-align: center;
    }
}
</style>

