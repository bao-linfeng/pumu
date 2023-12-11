<template>
    <div class="swapListModal">
        <div class="form">
            <ul class="swap-title">
                <li :class="{active: titleIndex === index}" v-for="(item,index) in titleList" :key="'title'+index" @click="changeTitle(index)">{{item}}</li>
            </ul>
            <!-- <h3>{{siteKey == '593133135' ? '家谱接受' : '家谱交换'}}记录</h3> -->
            <!-- <i class="el-icon-close close" @click="close"></i> -->
            <table class="mytable">
                <thead>
                    <tr>
                        <th class="w10">分享时间</th>
                        <th class="w25">分享机构</th>
                        <th class="w10">分享人</th>
                        <th class="w25">分享资源</th>
                        <th class="w10">预期赋分</th>
                        <th class="w10">实际赋分</th>
                        <!-- <th class="w10" v-if="siteKey == '593133135'">操作</th> -->
                    </tr>
                </thead>
            </table>
            <div class="genealogy_box style1">
                <table class="mytable">
                    <tbody>
                        <tr v-for="(item,index) in list" :key="'tr'+index">
                            <td class="w10" @click="getGenealogy(item)"><span>{{item.time | getLocalTime}}</span></td>
                            <td class="w25" @click="getGenealogy(item)"><span>{{item.siteName || '-'}}</span></td>
                            <td class="w10" @click="getGenealogy(item)"><span>{{item.executor}}</span></td>
                            <td class="w25" @click="getGenealogy(item)"><span>{{item.shareContent}}</span></td>
                            <td class="w10" @click="getGenealogy(item)"><span>{{item.estimateCoupon}}</span></td>
                            <td class="w10" @click="getGenealogy(item)"><span>{{item.realCoupon || '-'}}</span></td>
                            <!-- <td class="w10" v-if="siteKey == '593133135'"><span @click="deleteAll(item)">清除</span><i class="line">|</i><span v-if="item.status == 2">已结算</span><span v-else @click="complete(item._key)">结算</span></td> -->
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="complete_wrap" v-show="isComplete">
            <h3>家谱结算</h3>
            <i class="el-icon-close close" @click="isComplete=false"></i>
            <div class="coupon">
                <label for="">支付谱劵</label>
                <input type="number" v-model="coupon" placeholder="谱劵" />
            </div>
            <input type="button" value="确认支付" class="btn" @click="completeExchange" />
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "swapListModal",
    props:{
        data:{
            type:Array,
        },
    },
    data: () => {
        return {
            userKey:'',
            siteKey:'',
            list:[],
            page:1,
            limit: 50,
            pages:0,
            total:0,
            isComplete:false,
            coupon:1,
            swapKey:'',
            titleList: ['家谱交换','家谱接收'],
            titleIndex: 0,
        };
    },
    mounted:function(){
        this.userKey = window.localStorage.getItem('userId') || '';
        this.siteKey = window.localStorage.getItem('stationKey') || '';
        this.getExchange('out');
    },
    methods:{
        close(){
            this.$emit('close-site',false);
        },
        save(){
            this.$emit('save-site',false);
        },
        deleteAll:async function(item){//删除家谱
            if(item.status === 0){this.$message({message: '该交换记录下的家谱已删除，请不要重复删除',type: 'warning'});return false;}
            this.$confirm('此操作将永久删除该交换家谱, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteSwap(item._key);
            }).catch(() => {});
        },
        deleteSwap:async function(key){//删除家谱
            let data=await api.deleteAxios('deleteExchange',{
                "siteKey":this.siteKey,
                "exchangeId":key
            });
            if(data.status == 200){
                this.$message({message: '删除交换家谱成功',type: 'success'});
                this.getSwapList();
            }else{
                this.$message({message: data.msg,type: 'warning'});
            }
        },
        complete(key){//结算
            this.isComplete = true;
            this.swapKey = key;
        },
        completeExchange:async function(){
            if(!this.siteKey || this.siteKey != '593133135'){this.$message({message: '你没权限结算',type: 'warning'});return false;}
            if(!this.swapKey){this.$message({message: '请选择结算目标',type: 'warning'});return false;}
            if(this.coupon < 0){this.$message({message: '谱劵不能为负',type: 'warning'});return false;}
            let data=await api.patchAxios('completeExchange',{
                "siteKey":this.siteKey,
                "exchangeId":this.swapKey,
                "coupon":Number(this.coupon)
            });
            if(data.status == 200){
                this.isComplete = false;
                this.$message({message: '结算成功',type: 'success'});
                this.getSwapList();
            }else{
                this.$message({message: data.msg,type: 'warning'});
            }
        },
        getGenealogy(item){
            if(item.status == 0){this.$message({message: '该交换记录下的家谱已删除',type: 'warning'});return false;}
            this.$emit('save-site',item._key);
        },
        getSwapList:async function(flag=true){//交换记录
            let data=await api.getAxios('exchangeHistory?page='+this.page+'&limit='+this.limit+'&siteKey='+this.siteKey);
            if(data.status == 200){
                if(flag){
                    this.list = data.result.list;
                }else{
                    this.list = this.list.concat(data.result.list);
                }
                if(flag){
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                }
            }else{
                this.$message({message: data.msg,type: 'warning'});
            }
        },
        getExchange:async function(t,flag=true){//out -> 我交换家谱给其他微站记录, in -> 接收其他微站给我记录
            let data = await api.getAxios('exchange/'+t+'?page='+this.page+'&limit='+this.limit+'&currentSite='+this.stationKey+'&siteName=&siteKey=');
            if(data.status == 200){
                if(flag){
                    this.list = data.result.list;
                }else{
                    this.list = this.list.concat(data.result.list);
                }
                if(flag){
                    this.pages = data.result.pageNum;
                    this.total = data.result.total;
                }
            }else{
                this.$message({message: data.msg,type: 'warning'});
            }
        },
        changeTitle(i){
            this.titleIndex = i;
            this.getExchange(i ? 'in' : 'out');
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
	background-color: #7e8e98;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #7e8e98;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #fff;
}
.style1::-webkit-scrollbar-corner{
	background-color: #7e8e98;
}
.swapListModal{
    width: calc(100% - 40px);
    height: 100%;
    // position: fixed;
    // top: 0;
    // right: 0;
    // height: 320px;
    // left: 200px;
    background: rgba(43,51,72,0.9);
    z-index: 100;
    padding: 0 20px;
}
.form{
    position: relative;
    width: 100%;
    height: calc(100% - 30px);
    padding: 15px 0;
    h3{
        color: #fff;
        margin-bottom: 20px;
    }
    .close{
        position: absolute;
        top: 15px;
        right: 10px;
        font-size: 20px;
        color: #fff;
    }
    .genealogy_box{
        width: 100%;
        overflow-y: auto;
        height: calc(100% - 72px);
    }
}
.w10{
    width: 10%;
}
.w15{
    width: 15%;
}
.w20{
    width: 20%;
}
.w25{
    width: 25%;
}
.w30{
    width: 30%;
}
.mytable{
    color: #e7f0fc;
    .line{
        margin: 0 5px;
    }
    cursor: pointer;
    thead{
        background: #515869;
        tr{
            th{
                height: 30px;
                line-height: 30px;
                font-size: 12px;
                letter-spacing: 1px;
            }
        }
    }
    tbody tr{
        background: #787e8b;
        td{
            padding: 5px 0;
            height: 30px;
            line-height: 16px;
            font-size: 12px;
        }
        &:nth-of-type(even){
            background: #515869;
        }
        &:hover{
            background: #72a5ef;
        }
    }
}
.complete_wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    padding: 10px 20px;
    background: #fff;
    box-shadow: 0 0 1px 2px #ddd;
    h3{
        text-align: center;
    }
    i{
        position: absolute;
        top: 10px;
        right: 20px;
        font-size: 20px;
        cursor: pointer;
    }
    .coupon{
        width: 280px;
        height: 40px;
        line-height: 40px;
        display: flex;
        margin: 20px 0;
        label{
            width: 80px;
            display: inline-block;
        }
        input{
            width: 200px;
            display: inline-block;
            border: 1px solid #ddd;
            outline: none;
            text-indent: 10px;
        }
    }
    .btn{
        display: block;
        margin: 0 auto;
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #72a5ef;
        color: #fff;
        cursor: pointer;
        border: none;
        outline: none;
        border-radius: 20px;
    }
}
.swap-title{
    display: flex;
    align-items: center;
    height: 60px;
    line-height: 60px;
    li{
        margin-right: 20px;
        cursor: pointer;
        color: #fff;
        &.active{
            color: #72a5ef;
        }
    }
}
</style>

