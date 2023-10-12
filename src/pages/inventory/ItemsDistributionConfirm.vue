<template>
  <q-page class="page-app">
    <q-card
      class="q-mb-sm"
      square
    >
      <q-bar class="entry-caption"> Filter data </q-bar>
      <q-card-section
        class="q-pa-sm"
        square
      >
        <div class="row items-center q-col-gutter-sm">
          <div class="col-xs-12 col-sm-4 col-md-4">
            <q-input
              v-model="location_name"
              label="Lokasi"
              dense
              square
              outlined
              readonly
            >
              <template v-slot:append>
                <q-icon
                  name="search"
                  color="green-10"
                  size="sm"
                  @click="dlgWarehouse = true"
                >
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-show="status === '1'"
              v-model="date1"
              label="Periode"
              dense
              square
              outlined
              type="date"
              @blur="loaddata()"
            />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-show="status === '1'"
              v-model="date2"
              label="s/d"
              dense
              square
              outlined
              type="date"
              @blur="loaddata()"
            />
          </div>
          <div class="col-xs-12 col-sm-2 offset-md-2 col-md-2">
            <q-btn-toggle
              v-model="status"
              spread
              style="border: 1px solid #027be3"
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="[
                { label: 'Belum Diterima', value: '0' },
                { label: 'Semua Data', value: '1' }
              ]"
              @update:model-value="loaddata()"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card
      square
      class="icard"
    >
      <q-bar class="entry-caption">
        <span
          ><strong>{{ pagetitle }}</strong></span
        >
        <q-space />
        <q-input
          v-model="filter"
          dense
          outline
          debounce="500"
          label-color="white"
          borderless
          placeholder="Pencarian"
          input-class="text-white"
        >
          <template v-slot:append>
            <q-icon
              v-if="filter === ''"
              name="search"
              color="white"
              size="sm"
            />
            <q-icon
              v-else
              name="clear"
              class="cursor-mouer"
              color="white"
              size="sm"
              @click="filter = ''"
            />
          </template>
        </q-input>
      </q-bar>
      <q-table
        square
        dense
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="sysid"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        :loading="loading"
        class="grid-tables fit-table-ui-with-parameter-1"
      >
        <template v-slot:loading>
          <q-inner-loading showing>
            <q-spinner-ball
              size="75px"
              color="red-10"
            />
          </q-inner-loading>
        </template>
        <template v-slot:no-data="{ icon, message, filter }">
          <div class="full-width row flex-top text-accent q-gutter-sm">
            <q-icon
              size="2em"
              name="sentiment_dissatisfied"
            />
            <span>{{ message }}</span>
            <q-icon
              size="2em"
              :name="filter ? 'filter_b_and_w' : icon"
            />
          </div>
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr
            :props="props"
            @click="props.selected = !props.selected"
          >
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              <div class="grid-data">
                <div v-if="col.name === 'action'">
                  <q-icon
                    v-for="(btn, index) in btns"
                    v-show="btn.is_allowed && btn.is_show"
                    :key="index"
                    no-caps
                    flat
                    class="q-mr-sm"
                    :name="btn.icon"
                    size="xs"
                    color="green-10"
                    @click="runMethod(btn.onclick, props.row.uuid_rec)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'line_states'">
                  <span
                    :class="
                      props.row.line_state === 'C005@D'
                        ? 'q-pa-xs bg-yellow-10 text-white'
                        : 'q-pa-xs bg-green-10 text-white'
                    "
                    >{{ props.row.line_states }}</span
                  >
                </div>
                <div v-else-if="col.name === 'ref_date'">
                  {{ $INDDate(props.row.ref_date) }}
                </div>
                <div v-else-if="col.name === 'cost'">
                  {{ $formatnumber(props.row.cost) }}
                </div>
                <div v-else-if="col.name === 'confirm_date'">
                  {{ $INDDateTime2(props.row.confirm_date) }}
                </div>
                <div v-else-if="col.name === 'received_date'">
                  {{ $INDDateTime2(props.row.received_date) }}
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

    <!-- place QPageSticky at end of page -->
    <q-page-sticky
      expand
      position="top"
    >
      <q-toolbar class="main-toolbar">
        <q-btn
          v-for="(btn, index) in btns"
          :key="index"
          dense
          no-caps
          flat
          v-show="btn.is_allowed"
          class="btn-toolbar q-mr-xs"
          :icon="btn.icon"
          :label="btn.caption"
          @click="runMethod(btn.onclick)"
        >
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-page-sticky>

    <!-- Dialog Data Location-->
    <q-dialog
      v-model="dataevent"
      persistent
    >
      <q-card
        class="icard"
        square
        style="width: 1000px; max-width: 90vw"
      >
        <q-bar class="entry-caption">
          {{
            mode === 'accepted'
              ? ' KONFIRMASI PENERIMAAN BARANG'
              : ' KONFIRMASI PENOLAKAN BARANG'
          }}
          <q-space />
          <q-icon
            name="close"
            v-close-popup
            dense
            flat
            size="xs"
          />
        </q-bar>

        <q-card-section class="q-pa-sm">
          <div class="row items-start q-col-gutter-xs q-mb-sm">
            <div class="col-xs-12 col-sm-7 col-md-6">
              <div class="row items-center q-mb-sm q-col-gutter-xs">
                <div class="col-xs-6 col-sm-4 col-md-3">
                  <q-input
                    v-model="edit.doc_number"
                    disable
                    dense
                    outlined
                    type="text"
                    label="No.Distribusi"
                    square
                    stack-label
                  />
                </div>
                <div class="col-xs-6 col-sm-4 col-md-4">
                  <q-input
                    v-model="edit.ref_number"
                    dense
                    outlined
                    type="text"
                    label="Referensi Dokumen (Permintaan)"
                    square
                    stack-label
                    disable
                  />
                </div>
              </div>
              <div class="row items-start q-col-gutter-xs q-mb-sm">
                <div class="col-xs-12 col-sm-8 col-md-10">
                  <q-input
                    v-model="edit.location_name_from"
                    dense
                    outlined
                    label="Dari Lokasi"
                    square
                    stack-label
                    disable
                  />
                </div>
              </div>
              <div class="row items-start q-col-gutter-xs q-mb-sm">
                <div class="col-xs-12 col-sm-8 col-md-10">
                  <q-input
                    v-model="edit.location_name_to"
                    dense
                    outlined
                    label="Kepada Lokasi"
                    square
                    stack-label
                    disable
                  />
                </div>
              </div>
            </div>
            <div class="col-xs-12 col-sm-5 offset-md-2 col-md-4">
              <div class="row items-start q-col-gutter-xs q-mb-sm">
                <div class="col-6">
                  <q-input
                    v-model="edit.ref_date"
                    dense
                    outlined
                    type="date"
                    label="Tanggal"
                    square
                    stack-label
                    disable
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="edit.ref_time"
                    dense
                    outlined
                    type="time"
                    label="Jam"
                    square
                    stack-label
                    disable
                  />
                </div>
              </div>
              <div class="row items-start q-col-gutter-xs q-mb-sm">
                <div class="col-12">
                  <q-input
                    v-model="edit.remarks"
                    outlined
                    dense
                    label="Catatan"
                    square
                    stack-label
                    disable
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-table
          square
          dense
          class="grid-tables fit-table-entry"
          :rows="detail"
          :columns="coldetail"
          no-data-label="data kosong"
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="line_no"
          separator="cell"
          selection="single"
          v-model:selected="selected_detail"
          v-model:pagination="pagination_detail"
          virtual-scroll
          hide-selected-banner
          hide-pagination
          auto-width
          hide-no-data
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-teal-8 text-white"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              @click="props.selected = !props.selected"
            >
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                <div class="grid-data">
                  <div v-if="col.name === 'line_no'">
                    {{ col.value }}
                  </div>
                  <div v-else-if="col.name === 'quantity_received'">
                    {{ $formatnumber(props.row.quantity_received, 2) }}
                  </div>
                  <div v-else-if="col.name === 'quantity_distribution'">
                    {{ $formatnumber(props.row.quantity_distribution, 2) }}
                  </div>
                  <div v-else-if="col.name === 'package'">
                    1 {{ props.row.mou_issue }} = {{ props.row.convertion }}
                    {{ props.row.mou_inventory }}
                  </div>
                  <div v-else-if="col.name === 'quantity_request'">
                    {{ props.row.quantity_request }}
                    {{ props.row.mou_inventory }}
                  </div>
                  <div v-else-if="col.name === 'quantity_update'">
                    {{ props.row.quantity_update }}
                    {{ props.row.mou_inventory }}
                  </div>
                  <div v-else-if="col.name === 'item_cost'">
                    {{ $formatnumber(props.row.item_cost, 2, ',', 0, true) }}
                  </div>
                  <div v-else-if="col.name === 'line_cost'">
                    {{ $formatnumber(props.row.line_cost, 2, ',', 0, true) }}
                  </div>
                  <div v-else>
                    {{ col.value }}
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-card-section
          class="q-pa-sm entry-caption"
          align="right"
        >
          <q-btn
            v-show="edit.line_state === 'C005@D'"
            :label="mode === 'accepted' ? 'Barang diterima' : 'Barang ditolak'"
            :icon="mode === 'accepted' ? 'thumb_up' : 'thumb_down'"
            flat
            dense
            no-caps
            class="q-mr-sm"
            @click="confirm_receiving()"
          />
          <q-btn
            label="Tutup"
            flat
            dense
            no-caps
            icon="undo"
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <warehouse
      v-if="dlgWarehouse"
      :show="dlgWarehouse"
      warehouse_group=""
      :allgroup="1"
      @CloseData="getWarehouse"
    />
  </q-page>
</template>

<script>
import Warehouse from 'src/components/master/Warehouse.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { ymd } from 'boot/engine'

export default defineComponent({
  name: 'DistributionConfirm',
  components: { Warehouse },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()
    const status = ref('0')
    const date1 = ref(null)
    const date2 = ref(null)
    const location_id = ref(-1)
    const location_name = ref('')

    const loading = ref(false)
    const edit = ref({})
    const detail = ref([])
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')
    const tab = ref('general')

    const pagination = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const btn_loading = ref(false)
    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const mode = ref('')

    const dlgWarehouse = ref(false)

    const coldetail = ref([
      {
        name: 'line_no',
        align: 'Left',
        sytle: 'width: 60px',
        headerStyle: 'width: 60px',
        label: '#',
        field: 'line_no'
      },
      {
        name: 'item_code',
        align: 'left',
        sytle: 'width: 120px',
        headerStyle: 'width: 120px',
        label: 'Kode',
        field: 'item_code'
      },
      {
        name: 'item_name',
        align: 'left',
        label: 'Keterangan',
        sytle: 'width: 250px',
        headerStyle: 'width: 250px',
        field: 'item_name'
      },
      {
        name: 'quantity_request',
        align: 'right',
        label: 'Jml.Permintaan',
        field: 'quantity_request'
      },
      {
        name: 'quantity_update',
        align: 'left',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Jml Distribusi',
        field: 'quantity_update'
      },
      {
        name: 'item_cost',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Harga Item',
        field: 'item_cost'
      },
      {
        name: 'line_cost',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Total',
        field: 'line_cost'
      },
      {
        name: 'remarks',
        align: 'left',
        label: 'Catatan',
        field: 'remarks'
      },
      {
        name: 'qty_received',
        align: 'right',
        label: 'Jml.Terima',
        field: 'qty_received'
      }
    ])
    const selected_detail = ref([])
    const pagination_detail = ref({
      sortBy: 'line_no',
      descending: false,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 50
    })

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading.value = true
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          date1: date1.value,
          date2: date2.value,
          location_id: location_id.value,
          status: status.value,
          url: 'inventory/item/distribution/confirm'
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        data.value = respon.data
        pagination.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending
        }
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    async function accept_event(uuid_rec = '') {
      if (selected.value.length > 0 || !(uuid_rec === '')) {
        if (uuid_rec === '') {
          uuid_rec = selected.value[0].uuid_rec
        }
        loading.value = false
        let props = {}
        props.url = 'inventory/item/distribution/get'
        props.uuidrec = uuid_rec
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          mode.value = 'accepted'
          dataevent.value = true
          edit.value = respon.header
          detail.value = respon.detail
        }
      }
    }
    async function rejected_event(uuid_rec = '') {
      if (selected.value.length > 0 || !(uuid_rec === '')) {
        if (uuid_rec === '') {
          uuid_rec = selected.value[0].uuid_rec
        }
        loading.value = false
        let props = {}
        props.url = 'inventory/item/distribution/get'
        props.uuidrec = uuid_rec
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          mode.value = 'rejected'
          dataevent.value = true
          edit.value = respon.header
          detail.value = respon.detail
        }
      }
    }

    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function runMethod(method, uuidrec = '') {
      this[method](uuidrec)
    }

    function getWarehouse(closed, data) {
      dlgWarehouse.value = closed

      if (typeof data.location_code !== 'undefined') {
        location_id.value = data.sysid
        location_name.value = data.location_name
        loaddata()
      }
    }
    function confirm_receiving() {
      $q.dialog({
        title: 'Konfirmasi',
        message:
          mode.value === 'accepted'
            ? 'Apakah distribusi barang ini sudah benar dan konfirmasi diterima ?'
            : 'Apakah distribusi barang ini akan ditolak ?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          let app = {}
          app.uuid = edit.value.uuid_rec
          if (mode.value === 'accepted') {
            app.url = 'inventory/item/distribution/accepted'
          } else {
            app.url = 'inventory/item/distribution/rejected'
          }
          app.progress = true
          let respon = {}
          if (mode.value === 'accepted') {
            respon = await $store.dispatch('master/POST_DATA', app)
          } else {
            respon = await $store.dispatch('master/DELETE_DATA', app)
          }
          if (!(typeof respon === 'undefined')) {
            let msg = respon.data
            if (respon.success) {
              dataevent.value = false
              mode.value = ''
              $q.notify({
                color: 'positive',
                textcolor: 'white',
                message: msg,
                position: 'top',
                timeout: 2000
              })
              edit.value = {}
              detail.value = []
              loaddata()
            } else {
              $q.notify({
                color: 'red-10',
                textcolor: 'white',
                message: msg,
                position: 'top',
                timeout: 3000
              })
            }
          }
        } finally {
          loading.value = false
        }
      })
    }

    onMounted(async () => {
      let property = await $store.dispatch(
        'home/GET_PAGEPROPERTY',
        $router.currentRoute.value.fullPath
      )
      columns.value = property.columns
      pagetitle.value = property.title
      api_url.value = property.url
      btns.value = property.btn
      access.value = property.access
      let today = new Date()
      date1.value = ymd(today)
      date2.value = ymd(today)
      loaddata()
    })

    return {
      loading,
      data,
      edit,
      detail,
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
      tab,
      runMethod,
      onRequest,
      accept_event,
      rejected_event,
      loaddata,
      btn_loading,
      dlgWarehouse,
      getWarehouse,
      location_id,
      location_name,
      date1,
      date2,
      status,
      pagination_detail,
      selected_detail,
      coldetail,
      mode,
      confirm_receiving
    }
  }
})
</script>
<style lang="scss">
.fit-table-entry {
  height: -webkit-calc(100vh - 295px) !important;
  height: -moz-calc(100vh - 295px) !important;
  height: calc(100vh - 295px) !important;

  thead tr th {
    position: sticky;
    z-index: 1;
  }
  thead tr:first-child th {
    top: 0;
  }
  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }
}
</style>
