<template>
    <div class="AutoCompleteSearch-wrap" @keyup.stop="">
        <div class="head-box">
            <h3 class="title">地址搜索服务</h3>
            <!-- <img class="close" @click="close" src="../../assets/close.svg" alt=""> -->
        </div>
        <div class="content-box">
            <div class="map" id="map"></div>
            <div class="search-wrap">
                <div class="search">
                    <el-input v-model="keywords" clearable size="medium"></el-input>
                    <el-button type="primary" size="medium" @click="autoCompleteSearch">检索</el-button>
                </div>
                <div class="search-box style1">
                    <p class="p" :class="{active: id == item.id}" v-for="(item, index) in list" :key="index" @click="handleCheckMarker(item)">{{item.district}} {{item.name}}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "AutoCompleteSearch",
    props:{
        
    },
    data: () => {
        return {
            keywords: '',
            autoComplete: '',
            map: '',
            list: [],
            id: '',
            infoWindow: '',
        };
    },
    mounted: function(){
        this.keywords = ADS.getQueryVariable('place') ? decodeURIComponent(ADS.getQueryVariable('place')) : ''; 
        this.initMap();
        this.initAutoComplete();
    },
    methods:{
        initMap(){
            this.map = new AMap.Map("map", {
                resizeEnable: true,
            });
            this.infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});//信息窗口初始化
        },
        initAutoComplete(){
            AMap.plugin('AMap.Autocomplete', () => {
                let autoOptions = {
                    city: '全国',
                }
                this.autoComplete = new AMap.Autocomplete(autoOptions);
            });

            this.autoCompleteSearch();
        },
        autoCompleteSearch(){
            if(!this.keywords){
                return ADS.message('请输入地址！');
            }
            this.autoComplete.search(this.keywords, (status, result) => {
                console.log(result, status);
                if(status = 'complete'){
                    this.list = result.tips;
                    this.addMarker(this.list);
                }else{
                    ADS.message('检索异常，请重新检索！');
                }
            });
        },
        addMarker(data, isCluster = false){//添加点
            let marker, markers=[], cluster;
            this.map.clearMap();
            if(data && !data.length){
                return;
            }
            for(let i = 0; i < data.length; i++){
                marker = new AMap.Marker({
                    position: data[i].location,
                    title: data[i].district+data[i].name,
                });
                markers.push(marker);
            }  
            this.map.add(markers);
            this.map.setFitView();
            //点聚合
            if(isCluster){
                if (cluster) {
                    cluster.setMap(null);
                }
                cluster = new AMap.MarkerClusterer(this.map, markers,{gridSize:80});
            }
        },
        handleCheckMarker(data){
            this.id = data.id;
            this.map.panTo(data.location);
            this.infoWindow.setContent(data.district+data.name);
            this.infoWindow.open(this.map, data.location);
        },
        close(){
            this.$emit('close', false);
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
.AutoCompleteSearch-wrap{
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: #fff;
    font-size: 14px;
    color: #000;
    box-shadow: 0 0 1px 1px #ddd;
    z-index: 1000;
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
        width: 100%;
        height: calc(100% - 70px);
        display: flex;
        .map{
            position: relative;
            width: calc(100% - 300px);
            height: 100%;
        }
        .search-wrap{
            position: relative;
            width: 260px;
            height: calc(100% - 40px);
            padding: 20px;
            .search{
                position: relative;
                height: 40px;
                display: flex;
                align-items: center;
            }
            .search-box{
                position: relative;
                height: calc(100% - 40px);
                overflow-y: auto;
                .p{
                    text-align: left;
                    margin-top: 15px;
                    cursor: pointer;
                    &.active{
                        color: #358acd;
                    }
                    &:hover{
                        color: #358acd;
                    }
                }
            }
        }
    }
    .foot-box{
        position: relative;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>

