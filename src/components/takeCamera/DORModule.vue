<template>
    <div class="dor-module-wrap">
        <div class="head-box">
            <h3 class="title">DOR报告</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <div class="dor-box">
                <p>Title.Volume.Date [Archive Reference ID]</p>
                <span>{{detail.genealogyName+' '+'['+detail.volume+']·'+detail.internalSerialNumber+((detail.volume+'').indexOf('不分卷') > -1 ? '' : ','+detail.volumeNumber)+'·'+'1600-'+detail.publish}}</span>
                <span>{{detail.genealogyName+' '+'['+detail.volume+']_'+detail.internalSerialNumber+((detail.volume+'').indexOf('不分卷') > -1 ? '' : ','+detail.volumeNumber)+'_'+'1600-'+detail.publish}}</span>
            </div>
            <div class="dor-box">
                <p>Locality</p>
                <span>{{detail.place}}</span>
            </div>
            <div class="dor-box">
                <p>Images</p>
                <span>{{detail.takePages}}</span>
            </div>
            <div class="dor-box">
                <p>Images</p>
                <span>{{detail.takePages}}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "DORModule",
    props:{
        detail: {
            type: Object
        }
    },
    data: () => {
        return {
            
        };
    },
    mounted: function(){
        
    },
    methods:{
        close(){
            this.$emit('close', false);
        },
    },
    watch:{
        
    }
};
</script>

<style scoped lang="scss">
.dor-module-wrap{
    position: fixed;
    top: 40px;
    right: 0;
    background: #d8d8d8;
    font-size: 14px;
    color: #000;
    padding: 0 20px 20px 20px;
    width: 390px;
    .head-box{
        position: relative;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            cursor: pointer;
        }
    }
    .content-box{
        text-align: left;
        .dor-box{
            margin-bottom: 20px;
            p{
                color: #666;
            }
            span{
                display: block;
                margin-top: 5px;
                color: #0D0D0D;
                text-indent: 10px;
            }
        }
    }
}
</style>

