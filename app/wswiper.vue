<template>
	<div class="swiper-container have_header">
		<swiper :options="swiperOption">
			<swiper-slide v-for="swiper in swipers">
				<a :href="swiper.article_url" style="height: 200px;"><img :src="swiper.image_url_big" class="banner-item" alt="" height="20%" width="100%"></a>
			</swiper-slide>
			<div class="swiper-pagination" slot="pagination"></div>
		</swiper>
		<div class="swiper-pagination"></div>
	</div>
</template>
<script>
	//import 'swiper';
	//require("swiper")
	//import '../node_modules/swiper/dist/css/swiper.css'
	//require("../node_modules/swiper/dist/css/swiper.css")
	export default {
		data() {
				return {
					swipers: [],
					swiperOption: {
						pagination: '.swiper-pagination',
						paginationClickable: true,
						autoplay: 3000
					},
				}
			},
			methods: {
				getNavigation() {
					var self = this
					$.ajax({
						type: "GET",
						url: "http://localhost:81/vue-news/vue/navigation.php",
						async: true,
						dataType: 'jsonp',
						jsonpCallback: 'GET_NAVIGATION',
						success: function(data) {
							console.log(data.list);
							self.swipers = data.list;
						}
					});
				}
			},
			directives: {
				swiper: {
					inserted() {
						//console.log(swiper)
						var swiper = new Swiper('.swiper-container', {
							pagination: '.swiper-pagination',
							paginationClickable: true
						});
					}
				}
			},
			mounted() {
				this.getNavigation();
			}
	}
</script>
<style>
	.swiper-container {
		width: 100%;
		height: 100%;
	}
	
	.swiper-slide {
		text-align: center;
		font-size: 18px;
		background: #fff;
		/* Center slide text vertically */
		display: -webkit-box;
		display: -ms-flexbox;
		display: -webkit-flex;
		display: flex;
		-webkit-box-pack: center;
		-ms-flex-pack: center;
		-webkit-justify-content: center;
		justify-content: center;
		-webkit-box-align: center;
		-ms-flex-align: center;
		-webkit-align-items: center;
		align-items: center;
	}
	
	.swiper-slide img {
		width: 100%;
		height: 200px;
	}
	
	.have_header {
		padding-top: 56px;
	}
</style>