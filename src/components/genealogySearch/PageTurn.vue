<template>
    <div class="pageTurn">
        <div class="left">
            <button class="marginRight10 hide" :class="{active:pages > 1 && page > 1}" @click="handleClickPage('first')">首页</button>
            <button :class="{active:pages > 1 && page > 1}" @click="handleClickPage('prev')">上一页</button>
        </div>
        <div class="inputGroup">
            <input type="text" v-model="page" @keyup="enterPage" placeholder="页码" />
            <span>共{{pages}}页,{{total}}{{label}}</span>
        </div>
        <div class="right">
            <button :class="{active:pages > 1 && page < pages}" @click="handleClickPage('next')">下一页</button>
            <button :class="{active:pages > 1 && page < pages}" class="marginLeft10 hide" @click="handleClickPage('last')">末页</button>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "pageTurn",
    components: {

    },
    props:{
        total:{
            type:Number,
            required:true,
            default:0,
        },
        pages:{
            type:Number,
            required:true,
            default:1,
        },
        curPage:{
            type:Number,
            default:1,
        },
        label:{
            type:String,
            default:'本家谱',
        },
    },
    data: () => {
        return {
            page:1,
        };
    },
    mounted:function(){
        this.page=this.curPage;
    },
    methods:{
        enterPage(e){
            if(e.keyCode == 13){
                this.$emit('click-page',this.page);
            }
        },
        handleClickPage(type){
            switch(type){
                case 'first':
                    if(this.page == 1){
                        return false;
                    }
                    this.page=1;
                    break;
                case 'prev':
                    if(this.page == 1){
                        return false;
                    }
                    this.page > 1 ? this.page=this.page - 1 : null;
                    break;
                case 'next':
                    if(this.page == this.pages){
                        return false;
                    }
                    this.page < this.pages ? this.page=this.page + 1 : null;
                    break;
                case 'last':
                    if(this.page == this.pages){
                        return false;
                    }
                    this.page=this.pages;
                    break;
                default:
                    this.page=1;
                    break;
            }

            this.$emit('click-page',this.page);
        },
    },
    watch:{
        page(newVal,oldVal){
            if(/^[1-9]/.test(newVal)){
                let page2 = Number(newVal);
                if(page2 <= 1){
                    this.page = 1;
                }else if(page2 >= this.pages){
                    this.page = this.pages;
                }else{
                    this.page = page2;
                }
            }else{
                this.page = 1;
            }
        },
        curPage(newVal,oldVal){
            if(newVal == 1){
                this.page = 1;
            }
        },
    },
    computed: {
        ...mapState({
            pathname: state => state.nav.pathname,
        })
    },
};
</script>
<style scoped lang="scss">
.pageTurn{
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    font-size: 14px;
    color: #666;
    button{
        width: 80px;
        height: 40px;
        line-height: 40px;
        display: inline-block;
        border-radius: 3px;
        outline: none;
        border: none;
        cursor: pointer;
        color: #666;
        &.active{
            background: #358acd;
            color: #fff;
        }
    }
    .inputGroup{
        width: 50%;
        height: 40px;
        line-height: 40px;
        input{
            width: 60px;
            height: 30px;
            line-height: 30px;
            border:1px solid #ddd;
            outline: none;
            text-indent: 10px;
        }
        span{
            margin-left: 15px;
        }
    }
}
.marginRight10{
    margin-right: 10px;
}
.marginLeft10{
    margin-left: 10px;
}
@media screen and (max-width:768px) {
    .pageTurn{
        left: 10px;
        right: 10px;
        width: calc(100% - 20px);
        button{
            width: 60px;
            &.hide{
                display: none;
            }
        }
        .inputGroup{
            width: 60%;
            input{
                width: 30px;
                height: 30px;
                line-height: 30px;
                border:1px solid #ddd;
                outline: none;
                text-indent: 10px;
            }
        }
    }
}
</style>

