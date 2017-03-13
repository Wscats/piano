<template>
	<mu-card>
		<!--<mu-card-header title="Myron Avatar" subTitle="sub title">
			<mu-avatar :src="img" slot="avatar" />
		</mu-card-header>-->
		<mu-card-media title="hero.title" :subTitle="hero.name">
			<!--<img :src="'http://cdn.tgp.qq.com/pallas/images/skins/original/'+hero.image" />-->
		</mu-card-media>
		<mu-tabs :value="activeTab" @change="handleTabChange">
			<mu-tab value="tab1" title="TAB ONE" />
			<mu-tab value="tab2" title="TAB TWO" />
			<!--<mu-tab value="tab3" @active="handleActive" title="TAB ACTIVE" />-->
		</mu-tabs>
		<mu-card-title title="Content Title" subTitle="Content Title" />
		<mu-card-text>
			散落在指尖的阳光，我试着轻轻抓住光影的踪迹，它却在眉宇间投下一片淡淡的阴影。 调皮的阳光掀动了四月的心帘，温暖如约的歌声渐起。 似乎在诉说着，我也可以在漆黑的角落里，找到阴影背后的阳光， 找到阳光与阴影奏出和谐的旋律。我要用一颗敏感赤诚的心迎接每一缕滑过指尖的阳光！
		</mu-card-text>
		<mu-card-actions>
			<mu-flat-button label="Action 1" />
			<mu-flat-button label="Action 2" />
		</mu-card-actions>
		<div>
			<div v-if="activeTab === 'tab1'">
				<h2>Tab One</h2>
				<p>
					这是第一个 tab
				</p>
			</div>
			<div v-if="activeTab === 'tab2'">
				<h2>Tab Two</h2>
				<p>
					这是第二个 tab
				</p>
			</div>
			<div v-if="activeTab === 'tab3'">
				<h2>Tab Three</h2>
				<p>
					这是第三个 tab
				</p>
			</div>
		</div>
		<mu-list>
			<mu-sub-header>今天</mu-sub-header>
			<mu-list-item :title="passive.name">
				<mu-avatar :src="'http://ossweb-img.qq.com/images/lol/img/passive/'+passive.image" slot="leftAvatar" />
				<p slot="describe">
					<span style="color: rgba(0, 0, 0, .87)">{{passive.description}}</span>
				</p>
			</mu-list-item>
			<mu-divider inset/>
		</mu-list>
	</mu-card>
</template>

<script>
	import img from '../public/wscats.jpg'
	export default {
		data() {
				return {
					img: img,
					activeTab: 'tab1',
					hero: [],
					passive: {},
				}
			},
			computed: {
				token() {
					return this.$store.state.token;
				}
			},
			methods: {
				getDetail() {
					var self = this;
					$.ajax({
						url: "http://lolapi.games-cube.com/GetChampionDetail?champion_id=1",
						type: "GET",
						headers: {
							"DAIWAN-API-TOKEN": self.token
						},
						success: function(data) {
							console.log(data);
							self.hero = data.data[0];
							//被动图片
							self.passive = {
								image: data.data[0].passive.image.full,
								description: data.data[0].passive.description,
								name: data.data[0].passive.name
							}
						}
					});
				},
				handleTabChange(val) {
					this.activeTab = val
				},
				handleActive() {
					window.alert('tab active')
				}
			},
			mounted() {
				this.getDetail()
			}
	}
</script>

<style lang="css">

</style>