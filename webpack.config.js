var webpack = require('webpack');
module.exports = {
	devtool: 'eval-source-map', //用于调试代码
	entry: __dirname + "/main.js", //入口文件
	output: {
		path: __dirname + "/public", //打包后的文件存放的地方
		filename: "bundle.js" //打包后输出文件的文件名
	},
	module: {
		loaders: [{
			test: /\.css$/,
			loader: 'style-loader!css-loader'
		}, {
			test: /\.(png|jpg)$/,
			loader: 'url-loader?limit=8192'
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			loader: "babel-loader",
		}, {
			test: /\.vue$/,
			loader: 'vue-loader'
		}, {
			test: /\.less$/,
			loader: 'less-loader'
		}]
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery"
		})
	],
	//ES6转ES5
	//执行webpack记得注释一下
	/*babel: {
		presets: ['es2015']
	},*/
	devServer: {
		contentBase: "./public", //本地服务器所加载的页面所在的目录
		historyApiFallback: true, //不跳转
		inline: true //实时刷新
	},
	//别名(resolve.alias)是Webpack的一个配置项，它的作用是把用户的一个请求重定向到另一个路径，例如通过修改 webpack.config.js 配置文件，加入
	//例如require("./app.vue")可以寫成require("./app")
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js'
		}
	}
}