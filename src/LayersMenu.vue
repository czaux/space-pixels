<template>
  <div id="layers-menu">
    <div class="layers-parent-container-container">

      <div class="layers-parent-container">
        <draggable id="layers-container" :list="layers"  @sort="onSort" :options="{handle: '.handle'}">
              <div class="layer-container" :class="{highlighted: item.highlight}" v-for="(item, index) in layers" >
                  <div class="layers-layer-left-contain handle">
                    <div class="layers-layer-number">{{layers.indexOf(item)}}</div>
                    <div class="blah">
                      <ul class="layers-layer-vrect-container">
                        <li class="v-rect"></li>
                        <li class="v-rect"></li>
                        <li class="v-rect"></li>
                        <li class="v-rect"></li>
                        <li class="v-rect"></li>
                        <li class="v-rect"></li>
                        <li class="v-rect"></li>
                      </ul>
                    </div>
                  <div class="layers-layer-number" style="visibility:hidden;"><span>9</span></div>
                </div>

                <div class="layer-controls" @click.self="setLayerHighlight(item, true)">
                    <div class="layer-img-contain">
                      <img class="layer-img-display" :src="item.url" />
                    </div>

                    <div class="layer-showhide" @click="" :class="{'layer-visible': item.visible, 'layer-invisible': !item.visible}" @click="showHideLayer(item)">
                      <i class="fa fa-eye visible-show" v-show="item.visible === true" aria-hidden="true"></i>
                      <i class="fa fa-eye-slash visible-hidden" v-show="item.visible === false" aria-hidden="true"></i>
                    </div>
                    <div class="layer-delete" @click="removeLayer(item)">
                      <i class="fa fa-trash" aria-hidden="true"></i>
                    </div>
                </div>
              </div>
          </draggable>
      </div>
    <select v-model="selected">
      <option>Dither</option>
      <option>Dither Serpentine</option>
      <option>Just Quantize</option>
    </select>
      <div class="layer-options">
        <range-slider
        class="slider"
        min="-255"
        max="255"
        step="10"
        v-model="brightnessValue">
      </range-slider>
        <range-slider
        class="slider"
        min="-255"
        max="255"
        step="10"
        v-model="contrastValue">
      </range-slider>
        <range-slider
        class="slider"
        min="-255"
        max="255"
        step="10"
        v-model="whiteValueThres">
      </range-slider>
        <range-slider
        class="slider"
        min="-255"
        max="255"
        step="10"
        v-model="whiteValueDist">
      </range-slider>
      </div>

    </div>
  </div>
</template>


<script>

  import Draggable from 'vuedraggable';
  import RangeSlider from 'vue-range-slider';
  import { mapMutations, mapGetters, mapActions } from 'vuex'

  let filteres = fabric.Image.filters;

  export default {
    name: "LayersMenu",
    //el: ".layers-parent-container-container",
    data () {
      return {
        brightnessValue: 100,
        contrastValue: 0,
        whiteValueThres: 0,
        whiteValueDist: 0
      }
    },
    components: {
      'draggable': Draggable,
      'range-slider': RangeSlider
    },
    methods: {
      ...mapMutations( {
        add: "asdf"
      }),
      add: function(object) {
        this.$store.commit('addToLayers', { object });
        this.$store.commit('updateImageOrder');
      },
      remove: function(object) {
        this.$store.commit('removeFromLayers', { object });
        this.$store.commit('updateImageOrder');
      },
      onSort: function(evt) {
        this.$store.commit('updateImageOrder');
      },
      removeLayer: function(item) {
        //Canvas remove event will take it out of our layers for us
        canvas.remove(item.object);
      },
      showHideLayer: function(item) {
        //Inverse visibility and clear selection, force re-render
        item.object.visible = !item.object.visible;
        item.visible = item.object.visible;
        item.highlight = false;
        canvas.deactivateAll().renderAll();
      },
      setLayerHighlight: function(item, dohighlight) {
        if(item.visible) {
          item.highlight = dohighlight;
          canvas.setActiveObject(item.object);
        }
      }
    }
  }


</script>


<style>

</style>