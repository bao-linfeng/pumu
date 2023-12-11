import * as qiniu from 'qiniu-js';

const qiniuUploadFile = {
    uploadFile: async (file, token, progressFN, completeFN) => {
        if(!token){
            alert('请输入token');
            return false;
        }
        if(!file){
            alert('请输入file');
            return false;
        }
        if(file.size > 10*1024*1024){
            alert('上传文件不能超过10M');
            return false;
        }
        const key = new Date().getTime() + '-' + file.name;
        const putExtra = {
            fname: "",
            mimeType: "",
            customVars: {},
            metadata: {},
        };
        const config = {
            useCdnDomain: true,
            disableStatisticsReport: false,
            retryCount: 5,
            region: qiniu.region.z0
        };
        const observable = qiniu.upload(file, key, token, putExtra, config);
        const observer = {
            next(res){
                progressFN(res);
            },
            error(err){
                console.log(err);
            },
            complete(res){
                completeFN(res);
            }
        };
        this.subscription = observable.subscribe(observer) // 上传开始
    },
    deleteUploadedFile: async (token, key) => {// 删除图片
        
    },
    unsubscribe: async () => {
        this.subscription.unsubscribe() // 上传取消
    }
};

export default qiniuUploadFile;