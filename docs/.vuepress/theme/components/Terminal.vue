<template>
	<div class="shadow-2xl border rounded">
		<!-- Title Bar -->
		<div class="py-2 border-b">
			<!-- Buttons -->
			<div class="float-left pl-2 absolute">
				<span class="custRound bg-yellow-500 hover:bg-yellow-600"></span>
				<span class="custRound bg-green-500 hover:bg-green-600"></span>
				<span class="custRound bg-red-500 hover:bg-red-600"></span>
			</div>
			<!-- Title -->
			<div class="center"><pre class="text-center text-sm">bash</pre></div>
		</div>
		<!-- Terminal Window -->
		<div class="bg-black text-white py-2 px-2 font-mono rounded-b flex h-24">
			<!-- Terminal Command -->
			hiven@hiven.js ~ % <pre> yarn install hivenjs </pre><b>_</b>
		</div>
	</div>
</template>
<script>
export default {
	name: 'Terminal'
}
</script>
<style scoped>
.custRound{
	@apply inline-block w-4 h-4 rounded-full mx-1;
}
</style>