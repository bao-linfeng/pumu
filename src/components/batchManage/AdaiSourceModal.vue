<template>  
    <div class="adai-source-wrap">
        <div class="adai-source-box">
            <h3>选择查重数据源</h3>
            <i class="el-icon-close" @click="close(false)"></i>
            <div class="adai-source-select">
                <el-select v-model="libKey" placeholder="请选择来源">
                    <el-option
                        v-for="item in libList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <div class="adai-source-foot">
                <button @click="clickDataCheck">确认</button>
                <button  @click="close(false)">取消</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import api from "../../api.js";
import ADS from "../../ADS.js";
export default {
    name: "adaiSourceModal",
    props:{
        stationKey:{
            type: String,
        }
    },
    data: () => {
        return {
            libKey: '',
            libList: [],
        };
    },
    mounted:function(){
        this.getLib();
    },
    methods:{
        getLib:async function(){// 来源
            let data=await api.getAxios('lib?siteKey='+this.stationKey);
            if(data.status == 200){
                let libList = [{'label': this.stationName,'value':''}];
                data.data.map((item)=>{
                    libList.push({'label':item.libName,'value':item._key});
                });
                this.libList = libList;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        clickDataCheck(){
            this.$emit('source-check',this.libKey);
            this.close(false);
        },
        close(flag){
            this.$emit('close-source',flag);
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            Utotal: state => state.nav.Utotal,
            Upage: state => state.nav.Upage,
            orgId: state => state.nav.orgId,
            stationName: state => state.nav.stationName,
        })
    },
};
</script>
<style scoped lang="scss">
.adai-source-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    .adai-source-box{
        position: relative;
        background-color: #fff;
        border-radius: 5px;
        padding: 10px;
        h3{
            text-align: center;
        }
        i{
            position: absolute;
            top: 15px;
            right: 10px;
            cursor: pointer;
        }
        .adai-source-select{
            margin: 10px 0;
        }
        .adai-source-foot{
            display: flex;
            justify-content: space-around;
            align-items: center;
            button{
                width: 100px;
                height: 30px;
                line-height: 30px;
                border: none;
                outline: none;
                background-color: #358acd;
                color: #fff;
                border-radius: 3px;
                cursor: pointer;
            }
        }
    }
}
</style>

