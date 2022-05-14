<template>
    <div class="paymentok">
        <div class="form">
            <h3>家谱购买订单确认</h3>
            <div class="btn_wrap">
                <span class="ok" @click="getAliPayment">确认</span>
                <span @click="goback">取消</span>
            </div>
        </div>
    </div>
</template>

<script>
import ADS from "../../ADS.js";
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "paymentok",
    data: () => {
        return {
            token:'',
            out_trade_no:'',
        };
    },
    mounted:function(){
        let search=window.location.search,params=ADS.params(search),out_trade_no=params['out_trade_no'] || '';
        this.token = window.localStorage.getItem('token');
        this.out_trade_no = out_trade_no;
    },
    methods:{
        goback(){
            this.$router.push('/'+window.localStorage.getItem('pathname'));
        },
        getAliPayment:async function(){
            let data=await api.getAxios('rechargeDetail?rechargeKey='+this.out_trade_no+'&simple=1');
            if(data.statusCode == 200){
                if(data.result.status == 2){
                    this.$router.push('/'+window.localStorage.getItem('pathname')+'/purchaseHistory')
                }else{
                    this.$router.push('/'+window.localStorage.getItem('pathname'));
                }
            }
        },
    },
    computed: {
        ...mapState({
            activeSurname: state => state.surname.activeSurname,
            activeSurnameIndex:state => state.surname.activeSurnameIndex,
        })
    },
};
</script>
<style scoped lang="scss">
.paymentok{
    position: relative;
    width: 100%;
    height: 100%;
    font-size: 14px;
    text-align: center;
    background: #f2f2f2;
    .form{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width:300px;
        border-radius:10px;
        padding:10px;
        background: #fff;
        h3{
            margin-top: 30px;
        }
        .btn_wrap{
            width: 200px;
            margin: 50px auto;
            display: flex;
            justify-content: space-between;
            span{
                display: block;
                width: 70px;
                height: 30px;
                line-height: 30px;
                border-radius: 5px;
                border: 1px solid #ddd;
                cursor: pointer;
                &.ok{
                    background: #f00;
                    color: #fff;
                }
            }
        }
    }
}
</style>

