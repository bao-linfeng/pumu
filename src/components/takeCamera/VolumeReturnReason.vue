<template>
    <div class="volume-return-reason">
        <div class="head-box">
            <h3 class="title">打回卷册原因</h3>
        </div>
        <div class="content-box">
            <input class="input" type="text" v-model="reason" placeholder="请输入打回原因" />
        </div>
        <div class="foot-box">
            <button class="btn" @click="close">取消</button>
            <button class="btn active" @click="save">确定</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "volumeReturnReason",
    props:{
        passReasonA: {
            type: Array
        }
    },
    data: () => {
        return {
            reason: '',
        };
    },
    mounted: function(){
        
    },
    methods:{
        close(){
            this.$emit('close', false);
        },
        save(){
            if(this.reason){
                this.$emit('save', this.reason);
            }else{
                this.$XModal.message({message: '请填写卷册打回原因', status: 'warning'})
            }
        },
    },
    watch:{
        
    }
};
</script>

<style scoped lang="scss">
.volume-return-reason{
    position: fixed;
    top: 40px;
    right: 0;
    background: #d8d8d8;
    font-size: 14px;
    color: #000;
    padding: 0 20px 20px 20px;
    .head-box{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content-box{
        margin: 20px 0;
        .input{
            width: 200px;
            height: 30px;
            outline: none;
            border: 1px solid #ddd;
            background: #fff;
            text-indent: 10px;
            border-radius: 3px;
        }
    }
    .foot-box{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 40px;
        .btn{
            width: 80px;
            height: 30px;
            outline: none;
            border: 1px solid #ddd;
            margin: 0 20px;
            cursor: pointer;
            border-radius: 3px;
            &.active{
                background: #358acd;
                color: #fff;
            }
        }
    }
}
</style>

