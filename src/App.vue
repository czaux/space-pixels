<template>
  <div id="app">
    <h1>Shopping Cart Example</h1>
    <hr>
    <h2>Products</h2>
    <product-list></product-list>
    <hr>
    <cart></cart>
  </div>
</template>

<script>
import LayersMenu from './LayersMenu.vue'
import LCDMenu from './LCDMenu.vue'
import OutputMenu from './OutputMenu.vue'

export default {
  components: { LayersMenu, LCDMenu, OutputMenu }
}
</script>