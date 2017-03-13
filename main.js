import Vue from 'vue'
//var Vue = require('vue')
import VueRouter from 'vue-router'
//var VueRouter = require('vue-router');
//import 'weui'
import MuseUI from 'muse-ui'
//import './node_modules/muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/muse-ui.css'
//require('weui')
import Vuex from 'vuex';

import VueAwesomeSwiper from 'vue-awesome-swiper'
//var Vuex = require('vuex')
//import $ from 'jquery'
//var $ = require('jquery')
//window.$ = $
//window.jQuery = $
//window.jQuery = window.$ = require('jquery')
//import 'bootstrap';
//import './node_modules/bootstrap/dist/fonts';
//import './node_modules/bootstrap/dist/css/bootstrap.css';
//import './node_modules/bootstrap/dist/js/bootstrap.js';
Vue.use(MuseUI)
Vue.use(VueRouter)
Vue.use(VueAwesomeSwiper)
var index = require('./app/index.vue')
var detail = require('./app/wdetail.vue')
var championdetail = require('./app/wchampiondetail.vue')

var news = require('./app/channel/news.vue')
var players = require('./app/channel/players.vue')
var heros = require('./app/channel/heros.vue')

const routes = [{
	path: '/index',
	component: index,
	children: [{
		path: 'news/:id',
		component: news
	}, {
		path: 'players/:id',
		component: players
	}, {
		path: 'heros/:id',
		component: heros
	}]
}, {
	path: '/detail/:id',
	component: detail
}, {
	path: '/championdetail/:id',
	component: championdetail
}, {
	//默认重定向 redirect
	path: '/',
	redirect: '/index/news/6'
}]

const router = new VueRouter({
	routes //（缩写）相当于 routes: routes
})

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		loading: false,
		newst_news: ['a', 'b'],
		title: '资讯',
		is_open_menu: false,
		token: "68418-96134-13189-8486B"
	},
	//接受组件commit传过来的数据并保存到state中,this.$store.commit('changeSearchName', this.searchName);
	mutations: {
		get_newst_news: function(state, data) {
			state.newst_news = state.newst_news.concat(data);
		},
		set_loading: function(state, data) {
			state.loading = data;
		},
		set_title: function(state, data) {
			state.title = data
		},
		set_is_open_menu: function(state, data) {
			state.is_open_menu = data
		}
	},
	actions: {
		GET_NEWST_NEWS(context) {
			$.ajax({
				type: 'GET',
				url: 'http://localhost:81/vue-news/vue/newsts.php',
				dataType: 'jsonp',
				jsonpCallback: 'GET_NEWST',
				success: function(data) {
					context.commit('set_loading', false)
					console.log(data)
					context.commit('get_newst_news', data.list)
				}
			})

		}
	},
	//可以从组件调用此方法获取值，一般配合计算属性动态获取值
	//(1)return this.$store.state.searchName
	//(2)return this.$store.getters.getSearchName
	getters: {
		getSearchName: function(state) {
			return state.searchName;
		}
	}
})

/*new Vue({
	el: '#app',
	render: (createElement) => createElement(App)
})*/

const app = new Vue({
	router,
	store,
}).$mount('#app')