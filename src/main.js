import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Loading from './components/loading'
import Scroll from './components/scroll'
import NoData from './components/nodata'
import ADS from "./ADS.js";
import VueSocketio from 'vue-socket.io';
import socketio from 'socket.io-client';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import 'xe-utils'
import VXETable from 'vxe-table'
import XEUtils from 'xe-utils'
import 'vxe-table/lib/style.css'

VXETable.formats.mixin({
  formatDate ({ cellValue }, format) {
    return XEUtils.toDateString(cellValue, format || 'yyyy-MM-dd HH:mm:ss')
  },
  formatLinkDor ({ cellValue }) {
    return cellValue == 1 ? '已关联' : '未关联'
  },
})

VXETable.renderer.add('RuKuModal', {
  renderDefault (h,renderOpts, params) {
    let { row,column } = params
    let { attr,events } = renderOpts
    let arr = [];
    // console.log(row.willIn);
    if(row){
      if(row.willIn == 1){
        arr.push(<button class="RuKuModal" onClick={ () => events.click({'_key':row._key,'willIn':1,'suggIn': row.suggIn, 'data': row}) }>是</button>);
        arr.push(<button class="RuKuModal disabled" onClick={ () => events.click({'_key':row._key,'willIn':2,'suggIn': row.suggIn, 'data': row}) }>否</button>);
      }else if(row.willIn == 2){
        arr.push(<button class="RuKuModal disabled" onClick={ () => events.click({'_key':row._key,'willIn':1,'suggIn': row.suggIn, 'data': row}) }>是</button>);
        arr.push(<button class="RuKuModal" onClick={ () => events.click({'_key':row._key,'willIn':2,'suggIn': row.suggIn, 'data': row}) }>否</button>);
      }else{
        arr.push(<button class="RuKuModal" onClick={ () => events.click({'_key':row._key,'willIn':1,'suggIn': row.suggIn, 'data': row}) }>是</button>);
        arr.push(<button class="RuKuModal" onClick={ () => events.click({'_key':row._key,'willIn':2,'suggIn': row.suggIn, 'data': row}) }>否</button>);
      }
    }
    
    return arr;
  },
  exportMethod (params) {
    const { row, column } = params
    return '自定义内容'
  }
})
// 是否标记
VXETable.renderer.add('repeatMarkModal', {
  renderDefault (h,renderOpts, params) {
    let { row,column } = params
    let { attr,events } = renderOpts
    let arr = [];
    if(row[column.property]){
      if(row[column.property] == 1){
        // console.log(row[column.property]);
        arr.push('已'+attr.label);
      }
    }else{
      arr.push(<button class="RuKuModal" onClick={() => events.click({'row':row})}>标记</button>);
    }
    return arr;
  },
  exportMethod (params) {
    const { row, column } = params
    return '自定义内容'
  }
})
// 开关按钮
VXETable.renderer.add('AdaiSwitchButton', {
  renderDefault (h,renderOpts, params) {
    let { row,column } = params
    let { attr,events } = renderOpts
    let arr = [<div class="AdaiSwitchButton" onClick={() => events.click({'row':row,'property':attr.property})}><span></span></div>];
    if(row[attr.property] == 1){
      arr = [<div class="AdaiSwitchButton active" onClick={() => events.click({'row':row,'property':attr.property})}><span></span></div>];
    }
    if(attr.property == 'canTake' && row.hasIn == '是'){
      arr = [<div class="AdaiSwitchButton active" onClick={() => events.click({'row':row,'property':attr.property})}><span></span></div>];
    }
    return arr;
  },
  exportMethod (params) {
    const { row, column } = params
    return '自定义内容'
  }
})

// tab按钮
VXETable.renderer.add('AdaiTabButton', {
  renderDefault (h,renderOpts, params) {
    let { row,column } = params
    let { attr,events } = renderOpts
    let arr = [];
    if(row.willIn == 1){
      if(!row[column.property]){
        arr = [<div class="AdaiTabButton"><span class="active" onClick={() => events.click({'row':row,'status': 0})}>重复</span><span onClick={() => events.click({'row':row,'status': 1})}>可拍</span><span onClick={() => events.click({'row':row,'status': 2})}>无效</span><span onClick={() => events.click({'row':row,'status': 3})}>打回</span></div>];
      }
      if(row[column.property] == 1 || row.hasIn == '是'){
        arr = [<div class="AdaiTabButton"><span onClick={() => events.click({'row':row,'status': 0})}>重复</span><span onClick={() => events.click({'row':row,'status': 1})} class="active">可拍</span><span onClick={() => events.click({'row':row,'status': 2})}>无效</span><span onClick={() => events.click({'row':row,'status': 3})}>打回</span></div>];
      }
      if(row[column.property] == 2){
        arr = [<div class="AdaiTabButton"><span onClick={() => events.click({'row':row,'status': 0})}>重复</span><span onClick={() => events.click({'row':row,'status': 1})}>可拍</span><span onClick={() => events.click({'row':row,'status': 2})} class="active">无效</span><span onClick={() => events.click({'row':row,'status': 3})}>打回</span></div>];
      }
      if(row[column.property] == 3){
        arr = [<div class="AdaiTabButton"><span onClick={() => events.click({'row':row,'status': 0})}>重复</span><span onClick={() => events.click({'row':row,'status': 1})}>可拍</span><span onClick={() => events.click({'row':row,'status': 2})}>无效</span><span onClick={() => events.click({'row':row,'status': 3})} class="active">打回</span></div>];
      }
    }
    
    return arr;
  },
  exportMethod (params) {
    const { row, column } = params
    return '自定义内容'
  }
})

VXETable.renderer.add('AdaiActionButton', {
  renderDefault(h, renderOpts, params){
    let arr = [];
    let { row,column } = params
    let { attr,events } = renderOpts
    attr.data.map((item)=>{
      if(row.status && item.value != 'look'){
        if(['nf', 'd', 'r', 'm'].indexOf(item.value) > -1){
          if(row.DupProjectIDStatus == 1 || !row.DupProjectIDStatus){
            arr.push(<button class="AdaiActionButton" onClick={() => events[item.value](params)}>{item.label}</button>)
          }
        }else if(item.value == 'resume'){
          arr.push(<button class="AdaiActionButton" onClick={() => events[item.value](params)}>{item.label}</button>)
        }
        else{
          arr.push(<button class="AdaiActionButton disabled" onClick={() => events[item.value](params)}>{item.label}</button>)
        }
      }else if(row.checkDoneTimeO < 0 && item.value == 'setCommon'){
        arr.push(<button class="AdaiActionButton disabled" onClick={() => events[item.value](params)}>{item.label}</button>)
      }else if(row.reviewStatus != 1 && item.value == 'volumeReturn'){
        arr.push(<button class="AdaiActionButton disabled" onClick={() => events[item.value](params)}>{item.label}</button>)
      }else if(row.reviewStatus != 1 && item.value == 'volumeLook'){
        arr.push(<button class="AdaiActionButton disabled" onClick={() => events[item.value](params)}>{item.label}</button>)
      }else if(!row.imageLink && !row.hasImage && item.value == 'readBook'){
        arr.push(<button class="AdaiActionButton disabled" onClick={() => events[item.value](params)}>{item.label}</button>)
      }else if(['nf', 'f'].indexOf(row.condition) === -1 && item.value == 'catalogPass'){
        arr.push(<button class="AdaiActionButton disabled" onClick={() => events[item.value](params)}>{item.label}</button>)
      }else{
        arr.push(<button class="AdaiActionButton" onClick={() => events[item.value](params)}>{item.label}</button>)
      }
    })
    return arr
  },
  exportMethod(params){
    const { row, column } = params
    return '自定义内容'
  }
})

VXETable.renderer.add('AdaiActionButton2', {
  renderDefault(h, renderOpts, params){
    let arr = [];
    let { row,column } = params
    let { attr,events } = renderOpts
    attr.data.map((item)=>{
      arr.push(<button class="AdaiActionButton" onClick={() => events[item.value](params)}>{item.label}</button>);
    })
    return arr
  },
  exportMethod(params){
    const { row, column } = params
    return '自定义内容'
  }
})

Vue.filter("getLocalTime", ADS.getLocalTime);

Vue.prototype.logout = ADS.logout;

let APIURL='https://pumudata.qingtime.cn/';
if(window.location.origin.indexOf('genealogy.1jiapu.com') > -1){
    APIURL = 'https://genealogydata.1jiapu.com/';
}
// APIURL = 'https://genealogydata.1jiapu.com/';
Vue.use(new VueSocketio({
  debug: true,
  connection: APIURL,
  vuex: {
  }
}))
Vue.use(Loading);
Vue.use(Scroll);
Vue.use(NoData);
Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VXETable);

// 给 vue 实例挂载内部对象，例如：
Vue.prototype.$XModal = VXETable.modal
Vue.prototype.$XPrint = VXETable.print
Vue.prototype.$XSaveFile = VXETable.saveFile
Vue.prototype.$XReadFile = VXETable.readFile

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
