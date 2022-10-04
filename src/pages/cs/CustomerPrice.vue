<template>
  <q-page class="page-app">
    <!--<q-card v-show="!stateform" square class="icard q-mb-sm">
      <q-bar class="entry-caption">
        <span><strong>Konsumen</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-start q-col-gutter-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-input v-model="partner_name" dense outlined square placeholder="Klik tombol untuk mencari nama konsumen">
              <template v-slot:append>
                <q-icon name="search" color="blue-grey-10" size="xs" @click="open_customer()" />
              </template>
            </q-input>
          </div>
          <div class="col-xs-12 offset-sm-4 col-sm-2 offset-md-6 col-md-2">
            <q-btn-toggle v-model="price_type" color="blue-grey-14" text-color="white" toggle-color="orange"
              toggle-text-color="primary" unelevated dense glossy no-caps spread :options="[
                {label: 'Semua', value: '0'},
                {label: 'Yang Berlaku', value: '1'}
              ]" @click="loaddata()" />
          </div>
        </div>
      </q-card-section>
    </q-card> -->

    <q-card v-show="!stateform" square class="icard">
      <q-bar class="entry-caption">
        <span class="q-mr-md"><strong>{{ pagetitle }}</strong>
        </span>
        <q-space />
        <q-input v-model="filter" dense outline debounce="300" label-color="white" borderless placeholder="Pencarian"
          input-class="text-white">
          <template v-slot:append>
            <q-icon v-if="filter === ''" name="search" color="white" size="sm" />
            <q-icon v-else name="clear" class="cursor-mouer" color="white" size="sm" @click="filter = ''" />
          </template>
        </q-input>
      </q-bar>
      <q-table square :rows="data" :columns="columns" no-data-label="data kosong" :dense="$q.screen.md"
        no-results-label="data yang kamu cari tidak ditemukan" row-key="id" :filter="filter" separator="cell"
        selection="single" v-model:selected="selected" v-model:pagination="pagination" binary-state-sort
        @request="onRequest" :loading="loading" virtual-scroll>
        <template v-slot:loading>
          <q-inner-loading showing>
            <q-spinner-ball size="75px" color="red-10" />
          </q-inner-loading>
        </template>
        <template v-slot:no-data="{ icon, message, filter }">
          <div class="full-width row flex-top text-accent q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ message }}</span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" @click="props.selected = !props.selected">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div class="grid-data">
                <div v-if="col.name === 'action'">
                  <q-icon v-for="(btn, index) in btns" v-show="btn.is_allowed && btn.is_show" :key="index" no-caps flat
                    class="q-mr-sm" :name="btn.icon" size="xs" color="green-10"
                    @click="runMethod(btn.onclick, props.row.id)">
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="(col.name === 'origins' || (col.name==='destinations'))">
                  <span
                    :class="(props.row.is_active==='0') ? 'bg-red-10 text-white q-pa-xs' :'q-pa-xs'">{{col.value}}</span>
                </div>
                <div v-else-if="col.name === 'standart_price'">
                  {{ $formatnumber(props.row.standart_price) }}
                </div>
                <div v-else-if="col.name === 'other_fee'">
                  {{ $formatnumber(props.row.other_fee) }}
                </div>
                <div v-else-if="col.name === 'fleet_price'">
                  {{ $formatnumber(props.row.fleet_price) }}
                </div>
                <div v-else-if="col.name === 'standart_cost'">
                  {{ $formatnumber(props.row.standart_cost) }}
                </div>
                <div v-else-if="col.name === 'valid_price'">
                  {{ $INDDate(props.row.update_timestamp) }}
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle v-model="props.row.is_active" dense true-value="1" false-value="0" disable />
                </div>
                <div v-else-if="col.name === 'update_timestamp'">
                  {{ $INDDateTime(props.row.update_timestamp) }}
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

    <!-- Dialog Data Location-->
    <q-card v-show="stateform" class="icard" square>
      <q-bar class="entry-caption">
        {{ title }}
        <q-space />
      </q-bar>

      <q-card-section class="q-gutter-sm">
        <div class="row items-center q-col-gutter-sm q-mb-xs">
          <div class="col-xs-12 col-sm-4 col-md-3">
            <q-input v-model="edit.partner_name" dense outlined square
              placeholder="Klik tombol untuk mencari nama konsumen">
              <template v-slot:append>
                <q-icon name="search" color="blue-grey-10" size="xs" @click="open_customer()" />
              </template>
            </q-input>
          </div>
          <div class="col-xs-10 col-sm-4 col-md-3">
            <q-select v-model="edit.vehicle_type" :options="vehicle_types" outlined dense options-dense
              label="Jenis kendaraan" option-value="vehicle_type" option-label="vehicle_type_name" emit-value
              map-options fill-input stack-label square />
          </div>
          <div class="col-xs-2 col-sm-2 col-sm-1">
            <q-toggle v-model="edit.is_active" dense true-value="1" false-value="0" label="Aktif" />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-4 col-md-3">
            <q-input v-model="edit.origins" dense outlined square label="Asal" stack-label />
          </div>
          <div class="col-xs-12 col-sm-4 col-md-3">
            <q-input v-model="edit.destinations" dense outlined square label="Tujuan" stack-label />
          </div>
          <div class="col-xs-6 col-sm-2 col-md-1">
            <q-input v-model="edit.distance" dense outlined square label="Jarak (Km)" stack-label />
          </div>
          <div class="col-xs-6 col-sm-2 col-md-1">
            <q-input v-model="edit.eta" dense outlined square label="ETA (Jam)" stack-label />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-field square outlined stack-label dense :model-value="edit.standart_cost" label="Biaya Operasional">
              <template v-slot:control>
                <vue-numeric v-model="edit.standart_cost" class="q-field__input text-right" separator="." :precision="0"
                  disable />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-field square outlined stack-label dense :model-value="edit.standart_price" label="Tarif">
              <template v-slot:control>
                <vue-numeric v-model="edit.standart_price" class="q-field__input text-right" separator="."
                  :precision="0" @input="edit.fleet_price = edit.standart_price +edit.other_fee" />
              </template>
            </q-field>
          </div>
          <div class=" col-xs-6 col-sm-3 col-md-2">
            <q-field square outlined stack-label dense :model-value="edit.other_fee" label="Tambahan Lain2">
              <template v-slot:control>
                <vue-numeric v-model="edit.other_fee" class="q-field__input text-right" separator="." :precision="0"
                  @input="edit.fleet_price = edit.standart_price +edit.other_fee" />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-field square outlined stack-label dense :model-value="edit.fleet_price" label="Net Tarif">
              <template v-slot:control>
                <vue-numeric v-model="edit.fleet_price" class="q-field__input text-right" separator="." :precision="0"
                  disable />
              </template>
            </q-field>
          </div>
        </div>
      </q-card-section>
      <q-table square :rows="costs" :columns="col_cost" no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan" row-key="line_no" :filter="filter" separator="cell"
        selection="single" v-model:selected="sel_cost" v-model:pagination="pg_cost" dense hide-bottom hide-pagination>
        <template v-slot:no-data="{ icon, message, filter }">
          <div class="full-width row flex-top text-accent q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ message }}</span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-blue-grey-14 text-white">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" @click="props.selected = !props.selected">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div class="grid-data">
                <div v-if="col.name === 'fleet_cost'">
                  <q-field square outlined dense :model-value="props.row.fleet_cost" style="max-width:200px">
                    <template v-slot:control>
                      <vue-numeric v-model="props.row.fleet_cost" class="q-field__input text-right" separator="."
                        :precision="0" @input="calculate_cost()" />
                    </template>
                  </q-field>
                </div>
                <div v-else-if="col.name === 'is_invoice'">
                  <q-toggle v-model="props.row.is_invoice" true-value="1" false-value="0" disable dense />
                </div>
                <div v-else-if="col.name === 'is_fix'">
                  <q-toggle v-model="props.row.is_fix" true-value="1" false-value="0" disable dense />
                </div>
                <div v-else>
                  {{ col.value }}
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-space />
    </q-card>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top">
      <q-toolbar class="main-toolbar">
        <q-btn v-for="(btn, index) in btns" :key="index" dense no-caps flat v-show="(btn.is_allowed && !stateform)"
          class="btn-toolbar q-mr-xs" :icon="btn.icon" :label="btn.caption" @click="runMethod(btn.onclick)">
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
        <q-btn dense no-caps flat v-show="stateform" class="btn-toolbar q-mr-xs" icon="save" label="Simpan"
          @click="save_data()">
          <q-tooltip content-class="tooltips-app">
            Simpan data
          </q-tooltip>
        </q-btn>
        <q-btn dense no-caps flat v-show="stateform" class="btn-toolbar q-mr-xs" icon="undo" label="Batal"
          @click="stateform=false">
          <q-tooltip content-class="tooltips-app">
            Batal
          </q-tooltip>
        </q-btn>
        <q-space />
        <q-checkbox v-model="price_type" true-value="1" false-value="0" dense label="Hanya tarif yang berlaku"
          @update:model-value="loaddata()" />
      </q-toolbar>
    </q-page-sticky>

    <partner v-if="dlgPartner" :show="dlgPartner" state="C" @ClosePartner="getPartner" />
    <geofance v-if="dlgGeofance" :show="dlgGeofance" state="C" @CloseGeofance="getGeofance" />

  </q-page>
</template>

<script>
import partner from 'components/Partner.vue';
import geofance from 'components/Geofance.vue';
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerIos } from "quasar";

export default defineComponent({
  name: "CustOrder",
  components: { partner,geofance },
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();

    const loading = ref(false);
    const edit = ref({});
    const costs =ref([]);
    const dataevent = ref(false);
    const title = ref("Tambah Data");
    const filter = ref("");
    const stateform=ref(false);

    const pagination = ref({
      sortBy: "id",
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20,
    });
    const data = ref([]);
    const selected = ref([]);
    const columns = ref([]);

    const btn_loading = ref(false);
    const pagetitle = ref("");
    const api_url = ref({});
    const btns = ref([]);
    const access = ref({});

    const dlgPartner = ref(false);
    const partner_id=ref("");
    const partner_name = ref("");
    const price_type=ref("1");
    const vehicle_types = ref([]);
    const pg_cost = ref({
      sortBy: "line_no",
      descending: false,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0,
    });
    const sel_cost = ref([]);
    const col_cost = ref([
      {name:"line_no",align:"left",label:"No",field:"line_no"},
      { name: "descriptions", align: "left", label: "Variable biaya operasional", field: "descriptions" },
      { name: "fleet_cost", align: "left", label: "Biaya", field: "fleet_cost", style:"width:200px" },
      { name: "is_fix", align: "center", label: "Tetap", field: "is_fix" },
      { name: "is_invoice", align: "center", label: "Diinvoicekan", field: "is_invoice" }
      ]);
    const geofance_flag =ref('');
    const dlgGeofance=ref(false);

    async function onRequest(props) {
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
          price_type:price_type.value,
          url: api_url.value.retrieve
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

    async function add_event() {
        loading.value = false;
        stateform.value = true;
        title.value = "Tambah tarif "
        edit.value = {
          id: -1,
          partner_id: '',
          partner_name:'',
          vehicle_type:"",
          origins: "",
          destinations:"",
          origins_geofance: "",
          destinations_geofance: "",
          distance:0,
          eta:0,
          standart_price:0,
          other_fee: 0,
          fleet_price:0,
          standart_cost:0,
          valid_price: null,
          is_active:"1"
        };
        let props = {};
        let costs_variable=null;
        props.url = "master/operational/variable-cost/list";
        $store.dispatch("master/GET_DATA", props).then((response) => {
          costs_variable = response;
          let line=0
          costs_variable.forEach(el => {
            line=line+1
            let rec={
              cost_id:-1,
              line_no:line,
              id:el.id,
              descriptions: el.variable_name,
              fleet_cost:0,
              is_fix:el.is_fix,
              is_invoice:el.is_invoice
            }
            costs.value.push(rec)
          });
        });
    }

    async function edit_event(primary =-1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0];
          primary = item.id;
        }
        $q.loading.show({ delay: 100 });
        try {
          loading.value = false;
          let props = {};
          props.url = api_url.value.edit;
          props.id = primary;
          let respon = await $store.dispatch("master/GET_DATA", props);
          if (!(typeof respon === "undefined")) {
            title.value = "Ubah Data"
            stateform.value = true;
            edit.value = respon.price;
            costs.value=respon.costs
          }
        } finally {
          $q.loading.hide();
        }
      }
    }

    async function delete_event (primary=-1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0];
          primary = item.id;
        }
        $q.dialog({
          title: "Konfirmasi",
          message: "Apakah data ini akan di hapus?",
          cancel: true,
          persistent: true,
        }).onOk(() => {
          let json = {};
          json.id = primary;
          json.url = api_url.value.delete;
          $store.dispatch("master/DELETE_DATA", json).then((respon) => {
            if (!(typeof respon === "undefined")) {
              let msg = respon.data;
              if (respon.success) {
                dataevent.value = false;
                $q.notify({
                  color: "positive",
                  textcolor: "white",
                  message: msg,
                  position: "top",
                  timeout: 2000,
                });
                loaddata();
              } else {
                $q.notify({
                  color: "negative",
                  textcolor: "white",
                  message: msg,
                  position: "top",
                  timeout: 2000,
                });
              }
            }
          });
        });
      }
    }

    async function save_data() {
      let sysid = -1;
      try {
        let app = {};
        app.data = edit.value;
        app.cost =costs.value;
        app.url = api_url.value.save;
        loading.value = true;
        let respon = await $store.dispatch("master/POST_DATA", app);
        if (!(typeof respon === "undefined")) {
          let msg = respon.data;
          if (respon.success) {
            stateform.value = false;
            $q.notify({
              color: "positive",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
            loaddata();
          } else {
            $q.loading.hide();
            $q.notify({
              color: "negative",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
          }
        }
      } finally {
        loading.value = false;
      }
    }

    async function loaddata() {
      selected.value = [];
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    }

    function runMethod(method, primary = -1) {
      this[method](primary);
    }

    function open_customer (){
      dlgPartner.value=true;
    }

    function getPartner (closed, data) {
      dlgPartner.value = closed;
      if (typeof data.partner_id !== "undefined") {
        edit.value.partner_id=data.partner_id
        edit.value.partner_name = data.partner_id+' - '+data.partner_name
      }
    }

    function open_geofance(state){
      geofance_flag.value=state
      dlgGeofance.value=true;
    }
    
    function getGeofance(closed,data) {
      dlgGeofance.value = closed;
      if (typeof data.geofance_name !== "undefined") {
        if (geofance_flag.value==='origins') {
          edit.value.origins_geofance=data.geofance_name
        } else {
          edit.value.destinations_geofance = data.geofance_name
        }
      }
    }

    function calculate_cost(){
      edit.value.standart_cost=0;
      let cost=0
      costs.value.forEach(el=>{
        cost=cost+el.fleet_cost
      })
      edit.value.standart_cost = cost;
    }

    onMounted(async () => {
      let property = await $store.dispatch(
        "home/GET_PAGEPROPERTY",
        $router.currentRoute.value.fullPath
      );
      columns.value = property.columns;
      pagetitle.value = property.title;
      api_url.value = property.url;
      btns.value = property.btn;
      access.value = property.access;
      let props = {};
      props.url = "master/operational/vehicle-group/list";
      $store.dispatch("master/GET_DATA", props).then((response) => {
        vehicle_types.value = response;
      });
      loaddata()
    });

    return {
      loading,
      data,
      edit,
      dataevent,
      title,
      filter,
      pagination,
      selected,
      columns,
      pagetitle,
      api_url,
      btns,
      access,
      runMethod,
      onRequest,
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data,
      btn_loading,
      dlgPartner,
      getPartner,
      open_customer,
      stateform,
      partner_id,
      partner_name,
      price_type,
      costs,
      vehicle_types,
      pg_cost,
      sel_cost,
      col_cost,
      calculate_cost,
      geofance_flag,
      dlgGeofance,
      open_geofance,
      getGeofance
    };
  },
});
</script>
