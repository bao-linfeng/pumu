import * as qiniu from 'qiniu-js';
const uploadFile = {
    uploadImg: async (file, callback,uptoken) => {
        if (uptoken) {
            if (!uptoken || !file) {
                return false;
            }
            const domain = 'https://cdn-icare.qingtime.cn/';
            // if (file.size > 52428800) {
            //     message.error("文件过大,请重新选择");
            //     return;
            // }
            let putExtra = {
                // 文件原文件名
                fname: "",
                // 自定义变量
                params: {},
                // 限制上传文件类型
                mimeType: "",
            };
            let config = {
                useCdnDomain: true,
                disableStatisticsReport: false,
                retryCount: 5,
                region: qiniu.region.z0
            };
            let observer = {
                next(res) {
                },
                error(err) {
                    console.log(err.message);
                },
                complete(res) {
                    // content = content.replace(/(data:image\/){1}(jpeg|gif|png){1}(;){1}.*?\"/, "http://cdn-icare.qingtime.cn/" + res.key + "\"");
                    callback(domain + res.key);
                    //return domain + res.key;
                }
            }
            // 上传
            let observable = qiniu.upload(file, new Date().getTime() + "_" + file.name, uptoken, putExtra, config);
            // 上传开始
            observable.subscribe(observer);
        } else {
           alert("获取七牛数据失败")
        }
    }
}


export default uploadFile