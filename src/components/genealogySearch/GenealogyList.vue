<template>
  <div class="genealogyList-wrap">
    <Scroll />
    <table class="adai-table">
        <thead class="thead">
            <tr>
                <th>姓氏</th>
                <th>谱名</th>
                <th>谱籍地</th>
                <th>卷数</th>
                <th>实拍册数</th>
                <th>缺卷</th>
                <th>堂号</th>
                <th>出版时间</th>
                <th>作者姓名</th>
                <th>版本类型</th>
                <th>状态</th>
                <th>影像</th>
                <th>全文</th>
            </tr>
        </thead>
        <tbody class="tbody">
            <tr v-for="(item,index) in data" :key="index"  @click="gotoSummary(item)">
                <td>{{item.surname || '不详'}}</td>
                <td>{{item.genealogyName || '不详'}}</td>
                <td>{{item.place || '不详'}}</td>
                <td>{{item.volume || '不详'}}</td>
                <td>{{item.hasVolume || '不详'}}</td>
                <td>{{item.lostVolume || '不详'}}</td>
                <td>{{item.hall || '不详'}}</td>
                <td>{{item.publish || '不详'}}</td>
                <td>{{item.authors || '不详'}}</td>
                <td>{{item.version || '不详'}}</td>
                <td>{{item.condition}}</td>
                <td>{{item.hasImage ? '有' : '无'}}</td>
                <td>{{item.delivered == 2 ? '有' : '无'}}</td>
            </tr>
        </tbody>
    </table>
    <!-- <div class="tableTh">
        <span class="hide pro w5">姓氏</span>
        <span class="name">谱名</span>
        <span class="place">谱籍地</span>
        <span class="hide">堂号</span>
        <span class="hide">出版时间</span>
        <span class="hide">作者姓名</span>
        <span class="hide">版本类型</span>
        <span class="hide pro">馆藏地</span>
        <span class="w5">影像</span>
        <span class="w5">全文</span>
    </div> -->
    <!-- <div class="tableTh genealogy" v-for="(item,index) in data" :key="'genealogy'+index">
        <router-link class="genealogy_wrap" @click="gotoSummary(item)" :to="'/'+pathname+'/gd?id='+item._key">
            <span class="hide pro w5">{{item.surname || '不详'}}</span>
            <span class="name">{{item.genealogyName || '不详'}}</span>
            <span class="place">{{item.place || '不详'}}</span>
            <span class="hide">{{item.hall || '不详'}}</span>
            <span class="hide">{{item.publish || '不详'}}</span>
            <span class="hide">{{item.authors || '不详'}}</span>
            <span class="hide">{{item.version || '不详'}}</span>
            <span class="hide pro">{{item.libs && item.libs.length ? item.libs.join(',') : '不详'}}</span>
            <span class="w5">{{item.hasImage ? '有' : '无'}}</span>
            <span class="w5">{{item.delivered == 2 ? '有' : '无'}}</span>
        </router-link>
        <ul class="persons_wrap">
            <li v-for="(item1,index1) in item.persons" :key="'person'+index1" @click.stop="gotoView(item,item1)">
                <i>{{item1.name}}</i> <p v-show="item1.father">父:{{item1.father}}</p> <p v-show="item1.mother">母:{{item1.mother}}</p>
            </li>
        </ul>
    </div> -->
  </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogyList",
    props:{
        data:{
            type:[String,Array],
            
        },
        personTotalNum:{
            type:[Number],
            default:0
        },
    },
    components: {
    
    },
    data: () => {
      return {
          page:1,
          ths:['谱名','堂号','谱籍地','先祖|名人','姓氏','版本类型','馆藏地','影像','全文'],
          pathname:'',
      };
    },
    mounted:function(){
        this.pathname = window.localStorage.getItem('pathname') || '';
    },
    methods:{
        gotoView: async function(item,item2){
            let origin = window.location.origin;
            if(item.hasImage){
                let data=await api.getAxios('https://baokudata.qingtime.cn/pkfoxx/pkCatalog/personImage?gcKey='+item._key+'&personKey='+item2.person,true);
                if(data.status != 200){this.$message({message: data.msg,type: 'warning'});return false;}
                if(!data.page){this.$message({message: '该节点没有关联影像',type: 'warning'});return false;}
                window.open(origin+'/'+this.pathname+'/view?gid='+item._key+'&volume=1&page='+data.page,'_blank');
                // this.$router.push('/'+this.pathname+'/view?gid='+item._key+'&volume=1&page='+data.page);
            }else{
                window.open(origin+'/'+this.pathname+'/gd?id='+item._key,'_blank');
                // this.$router.push('/'+this.pathname+'/gd/'+item._key);
            }
        },
        gotoSummary(item){
            this.$router.push('/'+this.pathname+'/gd?id='+item._key);
        },
    },
    computed: {
        ...mapState({
            
        })
    },
};
</script>
<style scoped lang="scss">
.genealogyList-wrap{
    position: relative;
    width: 100%;
    box-sizing: border-box;
    padding: 30px 0 50px 0;
    .title{
        margin: 10px 0;
        border-left: 3px solid #333;
        font-size: 18px;
        height: 14px;
        line-height: 14px;
        text-indent: 10px;
    }
    .tableTh{
        display: block;
        overflow: hidden;
        border-bottom: 2px solid #C9A470;
        text-align: center;
        span{
            display: block;
            height: 50px;
            line-height: 50px;
            width: 9%;
            font-weight: bold;
            color: #666;
            float: left;
            &.name{
                padding-left: 5px;
                width: calc(18% - 5px);
                text-align: left;
            }
            &.place{
                width: 13%;
            }
            &.w5{
                width: 8%;
            }
        }
    }
    .genealogy{
        height: auto;
        margin-top: 10px;
        border-bottom: 1px solid #e5e5e5;
        // background: #f2f2f2;
        cursor: pointer;
        span{
            color: #333;
            font-weight: normal;
            height: auto;
            line-height: normal;
            overflow: hidden;
        }
        .nodes{
            width: 100%;
            float: left;
            background: #fff;
            .children{
                display: block;
                height: 30px;
                line-height: 30px;
                color: #666;
                i{
                    font-style: normal;
                    display: inline-block;
                    margin-right: 20px;
                    &.circle{
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #52c41a;
                    }
                }
            }
        }
    }
}
.genealogy_wrap{
    width: 100%;
    overflow: hidden;
    padding-bottom: 10px;
    display: block;
}
.persons_wrap{
    display: block;
    font-size: 10px;
    text-align: left;
}
.persons_wrap li{
    height: 20px;
    line-height: 20px;
    padding-left: 5px;
}
.persons_wrap i{
    font-style: normal;
    color: #358acd;
}
.persons_wrap p{
    display: inline-block;
    margin-left: 5px;
}
@media screen and (max-width:1199px) and (min-width:600px){
    .genealogyList{
        .tableTh{
            span{
                width: 15%;
                &.name{
                    width: 40%;
                }
                &.pro{
                    display: none;
                }
            }
        }
    }
}
@media screen and (max-width:600px) {
    .genealogyList{
        .tableTh{
            span{
                width: 25%;
                &.place{
                    width: 70px;
                }
                &.name{
                    width: calc(100% - 175px);
                }
                &.hide{
                    display: none;
                }
                &.w5{
                    width: 50px;
                }
            }
        }
    }
    
}
.adai-table{
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    border: none;
    border-collapse: collapse;
    .thead{
        position: relative;
        width: 100%;
        height: 40px;
        background: #D1D1D1;
        position: sticky;
        top: 0;
        z-index: 2;
        tr{
            th{
                padding: 5px 0;
                min-width: 60px;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 42px);
        tr{
            cursor: pointer;
            td{
                padding: 5px 0;
                min-width: 60px;
                max-width: 250px;
            }
        }
    }
}
</style>

