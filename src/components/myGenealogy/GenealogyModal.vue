<template>
    <div class="genealogyModal">
        <div class="form">
            <h3>{{type >= 0 ? '修改' : '添加'}}谱目</h3>
            <i class="el-icon-close" @click="close"></i>
            <div class="input_group">
                <input type="text" v-model="form.genealogyName" placeholder="请输入谱名 *" />
                <input type="text" v-model="form.generationName" placeholder="请输入字辈" />
            </div>
            <div class="input_group">
                <input type="text" v-model="form.surname" placeholder="请输入姓氏 *" />
                <input type="text" v-model="form.place" placeholder="请输入谱籍地 *" />
            </div>
            <div class="input_group">
                <input type="text" v-model="form.version" placeholder="请输入版本类型" />
                <input type="text" v-model="form.publish" placeholder="请输入版本年" />
            </div>
            <div class="input_group">
                <input type="text" v-model="form.hall" placeholder="请输入堂号 *" />
                <input type="text" v-model="form.ancestor" placeholder="请输入始祖" />
            </div>
            <div class="input_group">
                <input type="text" v-model="form.writeTime" placeholder="请输入修撰时间" />
                <input type="text" v-model="form.author" placeholder="请输入修撰者" />
            </div>
            <div class="input_group">
                <input type="number" v-model.number="form.volume" placeholder="请输入卷数 *" />
                <input type="number" v-model.number="form.pages" placeholder="请输入页数 *" />
            </div>
            <div class="input_group">
                <input type="text" v-model="form.owner" placeholder="请输入馆藏地 *" />
                <input type="text" v-model="form.celebrity" placeholder="请输入先祖名人" />
            </div>
            <div class="input_group">
                <input type="text" v-model="form.placeNow" placeholder="请输入现代谱籍地" />
                <el-select v-model="form.imageLevel" placeholder="请选择影像阅读权限 *" class="rootSelect">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <div class="input_group">
                <el-select v-model="form.catalogLevel" placeholder="请选择谱目阅读权限 *" class="rootSelect">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <input type="text" v-model="form.source" placeholder="请输入机构" />
                <!-- <p class="title">*为必填项</p> -->
            </div>
            <div class="input_group">
                <input type="text" v-model="form.dgsNumber" placeholder="文件编码" />
            </div>
            <input class="btn" type="button" value="确定" @click="save" />
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogyModal",
    props:{
        data:{
            type:Array,
        },
        type:{
            type:Number,
        },
    },
    data: () => {
        return {
            form:{
                genealogyName:'',
                generationName:'',
                ancestor:'',
                version:'',
                surname:'',
                place:'',
                hall:'',
                publish:'',
                writeTime:'',
                author:'',
                volume:'',
                pages:'',
                owner:'',
                celebrity:'',
                placeNow:'',
                imageLevel:'',//影像阅读权限
                catalogLevel:'',//谱目阅读权限
                dgsNumber:'',
            },
            keyObj:{
                genealogyName:'谱名',
                generationName:'字辈',
                ancestor:'始祖',
                version:'版本名',
                surname:'姓氏',
                place:'谱籍地',
                hall:'堂号',
                publish:'版本年',
                writeTime:'修撰时间',
                author:'修撰者',
                volume:'卷数',
                pages:'页数',
                owner:'馆藏地',
                celebrity:'先祖名人',
                placeNow:'古籍地',
                catalogLevel:'谱目阅读权限',
                imageLevel:'影像阅读权限',
                dgsNumber:'文件编码',
            },
            options:[{label:'游客',value:0},{label:'粉丝',value:21},{label:'付费订阅者',value:20},{label:'成员',value:5},{label:'作者',value:4},{label:'编辑',value:3},{label:'管理员',value:2},{label:'超管',value:1}],
        };
    },
    mounted:function(){
        let userKey='',siteKey='';
        userKey = window.localStorage.getItem('userId') || '';
        siteKey = window.localStorage.getItem('stationKey') || '';
        if(this.type >= 0){
            let genealogy = this.data[0];
            this.form={
                genealogyName:genealogy.genealogyName,
                ancestor:genealogy.ancestor,
                version:genealogy.version,
                surname:genealogy.surname,
                place:genealogy.place,
                hall:genealogy.hall,
                publish:genealogy.publish,
                writeTime:genealogy.writeTime,
                author:genealogy.author,
                volume:genealogy.volume,
                pages:genealogy.pages,
                owner:genealogy.owner,
                celebrity:genealogy.celebrity,
                placeNow:genealogy.placeNow,
                generationName:genealogy.generationName,
                imageLevel:genealogy.imageLevel,//影像阅读权限
                catalogLevel:genealogy.catalogLevel,//谱目阅读权限
                siteKey:siteKey,
                userKey:userKey,
                key:genealogy._key,
                dgsNumber:genealogy.dgsNumber,
            }
        }else{
            this.form['siteKey'] = siteKey;
            this.form['userKey'] = userKey;
        }
    },
    methods:{
        close(){
            this.$emit('close-genealogy',false);
        },
        save(){
            this.addGenealogy();
        },
        addGenealogy: async function(){
            let self = this,flag=false,keyArr=[],data='';
            // Object.keys(this.form).forEach(function(key){
            //     keyArr.push(key);
            //     if(self.form[key] === ''){
            //         self.$message({message: '请填写家谱表单字段'+self.keyObj[key],type: 'warning'});
            //         return false;
            //     }
            // });
            // flag = keyArr.every((item)=>{return this.form[item] !== ''});
            
            // if(!flag){return false;}
            if(!this.form['genealogyName']){self.$message({message: '谱名必填',type: 'warning'});return false;}
            if(!this.form['surname']){self.$message({message: '姓氏必填',type: 'warning'});return false;}
            if(!this.form['place']){self.$message({message: '谱籍地必填',type: 'warning'});return false;}
            if(!this.form['hall']){self.$message({message: '堂号必填',type: 'warning'});return false;}
            if(!this.form['pages']){self.$message({message: '页数必填',type: 'warning'});return false;}
            if(!this.form['volume']){self.$message({message: '卷数必填',type: 'warning'});return false;}
            if(!this.form['owner']){self.$message({message: '馆藏地必填',type: 'warning'});return false;}
            if(!this.form['catalogLevel']){self.$message({message: '谱目阅读权限必选',type: 'warning'});return false;}
            if(!this.form['imageLevel']){self.$message({message: '影像阅读权限必选',type: 'warning'});return false;}

            if(this.type >= 0){
                data=await api.patchAxios('catalog',this.form);
            }else{
                data=await api.postAxios('catalog',this.form);
            }
            
            if(data.status == 200){
                this.$emit('save-genealogy','');
            }else{
                this.$message({message: (this.type >=0 ? '修改' : '新增')+'家谱出错，请重新提交',type: 'warning'});
            }
        },
    },
};
</script>
<style scoped lang="scss">
.genealogyModal{
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
        padding: 20px 50px;
        background: #FFFFFF;
        border-radius: 10px;
        text-align: center;
        h3{
            margin-bottom: 30px;
        }
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            cursor: pointer;
        }
        .input_group{
            width: 520px;
            margin: 10px auto;
            display: flex;
            justify-content: space-between;
            input{
                width: 250px;
                height: 40px;
                line-height: 40px;
                // background: #DEF1FF;
                border: 1px solid #ddd;
                outline: none;
                text-indent: 10px;
            }
            .rootSelect{
                width: 250px;
            }
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
.title{
    font-size: 12px;
    color: #4C95FF;
    text-align: left;
     width: 250px;
    height: 40px;
    line-height: 40px;
}
</style>

