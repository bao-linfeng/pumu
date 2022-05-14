<template>
    <div class="edit-genealogy-wrap">
        <div class="edit-genealogy-box" :class="{active: isShow}">
            <div class="edit-genealogy-title">
                <h3>{{isShow ? '查看' : '编辑'}}谱目{{gid}}</h3>
                <i class="vxe-icon--close" @click="close(false)"></i>
            </div>
            <ul class="edit-genealogy-ul style1">
                <li v-for="(item,index) in fields" :key="'input'+index">
                    <label>{{item.fieldMeans}}</label>
                    <input type="text" v-model="fieldO[item.fieldName]" :disabled="item.fieldName == 'hasImage' || isShow ? true : false" :placeholder="'请输入'+item.fieldMeans" />
                </li>
            </ul>
            <div class="edit-genealogy-btn" v-if="!isShow">
                <button @click="addPuMu">提交</button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "editGenealogyModal",
    props:{
        gid:{
            type: String
        },
        pumu:{
            type: Object
        },
        isShow: {
            type: Boolean,
            default: false
        },
    },
    components: {

    },
    data: () => {
        return {
            fields:[],
            fieldO:{},
        };
    },
    mounted:function(){
        this.getField();
    },
    methods:{
        close(flag){
            this.$emit('close-edit',flag);
        },
        addPuMu:async function(){// 编辑谱目
            this.loading = true;
            let fieldO = {};
            for(let key in this.fieldO){
                if(key == 'hasImage'){
                    fieldO[key] = this.fieldO[key] == '有' ? 1 : 0;
                }else{
                    fieldO[key] = this.fieldO[key];
                }
            }
            // console.log(fieldO);
            // return;
            let data = await api.patchAxios('data/edit',{'dataKey': this.gid,'dataObj': fieldO,'userKey': this.userId});
            this.loading = false;
            if(data.status == 200){
                this.close(true);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        getField:async function(){
            let data=await api.getAxios('field?type=家谱');
            if(data.status == 200){
                let fieldO = {};
                data.data.map((item)=>{
                    fieldO[item.fieldName] = this.pumu[item.fieldName];
                });
                this.fieldO = fieldO;
                this.fields = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
            userId: state => state.nav.userId,
        })
    },
};
</script>

<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #fff;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #fff;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: #fff;
}
.edit-genealogy-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.3);
    z-index: 100000;
    display: flex;
    justify-content: center;
    align-items: center;
    .edit-genealogy-box{
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        max-height: calc(100% - 40px);
        display: inline-block;
        &.active{
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}
.edit-genealogy-title{
    position: relative;
    text-align: center;
    // margin-bottom: 20px;
    i{
        position: absolute;
        top: 5px;
        right: 0;
        cursor: pointer;
    }
}
.edit-genealogy-ul{
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    width: 420px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-right: 5px;
    padding-bottom: 20px;
    li{
        width: 100%;
        display: flex;
        align-items: center;
        margin-top: 15px;
        label{
            height: 40px;
            line-height: 40px;
            width: 120px;
        }
        input{
            width: calc(100% - 120px);
            height: 40px;
            line-height: 40px;
            line-height: 1;
            border: 1px solid #ddd;
            outline: none;
            text-indent: 10px;
        }
    }
}
.edit-genealogy-btn{
    display: flex;
    justify-content: center;
    button{
        border: none;
        outline: none;
        width: 200px;
        height: 40px;
        line-height: 40px;
        border-radius: 3px;
        background-color: #358acd;
        color: #fff;
        text-align: center;
        cursor: pointer;
    }
}
</style>

