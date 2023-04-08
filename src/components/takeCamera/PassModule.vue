<template>
    <div class="return-wrap">
        <p class="title">标记原因</p>
        <el-checkbox-group v-model="passReason">
            <el-checkbox v-for="(item,index) in passReasonList" :key="index" :label="item"></el-checkbox>
        </el-checkbox-group>
        <input class="pass-input" type="text" v-model="reason" placeholder="自定义标记原因" />
        <button class="btn" @click="setPassReason">确定</button>
    </div>
</template>

<script>
export default {
    name: "PassModule",
    props:{
        passReasonA: {
            type: Array
        }
    },
    data: () => {
        return {
            passReasonList: ['模糊', '缺页', '重复', '有异物', '不完整', '非家谱影像', '影像歪斜'],
            passReason: [],
            reason: '',
        };
    },
    mounted: function(){
        if(this.passReasonA.length == 1 && this.passReasonList.indexOf(this.passReasonA[0]) === -1){
            this.reason = this.passReasonA[0];
            this.passReason = [];
        }else{
            this.reason = '';
            this.passReason = this.passReasonA;
        }
    },
    methods:{
        setPassReason(){
            if(this.reason){
                this.$emit('set-reason', this.reason);
                this.reason = '';
            }else{
                if(this.passReason.length){
                    this.$emit('set-reason', this.passReason.join());
                    this.passReason = [];
                }else{
                    this.$emit('set-reason', '');
                    this.passReason = [];
                    // this.$XModal.message({message: '请勾选打回原因', status: 'warning'});
                }
            }
        },
    },
    watch:{
        'passReasonA': function(nv,ov){
            if(nv.length == 1 && this.passReasonList.indexOf(nv[0]) === -1){
                this.reason = nv[0];
                this.passReason = [];
            }else{
                this.reason = '';
                this.passReason = nv;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.return-wrap{
    position: absolute;
    bottom: 40px;
    right: -80px;
    height: 330px;
    padding: 0 20px 10px 20px;
    background: #D8D8D8;
    border-radius: 5px;
    font-size: 14px;
    color: #000;
    &::before{
        content: '';
        position: absolute;
        bottom: -16px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-top: 8px solid #D8D8D8;
        border-right: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-left: 8px solid transparent;
    }
    .title{
        height: 40px;
        line-height: 40px;
    }
    .pass-input{
        width: 100%;
        height: 30px;
        line-height: 30px;
        text-indent: 10px;
        border: none;
        outline: none;
        border-radius: 3px;
        display: block;
        margin-bottom: 10px;
    }
    .btn{
        border: none;
        outline: none;
        width: 88px;
        height: 34px;
        background: #358bcd;
        border: 1px solid #358bcd;
        border-radius: 4px;
        cursor: pointer;
        color: #fff;
    }
}
.el-checkbox-group{
    text-align: left;
}
.el-checkbox+.el-checkbox{
    margin-left: 0 !important;
    display: block;
}
.el-checkbox{
    margin-bottom: 10px;
}
</style>

