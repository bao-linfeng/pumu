<template>
    <div class="swapModal">
        <div class="form" v-if="isSwap">
            <div class="btn_wrap" @click="isSwap=false"><span>立即交换</span></div>
            <i class="el-icon-close" @click="close"></i>
            <table class="mytable">
                <thead>
                    <tr>
                        <th class="w20">提交时间</th>
                        <th class="w20">提交人</th>
                        <th class="w30">资源</th>
                        <th class="w15">估值(元)</th>
                        <th class="w15">获得谱劵</th>
                    </tr>
                </thead>
            </table>
            <div class="genealogy_box style1">
                <table class="mytable">
                    <tbody>
                        <tr v-for="(item,index) in genealogys" :key="'tr'+index">
                            <td class="w20"><span>{{item.createTime | getLocalTime}}</span></td>
                            <td class="w20"><span>{{item.author || '-'}}</span></td>
                            <td class="w30"><span>{{item.genealogyName}}</span></td>
                            <td class="w15"><span>{{item.pages ? (Number(item.pages)+1) : 0}}</span></td>
                            <td class="w15"><span>{{item.pages ? (Number(item.pages)+1) : 0}}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="form_box" v-else>
            <h3>交换家谱资源</h3>
            <i class="el-icon-close" @click="close"></i>
            <div class="desc">
                <p>家谱资源</p>
                <span>{{shareContent}}</span>
                <div class="site-wrap">
                    <span class="site-label">交换微站</span>
                    <el-select v-model="toSiteKey" placeholder="请选择微站">
                        <el-option
                            v-for="item in siteList"
                            :key="item._key"
                            :label="item.siteName"
                            :value="item._key">
                        </el-option>
                    </el-select>
                </div>
            </div>
            <p class="coupon">预计获取谱劵：<span>{{account}}</span></p>
            <input type="button" :value="btn" @click="changeGenealogy" />
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "swapModal",
    props:{
        checkList:{
            type:Array,
        },
    },
    data: () => {
        return {
            userKey:'',
            siteKey:'',
            shareContent:'',
            isSwap:false,
            account:0,
            btn:'确定交换',
            genealogys:[],
            gKeyArr:[],
            siteList: [],
            toSiteKey: '',
        };
    },
    mounted:function(){
        this.userKey = window.localStorage.getItem('userId') || '';
        this.siteKey = window.localStorage.getItem('stationKey') || '';
        let gtotal=0,vtotal=0,ptotal=0;
        // && item.resource == 1
        this.checkList ? this.checkList.map((item,index)=>{
           if(item.select){
               this.gKeyArr.push(item._key);
               this.genealogys.push(item);
           }
        }) : null;
        this.genealogys && this.genealogys.length ? this.genealogys.map((item) => {
            gtotal = gtotal + 1;
            vtotal = vtotal + Number(typeof(item.volume) == 'number' ? item.volume : 0);
            ptotal = ptotal + (Number(item.pages) ? Number(item.pages) : 0);
        }) : null;
        this.account = gtotal+ptotal;
        this.shareContent = `交换  ${gtotal}  套，${vtotal} 册，共计 ${ptotal}  张页`;
        this.getSiteAll();
    },
    methods:{
        close(){
            this.$emit('close-site',false);
        },
        getSiteAll:async function(){// 站
            let data = await api.getAxios('site/all');
            if(data.status == 200){
                this.siteList = data.data.filter((item) => {return item._key != this.stationKey});
            }
        },
        changeGenealogy: async function(){// 交换家谱
            if(!this.toSiteKey){
                return this.$message({message: '请选择交换微站',type: 'warning'});
            }
            this.btn = '交换中...';
            let data=await api.postAxios('data/exchange',{'toSiteKey': this.toSiteKey,'gKeyArr':this.gKeyArr,'siteKey':this.siteKey,'userKey':this.userKey,'shareContent':this.shareContent,'estimateCoupon':this.account});
            this.btn = '确定交换';
            if(data.status == 200){
                this.$message({message: '交换家谱成功',type: 'success'});
                this.close();
            }else if(data.status == 201){
                let msg = '';
                data.hasExchange && data.hasExchange.length ? msg = data.hasExchange.join() +'已经交换过' : null;
                data.sgCatalog && data.sgCatalog.length ? msg = data.sgCatalog.join() +'时光购买、分发家谱无法交换' : null;
                this.$message({message: msg ,type: 'warning'});
            }else{
                this.$message({message: '交换家谱失败，请重新交换',type: 'warning'});
            }
        },
        swapGenealogy:async function(){//时光赠送家谱
            this.btn = '交换中...';
            let data=await api.postAxios('catalog/giveSg',{'gKeyArr':this.gKeyArr,'siteKey':this.siteKey,'userKey':this.userKey,'shareContent':this.shareContent,'estimateCoupon':this.account});
            this.btn = '确定交换';
            if(data.status == 200){
                this.$message({message: '交换家谱成功',type: 'success'});
                this.close();
            }else if(data.status == 201){
                let msg = '';
                data.hasExchange && data.hasExchange.length ? msg = data.hasExchange.join() +'已经交换过' : null;
                data.sgCatalog && data.sgCatalog.length ? msg = data.sgCatalog.join() +'时光购买、分发家谱无法交换' : null;
                this.$message({message: msg ,type: 'warning'});
            }else{
                this.$message({message: '交换家谱失败，请重新交换',type: 'warning'});
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
};
</script>
<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #F6FAFD;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #F6FAFD;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: #F6FAFD;
}
.swapModal{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
}
.form{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background: #fff;
    padding: 15px;
    width: 700px;
    i{
        position: absolute;
        top: 15px;
        right: 10px;
        font-size: 20px;
    }
    .btn_wrap{
        width: 120px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-radius: 20px;
        background: #4C95FF;
        color: #fff;
        margin-bottom: 15px;
        cursor: pointer;
        span{
            display: inline-block;
            background: url('../../assets/icon/swap_w.svg') 0 50% no-repeat;
            background-size: 16px;
            padding-left: 20px;
        }
    }
    .genealogy_box{
        width: 100%;
        overflow-y: auto;
        max-height: 300px;
    }
}
.form_box{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background: #fff;
    padding: 15px 20px;
    width: 400px;
    h3{
        margin-bottom: 30px;
        text-align: center;
    }
    i{
        position: absolute;
        top: 15px;
        right: 10px;
        font-size: 20px;
    }
    .desc{
        background: #F6FAFD;
        padding: 10px;
        p{
            margin-bottom: 10px;
        }
    }
    .coupon{
        margin-top: 10px;
        text-align: right;
        span{
            color: #4C95FF;
            font-size: 20px;
        }
    }
    input{
        width: 200px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #fff;
        background: #4C95FF;
        border: none;
        outline: none;
        border-radius: 20px;
        cursor: pointer;
        margin: 30px auto 15px auto;
        display: block;
    }
}
.site-wrap{
    margin-top: 10px;
    display: flex;
    align-items: center;
    .site-label{
        margin-right: 10px;
    }
}
.w15{
    width: 15%;
}
.w20{
    width: 20%;
}
.w30{
    width: 30%;
}
</style>

