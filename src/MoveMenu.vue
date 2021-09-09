<template>
  <div class="layers-menu-parent-container">
    <div class="layers-menu-container">
      <div class="layers-menu-topmove">
        <ul class="layers-menu-rect-container">
          <li class="rect"></li>
          <li class="rect"></li>
          <li class="rect"></li>
          <li class="rect"></li>
          <li class="rect"></li>
          <li class="rect"></li>
          <li class="rect"></li>
          <li class="rect"></li>
          <li class="rect"></li>
          <li class="rect"></li>
        </ul>
      </div>
      <div class="tabs-container">
        <section class="tabcontains">
          <input id="tab-one" type="radio" name="grp" checked="checked">
          <label for="tab-one"><i class="fa fa-files-o" aria-hidden="true"></i> Layers</label>
          <div class="intab">
            <LayersMenu></LayersMenu>
          </div>
          <input id="tab-two" type="radio" name="grp">
          <label for="tab-two"><i class="fa fa-th-large" aria-hidden="true"></i> Screens</label>
          <div class="intab">
            <LCDMenu></LCDMenu>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapActions } from 'vuex';
  import LayersMenu from './LayersMenu';
  import LCDMenu from './LCDMenu';

  export default {
    name: "MoveMenu",
    //components: { LayersMenu }
    components: { LayersMenu, LCDMenu }
  }

</script>

<style>


</style>