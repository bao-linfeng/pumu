<template>  
    <div class="manage-modal-wrap">
        <div class="manage-modal-box">
            <h3>设置</h3>
            <i class="el-icon-close" @click="close(false)"></i>
            <div class="manage-modal-content">
                <vxe-checkbox v-model="filter" title="默认建议勾选，不入库已存在的编码资料，以提高入库效率" content="忽略重复编码数据"></vxe-checkbox>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "manageModal",
    data: () => {
        return {
            filter: true,
        };
    },
    methods:{
        close(flag){
            this.$emit('close-manage',flag);
        },
    },
    watch:{
        'filter':function(nv,ov){
            this.$emit('set-filter',nv);
        }
    }
};
</script>
<style scoped lang="scss">
.manage-modal-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
    .manage-modal-box{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 300px;
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
        .manage-modal-content{
            text-align: left;
            margin-top: 10px;
        }
    }
}
</style>

