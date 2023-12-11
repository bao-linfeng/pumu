<template>  
    <div class="bill-wrap">
        <div class="bill-head">
            <h3 class="head-title">发票 Invoice</h3>
            <p class="head-p bold">Invoice No. {{InvoiceNo}}FSSCAN</p>
            <p class="head-p bold">Date: {{date}}</p>
        </div>
        <table class="bill-table">
            <tbody>
                <tr>
                    <td>
                        <p>客戶名称</p>
                        <p>Client</p>
                    </td>
                    <td class="td-5" colspan="5">
                        <p>FamilySearch International (犹他家谱学会)</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>收款人名称</p>
                        <p>Receipient</p>
                    </td>
                    <td class="td-5" colspan="5">
                        <p>江苏时光信息科技有限公司</p>
                        <p>Jiangsu Qingtime Sci&Tech Co., Ltd.</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>收款人地址</p>
                        <p>Recipient address</p>
                    </td>
                    <td class="td-5" colspan="5">
                        <p>中国江苏常州科教城天润科技大厦A幢2层</p>
                        <p>The 2nd Floor, Building A, Tianrun Technology Mansion Science & Education Town, Changzhou City, Jiangsu Province, China.</p>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td class="td-5" colspan="5"></td>
                </tr>
                <tr>
                    <td rowspan="3">
                        <p>项目</p>
                        <p>Project Number</p>
                    </td>
                </tr>
                <tr>
                    <td>日期</td>
                    <td>数量</td>
                    <td>单价</td>
                    <td>金额</td>
                    <td>备註</td>
                </tr>
                <tr>
                    <td>Date</td>
                    <td>No.of clicks</td>
                    <td>Price per click</td>
                    <td>Amount</td>
                    <td>Remark</td>
                </tr>
                <tr v-for="(item, index) in billList" :key="index">
                    <td>{{item._key}}</td>
                    <td>{{item.payTimeO}}</td>
                    <td>{{item.imageNum}}</td>
                    <td>$0.18</td>
                    <td>${{item.fee}}</td>
                    <td>{{InvoiceNo}}</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td colspan="4" rowspan="2"></td>
                    <td class="bold">${{amount}}</td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        <div class="bill-foot">
            <div class="name">
                <span>收款人：</span>
                <img src="../../assets/shoot/name.png" alt="">
            </div>
            <div class="seal">
                <span>盖章：</span>
                <img src="../../assets/shoot/seal.png" alt="">
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "Bill",
    components: {
        
    },
    data: () => {
        return {
            InvoiceNo: '',
            billList: [],
            amount: 0,
            date: '',
            MonthO: {'0':'January', '1': 'February', '2': 'March', '3': 'April', '4': 'May', '5': 'June', '6': 'July', '7': 'August', '8': 'September', '9': 'October', '10': 'November', '11': 'December'},
        };
    },
    created:function(){
        this.InvoiceNo = ADS.getQueryVariable('k');
    },
    mounted:function(){
        this.getBillDetail(this.InvoiceNo);
    },
    methods:{
        async getBillDetail(key) {
            const result = await api.getAxios('review/bill/detail?siteKey='+this.stationKey+'&billKey='+key);
            if(result.status == 200){
                this.billList = result.data.catalogList.map((ele) => {
                    ele.fee = (ele.imageNum*0.18).toFixed(2);
                    ele.payTimeO = ADS.getLocalTime(ele.payTime, '.', 1);
                    return ele;
                });
                this.amount = result.data.fee;
                let time = new Date(result.data.createTime);
                this.date = this.MonthO[time.getMonth()+1]+'.'+time.getDate()+'th.'+time.getFullYear();
            }else{
                ADS.message(result.msg);
            }
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
        })
    },
    watch:{
        
    },
};
</script>
<style scoped lang="scss">
.bill-wrap{
    position: relative;
    width: 720px;
    height: 100%;
    margin: 0 auto;
    font-size: 12px;
}
.bill-head{
    text-align: right;
    .head-title{
        height: 45px;
        line-height: 45px;
        font-size: 28px;
        text-align: center;
    }
    .head-p{
        height: 20px;
        line-height: 20px;
    }
}
.bill-table{
    position: relative;
    width: 100%;
    max-height: 400px;
    text-align: center;
    border: 1px solid #999;
    border-collapse: collapse;
    color: #000;
    td{
        border: 1px solid #999;
        padding: 5px;
        width: 110px;
        // &.td-5{
        //     // width: 550px;
        // }
        p{
            text-align: left;
        }
    }
}
.bold{
    font-weight: bold;
}
.bill-foot{
    position: relative;
    height: 180px;
    display: flex;
    padding-bottom: 20px;
    .name{
        position: relative;
        width: 50%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        img{
            position: absolute;
            top: 45px;
            left: 220px;
            height: 90px;
        }
    }
    .seal{
        position: relative;
        width: 50%;
        height: 100%;
        display: flex;
        align-items: center;
        img{
            position: absolute;
            top: -20px;
            left: 80px;
            height: 200px;
        }
    }
}
</style>

