<template>
	<article class="weui-article">
		<h1>{{detail.title}}</h1>
		<section>
			<h2 class="title">{{detail.channel_name}}</h2>
			<section>
				<h3>{{detail.id}}</h3>
				<p>
					{{detail.text}}
				</p>
				<p>
					<img src="" alt="">
					<img src="" alt="">
				</p>
			</section>
			<section>
				<h3>{{detail.title}}</h3>
				<p>
					{{detail.text}}
				</p>
			</section>
		</section>
	</article>
</template>
<script>
	export default {
		data() {
				return {
					detail:[]
				}
			},
			methods: {
				getDetail(callback) {
					$.ajax({
						type: "get",
						//url: "http://localhost:81/news/php/index.php/news_api/show_detail",
						url: "./api/detail.json",
						data: {
							//获取路由的参数
							id: this.$route.params.id
						},
						async: true,
						success: function(data) {
							callback(data)
							//callback(JSON.parse(data))
						}
					});
				}
			},
			mounted() {
				var self = this;
				this.getDetail(function(data){
					console.log(data)
					self.detail = data.news_list[0];
				});
			}
	}
</script>