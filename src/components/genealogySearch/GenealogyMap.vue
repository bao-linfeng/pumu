<template>
    <div class="genealogyMapWrap" >
        <div class="genealogyMap" id="genealogyMap"></div>
        <span v-show="curPage < pages" class="moreGenealogy" @click="getMoreGenealogy">更多</span>
        <Loading v-show="flag" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogyMap",
    components: {

    },
    props:{
        param:{
            type:[String],
        },
        type:{
            type:[Boolean],
            default:false
        },
    },
    data: () => {
        return {
            flag:false,
            gList:[],
            total:0,
            pages:1,
            curPage:1,
            perPage:1000,
            map:'',
            infoWindow:'',
            pathname:'',
        };
    },
    mounted:function(){
        this.pathname = window.localStorage.getItem('pathname') || '';
        this.initMap();
        this.getGenealogyList();
    },
    methods:{
        initMap(){
            let map = new AMap.Map('genealogyMap', {
                center: [116.397428, 32.90923],
                resizeEnable: true,
                zoom: 4,
                features: ['bg','road'],
            });
            let infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0,-30)});//信息窗口初始化

            this.map = map;
            this.infoWindow = infoWindow;
        },
        addMarker(data,isCluster){//添加点
            let self = this;
            this.map.clearMap();
            let marker, markers=[], cluster;
            // 
            if(data && data.length){//绘制点
                for(let i = 0; i < data.length; i++){
                    if(data[i].location && data[i].location[0] && data[i].location[1]){
                        let div='';
                        data[i].location[0] = parseFloat(data[i].location[0])+ADS.GetRandomNum(1,9999)*0.00001;
                        data[i].location[1] = parseFloat(data[i].location[1])+ADS.GetRandomNum(1,9999)*0.00001;
                        div="<a target='_blank' href='/"+this.pathname+"/gd?id="+data[i]._key+"' style='overflow:hidden;display:block;position:relative;font-size:14px'><img src='"+require("../../assets/search/cover.jpg")+"' style='width:100px;height:150px;float:left' /><div style='float:left;width:180px;height:150px;color:#777;padding-left:10px'><p style='font-size:16px;color:#333;margin-bottom:10px'>"+(data[i].genealogyName || data[i].title)+"</p><p>责任者："+(data[i].author ? data[i].author : '不详')+"</p><p>堂号："+(data[i].hall || '不详')+"</p><p>谱籍地："+(data[i].place ? data[i].place : '不详')+"</p></div></a>";
                        marker = new AMap.Marker({
                            position: [data[i].location[1], data[i].location[0]],
                            title: (data[i].genealogyName || data[i].title),
                            map:this.map
                        });
                        //给marker绑定事件
                        marker.content=div;

                        marker.on('click', function(e){
                            self.infoWindow.setContent(e.target.content);
                            self.infoWindow.open(self.map, e.target.getPosition());
                        });
                        markers.push(marker);
                    }
                }  
                
                //点聚合
                if(isCluster){
                    if (cluster) {
                        cluster.setMap(null);
                    }
                    cluster = new AMap.MarkerClusterer(this.map, markers,{gridSize:80});
                }
            }
        },
        getMoreGenealogy(){
            this.curPage = this.curPage+1;
            this.getGenealogyList(false);
        },
        getGenealogyList: async function(type=true){
            this.flag = true;
            type ? this.curPage = 1 : null;
            let data = await api.getAxios('catalog?'+this.param+'&page='+this.curPage+'&limit='+this.perPage);
            this.flag = false;
            this.gList = this.gList.concat(data.result.list);
            this.addMarker(this.gList,true);
            if(type){
                this.total = data.result.total;
                this.pages = data.result.pageNum;
            }
        },
    },
    computed: {
        ...mapState({
            
        })
    },
};
</script>
<style scoped lang="scss">
.genealogyMapWrap{
    position: relative;
    width: 100%;
    height: 800px;
    background: #fff;
}
.genealogyMap{
    width: 100%;
    height: 800px;
}
.moreGenealogy{
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000000;
    display: block;
    width: 50px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border:1px solid #ddd;
    border-radius: 3px;
    background: #fff;
    font-size: 14px;
    color: #666;
    cursor: pointer;
}
</style>

