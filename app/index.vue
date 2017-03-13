<template>
	<div>
		<wheader></wheader>
		<router-view></router-view>
		<wfooter></wfooter>
		<wpopup></wpopup>
	</div>
</template>
<script>
	//import wheader from "./wheader.vue";
	var wheader = require("./wheader.vue")
	//import wsearch from "./wsearch.vue";
	var wsearch = require("./wsearch.vue")
	var wfooter = require("./wfooter.vue")
	import wpopup from "./wpopup.vue"
	export default {
		replace: false,
		data() {
			return {
			}
		},
		methods: {
		},
		components: {
			'wheader': wheader,
			'wsearch': wsearch,
			'wfooter': wfooter,
			'wpopup': wpopup
		},
		mounted() {
		},
		directives: {

		}
	}
</script>
<style scoped>
</style>