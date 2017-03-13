<template>
	<div>
		<wswiper></wswiper>
		<wpannel :channel="channel"></wpannel>
	</div>
</template>
<script>
	import wswiper from "../wswiper.vue";
	import wpannel from "../wpannel.vue";
	export default {
		replace: false,
		data() {
			return {
				channel:this.$route.params.id
			}
		},
		methods: {
		},
		components: {
			'wswiper': wswiper,
			'wpannel': wpannel
		},
		mounted() {
		},
		directives: {}
	}
</script>