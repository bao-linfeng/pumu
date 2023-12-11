<template>  
    <div class="nav-wrap">
        <h3 v-html="title"></h3>
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "navmodal",
    props:{
        title:{
            type: String
        }
    },
    data: () => {
        return {
            
        };
    },
    mounted:function(){
        
    },
    methods:{
        
    },
};
</script>
<style scoped lang="scss">
.nav-wrap{
    width: calc(100% - 40px);
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    h3{
        line-height: 60px;
        a{
            color: #358acd;
        }
    }
}
</style>

