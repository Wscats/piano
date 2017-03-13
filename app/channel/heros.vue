<template>
	<wchampion></wchampion>
</template>
<script>
	import wchampion from "../wchampion.vue"
	export default {
		replace: false,
		data() {
			return {
				channel: this.$route.params.id
			}
		},
		methods: {
		},
		components: {
			wchampion: wchampion
		},
		mounted() {
		},
		directives: {}
	}
</script>