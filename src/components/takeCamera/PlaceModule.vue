<template>
    <div class="place-wrap" @keyup.stop="">
        <div class="head-box">
            <h3 class="title">地址选择</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <div class="place-box">
                <label class="label">请选择区域(*)</label>
                <el-select class="w160" v-model="province" size="mini" placeholder="省">
                    <el-option
                        v-for="item in provinceList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select class="w160" v-model="city" size="mini" placeholder="市">
                    <el-option
                        v-for="item in cityList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select class="w160" v-model="district" size="mini" placeholder="区">
                    <el-option
                        v-for="item in districtList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <div class="place-box">
                <label class="label">详细地址(*)</label>
                <i class="place w240" :title="province+city+district">{{province}}{{city}}{{district}}</i>
                <el-input class="w240" v-model="place" clearable size="mini" placeholder="详细地址"></el-input>
            </div>
        </div>
        <div class="foot-box">
            <el-button size="mini" @click="close">取消</el-button>
            <el-button type="primary" size="mini" @click="saveData">地址确认</el-button>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "placeModule",
    props:{
        
    },
    data: () => {
        return {
            provinceList: [],
            province: '',
            cityList: [],
            city: '',
            districtList: [],
            district: '',
            place: '',
            districtSearch: '',
        };
    },
    mounted: function(){
        this.initDistrictSearch();
    },
    methods:{
        initDistrictSearch(){
            let opts = {
                subdistrict: 1,   //返回下一级行政区
                showbiz: false  //最后一级返回街道信息
            };
            this.districtSearch = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
            
            this.search('中国');
        },
        search(place){
            this.districtSearch.search(place, (status, result) => {
                if(status == 'complete'){
                    if(result.districtList[0].level == 'country'){
                        this.provinceList = result.districtList[0].districtList.map((ele) => {
                            ele.label = ele.name;
                            ele.value = ele.name;
                            return ele;
                        });
                    }
                    if(result.districtList[0].level == 'province'){
                        this.cityList = result.districtList[0].districtList.map((ele) => {
                            ele.label = ele.name;
                            ele.value = ele.name;
                            return ele;
                        });
                    }
                    if(result.districtList[0].level == 'city'){
                        this.districtList = result.districtList[0].districtList.map((ele) => {
                            ele.label = ele.name;
                            ele.value = ele.name;
                            return ele;
                        });
                    }
                }
            });
        },
        close(){
            this.$emit('close', false);
        },
        saveData(){
            if(!this.province){
                return ADS.message('请选择省份');
            }
            if(!this.city){
                return ADS.message('请选择城市');
            }
            if(!this.district){
                return ADS.message('请选择县区');
            }
            this.$emit('save', {'province': this.province, 'city': this.city, 'district': this.district, 'place': this.place});
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
        'province': function(nv, ov){
            this.search(nv);
            this.cityList = [];
            this.city = '';
            this.districtList = [];
            this.district = '';
        },
        'city': function(nv, ov){
            this.search(nv);
            this.districtList = [];
            this.district = '';
        },
    }
};
</script>

<style scoped lang="scss">
.place-wrap{
    position: fixed;
    top: 40px;
    right: 450px;
    background: #fff;
    font-size: 14px;
    color: #000;
    box-shadow: 0 0 1px 1px #ddd;
    z-index: 1000;
    padding: 10px 20px;
    .head-box{
        position: relative;
        height: 40px;
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
        width: 100%;
    }
    .foot-box{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.place-box{
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .label{
        width: 85px;
        text-align: right;
        margin-right: 10px;
    }
    .place{
        height: 28px;
        line-height: 28px;
        text-align: left;
        font-style: normal;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        text-indent: 10px;
    }
}
.w160{
    width: 160px;
}
.w240{
    width: 240px;
}
</style>

