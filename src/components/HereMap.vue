
<template>
  <!--In the following div the HERE Map will render-->
  <div
    id="mapContainer"
    ref="hereMap"
    class="q-ma-md"
    style="height:600px;width:100%"
  />
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerIos } from "quasar";

export default defineComponent({
  name: 'HereMap',
  props: { zoomlevel: { type: Object, default: null }, center: { type: Object, default: null } },
  setup () {
      const platform=ref(null);
      const apikey=ref('HtScxoHQSRVjL_t0r-i31CpHE013ZDWbswcsUiVzlh8');
      const map=ref(null);
      const hereMap=ref(null);

      onMounted(async () => {
        const platform = new window.H.service.Platform({
          apikey:apikey.value
        });
        platform.value = platform
        initializeHereMap()
      });

      function initializeHereMap () { // rendering map
        if (typeof (center.value) === 'undefined') {
          center.value = {
            lat: -6.213690,
            lng: 106.682660
          }
        }
        if (zoomlevel.value === null) {
          zoomlevel.value = 14
        }
        const mapContainer = hereMap
        var H = window.H
        var defaultLayers = platform.value.createDefaultLayers()
        this.map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
          zoom: this.zoomlevel,
          center: this.center,
          pixelRatio: window.devicePixelRatio || 1
        })
        this.map.addObject(new H.map.Marker({ lat: this.center.lat, lng: this.center.lng }))
        H.addEventListener('resize', () => this.map.getViewPort().resize())
        // Add map events functionality to the map
        var mapEvents = new H.mapevents.MapEvents(this.map)
        H.mapevents.Behavior(mapEvents)
        // H.mapevents.Behavior(new H.mapevents.MapEvents(this.map))

        var ui = H.ui.UI.createDefault(this.map, defaultLayers)

        var mapSettings = ui.getControl('mapsettings')
        var zoom = ui.getControl('zoom')
        var scalebar = ui.getControl('scalebar')

        mapSettings.setAlignment('top-left')
        zoom.setAlignment('top-left')
        scalebar.setAlignment('top-left')
      }
      return{
        platform,
        apikey,
        map,
        hereMap,
        initializeHereMap  
      };
  },
});
</script>

<style lang="sass" scoped>
#map
  width: 100%
  min-width: 360px
  text-align: center
  margin: 5% auto
  background-color: #ccc
</style>
