const path = require('path')
function assetsPath(_path) {
    // 如果是生产环境assetsSubDirectory就是'static'，否则还是'static'，哈哈哈
    // const assetsSubDirectory = process.env.NODE_ENV === 'production'
    //     ? config.build.assetsSubDirectory
    //     : config.dev.assetsSubDirectory
    // path.join和path.posix.join的区别就是，前者返回的是完整的路径，后者返回的是完整路径的相对根路径
    // 也就是说path.join的路径是C:a/a/b/xiangmu/b，那么path.posix.join就是b
    return path.posix.join('static', _path)
    // 所以这个方法的作用就是返回一个干净的相对根路径
}

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}
    
module.exports = {
  productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
  // devServer: {
  //   open: true,
  // },
  chainWebpack: config => {
    //config.module.rules.delete("svg"); //重点:删除默认配置中处理svg,
    //const svgRule = config.module.rule('svg')
    //svgRule.uses.clear()
    // config.module
    //   .rule('svg-sprite-loader')
    //   .test(/\.svg$/)
    //   .include
    //   .add(resolve('src/icons')) //处理svg目录
    //   .end()
    //   .use('svg-sprite-loader')
    //   .loader('svg-sprite-loader')
    //   .options({
    //     symbolId: 'icon-[name]'
    //   })
      
      // config.module.rules.delete("url-loader");
      // config.module
      // .rule('url-loader')
      // .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
      // .include
      // .add(resolve('src/assets')) //处理svg目录
      // .end()
      // .use('url-loader')
      // .loader('url-loader')
      // .options({
      //     limit: 10000,
      //     name: assetsPath('img/[name].[hash:7].[ext]')
      // })
  },
  configureWebpack: config =>{
    
  }
//   configureWebpack: (config) => ({
    
//     // resolve: {
//     //   alias: require('./alias.config').webpack
//     // },
//     // module: {
//     //   rules: [{
//     //     test: /\.svg$/,
//     //     use: [{
//     //       loader: "svg-sprite-loader",
//     //       options: {
//     //         symbolId: 'icon-[name]'
//     //       }
//     //     }]
//     //   }]
//     // }
//   })
}
