<template>  
    <div class="wrap" @mousemove="mouseLMove" @mouseup="mouseLEnd">
        <div class="head">
            <div class="head-left">
                <img class="back" @click="goRouter" title="返回" src="../../assets/shoot/l_w.svg" alt="">
                <p class="genealogyName" :title="detail.genealogyName">{{detail.genealogyName}}({{detail.gcKey}})</p>
                <el-select v-if="(takeStatus == 5 || takeStatus == 6 || takeStatus == 7 || takeStatus == 12 || takeStatus == 13 || takeStatus == 14 || takeStatus == 16)" class="width150" v-model="vid" placeholder="请选择卷名" size="small">
                    <el-option
                        v-for="item in volumeList"
                        :class="{active: item.takeStatus == 6 || item.takeStatus == 7}"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select v-if="(imageList.length >= precentLimit) && (role >= 1 && role <= 3)" class="width80 marginL10" v-model="precent" placeholder="请选择审核影像比例" size="small">
                    <el-option
                        v-for="item in precentList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select class="width80 marginL10" v-model="imageHref" placeholder="域名提速" size="small">
                    <el-option
                        v-for="item in speedList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <h3 class="title" @click="isShow = 8">{{takeStatusO[takeStatus]}} ({{scale*100}}%)</h3>
            <div class="head-right">
                <div v-if="takeStatus == 6 && orgAdmin == 'admin'" class="task-verify" @click="isShow = 9">
                    <img src="../../assets/shoot/leaveMsg.svg" alt="">
                    <span class="span">补拍快捷处理</span>
                </div>
                <div class="task-verify" @click="isShow = 4">
                    <img src="../../assets/shoot/leaveMsg.svg" alt="">
                    <span class="span">查看谱目</span>
                </div>
                <div v-if="(((takeStatus == 5 || takeStatus == 6 || takeStatus == 7 || takeStatus == 8 || takeStatus == 9 || takeStatus == 12 || takeStatus == 13 || takeStatus == 14) && role >= 1 && role <= 3) || (takeStatus == 12 && orgAdmin == 'admin')) && !isRead" class="task-verify" @click="(isShow = 6)">
                    <img src="../../assets/shoot/leaveMsg.svg" alt="">
                    <span class="span">编辑谱目</span>
                </div>
                <div v-if="(((takeStatus == 5 || takeStatus == 6 ||  takeStatus == 7 || takeStatus == 8 || takeStatus == 9 || takeStatus == 12 || takeStatus == 13 || takeStatus == 14) && role >= 1 && role <= 3) || (takeStatus == 12 && orgAdmin == 'admin')) && !isRead" class="task-verify" @click="isShow = 3">
                    <img src="../../assets/shoot/leaveMsg.svg" alt="">
                    <span class="span">编辑卷册</span>
                </div>
                <div v-if="(role >= 1 && role <= 3 && (takeStatus == 5 || takeStatus == 13 || takeStatus == 14 || takeStatus == 16))" class="task-verify" @click="isShow = 2">
                    <img src="../../assets/shoot/dor.svg" alt="">
                    <span class="span">DOR报告</span>
                </div>
                <div v-if="(((takeStatus == 5 || takeStatus == 13 || takeStatus == 14) && role >= 1 && role <= 3) || (takeStatus == 12 && orgAdmin == 'admin')) && !isRead" class="task-verify" @click="isShow = 1">
                    <img src="../../assets/shoot/leaveMsg.svg" alt="">
                    <span class="span">申诉{{(role == 1 || role == 2 || role == 3) ? '回复' : ''}}</span>
                </div>
                <div v-if="((orgAdmin == 'admin' && (takeStatus == 12 || takeStatus == 6)) || (role >= 1 && role <= 3 && (takeStatus == 5 || takeStatus == 6 || takeStatus == 7 || takeStatus == 13 || takeStatus == 14))) && !isRead" class="task-verify" @click="handleImagesCheck">
                    <img src="../../assets/shoot/pass.svg" alt="">
                    <span class="span">影像审核</span>
                </div>
            </div>
        </div>
        <div class="content" :style="{height: IH+'px', background: bgColor}">
            <!-- 大图 -->
            <div class="img-box" :class="{active: isZoom, paddingRight340: isShow == 6}">
                <img class="large-image" :class="{active: isNatural}" :style="{transform: 'translate('+x+'px, '+y+'px) rotate('+rotate+'deg) scale('+scale+')'}" @load="loadImage" :src="imageURL+(imageURL.indexOf('gif') > -1 ? '' : '?v='+now)" alt="" />
                <div class="img-hand" @mousedown="dragStart" @mousemove.prevent="mouseMove" @wheel.passive="handleWheel"></div>
            </div>
            <div class="pass-wrap" v-show="isShowSideBar">
                <div class="content-top style1">
                    <div class="pass-box" v-if="lastReason.length">
                        <h3>审核结果:</h3>
                        <div class="repulseRecord-box" v-for="(item,index) in lastReason" v-show="item.type !=2" :key="index">
                            <span>{{item.userName || item.mobile}} {{item.createTimeO}}</span>
                            <p :class="{active: imageIndex == item2.index}" v-for="(item2,index2) in item.returePageArray" :key="index2" @click="changeImage(item2.index)">{{item.type == 2 ? '第'+(item2.index+1)+'拍' : ''}} {{item2.returnReason}} {{item.action || ''}}</p>
                        </div>
                    </div>
                    <div class="pass-box" v-if="resionList.length">
                        <h3>单页标记:</h3>
                        <p :class="{active: imageIndex == item.i}" v-for="(item, i) in resionList" :key="i" :id="item.i" @click="changeImage(item.i)">第{{item.i+1}}拍 {{item.returnReason}} {{item.returnUserName}}{{item.returnPageTimeO}}</p>
                    </div>
                    <div v-if="leaveMsgList.length" class="leave-msg-list">
                        <h3 class="title">拍机备注</h3>
                        <p class="leave-msg-p" :class="{active: imageIndex === item.i}" @click="changeImage(item.i)" v-for="(item, index) in leaveMsgList" :key="index">第{{item.i+1}}拍 {{item.leaveMsg}}</p>
                    </div>
                    <div v-if="complainVolumeList.length" class="leave-msg-list">
                        <h3 class="title">申诉{{orgAdmin == 'admin' ? '回复' : ''}}列表</h3>
                        <p class="leave-msg-p"  v-for="(item, index) in complainVolumeList" :key="index">{{item.log}} {{item.userName}} {{item.timeO}}</p>
                    </div>
                </div>
                <div class="content-bottom style1">
                    <span>卷册备注：{{detail.memo}}</span>
                </div>
                <img class="s-fold" src="../../assets/shoot/s-fold.svg" @click="isShowSideBar = false" alt="">
            </div>
            <!-- 工具栏 -->
            <div class="tool-wrap" @mousedown="mouseLStart">
                <div class="tool-box" @mousedown.stop="" @keyup.stop="">
                    <input class="page-input w50" type="Number" title="原图缩放比例设置" v-model="zoomLevel" step="0.1" placeholder="原图缩放比例" />
                    <img class="icon" @click="handleNatural" title="原图查看" :src="require('../../assets/shoot/'+(isNatural ? 'naturalOpen' : 'naturalClose')+'.svg')" alt="">
                    <img class="icon" @click="handleOpenNewView" title="查看单页" :src="require('../../assets/shoot/magnifierOpen.svg')" alt="">
                    <!-- <img class="icon" @click="handleMagnifier" title="放大镜" :src="require('../../assets/shoot/'+(isMagnifier == 1 ? 'magnifierOpen' : 'magnifierClose')+'.svg')" alt=""> -->
                    <img v-if="checkImageList.length" class="icon" src="../../assets/shoot/delete.svg" @click="handleDeleteImages" title="删除图片" alt="">
                    <input class="page-input" type="Number" @keyup.enter="imageIndex = page-1" @change="changeImagePage" :value="page" placeholder="页码" />
                    <span class="total">/共{{precentImages.length}}页</span>
                    <img class="icon" @click="handleRotate(false)" title="左旋90°" src="../../assets/shoot/spinL.svg" alt="">
                    <img class="icon" @click="handleRotate()" title="右旋90°" src="../../assets/shoot/spinR.svg" alt="">
                    <img class="icon" @click="handleZoom(false)" title="缩小" src="../../assets/shoot/zoomIn.svg" alt="">
                    <img class="icon" @click="handleZoom()" title="放大" src="../../assets/shoot/zoomOut.svg" alt="">
                    <img class="icon" @click="handleReset" title="重置" src="../../assets/shoot/reset.svg" alt="">
                    <img v-if="((orgAdmin == 'admin' && takeStatus == 12) || (role >= 1 && role <= 3 && (takeStatus == 5 || takeStatus == 6 || takeStatus == 13 || takeStatus == 14))) && !isRead" class="icon" @click="isPassModule = !isPassModule" title="标记原因" src="../../assets/shoot/mark.svg" alt="">
                    <!-- 标记打回 -->
                    <PassModule v-if="isPassModule" :passReasonA="passReason" v-on:set-reason="patchPageReturn" />
                </div>
            </div>
            <i class="el-icon-arrow-left prev" @click="changeImage(imageIndex - 1)"></i>
            <i class="el-icon-arrow-right next" @click="changeImage(imageIndex + 1)"></i>
        </div>
        <div class="foot style3" :style="{height: TH+'px'}">
            <!-- 缩略图 -->
            <div class="thumbnail-box" :class="{active: imageIndex === index}" v-for="(item,index) in precentImages" :key="index" :id="index" @click="changeImage(index)">
                <img class="lazyload" :data-src="imageHref+(item.thumbnail || item.name)" :src="imageGif" alt="" />
                <div class="page-box">
                    <i>{{index+1}}{{(precent == 1 ? '' : '('+(item.index+1)+')')}}</i>
                </div>
                <img class="attachedSheet" v-if="item.attachedSheet == 1" title="附页" src="../../assets/shoot/attachedSheetA.svg" alt="">
                <i class="check" v-if="orgAdmin == 'admin' && (takeStatus == 12 || takeStatus == 6)" :class="{active: checkImageList.indexOf(item._key) > -1}" @click.stop="checkImage(item._key)"></i>
            </div>
        </div>
        <!-- 放大镜 -->
		<div class="magnifier-box" v-show="isMagnifier == 1" :style="{top: (magnifierY+30)+'px', left: (magnifierX+30)+'px', width: magnifierW+'px', height: magnifierH+'px'}">
			<img class="magnifier" :style="{top: magnifierNaturalY+'px', left: magnifierNaturalX+'px', height: zoomLevel*imgNH+'px'}" :src="imageURL" alt="">
		</div>
        <!-- 左侧栏弹出 -->
        <img v-if="!isShowSideBar" class="s-unfold" src="../../assets/shoot/s-unfold.svg" @click="isShowSideBar = true" alt="">
        <!-- 卷册打回原因 -->
        <VolumeReturnReason v-if="isVRR" v-on:close="isVRR = false" v-on:save="handleVolumeReturn" />
        <!-- 申诉理由 -->
        <ComplainVolumeModule v-if="isShow == 1" v-on:close="isShow = 0" v-on:save="handleComplainVolume" />
        <!-- OCR报告 -->
        <DORModule v-if="isShow == 2" :detail="detail" v-on:close="isShow = 0" />
        <!-- 卷册编辑 -->
        <EditVolume v-if="isShow == 3" :detail="detail" v-on:close="closeEditVolume" />
        <!-- 查看谱目 -->
        <CatalogView v-if="isShow == 4" :read="true" :dataKey="dataKey" :vid="vid" v-on:close="isShow = 0" v-on:save="handleSave" />
        <!-- 谱目编辑 -->
        <EditCatalog v-if="(isShow == 6)" :read="false" :dataKey="dataKey" :vid="vid" :attr="[]" v-on:close="isShow = 0" />
        <!-- 影像审核 -->
        <ImagesCheck v-if="isShow == 5" :detail="detail" :returnReasonL="resionList.length" v-on:close="closeCheck" />
        <!-- loading -->
        <Loading class="image-loading" v-show="loading" />
        <!-- 影像预览 -->
        <ImageView v-if="isShow == 8" :gid="gid" :genealogyName="genealogyName" v-on:close="isShow = 0" />
        <!-- 补拍影像 -->
        <ReshootImages v-if="isShow == 9" :gid="gid" :vid="vid" :device="device" :imageKey="pageKey" :imageURL="imageURL" :page="page" v-on:close="closeReshoot" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
import PassModule from '../../components/takeCamera/PassModule.vue';
import VolumeReturnReason from '../../components/takeCamera/VolumeReturnReason.vue';
import ComplainVolumeModule from '../../components/takeCamera/ComplainVolumeModule.vue';
import DORModule from '../../components/takeCamera/DORModule.vue';
import EditVolume from '../../components/takeCamera/EditVolume.vue';
import CatalogView from '../../components/takeCamera/CatalogView.vue';
import EditCatalog from '../../components/takeCamera/EditCatalog.vue';
import ImagesCheck from '../../components/takeCamera/ImagesCheck.vue';
import ImageView from '../../components/takeCamera/ImageView.vue';
import ReshootImages from '../../components/takeCamera/ReshootImages.vue';

export default {
    name: "cameraImage",
    components: {
        PassModule, VolumeReturnReason, ComplainVolumeModule, DORModule, EditVolume, CatalogView, ImagesCheck, EditCatalog, ImageView, ReshootImages,
    },
    data: () => {
        return {
            vid: '',
            imageList: [],
            imageGif: 'data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs',
            imageURL: '',
            pageKey: '',
            imageIndex: 0,
            passList: [],
            resionList: [],
            isPassModule: false,
            passReason: [],
            lastReason: [],
            isZoom: false,
            rotate: 0,
            scale: 1,
            pointerX: 0,
            pointerY: 0,
            x: 0,
            y: 0,
            takeStatus: '',
            isVRR: false,
            leaveMsgList: [],
            isShow: 0,
            complainVolumeList: [],
            detail: {'changeFieldArr': []},
            page: 1,
            dataKey: '',
            checkImageList: [],
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
            isMagnifier: 0,
            magnifierW: 300,
            magnifierH: 300,
            magnifierX: 0,
            magnifierY: 0,
            magnifierNaturalX: 0,
            magnifierNaturalY: 0,
            windowW: window.innerWidth,
            windowH: window.innerHeight,
            imgW: 0,
            imgH: 0,
            imgNW:0,
            imgNH:0,
            zoomLevel: 1,
            Y: 0,
            thumbnailH: 100,
            isMouseMove: false,
            isNatural: false,
            TH: 100,
            IH: window.innerHeight - 40 - 100,
            bgColor: '#ecc48b',
            volumeList: [],
            precentList: [
                {'label': '100%', 'value': 1},
                {'label': '40%', 'value': 0.4},
            ],
            precent: 1,
            precentLimit: 30,
            total: 0,
            precentImages: [],
            precentImageList: [],
            loading: false,
            isFirst: true,
            genealogyName: '',
            gid: '',
            isRead: '',
            isShowSideBar: false,
            pageLimit: 10,
            now: 0,
            speedList: [
                {'label': '线路1', 'value': 'https://sync.qingtime.cn/photo'},
                // {'label': '线路2', 'value': 'http://223.111.180.111:8085/photo'},
            ],
            imageHref: 'https://sync.qingtime.cn/photo',
            device: '',
        };
    },
    created:function(){
        this.device = ADS.getQueryVariable('device');
        this.vid = ADS.getQueryVariable('vid');
        this.gid = ADS.getQueryVariable('gid');
        this.genealogyName = ADS.getQueryVariable('genealogyName') ? decodeURIComponent(ADS.getQueryVariable('genealogyName')) : '';
        this.takeStatus = ADS.getQueryVariable('takeStatus');
        this.isRead = ADS.getQueryVariable('isRead') || ''; 
        if(window.location.origin.indexOf('genealogy.1jiapu.com') > -1){
            this.imageHref = 'https://photo.1jiapu.com/photo';
            this.speedList = [
                {'label': '线路1', 'value': 'https://photo.1jiapu.com/photo'},
                {'label': '线路2', 'value': 'http://223.111.180.111:8085/photo'},
            ]
        }
    },
    mounted:function(){
        // 初始化enter事件
        const enterKeyUp = () => {
            document.addEventListener('keyup', this.enterKey);
        }
        enterKeyUp();
    },
    beforeDestroy: function(){
        // 销毁enter事件
        const enterKeyUpDestoryed = () => {
            document.removeEventListener('keyup', this.enterKey);
        }
        enterKeyUpDestoryed();
    },
    methods:{
        closeReshoot(f){
            this.isShow = 0;
            if(f){
                this.getImageList(this.dataKey);
            }
        },
        handleSave(){
            this.getVolumeDetail();
        },
        handleOpenNewView(){
            window.open(this.imageURL+'?v='+Date.now(), '_blank');
        },
        handleNatural(){
			this.isMagnifier = 0;
			this.isNatural = !this.isNatural;
			this.scale = 1;
			this.rotate = 0;
			this.x = 0;
			this.y = 0;
            this.zoomLevel = 1;
			this.TH = this.thumbnailH || 100;
			this.IH = window.innerHeight - 40 - this.thumbnailH;
		},
        mouseMove(e){
			if(this.isMagnifier != 1){
				return;
			}
			this.magnifierX = e.clientX;
			this.magnifierY = e.clientY;
			this.magnifierNaturalX = -(e.clientX - (this.windowW - this.imgW)/2)*this.imgNW*Number(1 || this.zoomLevel)/this.imgW+this.magnifierW/2;
			this.magnifierNaturalY = -(e.clientY - 60)*this.imgNH*Number(1 || this.zoomLevel)/this.imgH;
		},
        handleMagnifier(){// 切换放大镜模式
			this.isMagnifier = this.isMagnifier == 1 ? 0 : 1;
			this.isNatural = false;
			this.scale = 1;
			this.rotate = 0;
			this.x = 0;
			this.y = 0;
            this.zoomLevel = 1;
			this.TH = this.thumbnailH || 100;
			this.IH = window.innerHeight - 40 - this.thumbnailH;
		},
        loadImage(e){//大图加载
            console.log(e.target.width, e.target.height, e.target.naturalWidth, e.target.naturalHeight);
            this.loading = false;
            this.imgW = e.target.width;
            this.imgNW = e.target.naturalWidth;
            this.imgH = e.target.height;
            this.imgNH = e.target.naturalHeight;
        },
        closeCheck(f){
            console.log(f);
            this.isShow = 0;
            if(f){
                this.isFirst = true;
                // this.getImageList();// 影像列表
                this.getVolumeDetail();// 卷册详情
                // this.getComplainVolume();// 申诉
            }
        },
        async getVolumeList(dataKey){// 卷册列表
            const result = await api.getAxios('catalog/volumeList?catalogKey='+dataKey);
            if(result.status == 200){
                let volumeList = [];
                let takeStatusOO = {'1': '待拍摄', '2': '拍摄中', '3': '自检中', '4': '同步中', '5': '初审', '6': '打回中', '7': '完成', '8': '开发票中', '12': '审核', '13': '复审', '14': '待议', '15': '', '16': '作废'};
                result.data.forEach((ele) => {
                    ele.takeStatusO = takeStatusOO[ele.takeStatus];
                    ele.label = ele.volumeNumber+'('+ele.takeStatusO+')';
                    ele.value = ele._key;

                    if(this.role >= 1 && this.role <= 3){
                        if(ele.takeStatus == 5 || ele.takeStatus == 6 || ele.takeStatus == 7 || ele.takeStatus == 13 || ele.takeStatus == 14){
                            volumeList.push(ele);
                        }
                        // if(this.takeStatus == 5 || this.takeStatus == 13 || this.takeStatus == 14){
                        //     if(ele.takeStatus == 5 || ele.takeStatus == 13 || ele.takeStatus == 14){
                        //         volumeList.push(ele);
                        //     }
                        // }else{
                        //     if(ele._key == this.vid){
                        //         volumeList.push(ele);
                        //     }
                        // }
                    }
                    if(this.orgAdmin == 'admin'){
                        if(this.takeStatus == 12){
                            if(ele.takeStatus == 12){
                                volumeList.push(ele);
                            }
                        }else{
                            if(ele._key == this.vid){
                                volumeList.push(ele);
                            }
                        }
                    }
                });

                volumeList = volumeList.sort((a, b) => {return a.internalSerialNumber - b.internalSerialNumber});
                this.volumeList = volumeList;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        randomPrecentData(data){// 获取指定长度数组 固定百分比的随机数据
            let l = data.length, img = '', i = 0, precent = Math.floor(this.total*this.precent);
            
            if(this.total >= this.precentLimit){// 影像页大于指定页数 根据百分比显示
                if(this.precent == 1 || (this.role < 1 || this.role > 3)){// 百分百直接显示
                    this.precentImages = this.imageList;

                    this.loading = false;
                    this.imageURL = this.imageHref + this.precentImages[this.imageIndex].name;
                    this.pageKey = this.precentImages[this.imageIndex]._key;
                    this.Observer();
                }else{
                    if(this.total - l < precent){
                        i = ADS.GetRandomNum(0, l);
                        img = data.splice(i, 1);
                        this.precentImageList.push(img[0]);
                        this.randomPrecentData(data);
                    }else{
                        this.precentImages = this.precentImageList.sort((a, b) => {return a.index - b.index});

                        this.loading = false;
                        this.imageURL = this.imageHref + this.precentImages[this.imageIndex].name;
                        this.pageKey = this.precentImages[this.imageIndex]._key;
                        this.Observer();
                    }
                }
            }else{// 显示所有
                this.precentImages = this.imageList;

                this.loading = false;
                this.imageURL = this.imageHref + this.precentImages[this.imageIndex].name;
                this.pageKey = this.precentImages[this.imageIndex]._key;
                this.Observer();
            }
        },
        mouseLStart(e){
			if(this.isMagnifier == 1){
				return;
			}
			this.Y = e.clientY;
			this.isMouseMove = true;
		},
        mouseLMove(e){
			let nowY = 0;
			let disY = 0;
			nowY = e.clientY;
			disY = nowY - this.Y;
			if(!this.isMouseMove){
				return;
			}
			this.Y = nowY;
			this.TH = this.TH - disY;
			// changePropertyValue('thumbnailH', TH.value);
			// setValue('thumbnailH', TH.value);
			this.IH = this.IH + disY;
		},
        mouseLEnd(e){
			if(!this.isMouseMove){
				return;
			}
			this.isMouseMove = false;
		},
        handleImagesCheck(){
            this.isShow = 5;
        },
        handleDeleteImages(){
            if(!this.checkImageList.length){
                return ADS.message('请勾选缩略图！');
            }
            this.$confirm('此操作将删除选中的图片影像, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteImageList();
            }).catch(() => {});
        },
        async deleteImageList(){// 批量删除图片
            let result = await api.deleteAxios('v3/review/catalog/image', {'volumeKey': this.vid, 'orgKey': this.orgId, 'imageKeyArray': this.checkImageList, 'siteKey': this.stationKey, 'userKey': this.userId});
            if(result.status == 200){
                this.checkImageList = [];
                this.getImageList();
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'});
            }
        },
        checkImage(i){
			let t = this.checkImageList.indexOf(i);
			if(t > -1){
				this.checkImageList.splice(t, 1);
			}else{
				this.checkImageList.push(i);
			}
		},
        handleWheel(e){
            if(e.deltaY > 0){
                if(this.scale >=2){
                    this.handleZoom(false);
                }
            }
            if(e.deltaY < 0){
                this.handleZoom();
            }
        },
        closeEditVolume(f){
            console.log(f);
            this.isShow = 0;
            if(f){
                this.getVolumeDetail();
            }
        },
        enterKey(event){
            const keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
            // console.log(keyCode);
            // 左、上
            if(keyCode == 37 || keyCode == 38){
                if(this.imageIndex >= 1){
                    this.changeImage(this.imageIndex - 1);
                }else{
                    ADS.message('第一页了');
                }
            }
            // 右、下
            if(keyCode == 39 || keyCode == 40){
                if(this.imageIndex < this.precentImages.length - 1){
                    this.changeImage(this.imageIndex + 1);
                }else{
                    ADS.message('末一页了');
                }
            }
        },
        changeImagePage(e){
            if(e.target.value >= this.precentImages.length){
                this.page = this.precentImages.length;
                this.imageIndex = this.page - 1;
            }else if(e.target.value <= 1){
                this.page = 1;
                this.imageIndex = 0;
            }else{
                this.page = Number(e.target.value);
                this.imageIndex = this.page - 1;
            }

            this.pageKey = this.precentImages[this.imageIndex]._key;
            this.imageURL = this.imageHref + this.precentImages[this.imageIndex].name;
            
            document.getElementById(this.pageLimit + this.imageIndex <= this.precentImages.length ? this.pageLimit + this.imageIndex : this.imageIndex).scrollIntoView();
            
        },
        async getComplainVolume(){// 申诉列表
            let result = await api.getAxios('v3/review/volume/complainVolume?volumeKey='+this.vid+'&logType='+(this.orgAdmin == 'admin' ? '申诉回复' : '申诉'));
            if(result.status == 200){
                this.complainVolumeList = result.data.map((ele) => {
                    ele.timeO = ele.time ? ADS.getLocalTime(ele.time) : '';
                    return ele;
                });
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        async handleComplainVolume(complainReason){// 申诉
            this.isShow = 0;
            let result = await api.postAxios('v3/review/volume/complainVolume', {'volumeKey': this.vid, 'complainReason': complainReason, 'siteKey': this.stationKey, 'userKey': this.userId});
            if(result.status == 200){
                this.$XModal.message({message: '提交申诉'+(this.role >= 1 && this.role <= 3 ? '回复' : '')+'成功', status: 'success'});
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'});
            }
        },
        patchVolumeReturn(){
            this.$confirm('是否打回卷册?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                if(this.resionList.length){// 单页标记
                    this.patchTaskVerify('return', '')
                }else{
                    this.isVRR = true;
                }
            }).catch(() => {});
        },
        handleVolumeReturn(data){
            this.isVRR = false;
            this.patchTaskVerify('return', data);
        },
        dragStart(ev){
            this.pointerX = ev.clientX;
            this.pointerY = ev.clientY;
            document.onmousemove = (e)=>{
                let nowX = 0, nowY = 0;
                nowX = e.clientX - this.pointerX;
                nowY = e.clientY - this.pointerY;
                this.x = this.x + nowX;
                this.y = this.y + nowY;
                this.pointerX = e.clientX;
                this.pointerY = e.clientY;
            };
            document.onmouseup = (e) => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        },
        handleReset(){
            this.scale = 1;
            this.rotate = 0;
            this.x = 0;
            this.y = 0;
            this.zoomLevel = 1;
            this.isMagnifier = 0;
			this.isNatural = false;
        },
        handleRotate(f = true){
            let rotate = 90;
            // if(f){
            //     this.rotate = this.rotate + rotate;
            // }else{
            //     this.rotate = this.rotate - rotate;
            // }
            this.$confirm('此操作将会对选中的图片'+(f ? '向右旋转90°' : '向左旋转90°')+', 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.imageRotate(f);
            }).catch(() => {});
        },
        async imageRotate(f){
            this.loading = true;
            let result = await api.postAxios('review/task/rotate', {
                'volumeKey': this.vid, 
                'catalogKey': this.gid,
                'siteKey': this.stationKey, 
                'userKey': this.userId,
                'value': f ? 90 : -90,
                "server": window.location.origin.indexOf('genealogy.1jiapu.com') > -1 ? '' : "test", 
                'image': this.precentImages[this.imageIndex].name,
            });
            this.loading = false;
            this.now = Date.now();
            if(result.status == 200){
                
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        handleZoom(f = true){
            if(f){
                this.scale = this.scale + 1;
            }else{
                if(this.scale >= 2){
                    this.scale = this.scale - 1;
                }else{
                    this.$XModal.message({message: '已经最小尺寸啦', status: 'warning'})
                }
            }
        },
        changeImage(i){
            if(i < 0){
                return ADS.message('首一页了！');
            }
            if(i >= this.precentImages.length){
                return ADS.message('末一页了！');
            }
            this.imageIndex = i;
            this.page = i + 1;
            this.imageURL = this.imageHref + this.precentImages[this.imageIndex].name;
            this.pageKey = this.precentImages[this.imageIndex]._key;
            this.passReason = [];
            if(this.precentImages[this.imageIndex].returnReason){
                this.passReason = this.precentImages[this.imageIndex].returnReason.split(',');
            }

            document.getElementById(this.imageIndex).scrollIntoView();
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
        handlePatchTaskVerify(){
            this.$confirm('是否'+(this.orgAdmin == 'admin' ? '提交审阅' : '审阅通过')+'?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.patchTaskVerify('pass', '');
            }).catch(() => {});
        },
        async patchTaskVerify(operate, returnReason = ''){// 卷册打回、提交审阅
            let result = await api.patchAxios('v3/review/task/verify', {'volumeKey': this.vid, 'operate': operate, 'returnReason': returnReason, 'siteKey': this.stationKey, 'userKey': this.userId});
            if(result.status == 200){
                if(operate == 'return'){
                    ADS.message('卷册已打回', true);
                    this.takeStatus = 4;
                    
                }
                if(operate == 'pass'){
                    if(this.takeStatus == 12){
                        ADS.message('卷册已提交审阅', true);
                        this.takeStatus = 3;
                    }else{
                        ADS.message('卷册已审核通过', true);
                        this.takeStatus = 5;
                    }
                }
                // this.$router.push('/'+window.localStorage.getItem('pathname')+'/takeCamera?i='+this.takeStatus);
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        async getRepulseRecord(){// 打回记录
            let result = await api.getAxios('review/task/repulseRecord?siteKey=1528234980&volumeKey='+this.vid+'&orgOrFS=1&gcKey=');
            if(result.status == 200){
                this.lastReason = result.data.map((ele) => {
                    ele.createTimeO = ele.createTime ? ADS.getLocalTime(ele.createTime) : '';
                    return ele;
                });
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        async getImageList(){// 影像列表
            this.imageList =  [];
            let result = await api.getAxios('review/page/list?volumeKey='+this.vid);
            if(result.status == 200){
                if(!result.data.length){return;}
                let imageList = [];
                this.imageList = result.data.map((ele) => {
                    ele.returnPageTimeO = ele.returnPageTime ? ADS.getLocalTime(ele.returnPageTime) : '';
                    return ele;
                });
                result.data.forEach((ele) => {
                    imageList.push({'_key': ele._key, 'name': ele.name, 'index': ele.index, 'attachedSheet': ele.attachedSheet || ''});
                });
                this.total = result.data.length;
                this.precentImageList = [];
                this.randomPrecentData(imageList);

                if(this.imageList[this.imageIndex].returnReason){
                    this.passReason = this.imageList[this.imageIndex].returnReason.split(',');
                }
                this.resionList = this.imageList.filter((ele, i) => {
                    ele.i = i;
                    return ele.returnReason && ele.returnReason.length > 0;
                });
                // 留言列表
                this.leaveMsgList = this.imageList.filter((ele, i) => {
                    ele.i = i;
                    return ele.leaveMsg;
                });
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        async patchPageReturn(returnReason){// 设置打回原因

            let result = await api.patchAxios('review/page/return', {'pageKey': this.pageKey, 'returnReason' : returnReason, 'userKey': this.userId} , false);
            if(result.status == 200){
                this.isPassModule = false;
                ADS.message('设置成功', true);
                this.precentImages[this.imageIndex].returnReason = returnReason;
                this.imageList[this.precentImages[this.imageIndex].index].returnReason = returnReason;
                this.imageList[this.precentImages[this.imageIndex].index].returnPageTimeO = ADS.getLocalTime(Date.now());
                this.imageList[this.precentImages[this.imageIndex].index].returnUserName = this.userName;
                this.resionList = this.imageList.filter((ele, i) => {
                    ele.i = i;
                    return ele.returnReason && ele.returnReason.length > 0;
                });
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        async getVolumeDetail(){// 卷册详情
            let result = await api.getAxios('v3/review/volume/detail?volumeKey='+this.vid);
            if(result.status == 200){
                this.detail = result.data;
                this.detail.changeFieldArr = this.detail.changeFieldArr || [];
                this.dataKey = result.data.gcKey;
                this.takeStatus = result.data.takeStatus;
                document.title = result.data.genealogyName+'-'+result.data.volumeNumber;
                if(this.takeStatus == 5 || this.takeStatus == 6 || this.takeStatus == 12 || this.takeStatus == 13 || this.takeStatus == 14){
                    this.isShowSideBar = true;
                }
                if(this.isFirst){
                    this.isFirst = false;
                    this.getRepulseRecord();
                    this.getVolumeList(this.dataKey);
                }
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        goRouter(){
            history.back(-1);
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
            orgId: state => state.nav.orgId,
        })
    },
    watch:{
        'imageHref': function(){
            this.imageURL = this.imageHref + this.precentImages[this.imageIndex].name;
            this.Observer();
        },
        'imageURL': function(){
            this.loading = true;
            this.now = Date.now();
        },
        'vid': function(nv, ov){
            console.log(nv);
            this.imageURL = this.imageGif;
            this.imageIndex = 0;
            this.imageList =  [];
            this.precentImages = [];
            this.page = 1;
            this.isFirst = true;
            // this.$router.push('/'+this.pathname+'/cameraImage?vid='+nv);

            this.handleReset();// 重置
            this.getImageList();// 影像列表
            this.getVolumeDetail();// 卷册详情
            this.getComplainVolume();// 申诉
        },
        'precent': function(nv, ov){
            this.loading = true;
            let imageList = [];

            this.imageURL = this.imageGif;
            this.imageIndex = 0;
            this.page = 1;
            
            this.imageList.forEach((ele) => {
                imageList.push({'_key': ele._key, 'name': ele.name, 'index': ele.index, 'attachedSheet': ele.attachedSheet || ''});
            });
            this.precentImageList = [];
            this.randomPrecentData(imageList);
        },
        'zoomLevel': function(nv ,ov){
            this.scale = Number(nv);
            console.log(this.scale);
            if(nv == 23){
                if(this.isNatural){
                    // this.x = this.imgNW*(nv)/2;
                    // this.y = this.imgNH*(nv - 1)/2;
                }else{
                    this.x = (this.isNatural ? this.imgNW : this.imgW)*(nv)/2 - window.innerWidth/2;
                    this.y = (this.isNatural ? this.imgNH : this.imgH)*(nv - 1)/2;
                }
            }else{
                this.x = 0;
                this.y = 0;
            }
        },
        'pageKey': function(nv, ov){
            console.log(nv);
        }
    },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    color: #fff;
    overflow: hidden;
    .head{
        position: relative;
        width: calc(100% - 40px);
        padding: 0 20px;
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #404040;
        .head-left{
            position: relative;
            display: flex;
            align-items: center;
            .genealogyName{
                margin: 0 10px;
            }
        }
        .back{
            cursor: pointer;
            display: block;
        }
        .title{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .head-right{
            position: relative;
            height: 100%;
            display: flex;
            align-items: center;
            font-style: normal;
            .task-verify{
                position: relative;
                height: 100%;
                padding: 0 10px;
                display: flex;
                align-items: center;
                font-style: normal;
                cursor: pointer;
                &.active{
                    background: #000;
                }
                &:hover{
                    background: #000;
                }
            }
            .span{
                margin-left: 5px;
            }
        }
    }
    .content{
        position: relative;
        width: 100%;
        height: calc(100% - 140px);
        display: flex;
        justify-content: center;
        align-items: center;
        .img-box{
            position: relative;
            overflow: hidden;
            height: 100%;
            width: 100%;
            &.active{
                overflow: auto;
            }
            .img-hand{
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
            }
            &.paddingRight340{
                width: calc(100% - 440px);
                padding-right: 440px;
            }
        }
        .large-image{
            height: 100%;
            display: block;
            margin: 0 auto;
            &.active{
                height: auto;
                transform-origin: 0 0;
            }
        }
        .pass-wrap{
            position: absolute;
            top: 1px;
            bottom: 0;
            width: 200px;
            left: 0;
            background: #404040;
            text-align: left;
            padding: 10px 0 0 10px;
            overflow-y: auto;
            h3{
                margin-bottom: 5px;
            }
            p{
                position: relative;
                padding: 5px;
                margin: 0 5px 0 0;
                &::before{
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: #fff;
                    opacity: 0.1;
                }
                cursor: pointer;
                &.active{
                    color: #85b83e;
                }
            }
            .repulseRecord-box{
                margin-bottom: 10px;
                span{
                    opacity: 0.3;
                    font-size: 12px;
                }
            }
            .content-top{
                position: relative;
                width: 100%;
                height: calc(100% - 70px);
                overflow-y: auto;
            }
            .content-bottom{
                position: relative;
                width: 100%;
                height: 40px;
                overflow-y: auto;
            }
        }
    }
    .foot{
        position: relative;
        width: 100%;
        height: 100px;
        background: #232323;
        width: calc(100% - 40px);
        padding: 0 20px;
        overflow-x: auto;
        display: flex;
        align-items: center;
        .thumbnail-box{
            position: relative;
            height: calc(100% - 20px);
            margin-right: 10px;
            // min-width: 50px;
            display: block;
            cursor: pointer;
            .attachedSheet{
                position: absolute;
                top: 0;
                left: 0;
                width: 20px;
                cursor: pointer;
            }
            .lazyload{
                height: 100%;
            }
            &.active{
                border: 5px solid #85b83e;
                height: calc(100% - 30px);
            }
            .page-box{
                position: absolute;
                width: 100%;
                height: 20px;
                bottom: 0;
                left: 0;
                background: rgba(0,0,0,0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(8px);
                i{
                    color: #fff;
                    font-weight: bold;
                    font-style: normal;
                }
            }
            .check{
                position: absolute;
                top: 2px;
                right: 2px;
                width: 18px;
                height: 18px;
                cursor: pointer;
                border: 1px solid #f00;
                &.active{
                    background: url('../../assets/shoot/tick_red.svg') 50% 50% no-repeat;
                    background-size: cover;
                }
            }
        }
    }
}
.s-fold{
    position: absolute;
    top: 10px;
    right: 10px;
    height: 20px;
    cursor: pointer;
}
.s-unfold{
    position: absolute;
    top: 50px;
    left: 10px;
    height: 20px;
    cursor: pointer;
    z-index: 1000;
}
.tool-wrap{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(53, 138, 205, 0.5);
    cursor: pointer;
}
.tool-box{
    position: relative;
    height: 30px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background: #333;
    .icon{
        height: 20px;
        margin: 0 10px;
        cursor: pointer;
    }
    .page-input{
        width: 80px;
        height: 20px;
        line-height: 20px;
        text-indent: 10px;
        outline: none;
        border: none;
        margin-left: 10px;
        &.w50{
            width: 50px;
        }
    }
}

// 留言列表
.leave-msg-list{
	position: relative;
	.title{
		font-size: 16px;
	}
	.leave-msg-p{
		margin-bottom: 5px;
		&.active{
			color: #85b83e;
		}
	}
}
.width150{
    width: 120px;
}
.width80{
    width: 80px;
}
.marginL10{
    margin-left: 10px;
}
.magnifier-box{
	position: absolute;
	border: 1px solid #ddd;
	width: 200px;
	height: 200px;
	z-index: 100;
	background: #fff;
	overflow: hidden;
	.magnifier{
		position: absolute;
		display: block;
	}
}
.prev{
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    font-size: 40px;
    color: #fff;
    cursor: pointer;
}
.next{
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    font-size: 40px;
    color: #fff;
    cursor: pointer;
}
.image-loading{
    top: 50% !important;
    right: auto !important;
    bottom: auto !important;
    left: 50% !important;
    width: 80px;
    height: 80px;
    transform: translate(-50%, -50%);
}
</style>

