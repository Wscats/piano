<template>
	<mu-appbar :title="title" class="header_fixed">
		<mu-icon-button icon='menu' slot="left" @click="leftMenu()" />
		<mu-icon-button icon='expand_more' slot="right" />
	</mu-appbar>
</template>
<script>
	export default {
		replace: false,
		data() {
			return {
			}
		},
		computed:{
			title(){
				return this.$store.state.title
			}
		},
		methods: {
			leftMenu(){
				//通知vuex让menu栏打开
				this.$store.commit('set_is_open_menu',true)
			}
		},
		components: {},
		mounted() {},
		directives: {

		}
	}
</script>
<style scoped>
	.header_fixed{
		position: fixed;
	}
</style>