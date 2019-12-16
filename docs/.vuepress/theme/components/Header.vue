<template>
	<div>
		<header class="lg:px-16 px-6 bg-white flex flex-wrap items-center lg:py-0 container mx-auto">
			<div class="flex-1 flex justify-between items-center">
				<a href="/">
					<!-- logo -->
					<span>Hiven.Js</span>
				</a>
			</div>
			<label for="menu-toggle" class="pointer-cursor lg:hidden block"><svg class="fill-current text-gray-900" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><title>menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path></svg></label>
			<input class="hidden" type="checkbox" id="menu-toggle" />
			<div class="hidden lg:flex lg:items-center lg:w-auto w-full" id="menu">
				<nav>
				<ul class="lg:flex items-center justify-between text-base text-gray-700 pt-4 lg:pt-0">
					<!-- <li><router-link class="lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-red-600" to="/features">Features</router-link></li> -->
					<li><a class="lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-red-600" href="/docs">Documentation</a></li>
					<!-- <li><router-link class="lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-red-600" to="/reference">Reference</router-link></li> -->
					<li><a class="lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-red-600 lg:mb-0 mb-2" href="https://github.com/pulse-framework">Github</a></li>
				</ul>
				</nav>
			</div>
		</header>
	</div>
</template>

<style scoped>
.logo {
	padding-top: 6px;
	width: 32px;
}
</style>

<script>
export default {
	name: 'Header',

}
</script>