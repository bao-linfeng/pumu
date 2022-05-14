<template>
    <div class="share_sm_wrap">
        <div class="share_sm_box">
            <span class="line"></span>
            <div class="share">
                <span class="weibo" @click="share(0)"><i>微博</i></span>
                <span class="douban" @click="share(1)"><i>豆瓣</i></span>
                <span class="QZone" @click="share(2)"><i>QQ空间</i></span>
            </div>
            <div class="btn" @click="hideShare">取消</div>
        </div>
    </div>
</template>

<script>

export default {
    name: "sharesm",
    props:{
        detail:{
            type:[String,Object],
        },
    },
    data: () => {
        return {
            
        };
    },
    mounted:function(){
        
    },
    methods:{
        hideShare(){
            this.$emit('toggle-share',false);
        },
        share(cmd){
            if(this.detail){
                let title=this.detail.genealogyName || this.detail.title || '',abstract=this.detail.summary || '',url=window.location.href,uri='';
                switch (cmd) {
                    case 0:
                        uri = ('http://service.weibo.com/share/share.php?url=' + encodeURI(url) + '&title=' + encodeURI(title) + '&appkey=1343713053');
                        window.open(uri);
                        break;
                    case 1:
                        uri = ('https://www.douban.com/share/service?href=' + encodeURI(url) + '&name=' + encodeURI(title) + '&text=' + encodeURI(abstract));
                        window.open(uri);
                    case 2:
                        uri = ("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + encodeURI(url) + "&title=" + encodeURI(title) + "&desc="+encodeURI(abstract));
                        window.open(uri);
                        break;
                }
            }   
        },
    },
};
</script>
<style scoped lang="scss">
.share_sm_wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 1000;
}
.share_sm_box{
    position: absolute;
    padding: 0 10px;
    width: 100%;
    box-sizing: border-box;
    left: 0;
    bottom: 0;
    background: #fff;
}
.line{
    display: block;
    width: 62px;
    height: 6px;
    background: #999;
    margin: 10px auto 0 auto;
    border-radius: 3px;
}
.share{
    padding: 20px 0;
    display: flex;
    justify-content: space-between;
    span{
        position: relative;
        width: 60px;
        height: 90px;
        text-align: center;
        background: url('../../assets/share/share_xm.svg') 0 0 no-repeat;
        i{
            position: absolute;
            display: block;
            width: 100%;
            height: 20px;
            line-height: 20px;
            left: 0;
            bottom: 0;
            font-style: normal;
        }
        &.weibo{
            background-position-x: 0;
        }
        &.douban{
            background-position-x: -60px;
        }
        &.QZone{
            background-position-x: -120px;
        }
    }
}
.btn{
    border-top: 1px solid #bababa;
    padding: 20px 0;
    font-size: 20px;
    height: 20px;
    line-height: 20px;
    color: #666;
    text-align: center;
}
@media screen and (max-width: 768px) {
    
}
</style>

