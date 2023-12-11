<template>  
    <div class="excel-error-wrap">
        <div class="excel-error-box">
            <h3>批量导入错误记录</h3>
            <i class="el-icon-close" @click="close(false)"></i>
            <ul class="excel-error-table">
                <li>
                    <span class="w100">excel序号</span>
                    <span>错误原因</span>
                </li>
                <li v-for="(item,index) in list" :key="'error'+index">
                    <span class="w100">{{item.index}}</span>
                    <span>{{item.reason}}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: "excelerrormodal",
    props:{
        list:{
            type: Array
        }
    },
    components: {
        
    },
    data: () => {
        return {
            
        };
    },
    mounted:function(){
        
    },
    methods:{
        close(){
            this.$emit('close-excel-error',false);
        },
    },
};
</script>
<style scoped lang="scss">
.excel-error-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
    .excel-error-box{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 600px;
        padding: 20px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .excel-error-table{
            width: 100%;
            max-height: 500px;
            overflow-y: auto;
            li{
                height: 40px;
                line-height: 40px;
                display: flex;
                &:nth-of-type(2n){
                    background-color: #f1f1f1;
                }
                span{
                    display: block;
                    width: calc(100% - 80px);
                    &.w100{
                        width: 80px;
                    }
                }
            }
        }
    }
}
</style>

