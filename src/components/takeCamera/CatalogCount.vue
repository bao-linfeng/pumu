<template>
    <div class="volume-edit-wrap">
        <div class="head-box">
            <h3 class="title">家谱卷册信息汇总</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <ul class="edit-content style1">
                <li>
                    <span class="label">ID</span>
                    <input type="text" v-model="dataKey" disabled />
                </li>
                <li>
                    <span class="label">缺卷</span>
                    <input type="text" v-model="detail.lostVolume" disabled />
                </li>
                <li>
                    <span class="label">卷数</span>
                    <input type="text" v-model="detail.volume" disabled />
                </li>
                <li>
                    <span class="label">实拍册数</span>
                    <input type="text" v-model="detail.actualVolumes" disabled />
                </li>
                <li>
                    <span class="label">待提交卷数</span>
                    <input type="text" v-model="detail.waitSubmitNumber" disabled />
                </li>
                <li>
                    <span class="label">机构待审核卷数</span>
                    <input type="text" v-model="detail.waitOrgReviewNumber" disabled />
                </li>
                <li>
                    <span class="label">微站待审核卷数</span>
                    <input type="text" v-model="detail.waitSiteReviewNumber" disabled />
                </li>
                <li v-for="(item, index) in dataList" :key="index">
                    <span class="label">{{item.volumeNumber}}</span>
                    <p>{{item.takeStatus == 5 ? '微站审核中' : item.takeStatus == 12 ? '机构审核中' : item.takeStatus == 6 ? '打回中' : item.takeStatus == 7 ? '已完成' : '未提交'}}</p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "catalogCount",
    props:{
        dataKey: String
    },
    data: () => {
        return {
            detail: {},
            dataList: [],
        };
    },
    mounted: function(){
        this.getCatalogStatisticsData();
    },
    methods:{
        close(){
            this.$emit('close', false);
        },
        async getCatalogStatisticsData(){
            let result = await api.getAxios('v3/camera/catalog/catalogStatisticsData?catalogKey='+this.dataKey);
            if(result.status == 200){
                this.detail = result.data;
                this.dataList = result.data.volumeList;
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
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
            orgAdmin: state => state.nav.orgAdmin,
        })
    },
    watch:{
        
    }
};
</script>

<style scoped lang="scss">
.volume-edit-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #d8d8d8;
    font-size: 14px;
    color: #000;
    padding: 0 40px 20px 40px;
    z-index: 100;
    .head-box{
        position: relative;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            cursor: pointer;
        }
    }
    .content-box{
        position: relative;
        height: calc(100% - 60px);
        .edit-content{
            position: relative;
            height: 500px;
            width: 800px;
            overflow-y: auto;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-start;
            li{
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                width: 390px;
                .label{
                    width: 120px;
                    text-align: right;
                    padding-right: 20px;
                }
                input{
                    width: 250px;
                    height: 30px;
                    line-height: 30px;
                    outline: none;
                    border: none;
                    text-indent: 10px;
                }
            }
        }
    }
}
</style>

