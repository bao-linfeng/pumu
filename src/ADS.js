
function params(str){
    let arr='',obj={};
    if(str && str.substr(0,1) && str.substr(0,1) == '?'){
        arr=str.substr(1).split('&');
        if(arr && arr.length){
            arr.map((item,key)=>{
                obj[item.split('=')[0]]=item.split('=')[1];
            })
        }
    }
    return obj;
}

function Uint8ArrayToString(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
    }
   
    return dataString
}

// 解压
function unzip(key) {
    // 将二进制字符串转换为字符数组
    var charData = key.split('').map(function (x) { return x.charCodeAt(0); });
    //console.log('压缩后的文件大小:', charData.join(","))
   
    // 将数字数组转换成字节数组
    var binData = new Uint8Array(charData);
   
    // 解压
    var data = pako.inflate(binData);

    var Uint8ArrayData=new Uint8Array(data);
    key=Uint8ArrayToString(Uint8ArrayData);
   
    // 将GunZip ByTAREAR转换回ASCII字符串
    //key = String.fromCharCode.apply(null, new Uint16Array(data));//数据太大时，报错
   
    //unescape(str)  --->解压后解码，防止中午乱码
    return unescape(key);
}
   
// 压缩
function zip(str) {
    //escape(str)  --->压缩前编码，防止中午乱码
    var binaryString = pako.gzip(escape(str), { to: 'string' });
    return binaryString;
}

//加密
function compile(code){    
    var c=String.fromCharCode(code.charCodeAt(0)+code.length);  
    for(var i=1;i<code.length;i++){  
        c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));  
    }  
    return escape(c);  
}  

//解密
function uncompile(code){  
    code=unescape(code);  
    var c=String.fromCharCode(code.charCodeAt(0)-code.length);  
    for(var i=1;i<code.length;i++){  
       c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));  
    }  
    return c;  
}  

//生成随机数
function GetRandomNum(Min, Max) {
	var Range = Max - Min;
	var Rand = Math.random();
	return (Min + Math.floor(Rand * Range));
}

function Appendzero(obj) {
	if (obj < 10) return "0" + obj;
	else return obj;
}

//生成固定格式时间
function getLocalTime(nS, symbol, index) {
    if(nS){
        symbol = symbol || '-';
        index = index || 5;
        var date = new Date(nS),
            Y, M, D, h, m, s;
        Y = date.getFullYear() + symbol;
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + symbol;
        D = date.getDate() + ' ';
        h = Appendzero(date.getHours()) + ':';
        m = Appendzero(date.getMinutes()) + ':';
        s = Appendzero(date.getSeconds());
        switch (index) {
            case 1:
                return (Y + M + D);
            case 2:
                return (Y + M);
            case 3:
                return (M + D);
            case 4:
                return (h + m + s);
            case 5:
                return (Y + M + D + h + m + s);
        }
    }else{
        return '';
    }
}

/**
 * 人性化时间处理 传入时间戳
 */
function timeago(timestamp){
	var mistiming=Math.round((new Date())-timestamp)/1000;

	if(mistiming <= 1){
		return '1秒前';
	}
    var arrr = ['年','个月','星期','天','小时','分钟','秒'];
    var arrn = [31536000,2592000,604800,86400,3600,60,1];
    let inms=[];
    for(var i=6;i>=0;i--){
        var inm = Math.floor(mistiming/arrn[i]);
        if(inm != 0){
            inms.push(inm+arrr[i]+'前');
        }
    }

    return inms[inms.length-1]
}

/**
* 日期转时间戳
*/
function Date2Timestamp(time){
    return (new Date(time)).getTime() || '';
}

//滑动穿透
var ModalHelper = (function(bodyCls){
	var scrollTop;
	return {
		afterOpen:function(){
			scrollTop = document.scrollingElement.scrollTop;
			document.body.classList.add(bodyCls);
			document.body.style.top = -scrollTop + 'px';
		},
		beforeClose:function(){
			document.body.classList.remove(bodyCls);
			document.scrollingElement.scrollTop = screenTop;
		}
	}
})("modal_open");
//退出登录
function logout(){
    let pathname = window.localStorage.getItem('pathname') || '';
    window.localStorage.setItem('token','');
    window.localStorage.setItem('profile','');
    window.localStorage.setItem('userId','');
    window.localStorage.setItem('stationKey','');
    window.localStorage.setItem('stationName','');
    window.localStorage.setItem('stationLogo','');
    window.localStorage.setItem('role','');
    this.$router.push('/'+pathname); 
}

// 本地缓存一天时间
function clearCacheTime(){
    let now = Date.now(),pumutime = window.localStorage.getItem('pumutime') ? Number(window.localStorage.getItem('pumutime')) : 0;
    if((now - pumutime) >= 24*60*60*1000){
        window.localStorage.setItem('token','');
        window.localStorage.setItem('profile','');
        window.localStorage.setItem('userId','');
        window.localStorage.setItem('stationKey','');
        window.localStorage.setItem('stationName','');
        window.localStorage.setItem('stationLogo','');
        window.localStorage.setItem('role','');
    }
}


function objectValue2String(o){//对象值合并成字符串
    return Object.values(o).join('')
}

function message(msg = 'ok', flag = false) {// 提示信息
    const time = (Date.now()).toString();
    const className = flag ? 'msg_wrap_ok' : 'msg_wrap_warn';
    const str = '<span id='+time+' class="msg_wrap '+className+'">'+msg+'</span>';
    const range = document.createRange();
    range.selectNodeContents(document.documentElement); 
    const fragment = range.createContextualFragment(str);
    document.body.appendChild(fragment);

    const timer = setTimeout(()=>{
        const ele = document.getElementById(time);
        if(ele){
            document.body.removeChild(ele)
        }
        clearTimeout(timer);
    },3000);
}
function downliadLink(fileName){
    var a = document.createElement('a');
    a.download = fileName;
    a.href = 'https://pumudata.qingtime.cn/'+fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function saveImg (Url) {
	var blob=new Blob([''], {type:'application/octet-stream'});
	var url = URL.createObjectURL(blob);
	var a = document.createElement('a');
	a.href = Url;
	a.download = Url.replace(/(.*\/)*([^.]+.*)/ig,"$2").split("?")[0];
	var e = document.createEvent('MouseEvents');
	e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	a.dispatchEvent(e);
	URL.revokeObjectURL(url);
}

function ChineseToNumber(chnStr){// 中文数字2阿拉伯数字
    var chnNumChar = {零:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
    var chnNameValue = {
        十:{value:10, secUnit:false},
        百:{value:100, secUnit:false},
        千:{value:1000, secUnit:false},
        万:{value:10000, secUnit:true},
        亿:{value:100000000, secUnit:true}
    };
    var rtn = 0;
    var section = 0;
    var number = 0;
    var secUnit = false;
    var str = chnStr.split('');
    for(var i = 0; i < str.length; i++){
        var num = chnNumChar[str[i]];
        if(typeof num !== 'undefined'){
            number = num;
            if(i === str.length - 1){
                section += number;
            }
        }else{
            var unit = chnNameValue[str[i]].value;
            secUnit = chnNameValue[str[i]].secUnit;
            if(secUnit){
                section = (section + number) * unit;
                rtn += section;
                section = 0;
            }else{
                section += (number * unit);
            }
            number = 0;
        }
    }
    return rtn + section;
}

// 阿拉伯数字转中文数字
function NumberToChinese(num){
    // 节内转换算法
    var chnNumChar = ['零','一','二','三','四','五','六','七','八','九'];
    var chnUnitSection = ['','万','亿','万亿','亿亿'];
    var chnUnitChar = ['','十','百','千'];
    function SectionToChinese(section){
        var strIns = '', chnStr = '';
        var unitPos = 0;
        var zero = true;
        while(section > 0){
            var v = section % 10;
            if(v === 0){
                if(!zero){
                    zero = true;
                    chnStr = chnNumChar[v] + chnStr;
                }
            }else{
                zero = false;
                strIns = chnNumChar[v];
                strIns += chnUnitChar[unitPos];
                chnStr = strIns + chnStr;
            }
            unitPos++;
            section = Math.floor(section / 10);
        }
        return chnStr;
    }
    
    var unitPos = 0;
    var strIns = '', chnStr = '';
    var needZero = false;

    if(num === 0){
        return chnNumChar[0];
    }
    while(num > 0){
        var section = num % 10000;
        if(needZero){
            chnStr = chnNumChar[0] + chnStr;
        }
        strIns = SectionToChinese(section);
        strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
        chnStr = strIns + chnStr;
        needZero = (section < 1000) && (section > 0);
        num = Math.floor(num / 10000);
        unitPos++;
    }
    return chnStr;
}

// 并集
Array.prototype.union = function(arr){
    var tempArr = this.slice();
    arr.forEach(function(v) {
        !tempArr.includes(v) && tempArr.push(v)
    });
    return tempArr;
}

function debounce(fn,delay){
    let timer = null //借助闭包
    return function() {
        if(timer){
            clearTimeout(timer) 
        }
        timer = setTimeout(fn,delay) // 简化写法
    }
}

function throttle(func, delay) {            
    let prev = Date.now();            
　　return function() {                
　　　　var context = this;                
　　　　var args = arguments;                
　　　　var now = Date.now();                
　　　　if (now - prev >= delay) {                    
　　　　　　func.apply(context, args);                    
　　　　　　prev = Date.now();                
　　　　}            
　　}        
}     

function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var pairs = query.split("&"), pair, i;
    for(i=0; i < pairs.length; i++) {
        pair = pairs[i].split("=");
        if(pair[0] == variable){
            return pair[1];
        }
    }
    return '';
}

export default {
    clearCacheTime,throttle,debounce,NumberToChinese,ChineseToNumber,Date2Timestamp,
    downliadLink,message,objectValue2String,params,unzip,zip,compile,uncompile,
    GetRandomNum,getLocalTime,timeago,ModalHelper,logout,
    getQueryVariable, 
}