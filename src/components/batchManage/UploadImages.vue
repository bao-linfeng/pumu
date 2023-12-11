<template>  
    <div class="upload-image-wrap" ref="dragElement">
        <div class="upload-image-box">
            <div class="head-box" @mousedown="onMouseDown">
                <h3 class="title">{{batchData.look ? '影像列表' : '上传影像'}}(标题栏可拖动)</h3>
                <i class="el-icon-close" @click="close(false)"></i>
            </div>
            <div class="contnent-box" v-if="!batchData.look">
                <div class="upload-input">
                    <input type="file" accept="image/*" multiple @change="upload" />
                </div>
                <vxe-button v-if="imageList.length" content="关联影像" @click="linkSource"></vxe-button>
                <p class="title">请修改影像文件名称与谱书相关联</p>
            </div>
            <div class="image-list-box" :class="{active: batchData.look}">
                <div class="image-box" v-for="(item, index) in imageList" :key="index" >
                    <img class="image" @click="previewImages(index)" :src="baseURL+item.simplePath" alt="" />
                    <i v-if="!batchData.look" class="el-icon-delete" @click="deleteImage(index)"></i>
                    <p class="name">{{item.originalName}}</p>
                </div>
            </div>
        </div>
        <div class="preview-images-wrap" v-if="simplePath">
            <i class="left el-icon-arrow-left" :class="{active: currentIndex === 0}" @click="previewImages(currentIndex - 1)"></i>
            <img class="large-image" :style="{transform: 'rotate('+rotate+'deg)'}" :src="baseURL+simplePath" alt="" />
            <div class="refresh-box">
                <img class="icon" @click="handleRotate(false)" title="左旋90°" src="../../assets/shoot/spinL.svg" alt="">
                <img class="icon" @click="handleRotate()" title="右旋90°" src="../../assets/shoot/spinR.svg" alt="">
            </div>
            <i class="close el-icon-close" @click="closePreview"></i>
            <i class="left right el-icon-arrow-right" :class="{active: currentIndex === imageList.length - 1}" @click="previewImages(currentIndex + 1)"></i>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "uploadImages",
    props:{
        batchData: {
            type: Object
        }
    },
    components: {
        
    },
    data: () => {
        return {
           imageList: [],
           currentIndex: -1,
           simplePath: '',
           dragElement: '',
           distanceX: 0,
           distanceY: 0,
           rotate: 0,
        };
    },
    mounted:function(){
        console.log(this.batchData);
        this.getLinkImages();
        this.dragElement = this.$refs.dragElement;
    },
    methods:{
        handleRotate(f = true){
            let rotate = 90;
            if(f){
                this.rotate = this.rotate + rotate;
            }else{
                this.rotate = this.rotate - rotate;
            }
        },
        onMouseDown(e) {
            // 获取起始鼠标位置相对于容器的坐标
            const startX = e.clientX;
            const startY = e.clientY;

            // 添加mousemove和mouseup事件监听器
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);

            // 记录起始鼠标位置和元素位置的距离
            this.distanceX = this.dragElement.offsetLeft - startX;
            this.distanceY = this.dragElement.offsetTop - startY;

            // 阻止默认行为
            e.preventDefault();                                 
        },
        onMouseMove(e) {
            // 计算元素的新位置
            const x = e.clientX  + this.distanceX;
            const y = e.clientY + this.distanceY;

            // 设置元素的新位置
            this.dragElement.style.left = x + 'px';
            this.dragElement.style.top = y + 'px';

            // 阻止默认行为
            e.preventDefault();
        },
        onMouseUp(e) {
            // 移除事件监听器
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);

            // 阻止默认行为
            e.preventDefault();
        },
        closePreview(){
            this.simplePath = '';
            this.currentIndex = -1;
        },
        previewImages(i){
            if(i >= 0 && i <= this.imageList.length - 1){
                this.currentIndex = i;
                this.simplePath = this.imageList[i].simplePath;
                this.scale = 0;
            }
        },
        upload(e){
            let files = Array.from(e.target.files);
            this.uploadImage(files);
        },
        uploadImage(files){
            if(files && files.length){
                let file = files.shift();
                let fd = new FormData();
                fd.append('file', file);
                this.uploadApi(fd, files);
            }
        },
        async uploadApi(fd, files){
            let result = await api.postAxios('upload', fd);
            if(result.statusCode == 200){
                this.imageList.push({'filePath': result.filePath, 'originalName': result.originalName, 'simplePath': result.simplePath});
                if(files && files.length){
                    this.uploadImage(files);
                }
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
        deleteImage(i){
            this.deleteFile(this.imageList[i].filePath, i);
        },
        close(data){
            this.$emit('close', data);
        },
        async deleteFile(filePath, i){// 删除文件
            let result = await api.deleteAxios('singleFile',{'filePath': filePath, 'userKey': this.userId, 'siteKey': this.stationKey});
            if(result.status == 200){
                this.imageList.splice(i, 1);
                this.$XModal.message({ message: '图片删除成功', status: 'success' });
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        async getLinkImages(){// 批次关联影像列表
            let result = await api.getAxios('batch/linkImages?batchKey='+this.batchData._key);
            if(result.status == 200){
                this.imageList = result.data;
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
        async linkSource(){// 文件关联家谱
            if(!this.imageList.length){
                return ADS.message('请上传家谱影像！');
            }
            let result = await api.postAxios('batch/linkImages',{'batchKey': this.batchData._key, 'imageList': this.imageList, 'userKey': this.userId, 'siteKey': this.stationKey});
            if(result.status == 200){
                this.$XModal.message({ message: '批量关联影像成功！', status: 'success' })
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            baseURL: state => state.nav.baseURL,
        })
    },
};
</script>
<style scoped lang="scss">
.upload-image-wrap{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.3);
    box-shadow: 0 0 1px 3px #ddd;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    .upload-image-box{
        position: relative;
        width: 800px;
        height: 480px;
        background: #fff;
        padding: 0 20px;
        .head-box{
            position: relative;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            i{
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 0;
                font-size: 20px;
                cursor: pointer;
            }
        }
    }
    .contnent-box{
        position: relative;
        height: 40px;
        display: flex;
        align-items: center;
        .title{
            margin-left: 20px;
            color: #f00;
        }
    }
    .image-list-box{
        position: relative;
        height: calc(100% - 100px);
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        &.active{
            height: calc(100% - 60px);
        }
        .image-box{
            position: relative;
            margin: 10px 10px 0 0;
            background: #ddd;
            padding: 5px;
            .image{
                position: relative;
                height: 100px;
                display: block;
            }
            i{
                position: absolute;
                top: 5px;
                right: 5px;
                cursor: pointer;
                color: #f00;
            }
            p{
                font-size: 14px;
                margin-top: 5px;
            }
        }
    }
    .preview-images-wrap{
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0,0,0,0.3);
        display: flex;
        justify-content: center;
        align-items: center;
        .large-image{
            position: relative;
            max-height: 100%;
            max-width: 100%;
            display: block;
            cursor: pointer;
        }
        .close{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 40px;
            cursor: pointer;
            color: #fff;
        }
        .left{
            position: absolute;
            color: #fff;
            font-size: 40px;
            cursor: pointer;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            &.active{
                display: none;
            }
        }
        .right{
            left: auto;
            right: 20px;
        }
        .refresh-box{
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            background: #000;
            padding: 5px 10px;
            .icon{
                cursor: pointer;
                margin: 0 10px;
            }
        }
    }
}
</style>

