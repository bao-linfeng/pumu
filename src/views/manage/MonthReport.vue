<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'月报'">
                <div class="tool-bar" v-if="role >= 1 && role <= 3">
                    <vxe-button status="primary" content="下载月报" v-show="aoa" @click="initDownloadExcel(aoa)"></vxe-button>
                    <!-- <vxe-select v-model="filterUser" placeholder="用户">
                        <vxe-option v-for="(item,index) in users" :key="'user'+index" :value="item.value" :label="item.label"></vxe-option>
                    </vxe-select> -->
                    <vxe-input v-model="startTime" type="date" placeholder="请选择开始日期" clearable></vxe-input>
                    <vxe-input v-model="endTime" type="date" placeholder="请选择结束日期" clearable></vxe-input>
                    <vxe-select v-if="role >= 1 && role<= 2" v-model="orgKey" placeholder="机构">
                        <vxe-option v-for="(item,index) in orgList" :key="'orh'+index" :value="item.value" :label="item.label"></vxe-option>
                    </vxe-select>
                    <vxe-button status="primary" content="检索" @click="getSiteSummary"></vxe-button>
                </div>
            </NavModal>
            <div class="vex-table-box" id="adai_chart"></div>
            <div class="vex-table-box">
                <vxe-table
                    class="table-scrollbar"
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    :loading="loading"
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData">
                    <vxe-table-column field="time" title="时间"></vxe-table-column>
                    <vxe-table-column field="repeatData" title="重复谱目"></vxe-table-column>
                    <vxe-table-column field="invalidData" title="无效谱目"></vxe-table-column>
                    <vxe-table-column field="buyData" title="已购谱目"></vxe-table-column>
                    <vxe-table-column field="submitData" title="提交谱目"></vxe-table-column>
                </vxe-table>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "monthReport",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            h: 0,
            loading: false,
            filterUser: '',
            users:[],
            orgList: [],
            orgKey: '',
            startTime: '',
            endTime: '',
            tableData: [],
            aoa: '',
        };
    },
    created:function(){
        this.h = window.innerHeight - 100;
    },
    mounted:function(){
        this.role >= 1 && this.role <= 2 ? this.getOrgList() : null;
        this.getSiteSummary();
    },
    methods:{
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
                    var buf = new ArrayBuffer(s.length);
                    var view = new Uint8Array(buf);
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
                var aLink = document.createElement('a');
                aLink.href = url;
                aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
                var event;
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
                openDownloadDialog(sheet2blob(sheet), '月报'+Date.now()+'.xlsx');
           })(aoa)
            
        },
        getOrgList:async function(){
            let data=await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                let orgList = [{'label':'全部','value':''}];
                data.data.map((item)=>{
                    orgList.push({'label': item.name,'value': item._key});
                });
                this.orgList = orgList;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        changeLoading(flag = true){
            this.$store.dispatch('setPropertyValue',{'property':'loading','value': flag});
        },
        getSiteSummary:async function(){// 统计数据
            let aoa = [['时间','重复谱目','无效谱目','已购谱目','提交谱目']];
            this.changeLoading();
            this.loading = true;
            let data = await api.getAxios('site/summary?siteKey='+this.stationKey+'&startTime='+this.startTime+"&endTime="+this.endTime+'&filterUser='+(!this.orgId && (this.role < 1 || this.role > 2) ? this.userId : '')+'&filterOrg='+((this.role >= 1 && this.role <= 2) ? this.orgKey : this.orgId));
            this.changeLoading(false);
            if(data.status == 200){
                let buyData = [],buyDataO = {},invalidData = [],invalidDataO = {},repeatData = [],repeatDataO = {},submitData = [],submitDataO = {},unionTime = [],tableData = [];
                data.buyData.map((item)=>{
                    unionTime.push(item.ctime);
                    buyDataO[item.ctime] = item.count;
                });
                data.invalidData.map((item)=>{
                    unionTime.push(item.ctime);
                    invalidDataO[item.ctime] = item.count;
                });
                data.repeatData.map((item)=>{
                    unionTime.push(item.ctime);
                    repeatDataO[item.ctime] = item.count;
                });
                data.submitData.map((item)=>{
                    unionTime.push(item.ctime);
                    submitDataO[item.ctime] = item.count;
                });
                // unionTime = [...(new Set(unionTime))].sort();
                unionTime = (Array.from(new Set(unionTime))).sort();
                unionTime.map((item,index)=>{
                    aoa.push([item,(buyData[index-1] || 0) + (buyDataO[item] || 0),invalidDataO[item] || 0,repeatDataO[item] || 0,(submitData[index-1] || 0) + (submitDataO[item] || 0)])
                    tableData.push({'time': item,'buyData': (buyData[index-1] || 0) + (buyDataO[item] || 0),'invalidData': invalidDataO[item] || 0,'repeatData': repeatDataO[item] || 0, 'submitData': (submitData[index-1] || 0) + (submitDataO[item] || 0)});
                    buyData.push((buyData[index-1] || 0) + (buyDataO[item] || 0));
                    invalidData.push(invalidDataO[item] || 0);
                    repeatData.push(repeatDataO[item] || 0);
                    submitData.push((submitData[index-1] || 0) + (submitDataO[item] || 0));
                });
                // console.log(tableData);
                this.aoa = aoa;
                this.tableData = tableData;
                this.loading = false;
                this.initChart(unionTime,buyData,invalidData,repeatData,submitData);
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        initChart(xAxisData,data1,data2,data3,data4){// 可视化chart
            var dom = document.getElementById("adai_chart");
            var myChart = echarts.init(dom);
            var app = {},option = null;
            app.title = '谱目趋势图';

            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        }
                    }
                },
                legend: {
                    data:['重复谱目','无效谱目','已购谱目','提交谱目']
                },
                xAxis: [
                    {
                        type: 'category',
                        data: xAxisData,
                        axisPointer: {
                            type: 'shadow'
                        }
                    }
                ],
                yAxis: [{
                    type: 'value',
                    name: '重复/无效谱目',
                    min: 0,
                    max: Math.max(...data3),
                    interval: Math.round(Math.max(...data3)/10),
                    axisLabel: {
                        formatter: '{value}'
                    }
                },{
                    type: 'value',
                    name: '提交/已购谱目',
                    min: 0,
                    max: (data1[data1.length - 1] > data4[data4.length - 1] ? data1[data1.length - 1] : data4[data4.length - 1]),
                    interval: Math.round((data1[data1.length - 1] > data4[data4.length - 1] ? data1[data1.length - 1] : data4[data4.length - 1])/10),
                    axisLabel: {
                        formatter: '{value}'
                    }
                }],
                series: [
                    {
                        name:'重复谱目',
                        type:'bar',
                        data:data3,
                        itemStyle: {color: '#f00'}
                    },
                    {
                        name:'无效谱目',
                        type:'bar',
                        data:data2,
                        itemStyle: {color: '#aaa'}
                    },
                    {
                        name: '已购谱目',
                        type: 'line',
                        data: data1,
                        yAxisIndex: 1,
                        itemStyle: {color: '#67c23a'}
                    },
                    {
                        name: '提交谱目',
                        type: 'line',
                        data: data4,
                        yAxisIndex: 1,
                        itemStyle: {color: '#358acd'}
                    }
                ],
            };
            if (option && typeof option === "object") {
                myChart.setOption(option, true);
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            orgId: state => state.nav.orgId,
        })
    },
    watch:{
        'filterUser':function(nv,ov){
            // this.getSiteSummary();
        },
        'orgKey':function(nv,ov){
            // this.getSiteSummary();
        },
    }
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    padding-left: 200px;
    text-align: left;
    .content{
        position: relative;
        width: 100%;
        height: calc(100% - 20px);
        background: #EFF1F5;
        padding-bottom: 20px;
        .tool-bar{
            display: flex;
            align-items: center;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 80px);
            margin-top: 20px;
            background: #EFF1F5;
        }
    }
}
</style>

