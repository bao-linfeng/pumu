<template>  
    <div class="wrap">
        <Sidebar />
        <div class="box">
            <div class="head-box">
                <div class="head-left">
                    <h3 class="title">卷册审核状态统计</h3>
                </div>
                <div class="head-right">
                    
                </div>
            </div>
            <div class="search-wrap">
                <div class="search-left">
                    
                </div>
                <div class="search-right">
                    <el-select class="width130" v-model="orgKey" placeholder="所属机构">
                        <el-option
                            v-for="item in orgList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <label class="label" for="">时间选择</label>
                    <el-date-picker
                        class="width150"
                        v-model="startTime"
                        type="date"
                        size="medium"
                        placeholder="开始日期">
                    </el-date-picker>
                    <el-date-picker
                        class="width150"
                        v-model="endTime"
                        type="date"
                        size="medium"
                        placeholder="结束日期">
                    </el-date-picker>
                    <label class="label marginL10" for="">汇总周期</label>
                    <el-select class="width80" v-model="accountTime" placeholder="请选择汇总周期" size="medium">
                        <el-option
                            v-for="item in accountTimeList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-button class="marginL10" type="primary" size="medium" @click="handleSearch">检索</el-button>
                    <el-button class="marginL10" type="primary" size="medium" @click="initDownloadExcel(aoa)">下载报表</el-button>
                </div>
            </div>
            <div class="vex-table-box">
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    @cell-click="cellClickEvent"
                    :data="tableData">
                    <vxe-table-column field="time" min-width="150" title="日期" sortable></vxe-table-column>
                    <vxe-table-column v-for="(item,index) in branch_main" :key="'main'+index" width="100" :field="item.value" :title="item.label"></vxe-table-column>
                </vxe-table>
            </div>
        </div>
        <AccountDetail v-if="isShow == 1" :row="cellData" v-on:close="isShow = 0" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import AccountDetail from '../../components/workload/AccountDetail.vue';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "volumeStatusAccount",
    components: {
        Sidebar, NavModal, AccountDetail,
    },
    data: () => {
        return {
            h: 0,
            tableData: [],
            accountType: '3',
            accountTime: '1',
            accountTimeList: [
                {'label': '每日', 'value': '1'},
                {'label': '每周', 'value': '2'},
                {'label': '每月', 'value': '3'}
            ],
            startTime: '',
            endTime: '',
            field_main: [],
            branch_main: [],
            isShow: 0,
            orgKey: '',
            orgList: [],
            cellData: {},
            aoa: [],
        };
    },
    created:function(){
        this.h = window.innerHeight - 120;
        this.endTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
        this.startTime = this.endTime - 30*24*60*60*1000;

        let field_main = [
            // {'label': '日期', 'value': 'time'},
            {'label': 'From卷册提交', 'value': 'from4'},
            {'label': 'To机构审核', 'value': 'to12'},
            {'label': 'From机构审核', 'value': 'from12'},
            {'label': 'To初审', 'value': 'to5'},
            {'label': 'From初审', 'value': 'from5'},
            {'label': 'To复审', 'value': 'to13'},
            {'label': 'From复审', 'value': 'from13'},
            {'label': 'To待议', 'value': 'to14'},
            {'label': 'From待议', 'value': 'from14'},
            {'label': 'To打回', 'value': 'to6'},
            {'label': 'From打回', 'value': 'from6'},
            {'label': 'To通过', 'value': 'to7'},
            {'label': 'From通过', 'value': 'from7'},
            {'label': 'To作废', 'value': 'to16'},
        ];
        this.branch_main = field_main;
    },
    mounted:function(){
        this.getOrgList();
        this.getStatisticsWork();
    },
    methods:{
        async getOrgList(){// 机构列表
            let data = await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                this.orgList = data.data.map((ele, index)=>{
                    return {'label': ele.organizationNo+'('+ele.name+')', 'value': ele._key};
                });
                this.orgList.unshift({'label': '全部机构序号', 'value': ''});
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        cellClickEvent({row,column}){
            console.log(row, column);
            this.cellData = {
                'statisticsType': this.accountTime,
                'startTime': row.sTime || '',
                'endTime': row.eTime || '',
                'takeStatus': column.property,
                'orgKey': this.orgKey,
            };
            this.isShow = 1;
        },
        handleSearch(){
            this.getStatisticsWork();
        },
        async getStatisticsWork(){
            let result = await api.getAxios('review/task/statisticsWork?startTime='+new Date(this.startTime).getTime()+'&endTime='+(new Date(this.endTime).getTime() + 24*60*60*1000 - 1)+'&statisticsType='+this.accountTime+'&orgKey='+this.orgKey);
            if(result.status == 200){
                // {'4': '卷册提交', '12': '机构审核', '5': '初审', '13': '复审', '14': '待议', '6': '打回', '7': '通过', '16': '作废'}
                let aoa = [['日期', 'From卷册提交', 'To机构审核', 'From机构审核', 'To初审', 'From初审', 'To复审', 'From复审', 'To待议', 'From待议', 'To打回', 'From打回', 'To通过', 'From通过', 'To作废']];

                this.tableData = result.data.map((ele)=>{
                    if(ele.sTime){
                        if(this.accountTime == 1){
                            ele.time = ele.sTime ? ADS.getLocalTime(ele.sTime, '-', 1) : '';
                        }
                        if(this.accountTime == 2){
                            ele.time = (ele.sTime ? ADS.getLocalTime(ele.sTime, '-', 1) : '') + '- ' +(ele.eTime ? ADS.getLocalTime(ele.eTime, '-', 1) : '');
                        }
                        if(this.accountTime == 3){
                            ele.time = ele.sTime ? ADS.getLocalTime(ele.sTime, '-', 2) : '';
                        }
                    }else{
                        ele.time = '汇总统计';
                    }
                    aoa.push([ele.time, ele['from4'], ele['to12'], ele['from12'], ele['to5'], ele['from5'], ele['to13'], ele['from13'], ele['to14'], ele['from14'], ele['to6'], ele['from6'], ele['to7'], ele['from7'], ele['to16']]);

                    return ele;
                });

                this.aoa = aoa;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
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
                openDownloadDialog(sheet2blob(sheet), '工作量统计报表.xlsx');
            })(aoa)
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            orgId: state => state.nav.orgId,
            orgAdmin: state => state.nav.orgAdmin,
        })
    },
    watch:{
        'accountTime': function(nv, ov){
            if(nv == 1){
                this.endTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
                this.startTime = this.endTime - 30*24*60*60*1000;
            }
            if(nv == 3){
                this.endTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
                this.startTime = this.endTime - 12*30*24*60*60*1000;
            }
            this.handleSearch();
        },
        'accountType': function(nv ,ov){
            this.handleSearch();
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
    .box{
        position: relative;
        width: 100%;
        height: 100%;
        background: #EFF1F5;
        .head-box{
            position: relative;
            width: calc(100% - 40px);
            padding: 0 20px;
            height: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .head-right{
                display: flex;
                align-items: center;
            }
        }
        .search-wrap{
            position: relative;
            width: calc(100% - 40px);
            padding: 0 20px;
            height: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .search-left{
                display: flex;
                align-items: center;
            }
            .search-right{
                display: flex;
                align-items: center;
            }
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 100px);
            margin-top: 20px;
        }
    }
}
.width130{
    width: 130px;
}
.width80{
    width: 80px !important;
}
.width150{
    width: 150px !important;
}
.label{
    margin-right: 10px;
}
.marginL10{
    margin-left: 10px;
}
.marginR10{
    margin-right: 10px;
}
</style>

