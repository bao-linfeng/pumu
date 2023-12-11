<template>
    <div class="rootModal">
        <div class="form">
            <h3>分级公开设置</h3>
            <i class="el-icon-close" @click="close"></i>
            <p>共选择了  {{checkList.length}}  项</p>
            <p>将影像公开阅读权限设置为：</p>
            <el-select v-model="imageLevel" placeholder="请选择" class="rootSelect">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <p>将谱目公开阅读权限设置为：</p>
            <el-select v-model="catalogLevel" placeholder="请选择" class="rootSelect">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <!-- <p>将全文公开阅读权限设置为：</p>
            <el-select v-model="textLevel" placeholder="请选择" class="rootSelect">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select> -->
            <input class="btn" type="button" value="确定" @click="editRoot" />
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import api from "../../api.js";
export default {
    name: "rootModal",
    props:{
        checkList:{
            type:Array,
        },
        siteKey:{
            type:String,
        },
    },
    data: () => {
        return {
            imageLevel:0,
            catalogLevel:0,
            textLevel:0,
            options:[{label:'游客',value:0},{label:'粉丝',value:21},{label:'付费订阅者',value:20},{label:'成员',value:5},{label:'作者',value:4},{label:'编辑',value:3},{label:'管理员',value:2},{label:'超管',value:1}],
        };
    },
    mounted:function(){
        if(this.checkList.length == 1){
            this.imageLevel = this.checkList[0].imageLevel;
            this.catalogLevel = this.checkList[0].catalogLevel;
        }
    },
    methods:{
        close(){
            this.$emit('close-root',false);
        },
        save(){
            this.$emit('save-root','');
        },
        editRoot:async function(){
            let catalogKeyArr = [];
            this.checkList.map((item)=>{catalogKeyArr.push(item._key)});
            let data=await api.patchAxios('catalog/readLevel',{'catalogKeyArr':catalogKeyArr,imageLevel:this.imageLevel,catalogLevel:this.catalogLevel,textLevel:this.textLevel,siteKey:this.siteKey});
            if(data.status == 200){
                this.save();
            }else{
                this.$message({message:'分级权限设置失败，请重新设置',type: 'warning'});
            }
        },
    },
};
</script>
<style scoped lang="scss">
.rootModal{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    z-index: 100;
    .form{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 400px;
        height: 320px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        h3{
            margin: 25px 0 15px 0;
        }
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        p{
            margin: 5px 0;
        }
        .rootSelect{
            margin-top: 5px;
        }
        .btn{
            width: 224px;
            height: 48px;
            line-height: 48px;
            text-align: center;
            border-radius: 24px;
            background: #4C95FF;
            border-radius: 24px;
            display: block;
            margin: 20px auto;
            outline: none;
            border: none;
            color: #fff;
            cursor: pointer;
        }
    }
}
</style>

