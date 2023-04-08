<template>  
    <div class="lead-excel-wrap">
        <div class="lead-excel-box">
            <h3>批量导入</h3>
            <i class="el-icon-close" @click="close(false,'')"></i>
            <div class="lead-excel-lib">
                <LibModal v-on:get-data="getData" v-on:get-detail="getDetail" />
            </div>
            <div class="lead-excel-button">
                <el-upload
                    :action="baseURL+'upload'"
                    :limit="1"
                    :accept="'.xlsx'"
                    :show-file-list="false"
                    :on-success="handleSuccess"
                    :before-upload="beforeUpload"
                    >
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传excel文件</div>
                </el-upload>
                <button class="download-btn" v-show="aoa" @click="initDownloadExcel(aoa)">下载模板</button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import LibModal from "./LibModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "leadexcelmodal",
    props:{
        
    },
    components: {
        LibModal,
    },
    data: () => {
        return {
            type:'',
            libKey:'',
            templateKey:'',
            aoa: '',
        };
    },
    mounted:function(){
        
    },
    methods:{
        getDetail(data){
            this.isShow = true;
            let aoa = [];
            data.forEach((item) => {
                aoa.push(item.columnName);
            });
            aoa = [aoa];
            this.aoa = aoa;
            console.log(aoa);
        },
        initDownloadExcel(aoa){
            /** 
            * 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
            * @param sheet
            * @param sheetName
            */
            function sheet2blob(sheet, sheetName) {
                sheetName = sheetName || 'sheet1';
                var workbook = {
                    SheetNames: [sheetName],
                    Sheets: {}
                };
                workbook.Sheets[sheetName] = sheet;
                // 生成excel的配置项
                var wopts = {
                    bookType: 'xlsx', // 要生成的文件类型
                    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
                    type: 'binary'
                };
                var wbout = XLSX.write(workbook, wopts);
                var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
                // 字符串转ArrayBuffer
                function s2ab(s) {
                    var buf = new ArrayBuffer(s.length), view = new Uint8Array(buf);
                    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                    return buf;
                }
                return blob;
            }

            /**
             * 通用的打开下载对话框方法，没有测试过具体兼容性
             * @param url 下载地址，也可以是一个blob对象，必选
             * @param saveName 保存文件名，可选
             */
            function openDownloadDialog(url, saveName){
                if(typeof url == 'object' && url instanceof Blob){
                    url = URL.createObjectURL(url); // 创建blob地址
                }
                var aLink = document.createElement('a'), event;
                aLink.href = url;
                aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
                if(window.MouseEvent) event = new MouseEvent('click');
                else{
                    event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                }
                aLink.dispatchEvent(event);
            }

            /**
             * 导出excel
             * @param aoa 二维数组，表格头部数据
            */
            (function aoa_to_sheet(aoa){
                let XLSX = window.XLSX;
                var sheet = XLSX.utils.aoa_to_sheet(aoa);
                openDownloadDialog(sheet2blob(sheet), '模板下载.xlsx');
            })(aoa)
        },
        getData(data){
            this.type = data.type;
            this.libKey = data.libKey;
            this.templateKey = data.templateKey;
        },
        close(flag, arr){
            this.$emit('close-lead-excel', { 'flag': flag, 'arr': arr });
        },
        beforeUpload(){
            if(this.type && this.libKey && this.templateKey){

            }else{
                this.$XModal.message({ message: '请选择模板', status: 'warning' })
                return false;
            }
        },
        handleSuccess(response, file, fileList){
            this.linkSource(response.filePath,response.originalName);
        },
        async linkSource(filePath,fileName){// 文件关联家谱
            let data = await api.postAxios('data/import',{'originalName':fileName,'filePath':filePath,'userKey':this.userId,'siteKey':this.stationKey,'templateKey':this.templateKey,'type':this.type});
            if(data.status == 200){
                this.$socket.emit("login",{ 'userKey': this.userId, 'siteKey': this.stationKey, 'role': this.role });
                this.$XModal.message({ message: data.msg, status: 'success' })
                // this.$notify({
                //     title: '提示',
                //     message: '批量上传成功,批次号为：'+data.batch,
                //     duration: 0,
                //     type: 'success'
                // });
                this.close(true, data.errorArr || '');
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
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
.lead-excel-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
    .lead-excel-box{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 600px;
        padding: 20px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .lead-excel-lib{
            position: relative;
            margin: 20px 0;
        }
        .lead-excel-button{
            display: flex;
            justify-content: center;
            .download-btn{
                border: none;
                outline: none;
                background: #358acd;
                width: 80px;
                height: 32px;
                line-height: 32px;
                border-radius: 5px;
                text-align: center;
                color: #fff;
                cursor: pointer;
                &:hover{
                    opacity: 0.9;
                }
            }
        }
    }
}
</style>

