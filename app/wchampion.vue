<template>
	<div class="gridlist-demo-container">
		<mu-grid-list class="gridlist-demo">
			<mu-sub-header>英雄列表</mu-sub-header>
			<mu-grid-tile v-for="tile in list" style="width:25%;height:76px">
				<img :src="'http://cdn.tgp.qq.com/pallas/images/champions_id/'+tile.id+'.png'" />
				<span slot="title">{{tile.title}}</span>
				<!--<span slot="subTitle">by <b>{{tile.author}}</b></span>-->
				<!--<mu-icon-button icon="star_border" slot="action" />-->
			</mu-grid-tile>
		</mu-grid-list>
	</div>
</template>
<script>
	export default {
			data() {
				return {
					list: []
				}
			},
			computed: {
				token() {
					return this.$store.state.token;
				}
			},
			methods: {
				getChampionList() {
					var self = this;
					$.ajax({
						url: "http://lolapi.games-cube.com/champion",
						type: "GET",
						headers: {
							"DAIWAN-API-TOKEN": self.token
						},
						success: function(data) {
							console.log(data);
							self.list = data.data
						}
					});
				}
			},
			mounted() {
				this.getChampionList()
			}
	}
</script>
<style>
	.gridlist-demo-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}
	
	.gridlist-demo {
		width: 500px;
		height: 100%;
		padding-top: 56px;
		padding-bottom: 56px;
		overflow-y: auto;
	}
	
	.mu-grid-tile-titlebar {
		height: 15px;
	}
	
	.mu-grid-tile-title {
		font-size: 8px;
	}
</style>