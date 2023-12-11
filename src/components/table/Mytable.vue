<template>
    <table class="mytable">
        <caption v-if="caption">{{caption}}</caption>
        <thead v-if="label && label.length">
            <tr>
                <th v-for="(item,index) in label" :key="'th'+index">{{item}}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item,index) in data" :key="'tr'+index">
                <td v-for="(item2,index2) in item" :key="'td'+index2">{{item2}}</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "mytable",
    props:{
        label:{
            type:Array,
        },
        data:{
            type:Array,
        },
        caption:{
            type:String,
        },
    },
    data: () => {
        return {
            
        };
    },
    mounted:function(){
       
    },
    methods:{
        gotoPage(path){
            this.$router.push(path);
        },
    },
};
</script>
<style scoped lang="scss">
.mytable{
    width: 100%;
    color: #333;
    text-align: center;
    //border: 1px solid #ddd;
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
            // border: 1px solid #ddd;
        }
    }
    tbody{
        tr{
            td{
                height: 50px;
                line-height: 50px;
            }
            //border-bottom: 1px solid #ddd;
        }
        tr:nth-of-type(even){
            background: #F6FAFD;
        }
    }
}

</style>

