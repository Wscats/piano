<template>
	<mu-text-field icon="search" class="appbar-search-field" slot="right" hintText="请输入搜索内容" v-model="searchName" @keyup="search()" />
</template>
<script>
	export default {
		replace: false,
		data() {
			return {
				searchName: "wscat"
			}
		},
		computed: {
			token() {
				return this.$store.state.token;
			}
		},
		methods: {
			search() {
				var self = this;
				$.ajax({
					url: "http://lolapi.games-cube.com/UserArea?keyword=" + this.searchName,
					type: "GET",
					headers: {
						"DAIWAN-API-TOKEN": self.token
					},
					success: function(data) {
						console.log(JSON.stringify(data));
					}
				});
			}
		},
		mounted() {
			this.search()
		}
	}
</script>
<style scoped>

</style>