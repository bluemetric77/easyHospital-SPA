<template>
  <q-page class="page-app">
    <q-card v-show="!isInfo" square class="icard q-mb-sm">
      <q-bar class="entry-caption">
        <span><strong>Pool</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-center q-col-gutter-sm">
          <div class="col-xs-12 col-sm-3 col-md-2">
            <q-select v-model="pool_code" :options="pools_all" outlined dense options-dense label="Pool kendaraan"
              option-value="pool_code" option-label="pool_name" emit-value map-options fill-input stack-label square
              @update:model-value="refresh_page()" />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-3">
            <q-select v-model="vehicle_type" :options="vehicle_types" outlined dense options-dense
              label="Jenis kendaraan/unit" option-value="main_group" option-label="main_group" emit-value map-options
              fill-input stack-label square @update:model-value="refresh_page()" />
          </div>
          <div class="col-xs-12 offset-sm-4 col-sm-2 offset-md-5 col-md-2">
            <q-btn-toggle v-model="all" color="blue-grey-14" text-color="white" toggle-color="orange"
              toggle-text-color="primary" unelevated glossy no-caps spread :options="[
                {label: 'Semua', value: '1'},
                {label: 'Sedang Kegiatan', value: '0'}
              ]" @click="refresh_page()" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top">
      <q-toolbar class="main-toolbar">
        <q-space />
        <q-btn label="Kembali" icon="far fa-arrow-alt-circle-left" flat no-caps rounded :to="{ name:
        'monitoring-unit', force: true }" />
      </q-toolbar>
    </q-page-sticky>

    <q-card class="icard" square>
      <q-bar class="entry-caption">
        Monitoring Unit
      </q-bar>
      <q-card-section class="q-pa-xs">
        <div class="row items-star q-col-gutter-xs">
          <div class="col-xs-12 col-sm-8">
            <!-- <q-fab id="menu" v-model="fab1" label="View" color="purple" icon="keyboard_arrow_down" direction="down"
              dense>
              <q-fab-action color="secondary" @click="setView('satellite-11')" label="satellite" />
              <q-fab-action color="secondary" @click="setView('light-v10')" label="light" />
              <q-fab-action color="secondary" @click="setView('dark-v10')" label="dark" />
              <q-fab-action color="secondary" @click="setView('streets-v11')" label="streets" />
              <q-fab-action color="secondary" @click="setView('outdoors-v11')" label="outdoors" />
            </q-fab> -->
            <div id="map" style="height:100vh;width:100%"></div>
          </div>

          <div class="col-xs-12 col-sm-4">
            <q-tabs v-model="tab" inline-label dense active-color="primary" indicator-color="primary" align="justify"
              narrow-indicator>
              <q-tab name="units" icon="photo" label="Unit" />
              <q-tab name="detail" icon="alarm" label="Detail" />
            </q-tabs>
            <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
              <q-tab-panel name="units">
                <q-card square class="icard">
                  <q-bar class="entry-caption">
                    <span><strong>Daftar Unit</strong></span>
                    <q-space />
                    <q-input v-model="filter" dense outline debounce="300" label-color="white" borderless
                      placeholder="Pencarian" input-class="text-white">
                      <template v-slot:append>
                        <q-icon v-if="filter === ''" name="search" color="white" size="sm" />
                        <q-icon v-else name="clear" class="cursor-mouer" color="white" size="sm" @click="filter = ''" />
                      </template>
                    </q-input>
                  </q-bar>
                  <q-table square :rows="data" :columns="columns" no-data-label="data kosong" :dense="$q.screen.md"
                    no-results-label="data yang kamu cari ttransidak ditemukan" row-key="vehicle_no" :filter="filter"
                    separator="cell" selection="single" v-model:selected="selected" v-model:pagination="pagination"
                    binary-state-sort @request="onRequest" :loading="loading" virtual-scroll style="height: 600px">
                    <template v-slot:loading>
                      <q-inner-loading showing>
                        <q-spinner-ball size="75px" color="red-10" />
                      </q-inner-loading>
                    </template>
                    <template v-slot:no-data="{ icon, message, filter }">
                      <div class="full-wtransidth row flex-top text-accent q-gutter-sm">
                        <q-icon size="2em" name="sentiment_dissatisfied" />
                        <span>{{ message }}</span>
                        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                      </div>
                    </template>
                    <template v-slot:header="props">
                      <q-tr :props="props">
                        <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-green-10 text-white">
                          {{ col.label }}
                        </q-th>
                      </q-tr>
                    </template>
                    <template v-slot:body="props">
                      <q-tr :props="props" @click="props.selected = !props.selected">
                        <q-td v-for="col in props.cols" :key="col.name" :props="props">
                          <div class="grid-data">
                            <div v-if="col.name === 'vehicle_no'">
                              <q-btn glossy :label="props.row.vehicle_no" dense class="bg-green-10 text-white" no-caps
                                rounded @click="show_info(props.row)" />
                            </div>
                            <div v-else-if="col.name === 'state_gps'">
                              <span :class="(props.row.state_gps==='Parking') ? 'q-pa-xs bg-red-10 text-white'
                                                  :(props.row.state_gps==='Driving') ? 'q-pa-xs bg-green-10 text-white'
                                                  :(props.row.state_gps==='Idle') ? 'q-pa-xs bg-yellow-10 text-white'
                              : 'q-pa-xs'">{{props.row.state_gps}}</span>
                            </div>
                            <div v-else-if="col.name === 'gps_last_update'">
                              {{ $INDDateTime(props.row.gps_last_update) }}
                            </div>
                            <div v-else-if="col.name === 'state_gps_datetime'">
                              {{ $INDDateTime(props.row.state_gps_datetime) }}
                            </div>
                            <div v-else-if="col.name === 'speed'">
                              {{ $formatnumber(props.row.speed) }} Kpj
                            </div>
                            <div v-else>
                              {{ col.value }}
                            </div>
                          </div>
                        </q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </q-card>
              </q-tab-panel>
              <q-tab-panel name="detail">
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-6">
                    <q-input v-model="vehicle.vehicle_no" label="No. Unit" dense outlined square stack-label disable />
                  </div>
                  <div class="col-6">
                    <q-input v-model="vehicle.police_no" label="No. Polisi" dense outlined square stack-label disable />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-6">
                    <q-input v-model="vehicle.latitude" label="Latitude" dense outlined square stack-label disable />
                  </div>
                  <div class="col-6">
                    <q-input v-model="vehicle.longitude" label="Longitude" dense outlined square stack-label disable />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-12">
                    <q-input v-model="vehicle.last_address" label="Alamat" dense type="textarea" outlined square
                      stack-label disable input-style="max-height:50px" />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-12">
                    <q-input v-model="vehicle.province" label="Provinsi" dense outlined square stack-label disable />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-6">
                    <q-input v-model="vehicle.district" label="Kabupaten" dense outlined square stack-label disable />
                  </div>
                  <div class="col-6">
                    <q-input v-model="vehicle.sub_district" label="Kecamatan" dense outlined square stack-label
                      disable />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-6">
                    <q-input v-model="vehicle.ignation" label="Status Mesin" dense outlined square stack-label
                      disable />
                  </div>
                  <div class="col-6">
                    <q-input v-model="vehicle.speed" label="Kecepatan (Kpj)" dense outlined square stack-label
                      disable />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-6">
                    <q-input v-model="vehicle.gps_vendor" label="Vendor GPS" dense outlined square stack-label
                      disable />
                  </div>
                  <div class="col-6">
                    <q-input v-model="vehicle.gps_id" label="ID GPS" dense outlined square stack-label disable />
                  </div>
                </div>
                <q-separator />
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-6">
                    <q-input v-model="vehicle.work_order_number" label="Surat Muatan" dense outlined square stack-label
                      disable />
                  </div>
                  <div class="col-6">
                    <q-input v-model="vehicle.work_order_date" label="Tgl.Kegiatan" dense type="date" outlined square
                      stack-label disable />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-sm q-mb-sm">
                  <div class="col-12">
                    <q-input v-model="vehicle.work_order_driver_name" label="Pengemudi" dense outlined square
                      stack-label disable />
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerIos } from "quasar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default defineComponent({
  name: "MonitoringUnit",
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();


    const vehicle_no=ref("");
    const pools_all=ref([]);
    const all=ref('0');
    const pool_code=ref('ALL');

    const loading = ref(false);
    const filter = ref("");
    const pagination = ref({
      sortBy: "vehicle_no",
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20,
    });
    const data = ref([]);
    const selected = ref([]);
    const columns = ref([
      { name: 'vehicle_no', align: 'left', label: 'Unit', field: 'vehicle_no', sortable: true },
      { name: 'police_no', align: 'left', label: 'No.Polisi', field: 'police_no', sortable: true },
      { name: 'state_gps', align: 'left', label: 'Status', field: 'state_gps', sortable: true },
      { name: 'minutes_text', align: 'left', label: 'Lama', field: 'minutes_text' },
      { name: 'speed', align: 'right', label: 'Kecepatan', field: 'speed', sortable: true},
      { name: 'state_gps_datetime', align: 'left', label: 'Mulai', field: 'state_gps_datetime' },
      { name: 'gps_id', align: 'left', label: 'GPS ID', field: 'gps_id', sortable: true },
      { name: 'gps_vendor', align: 'left', label: 'Vendor GPS', field: 'gps_vendor', sortable: true },
      { name: 'gps_last_update', align: 'left', label: 'GPS Update', field: 'gps_last_update', sortable: true },
    ]);

    const layerview = ref("streets-v11");
    const tab=ref("units");
    const vehicle=ref({});
    const coordinates=ref([]);
    const flatitude=ref('');
    const flongitude=ref('');
    const vehicle_type=ref('ALL');
    const vehicle_types=ref([]);

    async function refresh_page () {
      selected.value=[];
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    }

    async function loaddata () {
      selected.value = [];
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    }

    async function onRequest (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination;
      let filter = props.filter;

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage;
      loading.value = true;
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          pool_code: pool_code.value,
          all: all.value,
          vehicle_type: vehicle_type.value,
          gps_only:'1',
          url: 'operation/monitoring-unit'
        };
        let respon = await $store.dispatch("master/GET_DATA", props);
        data.value = respon.data;
        pagination.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending,
        };
      } catch (error) {
      } finally {
        loading.value = false;
      }
    }

    onMounted(async () => {
      let props = {};
      props.url = "master/operational/pool/list";
      props.all='1';
      $store.dispatch("master/GET_DATA", props).then((response) => {
        pools_all.value = response;
      });

      props={}
      props.url = "master/operational/vehicle-group/main/list";
      vehicle_types.value=[];
      $store.dispatch("master/GET_DATA", props).then((response) => {
        vehicle_types.value.push({main_group:'ALL'})
        response.forEach(el=>{
          vehicle_types.value.push(el) 
        })
      });

      mapboxgl.accessToken =
        "pk.eyJ1IjoiYmx1ZW1ldHJpYyIsImEiOiJjbDVqZHpvaXEwNG5pM2tsaTY1djl4Zmx6In0.vSS5qhGseQOUVvnuRi-8MQ";
      const map= new mapboxgl.Map({
        container: "map",
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [106.816666, -6.200000], // starting position [lng, lat]
        zoom: 12
      });
      map.addControl(new mapboxgl.NavigationControl());
      loaddata();
    });

    function show_info(row){
      vehicle_no.value=row.vehicle_no
      coordinates.value=[]
      const map = new mapboxgl.Map({
        container: "map",
        style: 'mapbox://styles/mapbox/' + layerview.value,
        center: [row.longitude, row.latitude], // starting position [lng, lat]
        zoom: 12
      });
      map.addControl(new mapboxgl.NavigationControl());
      const size = 100;
      let props = {};
      tab.value="detail";
      // This implements `StyleImageInterface`
      // to draw a pulsing dot icon on the map.
      const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // When the layer is added to the map,
        // get the rendering context for the map canvas.
        onAdd: function () {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d');
        },

        // Call once before every frame where the icon will be used.
        render: function () {
          const duration = 1000;
          const t = (performance.now() % duration) / duration;

          const radius = (size / 2) * 0.3;
          const outerRadius = (size / 2) * 0.7 * t + radius;
          const context = this.context;

          // Draw the outer circle.
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
          );
          context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
          context.fill();

          // Draw the inner circle.
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
          );
          context.fillStyle = 'rgba(255, 100, 100, 1)';
          context.strokeStyle = 'white';
          context.lineWidth = 2 + 4 * (1 - t);
          context.fill();
          context.stroke();

          // Update this image's data with data from the canvas.
          this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
          ).data;

          // Continuously repaint the map, resulting
          // in the smooth animation of the dot.
          map.triggerRepaint();

          // Return `true` to let the map know that the image was updated.
          return true;
        }
      };
      map.on('load', async () => {
        map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

        map.addSource('dot-point', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [row.longitude, row.latitude] 
                }
              }
            ]
          }
        });

        map.addLayer({
          'id': 'layer-with-pulsing-dot',
          'type': 'symbol',
          'source': 'dot-point',
          'layout': {
            'icon-image': 'pulsing-dot',
            'text-field':row.vehicle_no+'-'+row.police_no,
            'text-size':11
          }
        });

        map.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'LineString',
              'coordinates': []
            }
          }
        });
        map.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#1726F7',
            'line-width': 4
          }
        });        

        // Update the source from the API every 2 seconds.
        const updateSource = setInterval(async () => {
          const geojson = await getLocation(updateSource);
          map.getSource('dot-point').setData(geojson);
          const georoute= {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'LineString',
              'coordinates': coordinates.value
            }
          };
          map.getSource('route').setData(georoute);
        }, 10000);

        async function getLocation (updateSource) {
          // Make a GET request to the API and return the location of the ISS.
          try {
            const response = await fetch(
              'https://app.dutamediamandiri.com/v1/api/operation/gps_update?vehicle_no='+vehicle_no.value,
              { method: 'GET' }
            );
            const json = await response.json();
            const { latitude, longitude} = json.contents.data;
            vehicle.value = json.contents.data;

            //Create line data
            if ((!(flatitude.value === latitude)) || (!(flongitude.value === longitude))) {
              const coordinate = [longitude, latitude]
              coordinates.value.push(coordinate)
            }
            flatitude.value= latitude;
            flongitude.value=longitude

            // Fly the map to the location.
            map.flyTo({
              center: [longitude, latitude],
              speed: 0.5
            });

            // Return the location of the ISS as GeoJSON.
            return {
              'type': 'FeatureCollection',
              'features': [
                {
                  'type': 'Feature',
                  'geometry': {
                    'type': 'Point',
                    'coordinates': [longitude, latitude]
                  }
                }
              ]
            };
          } catch (err) {
            // If the updateSource interval is defined, clear the interval to stop updating the source.
            if (updateSource) clearInterval(updateSource);
            throw new Error(err);
          }
        }
      });      
    }

    return {
      vehicle_no,
      pool_code,
      all,
      pools_all,
      show_info,
      refresh_page,
      loading,
      filter,
      pagination,
      data,
      selected,
      columns,
      onRequest,
      loaddata,
      layerview,
      tab,
      vehicle,
      coordinates,
      flatitude,
      flongitude,
      vehicle_type,
      vehicle_types
    };
  },
});
</script>
<style>

  #menu {
  position: absolute;
  background: #efefef;
  padding: 10px;
  font-family: 'Open Sans', sans-serif;
  }
</style>