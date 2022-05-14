<template>  
    <div class="table-list-wrap">
        <div class="title-wrap">
            <h3>检索结果</h3>
            <span>共检索出{{total}}部家谱</span>
        </div>
        <div class="table_wrap style1">
            <table class="table-box">
                <thead>
                    <tr>
                        <th v-for="(item,index) in label" :key="'th'+index">
                            <el-checkbox class="marginLeft10" v-if="index === 0" :value="allCheck" @change="allCheckbox(allCheck)"></el-checkbox>
                            <span v-else @click="filterGenealogy(index)" class="el_span_adai">{{item}}<img class="el_icon_adai" v-show="prop == filterObj[index]" :src="require('../../assets/myGenealogy/el_icon_'+(order == 'asc' ? 'bottom' : 'top')+'.svg')" /></span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item,index) in list" :key="'tr'+index">
                        <td>
                            <el-checkbox class="marginLeft10" :value="item.select" @change="changeCheckbox(item.select,index)"></el-checkbox>
                        </td>
                        <td class="width200"><span>{{item.genealogyName}}</span></td>
                        <td><span>{{item.surname}}</span></td>
                        <td><span>{{item.place}}</span></td>
                        <td><span>{{item.hall}}</span></td>
                        <td class="width200"><span>{{item.publish}}</span></td>
                        <td><span>{{item.writeTime}}</span></td>
                        <td class="width200"><span>{{item.author}}</span></td>
                        <td><span>{{item.batch || '-'}}</span></td>
                        <td>{{item.creator || '-'}}</td>
                        <td><span>{{item.createTime | getLocalTime}}</span></td>
                        <td>
                            阅读
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    name: "tableList",
    props:{
        list:{
            type: Array,
        },
        total:{
            type: Number,
        },
    },
    data: () => {
        return {
            allCheck:[],
            prop:'',
            order:'',
            label:['','谱名','姓氏','谱籍地','堂号','版本年号','修撰时间','修撰者','批次','创建者','创建时间','操作'],
            filterObj:{0:'',1:'_key',2:'imagePages',3:'genealogyName',4:'surname',5:'place',6:'hall',7:'celebrity',8:'version',9:'writeTime',10:'author',11:'volume',12:'a',13:'a',14:'pages',15:'imagePages',16:'a',17:'batch',18:'creator',19:'createTime',20:'a'},
        };
    },
    mounted:function(){

    },
    methods:{
        allCheckbox(){

        },
        changeCheckbox(){

        },
    },
};
</script>
<style scoped lang="scss">
.table-list-wrap{
    width: 100%;
    background-color: #fff;
    margin-top: 20px;
}
.title-wrap{
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    h3{
        font-size: 16px;
        color: #344B5A;
        height: 16px;
        line-height: 16px;
        border-left: 2px solid #4C95FF;
        padding-left: 20px;
        text-align: left;
    }
    span{
        color: #999;
        margin-right: 20px;
    }
}
.table_wrap{
    padding: 0 0 20px 0;
    width: calc(100% - 40px);
    // height: 600px;
    font-size: 14px;
    margin: 0 auto;
    overflow-x: auto;
    overflow-y: auto;
}
.table-box{
    width: 1200px;
    color: #333;
    text-align: center;
    border-collapse:collapse;
    caption{
        height: 50px;
        line-height: 50px;
        text-align: left;
    }
    thead{
        background: #DEF1FF;
        tr{
            th{
                height: 50px;
                line-height: 50px;
            }
        }
    }
    tbody{
        tr{
            td{
                height: 50px;
                line-height: 50px;
            }
        }
        tr:nth-of-type(even){
            background: #F6FAFD;
        }
    }
}
</style>

