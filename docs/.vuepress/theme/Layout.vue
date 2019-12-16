<template>
    <div class="container mx-auto border shadow-md">
        <Header class="border-b shadow" />
        <Terminal class="mt-10 mx-20"/>
        <Content class="p-6" />
        <Footer class="border-t" />
    </div>
</template>
<script>
import Header from '@theme/components/Header'
import Footer from '@theme/components/Footer'
import Terminal from '@theme/components/Terminal'
export default {
    components: {
        Header,
        Footer,
        Terminal
    }
}
</script>
