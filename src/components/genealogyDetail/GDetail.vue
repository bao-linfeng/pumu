<template>
    <div class="gDetail">
        <span class="title titleCenter">家谱简介</span>
        <div class="content">
            <div class="cover">
                <div class="coverGg">
                    <img src="../../assets/gdetail/cover.png" alt="封面" />
                    <i>{{genealogyDetail.genealogyName ? genealogyDetail.genealogyName.replace(/[“”（）()]/g,'') : ''}}</i>
                </div>
                <a class="view-btn hide" v-if="genealogyDetail.imageLink" :href="genealogyDetail.imageLink" target="_blank">查看影像</a>
                <router-link v-else class="view-btn hide" :to="'/'+pathname+'/view?gid='+genealogyDetail._key+'&volume=1&page=1'" v-show="genealogyDetail.hasImage"><i></i><span>查看影像</span></router-link>
                <a class="view-btn hide marginTop10" :href="'https://youpu.qingtime.cn/v2/pedigree?genkey='+genealogyDetail._key+'&token='+token2" v-show="genealogyDetail.appeared == 1 && genealogyDetail.delivered == 2 && token && token2" target="_blank"><i></i><span>查看全文</span></a>
            </div>
            <div class="summary">
                <h3>{{genealogyDetail.genealogyName || ''}}<span  class="place" v-show="genealogyDetail.place"><img src="../../assets/gdetail/place.png" alt="" />{{genealogyDetail.place}}</span></h3>
                <div class="summary-content">
                    <div class="field-box" v-for="(item, index) in fieldFilters" :key="index" v-show="genealogyDetail[item.value]">
                        <label for="">{{item.label}}</label>
                        <span>{{genealogyDetail[item.value]}}</span>
                    </div>
                    <!-- <div class="summary-content-left">
                        <div class="summary-list">
                            <span class="summary-list-title">正题名</span>
                            <p class="generationName">{{data.generationName || '不详'}}</p>
                        </div>
                        <div class="summary-list">
                            <span class="summary-list-title">责任者</span>
                            <p>{{(data.author == '*' ? '不详' : data.authors) || '不详'}}</p>
                        </div>
                        <div class="summary-list">
                            <span class="summary-list-title">堂号</span>
                            <p>{{(data.hall == '*' ? '不详' : data.hall) || '不详'}}</p>
                        </div>
                        <div class="summary-list">
                            <span class="summary-list-title">撰修时间</span>
                            <p>{{data.writeTime ? data.writeTime : '不详'}}</p>
                        </div>
                        <div class="summary-list">
                            <span class="summary-list-title">姓氏</span>
                            <p>{{(data.surname == '*' ? '不详' : data.surname) || '不详'}}</p>
                        </div>
                        <div class="summary-list">
                            <span class="summary-list-title">卷数</span>
                            <p>{{data.volume || '不详'}}</p>
                        </div>
                        <div class="summary-list">
                            <span class="summary-list-title">页数</span>
                            <p>{{data.imagePages || '不详'}}</p>
                        </div>
                    </div>
                    <div class="summary-content-log hide">
                        <span class="summary-list-title">摘要</span>
                        <p>{{data.summary || '不详'}}</p>
                    </div> -->
                </div>
            </div>
        </div>
        <div class="content_xs">
            <div class="title_xs">
                <div class="coverGg">
                    <img src="../../assets/gdetail/cover.png" alt="封面" />
                    <i>{{genealogyDetail.genealogyName ? genealogyDetail.genealogyName.replace(/[“”（）()]/g,'') : ''}}</i>
                </div>
                <div class="right_xs">
                    <h3>{{genealogyDetail.genealogyName || ''}}</h3>
                    <router-link :to="'/nearGenealogy?long='+(genealogyDetail.location && (genealogyDetail.location[0] || '')) +'&lat='+(genealogyDetail.location && (genealogyDetail.location[1] || ''))+'&place='+genealogyDetail.place" target='_blank' class="place" v-show="genealogyDetail.place"><img src="../../assets/gdetail/place.png" alt="" />{{genealogyDetail.place}}</router-link>
                    <span v-show="genealogyDetail.hasImage" @click="gotoView(genealogyDetail)" class="quanwen">查看影像</span>
                    <a class="view-btn hide marginTop10" :href="'https://youpu.qingtime.cn/v2/pedigree?genkey='+genealogyDetail._key+'&token='+token2" v-show="genealogyDetail.appeared == 1 && genealogyDetail.delivered == 2 && token && token2" target="_blank"><i></i><span>查看全文</span></a>
                </div>
            </div>
            <ul class="genealogy_xs">
                <li><span>正题名</span><span>{{genealogyDetail.generationName || '不详'}}</span></li>
                <li><span>责任者</span><span>{{genealogyDetail.authors || '不详'}}</span></li>
                <li><span>堂号</span><span>{{genealogyDetail.hall || '不详'}}</span></li>
                <li><span>撰修时间</span><span>{{genealogyDetail.publish || '不详'}}</span></li>
                <li><span>姓氏</span><span>{{genealogyDetail.surname || '不详'}}</span></li>
                <li><span>卷数</span><span>{{genealogyDetail.volume || '不详'}}</span></li>
                <li><span>页数</span><span>{{genealogyDetail.imagePages || '不详'}}</span></li>
            </ul>
        </div>
        <div class="width768">
            <div class="xs_desc pcHide">
                <span>摘要</span>
                <p>{{genealogyDetail.summary || '不详'}}</p>
            </div>
        </div>
        <div class="qrcodeWrap">
            <div class="qrcode" id="qrcode"></div>
            <span>扫码读家谱</span>
            <i></i>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "gDetail",
    props:{
        genealogyDetail:{
            type:[String,Object],
            required:true
        },
        fieldFilters: {
            type: Array
        }
    },
    components: {
    
    },
    data: () => {
        return {
            type:0,
            token:'',
            pathname:'',
            token2:'',
        };
    },
    mounted:function(){
        this.pathname=window.localStorage.getItem('pathname') || '';
        let token=window.localStorage.getItem('token') || '';
        this.token=token;
        this.qrcode();
        this.getToken();
    },
    methods:{
        getToken: async function(){
            let data=await api.getAxios('https://baokudata.qingtime.cn/sgbh/account/switchToken?appHigh=28&token='+this.token,true);
            if(data.statusCode != 200){
                let origin=window.location.origin,pathname=window.localStorage.getItem('pathname') || 'puku';
                window.location.href = 'https://baokulogin.qingtime.cn?origin='+encodeURI(origin)+'&param='+pathname+'&router=genealogySearch';
                return false;
            }
            this.token2 = data.result.token;
        },
        aideTogglefn(){
            this.$emit('toggle-aide',true)
        },
        gotoView(data){
            if(data.imageLink){
                window.location.href = data.imageLink;
            }else{
                this.$router.push({path: '/'+this.pathname+'/view?gid='+data._key+'&volume=1&page=1'});
            }
        },
        qrcode(){
            let qrcode=new QRCode('qrcode',{
                text: window.location.href,
                width: 70,
                height: 70,
                colorDark : '#000000',
                colorLight : '#ffffff',
                correctLevel : QRCode.CorrectLevel.H
            });
            
        },
        collectToggle: async function(){
            if(!this.token){this.$message({message: '请先登录',type: 'warning'});return false;}

            this.type=0;
            if(this.data.hasCollected){
                this.type=1;
                this.data.collectNum=this.data.collectNum-1;
            }else{
                this.data.collectNum=this.data.collectNum+1;
            }
            let data=await api.postAxios('gcatalog/collect',{token:this.token,key:this.data._key,type:this.type});
            if(data.msg == 'OK'){
                this.data.hasCollected=!this.data.hasCollected;
            }
        },
    },
    computed: {
        ...mapState({
            
        })
    },
};
</script>
<style scoped lang="scss">
.gDetail{
    position: relative;
    box-sizing: border-box;
    padding: 50px 40px 20px 40px;
    width: 100%;
    min-height: 530px;
    font-size: 14px;
    background: url('../../assets/gdetail/bgTop.png') 50% 0 repeat-x,url('../../assets/gdetail/bg.png') 50% 0 repeat;
}
.qrcodeWrap{
    position: absolute;
    top: 0;
    right: 75px;
    padding: 5px;
    width: 70px;
    height: 86px;
    background: #fff;
    .qrcode{
        width: 70px;
        height: 70px;
        background: #f2f2f2;
    }
    span{
        font-size: 12px;
        display: block;
        text-align: center;
        color: #666;
    }
    i{
        position: absolute;
        top: 96px;
        left: 0;
        width: 0;
        height: 0;
        border-top: 20px solid #fff;
        border-right: 40px solid transparent;
        border-bottom: 20px solid transparent;
        border-left: 40px solid transparent;
    }
}
.title{
    font-size: 28px;
    color: #333;
    display: inline-block;
    font-family: 'FZQKBYSJW--GB1-0';
    width: 200px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background: url('../../assets/gdetail/tleft.svg') 0 50% no-repeat,url('../../assets/gdetail/tright.svg') 100% 50% no-repeat;
    margin-bottom: 35px;
}
.content{
    display: flex;
}
.cover{
    width: 190px;
    margin-right: 40px;
}
.coverGg{
    position: relative;
    width: 190px;
    height: 240px;
    background:url('../../assets/gdetail/coverL.png') 0 0 no-repeat,url('../../assets/gdetail/coverR.png') 100% 100% no-repeat;
    background-color: #fff;
    i{
        position: absolute;
        top: 60px;
        right: 65px;
        bottom: 40px;
        text-align: center;
        color: #fff;
        width: 12px;
        font-size: 10px;
        font-style: normal;
        overflow: hidden;
    }
}
.actionBox{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    cursor: pointer;
    li{
        i{
            display: inline-block;
            width: 14px;
            height: 14px;
            background-image: url('../../assets/gdetail/collect.png');
            background-position: 0 0;
            background-repeat: no-repeat;
            margin-right: 5px;
            &.collect{
                background-position-y:-14px;
            }
            &.active{
                background-position-x:-14px;
            }
        }
    }
    
}
.view-btn{
    width: 100%;
    height: 42px;
    line-height: 42px;
    background: #5082CC;
    border-radius: 3px;
    color: #fff;
    text-align: center;
    display: block;
    cursor: pointer;
    i{
        display: inline-block;
        width: 15px;
        height: 14px;
        background-image: url('../../assets/gdetail/book.png');
        background-position: 0 0;
        background-repeat: no-repeat;
        margin-right: 5px;
    }
}
.summary{
    width: 664px;
    h3{
        font-size: 32px;
        font-weight: normal;
        color: #333;
    }
    .place{
        margin-left: 20px;
        font-size: 14px;
        color: #9D7747;
        height: 20px;
        line-height: 20px;
        display: inline-block;
        img{
            margin-right: 5px;
        }
    }
}
.summary-content{
    position: relative;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}
.field-box{
    position: relative;
    width: 50%;
    height: 30px;
    display: flex;
    align-items: center;
}
.field-box label{
    font-weight: bold;
    margin-right: 10px;
    display: block;
}
.field-box label{

}
.summary-content-left,.summary-content-log{
    width: 50%;
}
.summary-list{
    display: flex;
    align-items: center;
}
.summary-list-title{
    display: inline-block;
    width: 80px;
    height: 30px;
    line-height: 30px;
    font-size: #333;
    font-weight: bold;
}
.summary-content-log{
    display: flex;
    p{
        padding-top: 5px;
    }
}
.summary-owner{
    display: flex;
    .owner-list{
        display: block;
        width: 580px;
        font-size: 12px;
        color: #333;
        li{
            border-bottom: 1px solid #C9A470;
            &.th{
                font-weight: bold;
            }
        }
        span{
            display: inline-block;
            width: 20%;
            height: 30px;
            line-height: 30px;
            &.width60{
                width: 60%;
            }
        }
    }
}
.pcHide{
    display: none;
}
.content_xs{
    display: none;
}
.generationName{
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.zhushou{
    background: #91C55E;
}
.marginTop10{
    margin-top: 10px;
}
@media screen and (max-width:1400px) and (min-width:1200px){
    .summary-owner{
        .owner-list{
            width: 470px;
        }
    }
}
@media screen and (max-width:1199px) and (min-width:600px){
    .content_xs{
        .title_xs{
            display: flex;
            .coverGg{
                margin-right: 20px;
            }
        }
    }
    img{
        max-width: 100%;
    }
}
@media screen and (max-width: 600px) {
    .gDetail{
        padding: 50px 10px 20px 10px;
    }
    .titleCenter{
        display: block;
        margin: 0 auto 35px auto;
    }
    .qrcodeWrap{
        right: 0;
        display: none;
    }
    .content{
        display: none;
    }
    .cover{
        margin-right: 10px;
    }
    .summary{
        width: 664px;
        h3{
            font-size: 22px;
        }
        .place{
            margin: 10px;
        }
    }
    .summary-content{
        display: block;
    }
    .summary-content-left{
        width: 100%;
    }
    .summary-content-log{
        width: 100%;
    }
    .hide{
        display: none;
    }
    .pcHide{
        display: block;
    }
    .xs_desc{
        width: 100%;
        display: block;
        margin-top: 10px;
        span{
            font-size: 20px;
        }
        p{
            margin-top: 10px;
        }
    }
    .view-btn{
        margin: 20px auto 0 auto;
    }
    .coverGg{
        img{
            max-width: 100%;
        }
    }
    .content_xs{
        display: block;
        .title_xs{
            display: flex;
            justify-content: space-between;
            .coverGg{
                position: relative;
                width: 140px;
                height: 168px;
                background:url('../../assets/gdetail/coverL.png') 0 0 no-repeat,url('../../assets/gdetail/coverR.png') 100% 100% no-repeat;
                background-color: #fff;
                i{
                    position: absolute;
                    top: 40px;
                    right: 45px;
                    bottom: 40px;
                    text-align: center;
                    color: #fff;
                    width: 12px;
                    font-size: 10px;
                    font-style: normal;
                    overflow: hidden;
                }
            }
            .right_xs{
                margin-left: 10px;
                width: 60%;
                h3{
                    font-size: 20px;
                    color: #333;
                    margin-bottom: 10px;
                }
                a{
                    color: #666;
                    display: block;
                    height: 30px;
                    line-height: 30px;
                    i{
                        display: none;
                    }
                    span{
                        margin: 0;
                        
                    }
                }
                span{
                    color: #fff;
                    text-align: center;
                    display: block;
                    margin: 10px 0;
                    width: 90%;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 3px;
                }
                .zhushou{
                    background: #91C55E;
                }
                .quanwen{
                    background: #5082CC;
                }
                .marginTop10{
                    width: 90%;
                    margin: 20px 0 0 0;
                }
            }
        }
        .genealogy_xs{
            display: block;
            background: #9B9B9B;
            border-radius: 3px;
            padding: 10px;
            margin-top: 20px;
            li{
                display: flex;
                justify-content: space-between;
                height: 40px;
                line-height: 40px;
                color: #fff;
                border-bottom: 1px solid #fff;
            }
        }
    }
}
</style>

