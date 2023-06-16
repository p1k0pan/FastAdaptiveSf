/*const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
});*/

const BundleTracker = require("webpack-bundle-tracker");
//const { defineConfig } = require('@vue/cli-service')
//const webpack = require('webpack');

//const entry = './src/main.js'
/*const pages = {
  main: {
    //entry: entry,
    chunks: ['chunk-common'] // or ['chunk-vendors']
  },
};*/
const publicPath = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080/'
  : 'http://localhost:8080/' // `${process.env.GLOBAL_PREFIX ?? ''}/static/vue/`;

  
module.exports = {
  transpileDependencies: true,
  /*transpileDependencies: [
    //'vuetify'
  ],*/
  publicPath,
  //pages: pages,
  filenameHashing: true,
  productionSourceMap: false,
  outputDir: '../wikihow_app/static/vue/',

  devServer: {
    proxy: {
      "/api": {
        target: "https://test.de/",
      },
    },
    devMiddleware: {
      publicPath,
    },
    client: {
      webSocketURL: {
        hostname: 'localhost',
        port: 8080,
      },
    },
    static: {
      watch: {
        poll: 1000,
      },
      publicPath,
    },
  },


  chainWebpack: config => {

    // clear the existing entry point
    config
      .entry('main')
      .clear()

    // add your custom entry point
    config
      .entry('main')
      .add('./src/main.ts') // ./src/main.js

    config.optimization
      .splitChunks({
        cacheGroups: {
          state: {
            /* As vuex state is not needed in all our entry points, we isolate it
             * in a separate chunk to be loaded only where needed.
             */
            test: /[\\/]node_modules[\\/](vuex|vuex-persisted-state)/,
            name: "chunk-state",
            chunks: "all",
            priority: 5
          },
          vendor: {
            /* This chunk contains modules that may be used in all entry points,
             * including Vue itself
             */
            test: /[\\/]node_modules[\\/]/,
            name: "chunk-common",
            chunks: "all",
            priority: 1
          },
        },
      });

    /*Object.keys(pages).forEach(page => {
      config.plugins.delete(`html-${page}`);
      config.plugins.delete(`preload-${page}`);
      config.plugins.delete(`prefetch-${page}`);
    })*/

    config
      .plugin('BundleTracker')
      .use(BundleTracker, [{
        path: '../frontend/',
        filename: 'webpack-stats.json',
        publicPath,
        host: 'localhost',
        port: 8080,
      }]);

    // Uncomment below to analyze bundle sizes
    // config.plugin("BundleAnalyzerPlugin").use(BundleAnalyzerPlugin);

    // config.resolve.alias
    // .set('__STATIC__', 'static')

    // add ts-loader
    /*config.module
      .rule('typescript')
      .test(/\.ts$/)
      .use('ts-loader')
        .loader('ts-loader')
          .tap(() => {
            return {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true,
            };
          });*/

    config.devServer
      .hot('only')
      .https(false)
      .historyApiFallback(true)
      .headers({"Access-Control-Allow-Origin": ["*"]})
  },

  configureWebpack: {
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" }
    }
  },

  /*configureWebpack: {
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // define the env variables that need to be present in js
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          GLOBAL_PREFIX: JSON.stringify(process.env.GLOBAL_PREFIX),
        },
      }),
    ],
  },*/
};