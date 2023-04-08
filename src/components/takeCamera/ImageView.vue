<template>
    <div class="image-view-wrap" @keyup.stop="">
        <div class="head-wrap">
            <div class="head-left">
                <p class="marginR10">{{genealogyName}}({{gid}})</p>
                <el-select class="width150" v-model="vid" placeholder="请选择卷名" size="small">
                    <el-option
                        v-for="item in volumeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <h3 class="title">影像预览</h3>
            <div class="head-right">
                <div v-if="(role >= 1 && role <= 3 && (takeStatus == 5 ||  takeStatus == 7 || takeStatus == 13 || takeStatus == 14))" class="task-verify" @click="handleImagesCheck">
                    <img class="icon" src="../../assets/shoot/pass.svg" alt="">
                    <span class="span">影像审核</span>
                </div>
                <img class="close" @click="close" src="../../assets/close.svg" alt="">
            </div>
        </div>
        <div class="content-wrap">
            <div class="view-wrap" v-for="(item) in imageList" :key="item._key" >
                <h3 class="title" :id="item._key">{{item.volumeNumber}}({{item.imageList.length}})</h3>
                <div class="view-box-out">
                    <div class="view-box" :class="{active: pid === item2._key}" v-for="(item2) in item.imageList" :key="item2._key"  :id="item2._key" @click="changeImage(item._key, item2._key)">
                        <img class="lazyload" :data-src="imageHref+item2.name" :src="imageGif" alt="" />
                        <i class="page">{{item2.index+1}}</i>
                        <img class="attachedSheet" v-if="item2.attachedSheet == 1" title="附页" src="../../assets/shoot/attachedSheetA.svg" alt="" />
                    </div>
                </div>
            </div>
        </div>
        <!-- 影像审核 -->
        <ImagesCheck v-if="isShow == 5" :detail="detail" :returnReasonL="resionList.length" v-on:close="closeCheck" />
    </div>
</template>

<script>
import ADS from "../../ADS.js";
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
import ImagesCheck from './ImagesCheck.vue';

export default {
    name: "imageView",
    components: {
        ImagesCheck, 
    },
    props:{
        gid: {
            type: String
        },
        genealogyName: {
            type: String
        }
    },
    data: () => {
        return {
            imageHref: 'https://sync.qingtime.cn/photo',
            imageList: [],
            imageGif: 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs',
            h: 300,
            imageIndex: 0,
            vid: '',
            pid: '',
            volumeList: [],
            volumeListO: {},
            takeStatusO: {
                '5': '微站初审',
                '12': '机构审核',
                '6': '打回中',
                '7': '审核通过',
                '13': '微站复审',
                '14': '微站待议',
                '8': '审核通过',
                '9': '审核通过',
                '16': '已作废',
                '': ''
            },
            takeStatus: '',
            isShow: 0,
            detail: {},
            resionList: [],
        };
    },
    mounted: function(){
        if(window.location.origin.indexOf('genealogy.1jiapu.com') > -1){
            // this.imageHref = 'http://223.111.180.111:8085/photo';
            this.imageHref = 'https://photo.1jiapu.com/photo';
        }
        this.getImageListAll(this.gid);
    },
    methods:{
        handleImagesCheck(){
            this.isShow = 5;
        },
        closeCheck(f){
            this.isShow = 0;
            if(f){

            }
        },
        close(){
            this.$emit('close', 'false');
        },
        save(){
            
        },
        async getVolumeList(dataKey){// 卷册列表
            const result = await api.getAxios('catalog/volumeList?catalogKey='+dataKey);
            if(result.status == 200){
                let volumeList = [], volumeListO = {};
                let takeStatusOO = {'1': '待拍摄', '2': '拍摄中', '3': '自检中', '4': '同步中', '5': '初审', '6': '打回中', '7': '完成', '8': '开发票中', '12': '审核', '13': '复审', '14': '待议'};
                result.data.forEach((ele) => {
                    ele.genealogyName = this.genealogyName;
                    volumeListO[ele._key] = ele;
                    ele.takeStatusO = takeStatusOO[ele.takeStatus];
                    ele.label = ele.volumeNumber+'('+ele.takeStatusO+'-'+ele.takePages+')';
                    ele.value = ele._key;

                    if(this.role >= 1 && this.role <= 3){
                        if(ele.takeStatus == 5 || ele.takeStatus == 13 || ele.takeStatus == 14){
                            volumeList.push(ele);
                        }
                    }
                    if(this.orgAdmin == 'admin'){
                        if(ele.takeStatus == 12){
                            volumeList.push(ele);
                        }
                    }
                    volumeList = volumeList.sort((a, b) => {return a.internalSerialNumber - b.internalSerialNumber});
                });
                this.volumeList = volumeList;
                this.volumeListO = volumeListO;

                volumeList.forEach((ele, i) => {
                    if(i === 0){
                        this.vid = ele._key;
                    }
                });
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        changeImage(vid, pid){
            this.vid= vid;
            this.pid = pid;
        },
        async getImageListAll(gcKey){
            const result = await api.getAxios('v3/review/catalog/imageList?gcKey='+gcKey+'&userKey='+this.userId+'&siteKey='+this.stationKey);
            if(result.status == 200){
                this.imageList = result.data;
                this.Observer();

                this.getVolumeList(this.gid);
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        Observer(){// 图片懒加载
            let timer = setTimeout(() => {
                let images = document.querySelectorAll(".lazyload");
                let observer = new IntersectionObserver(entries => {
                    entries.forEach(item => {
                        if (item.isIntersecting) {
                            item.target.src = item.target.dataset.src; // 开始加载图片,把data-origin的值放到src
                            observer.unobserve(item.target); // 停止监听已开始加载的图片
                        }
                    });
                },{rootMargin: "0px -50px 0px 0px"});
                images.forEach(item => observer.observe(item)); 

                clearTimeout(timer);
                timer = null;
            }, 200);
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            pathname: state => state.nav.pathname,
            orgAdmin: state => state.nav.orgAdmin,
        })
    },
    watch:{
        'vid': function(nv, ov){
            document.getElementById(nv).scrollIntoView();
            this.takeStatus = this.volumeListO[nv].takeStatus;
            this.detail = this.volumeListO[nv];
            console.log(this.takeStatus);
        }
    }
};
</script>

<style scoped lang="scss">
.image-view-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.9);
    font-size: 14px;
    color: #fff;
    z-index: 1000;
    .head-wrap{
        position: relative;
        width: calc(100% - 40px);
        padding: 0 20px;
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .head-left{
            position: relative;
            display: flex;
            align-items: center;
        }
        .head-right{
            position: relative;
            height: 100%;
            display: flex;
            align-items: center;
        }
        .close{
            // position: absolute;
            // top: 50%;
            // right: 20px;
            // transform: translateY(-50%);
            background: #fff;
            cursor: pointer;
        }
    }
    .content-wrap{
        position: relative;
        width: calc(100% - 40px);
        height: calc(100% - 80px);
        padding: 20px;
        overflow-y: auto;
    }
}
.view-wrap{
    position: relative;
    width: 100%;
    // height: 100%;
    // display: flex;
    // flex-wrap: wrap;
    text-align: left;
    .title{
        height: 40px;
        line-height: 40px;
    }
    .view-box{
        position: relative;
        margin: 0 20px 20px 0;
        height: 300px;
        display: inline-block;
        &.active{
            border: 5px solid #85b83e;
            // height: calc(100% - 10px);
        }
        .lazyload{
            height: 100%;
            display: block;
        }
        .page{
            position: absolute;
            bottom: 0;
            left: 0;
            height: 40px;
            line-height: 40px;
            width: 100%;
            text-align: center;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            font-size: 20px;
            font-style: normal;
            cursor: pointer;
        }
        .attachedSheet{
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            cursor: pointer;
        }
    }
}
.task-verify{
    position: relative;
    height: 100%;
    padding: 0 10px;
    display: flex;
    align-items: center;
    font-style: normal;
    cursor: pointer;
    .icon{
        margin-right: 10px;
    }
    &.active{
        background: #999;
    }
    &:hover{
        background: #999;
    }
}
.width150{
    width: 150px;
}
.marginR10{
    margin-right: 10px;
}
</style>

