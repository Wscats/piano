<template>
	<mu-paper class="bottom_fixed">
		<mu-bottom-nav :value="bottomNav" @change="handleChange">
			<mu-bottom-nav-item href="#/index/news/1" value="资讯" title="资讯" icon="restore" />
			<mu-bottom-nav-item href="#/index/players/2" value="玩家" title="玩家" icon="favorite" />
			<mu-bottom-nav-item href="#/index/heros/3" value="英雄" title="英雄" icon="location_on" />
		</mu-bottom-nav>
	</mu-paper>
</template>

<script>
	export default {
		data() {
				return {
					bottomNav: '资讯'
				}
			},
			created() {
				var id = this.$route.params.id
				switch(id) {
					case '1':
						this.bottomNav = '资讯'
						break
					case '2':
						this.bottomNav = '玩家'
						break
					case '3':
						this.bottomNav = '英雄'
						break
				}
				this.$store.commit('set_title', this.bottomNav)
			},
			methods: {
				handleChange(val) {
					this.bottomNav = val
					this.$store.commit('set_title', val)
				}
			}
	}
</script>
<style scoped>
	.bottom_fixed {
		position: fixed;
		bottom: 0;
		width: 100%;
	}
</style>