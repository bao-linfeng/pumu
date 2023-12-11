<template>
  <div class="genealogyDetail">
    <NavLink />
    <div class="center">
        <div class="genealogyContent">
            <div class="main">
                <GDetail :genealogyDetail="genealogyDetail" :fieldFilters="fieldFilters" v-on:toggle-aide="aideTogglefn" />
                <!-- <TitleVue id="gongyi" :title="'公益赞助'" :url="'/person'" /> -->
                <!-- <Sponsor v-if="genealogyDetail" :gid="id" :gname="genealogyDetail && genealogyDetail.genealogyName" /> -->
                <TitleVue id="commentTitle" :title="'评论留言'" :url="'/person'" />
                <Comment v-if="genealogyDetail && genealogyDetail._key" :gid="genealogyDetail && genealogyDetail._key" />
                <div class="toolBox">
                    <i @click="share('douban')" class="weixin"></i>
                    <i @click="share('tsina')" class="weibo"></i>
                    <i @click="share('QZone')" class="qq"></i>
                    <hr />
                    <i @click="moveToComment" class="edit"></i>
                    <i class="sanjiao"></i>
                </div>
            </div>
        </div>
    </div>
    <Footer />
    <!-- <div class="xs_footer" v-if="xs_footer">
        <i class="xs_comment" @click="commentToggle=true"><span>评论</span></i>
        <i v-show="isWeixin" class="xs_share" @click="share_sm=true"><span>分享</span></i>
    </div> -->
    <ShareSM v-show="share_sm" :detail="genealogyDetail" v-on:toggle-share="share_sm=false" />
    <!-- 评论手机 -->
    <CommentSM v-if="commentToggle" v-on:hide-comment="toggleComment" :gid="genealogyDetail && genealogyDetail._key" />
  </div>
</template>

<script>
import NavLink from "@/views/NavLink.vue";
import Footer from "@/views/Footer.vue";
import GDetail from "../components/genealogyDetail/GDetail.vue";
import TitleVue from "../components/genealogyDetail/TitleVue.vue";
import Sponsor from "../components/genealogyDetail/Sponsor.vue";
import Comment from "../components/genealogyDetail/Comment.vue";
import CommentSM from "../components/genealogyDetail/CommentSM.vue";
import Search from "../components/genealogyDetail/Search.vue";
import Genealogy from "../components/genealogyDetail/Genealogy.vue";
import ShareSM from "../components/genealogyDetail/ShareSM.vue";

import api from "../api.js";
import ADS from "../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "surnameData",
    components: {
        NavLink,
        Footer,
        GDetail,
        TitleVue,
        Sponsor,
        Comment,
        CommentSM,
        Search,
        Genealogy,
        ShareSM,
    },
    data: () => {
        return {
            id:'',
            token:'',
            genealogyDetail:'',
            share_weixin:false,
            first_click:true,
            share_sm:false,
            commentTab:0,
            commentToggle:false,
            xs_footer:true,
            isWeixin:true,
            profile:'',
            fieldFilters: [],
        };
    },
    mounted:function(){
        window.scrollTo(0,0);  
        this.id = ADS.getQueryVariable('id');
        this.token = window.localStorage.getItem('token') || '';
        this.profile = window.localStorage.getItem('profile')  ? JSON.parse(window.localStorage.getItem('profile')) : '';
        this.getFieldFilterList();
        this.getGenealogyDetail();
    },
    methods:{
        getFieldFilterList:async function(){// 检索字段列表
            let data=await api.getAxios('field/filter?type=家谱');
            if(data.status == 200){
                let fieldFilters = [];
                data.data.map((item)=>{fieldFilters.push({'label':item.fieldMeans,'value':item.fieldName})});
                this.fieldFilters = fieldFilters;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getGenealogyDetail: async function(){
            let data = await api.getAxios('data/detail?dataKey='+this.id);
            data.data.hasImage = data.data.hasImage ? '有' : '无';
            this.genealogyDetail = data.data;
        },
        moveToComment(){
            document.getElementById('commentTitle').scrollIntoView();
        },
        share(cmd){
            if(this.genealogyDetail){
                let title=this.genealogyDetail.genealogyName || this.genealogyDetail.title || '',abstract=this.genealogyDetail.summary || '',url=window.location.href,uri='';
                switch (cmd) {
                    case 'weixin':
                        uri = ('http://b.bshare.cn/barCode?site=weixin&url=' + url);
                        this.share_weixin=!this.share_weixin;
                        this.first_click ? this.qrcode(uri) : null;
                        this.first_click=false;
                        break;
                    case 'douban':
                        uri = ('https://www.douban.com/share/service?href=' + encodeURI(url) + '&name=' + encodeURI(title) + '&text=' + encodeURI(abstract));
                        window.open(uri);
                    case 'tsina':
                        uri = ('http://service.weibo.com/share/share.php?url=' + encodeURI(url) + '&title=' + encodeURI(title) + '&appkey=1343713053');
                        window.open(uri);
                        break;
                    case 'QZone':
                        uri = ("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url="+encodeURI(url)+"&title=" + encodeURI(title) + "&desc="+encodeURI(abstract));
                        window.open(uri);
                        break;
                }
            }   
        },
        qrcode(uri){
            let qrcode = new QRCode('share_qrcode',{
                text: uri,
                width: 150,
                height: 150,
                colorDark : '#000000',
                colorLight : '#ffffff',
                correctLevel : QRCode.CorrectLevel.H
            });
        },
        showSearch(flag){
            document.querySelector('#sm_search_wrap').style.display = flag ? 'block' : 'none';
        },
        hideSearch(){
            
        },
        aideTogglefn(flag){
            console.log(flag)
            document.querySelector('#genealogyDetailSidebar').style.display = flag ? 'block' : 'none';
        },
        toggleComment(flag){
            this.commentToggle=false;
        },
    },
    computed: {
        ...mapState({
            activeSurname: state => state.surname.activeSurname,
            activeSurnameIndex:state => state.surname.activeSurnameIndex,
        })
    },
    watch: {
    　　'$route': function (to, from) {
            console.log(to.params.id)
            this.id = to.params.id;
            if(window.innerWidth < 768){
                document.querySelector('#genealogyDetailSidebar').style.display = 'none';
            }
            
            this.getGenealogyDetail();
    　　}
    },
};
</script>
<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #e5e5e5;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #e5e5e5;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #caaa6f;
}
.style1::-webkit-scrollbar-corner{
	background-color: #e5e5e5;
}
.genealogyDetail{
    position: relative;
    width: 100%;
    min-height: 100%;
    font-size: 16px;
    text-align: left;
    padding-bottom: 98px;
    background: #f2f2f2;
}
.center{
    position: relative;
    width: 900px;
    margin: -80px auto 40px auto;
}
.genealogyContent{
    display: flex;
    justify-content: space-between;
}
.main{
    width:100%;
    position: relative;
}
.sidebar{
    position: relative;
    width: 408px;
}
.share_qrcode{
    position: absolute;
    top: 30px;
    right: 75px;
    width: 150px;
    height: 150px;
    padding: 10px;
    background: #f2f2f2;
    z-index: 10000;
}
.marginTop20{
    margin-top: 20px;
}
.toolBox{
    position: absolute;
    top: 0;
    right: -64px;
    width: 64px;
    height: 240px;
    padding: 28px 0;
    background: #5082CC;
    i{
        width: 42px;
        height: 42px;
        display: block;
        background: url('../assets/gdetail/toolbar.svg') 0 0 no-repeat;
        margin: 8px auto;
        cursor: pointer;
        &.weibo{
            background-position-y: -48px;
        }
        &.qq{
            background-position-y: -94px;
        }
        &.im{
            background-position-y: -138px;
        }
        &.edit{
            background-position-y: -180px;
        }
        &:hover{
            background-position-x: -42px;
        }
        &.sanjiao{
            position: absolute;
            left: 0;
            bottom: 0;
            background-image: none;
            width: 0;
            height: 0;
            border-bottom: 20px solid #f2f2f2;
            border-top: 20px solid transparent;
            border-left: 32px solid transparent;
            border-right: 32px solid transparent;
            margin: 0;
        }
    }
}
.xs_footer{
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 0;
    padding: 5px 40px;
    box-sizing: border-box;
    display: none;
    background: #fff;
    justify-content: space-between;
    z-index: 100;
    box-shadow: 0 0 1px 2px #ddd;
    i{
        position: relative;
        display: block;
        width: 40px;
        height: 50px;
        font-size: 10px;
        font-style: normal;
        cursor: pointer;
        background: url('../assets/gdetail/sx_1.png') 0 0 no-repeat;
        &.xs_comment{
            background-position-x: -40px;
        }
        &.xs_search{
            background-position-x: -80px;
        }
        &.xs_share{
            background-position-x: -120px;
        }
        span{
            position: absolute;
            bottom: 0;
            display: block;
            width: 100%;
            height: 10px;
            text-align: center;
            line-height: 10px;
        }
    }
}
.lantern{
    position: absolute;
    top: 0;
    right: 20px;
    display: none;
}
.sm_search_wrap{
    z-index: 1000;
    display: none;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #f2f2f2;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 1.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
@media screen and (max-width:1400px) and (min-width:679px){
    .sidebar{
        width: 350px;
    }
    .toolBox{
        z-index: 100000;
    }
}
@media screen and (max-width: 768px) {
    .center{
        width: calc(100% - 20px);
        margin: -80px auto 0 auto;
    }
    .genealogyContent{
        display: block;
    }
    .main{
        width: 100%;
    }
    .sidebar{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        z-index: 10000;
        overflow-y: scroll;
        background: #f2f2f2;
        display: none;
    }
    .toolBox{
        display: none;
    }
    .xs_footer{
        display: flex;
    }
    .lantern{
        display: block;
    }
    .hide{
        display: none;
    }
    .sm_comment_wrap{
        z-index: 1000;
    }
}
</style>

