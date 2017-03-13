<template>
	<div class="demo-infinite-container" :style="{height:screenHeight-312+'px'}">
		<!--向自定义指令v-color传入set_more函数来更改data的值-->
		<mu-list>
			<div v-for="newst in newsts" v-color="{screenHeight:screenHeight,setMore:setMore}">
				<!--<mu-sub-header>今天</mu-sub-header>-->
				<mu-list-item :title="newst.title" :href="newst.article_url">
					<mu-avatar :src="newst.image_url_small" slot="leftAvatar" />
					<span slot="describe">
						<span style="color: rgba(0, 0, 0, .87)">
							{{newst.summary}}
						</span>
					</span>
					<!--<mu-icon-menu slot="right" icon="more_vert" tooltip="操作">
					<mu-menu-item title="回复" />
					<mu-menu-item title="标记" />
					<mu-menu-item title="删除" />
				</mu-icon-menu>-->
				</mu-list-item>
			</div>
		</mu-list>
		<!--如果首页信息过短出现查看更多按钮-->
		<!--<p @click="getNewstNews()" class="load-more" style="display: block;" v-show="more">查看更多</p>-->
		<mu-infinite-scroll :scroller="scroller" :loading="loading" @load="getNewstNews" />

	</div>
</template>

<script>
	export default {
		data() {
				return {
					loading: false,
					scroller: null,
					newsts: [],
					screenHeight: window.screen.height,
					//判断是否出现查看更多按钮
					more: false
				}
			},
			mounted() {
				this.scroller = this.$el;
				//获取屏幕高度
				this.getScreenHeight();
				//首次加载触发获取首页消息
				this.getNewstNews();
			},
			directives: {
				color: {
					update: function(el, binding, v) {
						//判断列表渲染是否大于容器，如果不是出现查看更多按钮可点击
						setTimeout(function() {
							if(el.offsetHeight < binding.value.screenHeight - 312) {
								binding.value.setMore(true)
							} else(
								binding.value.setMore(false)
							)
						}, 0)
					}
				}
			},
			methods: {
				getScreenHeight() {
					var self = this;
					window.addEventListener("resize", function() {
						self.screenHeight = window.screen.height;
					})
				},
				setMore(bool) {
					this.more = bool
				},
				getNewstNews() {
					this.loading = true
					var self = this;
					$.ajax({
						type: 'GET',
						url: 'http://localhost:81/vue-news/vue/newsts.php',
						dataType: 'jsonp',
						jsonpCallback: 'GET_NEWST',
						success: function(data) {
							console.log(data)
							self.newsts = self.newsts.concat(data.list)
							self.loading = false
						}
					})
				}
			}
	}
</script>

<style lang="css">
	.demo-infinite-container {
		width: 100%;
		/*height: 300px;*/
		overflow: auto;
		-webkit-overflow-scrolling: touch;
		/*border: 1px solid #d9d9d9;*/
	}
	
	.load-more {
		margin: 0px;
		text-align: center;
		min-height: 48px;
		display: block;
		padding: 16px;
		color: rgba(0, 0, 0, .87);
		position: relative;
	}
	
	.mu-list {
		padding: 0px;
	}
	
	.mu-item-left {
		left: 5px;
		width: 62px;
	}
	
	.mu-avatar img {
		border-radius: 0;
	}
	
	.mu-avatar {
		width: 62px;
		height: 50px;
		margin-top: 10px
	}
</style>