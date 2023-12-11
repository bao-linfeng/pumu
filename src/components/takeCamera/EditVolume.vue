<template>
    <div class="volume-edit-wrap style1" @keyup.stop="">
        <div class="head-box">
            <h3 class="title">编辑卷册</h3>
        </div>
        <div class="content-box">
            <div class="volume-box">
                <label class="label" for="">卷ID:</label>
                <input class="input" type="text" v-model="this.detail._key" :disabled="true" />
            </div>
            <div class="volume-box">
                <label class="label" for="">内部序号:</label>
                <input class="input" type="number" v-model="internalSerialNumber" :disabled="true" />
            </div>
            <div class="volume-box">
                <label class="label" for="">卷册名:</label>
                <input class="input" :class="{changeActive: detail.changeFieldArr.indexOf('volumeNumber') > -1}" type="text" v-model="volumeNumber" />
            </div>
            <div class="volume-box">
                <label class="label" for="">ProjectID:</label>
                <input class="input" :class="{changeActive: detail.changeFieldArr.indexOf('DorProjectID') > -1}" type="text" v-model="DorProjectID" />
            </div>
            <div class="volume-box">
                <label class="label" for="">MediaID:</label>
                <input class="input" :class="{changeActive: detail.changeFieldArr.indexOf('DorMediaID') > -1}" type="text" v-model="DorMediaID" />
            </div>
            <div class="volume-box">
                <label class="label" for="">电子谱:</label>
                <el-radio-group v-model="isLeadImages" :disabled="detail.takeStatus == 6 || detail.takeStatus == 7">
                    <el-radio :label="'1'">是</el-radio>
                    <el-radio :label="'0'">否</el-radio>
                </el-radio-group>
            </div>
            <div class="volume-box">
                <label class="label" for="">单双页:</label>
                <el-radio-group v-model="singleOrTwo" :disabled="detail.takeStatus == 6 || detail.takeStatus == 7">
                    <el-radio :label="'1'">单页</el-radio>
                    <el-radio :label="'2'">双页</el-radio>
                </el-radio-group>
            </div>
            <div class="volume-box">
                <label class="label" for="">实体书状态:</label>
                <el-select class="width150" v-model="catalogStatus" multiple placeholder="实体书状态" size="small">
                    <el-option
                        v-for="item in catalogStatusList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <div class="volume-box">
                <label class="label" for="">备注:</label>
                <el-input
                    class="textarea"
                    :class="{changeActive: detail.changeFieldArr.indexOf('memo') > -1}"
                    type="textarea"
                    :rows="3"
                    v-model="memo">
                </el-input>
            </div>
            <div class="volume-box">
                <label class="label" for="">影像来源:</label>
                <el-select class="width150" v-model="imageSource" placeholder="影像来源" size="small">
                    <el-option
                        v-for="item in imageSourceList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <!-- <div class="summary">
                <h3>新建卷填写规范:</h3>
                <p>1.内部序号:为此谱书实体卷(册)序号,例 共有4本,现录入为第二本,则填入数字2;</p>
                <p>2.卷(册)名:对应实体谱书卷(册)名称,如包含多卷,则在名称上都标上;</p>
                <p>3.电子谱:直接由电子档谱书文件转换的影像文件,称为电子谱;</p>
                <p>4.单双页:单页,一次拍摄只包括一面影像;双页,一次拍摄后,包括相邻两面影像.</p>
                <p>5.备注:实体书正常、实体书破损、其他备注.</p>
            </div> -->
        </div>
        <div class="foot-box">
            <button class="btn" @click="close(false)">取消</button>
            <button class="btn active" @click="save">确定</button>
        </div>
    </div>
</template>

<script>
import ADS from "../../ADS.js";
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "editVolume",
    props:{
        detail: {
            type: Object
        }
    },
    data: () => {
        return {
            isLeadImages: '0',
            singleOrTwo: '2',
            electronicCopy: '0',
            volumeNumber: '',
            internalSerialNumber: '',
            memo: '谱书正常',
            catalogStatus: ['谱书正常'],
            catalogStatusList: [
                {'label': '谱书正常', 'value': '谱书正常'},
                {'label': '原稿模糊', 'value': '原稿模糊'},
                {'label': '原稿破损', 'value': '原稿破损'},
                {'label': '装订紧密', 'value': '装订紧密'},
                {'label': '其他', 'value': '其他'},
            ],
            imageSourceList: [
                {"label": '拍摄上传', 'value': '1'},
                {"label": 'DCAM导入', 'value': '5'},
                {"label": '其他影像导入', 'value': '10'},
            ],
            imageSource: '1',
            DorMediaID: '',
            DorProjectID: '',
        };
    },
    mounted: function(){
        this.isLeadImages = this.detail.isLeadImages || '0';
        this.singleOrTwo = this.detail.singleOrTwo ? this.detail.singleOrTwo+'' : '2';
        this.electronicCopy = this.detail.electronicCopy || '0';
        this.volumeNumber = this.detail.volumeNumber || '';
        this.internalSerialNumber = this.detail.internalSerialNumber ? Number(this.detail.internalSerialNumber) ? Number(this.detail.internalSerialNumber) : 1 : 1;
        this.memo = this.detail.memo || '';
        this.catalogStatus = this.memo ? this.memo.split(',') : [];
        this.imageSource = this.detail.imageSource || '1';
        this.DorMediaID = this.detail.DorMediaID || '';
        this.DorProjectID = this.detail.DorProjectID || '';
        
    },
    methods:{
        close(f = false){
            this.$emit('close', f);
        },
        save(){
            console.log(this.isLeadImages, this.singleOrTwo);
            this.editVolume();
        },
        async editVolume(){
            let result = await api.patchAxios('v3/review/catalog/volume', {
                "volumeKey": this.detail._key,
                "patchData": {
                    'isLeadImages': this.isLeadImages, 
                    'singleOrTwo': this.singleOrTwo, 
                    'volumeNumber': this.volumeNumber, 
                    'internalSerialNumber': Number(this.internalSerialNumber) || 1,
                    'memo': this.memo,
                    'imageSource': this.imageSource,
                    'DorMediaID': this.DorMediaID,
                    'DorProjectID': this.DorProjectID,
                },
                "userKey": this.userId,
                "siteKey": this.stationKey
            });
            if(result.status == 200){
                ADS.message('编辑成功！', true);
                this.close(true);
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        }
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
        'catalogStatus': function(nv, ov){
            // console.log(nv);
            this.memo = nv.join(',');
        },
    }
};
</script>

<style scoped lang="scss">
.volume-edit-wrap{
    position: fixed;
    top: 40px;
    right: 0;
    // bottom: 0;
    width: 280px;
    background: #d8d8d8;
    font-size: 14px;
    color: #000;
    padding: 0 20px 20px 20px;
    overflow-y: auto;
    .head-box{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content-box{
        position: relative;
        margin: 10px 0;
        .volume-box{
            display: flex;
            align-items: center;
            text-align: left;
            .label{
                display: block;
                width: 80px;
                height: 40px;
                line-height: 40px;
            }
            .textarea{
                width: calc(100% - 80px);
            }
        }
    }
    .foot-box{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 40px;
        .btn{
            width: 80px;
            height: 30px;
            outline: none;
            border: 1px solid #ddd;
            margin: 0 20px;
            cursor: pointer;
            border-radius: 3px;
            &.active{
                background: #358acd;
                color: #fff;
            }
        }
    }
}
.input{
    width: calc(100% - 80px);
    height: 30px;
    border: 1px solid #ddd;
    text-indent: 10px;
    text-align: left;
    outline: none;
}
.summary{
    text-align: left;
    margin-top: 20px;
    p{
        margin-top: 5px;
    }
}
.changeActive{
    color: #358acd;
}
</style>

