<template>
	<div>
		<!--<wswiper></wswiper>-->
		<!--<wpannel :channel="channel"></wpannel>-->
		
		<wsearch style="position: fixed; top: 56px;"></wsearch>
	</div>
</template>
<script>
	//import wswiper from "../wswiper.vue";
	//import wpannel from "../wpannel.vue";
	import wsearch from "../wsearch.vue";
	export default {
		replace: false,
		data() {
			return {
				channel: this.$route.params.id
			}
		},
		methods: {},
		components: {
			/*'wswiper': wswiper,
			'wpannel': wpannel,*/
			wsearch: wsearch
		},
		mounted() {},
		directives: {}
	}
</script>