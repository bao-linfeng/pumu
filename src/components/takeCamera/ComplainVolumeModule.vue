<template>
    <div class="volume-return-reason">
        <div class="head-box">
            <h3 class="title">申诉理由</h3>
        </div>
        <div class="content-box">
            <textarea class="input" v-model="reason" placeholder="请输入申诉理由"></textarea>
        </div>
        <div class="foot-box">
            <button class="btn" @click="close">取消</button>
            <button class="btn active" @click="save">确定</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "complainVolume",
    props:{
        
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
                this.$XModal.message({message: '请填写申诉理由', status: 'warning'})
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
        margin: 10px 0;
        .input{
            width: 245px;
            height: 50px;
            outline: none;
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 3px;
            display: block;
            padding: 5px;
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

