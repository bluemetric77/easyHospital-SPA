<template>
  <q-page class="page-app">
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
          debounce="300"
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
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        :dense="$q.screen.md"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="vehicle_no"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        :loading="loading"
      >
        <template v-slot:loading>
          <q-spinner-ios
            showing
            color="primary"
          />
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
                    @click="runMethod(btn.onclick, props.row.vehicle_no)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'vehicle_no'">
                  <span v-if="props.row.is_active === '1'">{{
                    props.row.vehicle_no
                  }}</span>
                  <span
                    class="text-red-10"
                    v-else
                    >{{ props.row.vehicle_no }}</span
                  >
                </div>
                <div v-else-if="col.name === 'descriptions'">
                  <span v-if="props.row.is_active === '1'">{{
                    props.row.descriptions
                  }}</span>
                  <span
                    class="text-red-10"
                    v-else
                    >{{ props.row.descriptions }}</span
                  >
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle
                    v-model="props.row.is_active"
                    dense
                    true-value="1"
                    false-value="0"
                    disable
                  />
                </div>
                <div v-else-if="col.name === 'stnk_validate'">
                  {{ $INDDate(props.row.stnk_validate) }}
                </div>
                <div v-else-if="col.name === 'kir_validate'">
                  {{ $INDDate(props.row.kir_validate) }}
                </div>
                <div v-else-if="col.name === 'vehicle_tax_validate'">
                  {{ $INDDate(props.row.vehicle_tax_validate) }}
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
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <q-card
        class="icard"
        style="width: 700px"
        square
      >
        <q-bar class="entry-caption">
          {{ title }}
          <q-space />
          <q-btn
            v-close-popup
            dense
            glossy
            rounded
            icon="close"
            color="red-5"
            size="xs"
          >
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-xs">
          <div class="row items-center q-col-gutter-sm q-mb-xs">
            <div class="col-3">
              <q-input
                v-model="edit.vehicle_no"
                dense
                outlined
                square
                label="No.Unit"
                stack-label
              />
            </div>
            <div class="col-7">
              <q-input
                v-model="edit.descriptions"
                dense
                outlined
                square
                label="Nama unit/kendaraan"
                stack-label
              />
            </div>
            <div class="col-2">
              <q-toggle
                v-model="edit.is_active"
                true-value="1"
                false-value="0"
                dense
                label="Aktif"
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm">
            <div class="col-3">
              <q-select
                v-model="edit.gps_vendor"
                :options="['N/A', 'TOTAL KILAT', 'EASY GO']"
                outlined
                dense
                options-dense
                label="Vendor GPS"
                fill-input
                stack-label
                square
              />
            </div>
            <div class="col-9">
              <q-select
                v-model="edit.gps_id"
                :options="gps_devices"
                option-value="device_id"
                option-label="list"
                map-options
                emit-value
                outlined
                dense
                options-dense
                label="ID GPS"
                fill-input
                stack-label
                square
              />
            </div>
          </div>
        </q-card-section>
        <q-tabs
          v-model="tab"
          class="text-teal"
          dense
          inline-label
          no-caps
          align="justify"
        >
          <q-tab
            name="general"
            icon="fas fa-address-card"
            label="Umum"
          />
          <q-tab
            name="legal"
            icon="fas fa-file-contract"
            label="Perizinan/Dokumen"
          />
        </q-tabs>
        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel name="general">
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-input
                  v-model="edit.police_no"
                  dense
                  outlined
                  square
                  label="No. Polisi"
                  stack-label
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="edit.model"
                  dense
                  outlined
                  square
                  label="Model"
                  stack-label
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="edit.manufactur"
                  dense
                  outlined
                  square
                  label="ATPM"
                  stack-label
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-input
                  v-model="edit.vin"
                  dense
                  outlined
                  square
                  label="Nomor Mesin"
                  stack-label
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="edit.chasis_no"
                  dense
                  outlined
                  square
                  label="Nomor Rangka"
                  stack-label
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="edit.year_production"
                  dense
                  outlined
                  square
                  label="Tahun Perakitan"
                  stack-label
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-6">
                <q-select
                  v-model="edit.unit_type"
                  :options="['FULL UNIT', 'HEAD UNIT', 'CHASSIS']"
                  outlined
                  dense
                  options-dense
                  label="Kategori kendaraan/unit"
                  fill-input
                  stack-label
                  square
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="edit.vehicle_type"
                  :options="vehicle_types"
                  outlined
                  dense
                  options-dense
                  label="Jenis kendaraan/unit"
                  option-value="vehicle_type"
                  option-label="vehicle_type_name"
                  emit-value
                  map-options
                  fill-input
                  stack-label
                  square
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-6">
                <q-input
                  v-model="edit.tire_type"
                  dense
                  outlined
                  square
                  label="Jenis Ban"
                  stack-label
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="edit.pool_code"
                  :options="pools"
                  outlined
                  dense
                  options-dense
                  label="Pool kendaraan"
                  option-value="pool_code"
                  option-label="pool_name"
                  emit-value
                  map-options
                  fill-input
                  stack-label
                  square
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input
                  v-model="edit.personal_name"
                  dense
                  outlined
                  square
                  label="Pengemudi"
                  stack-label
                  readonly
                >
                  <template v-slot:prepend>
                    <q-icon
                      name="clear"
                      color="red-10"
                      size="xs"
                      @click="edit.personal_name = ''"
                    />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      color="teal-10"
                      size="xs"
                      @click="open_driver()"
                    />
                  </template>
                </q-input>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="legal">
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-input
                  v-model="edit.stnk_validate"
                  dense
                  outlined
                  square
                  label="Masa berlaku STNK"
                  type="date"
                  stack-label
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="edit.vehicle_tax_validate"
                  dense
                  outlined
                  square
                  label="Masa berlaku pajak"
                  type="date"
                  stack-label
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="edit.kir_validate"
                  dense
                  outlined
                  square
                  label="Masa berlaku KIR"
                  type="date"
                  stack-label
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-input
                  v-model="edit.purchase_date"
                  dense
                  outlined
                  square
                  label="Tgl. Pembelian"
                  type="date"
                  stack-label
                />
              </div>
              <div class="col-4">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.purchase_amount"
                  label="Nilai Pembelian"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.purchase_amount"
                      class="q-field__input text-right"
                      separator="."
                      :precision="0"
                    />
                  </template>
                </q-field>
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-input
                  v-model="edit.asset_number"
                  dense
                  outlined
                  square
                  label="Nomor Asset"
                  stack-label
                />
              </div>
              <div class="col-4">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.asset_value"
                  label="Nilai Asset"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.asset_value"
                      class="q-field__input text-right"
                      separator="."
                      :precision="0"
                      readonly
                    />
                  </template>
                </q-field>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
        <q-separator />
        <q-card-section
          class="dialog-action q-pa-sm"
          align="right"
        >
          <q-btn
            class="q-mr-sm"
            icon="save"
            label="Simpan"
            flat
            no-caps
            @click="save_data()"
            :loading="loading"
          >
            <template v-slot:loading>
              <q-spinner class="on-left" />
              Proses
            </template>
          </q-btn>
          <q-btn
            icon="undo"
            label="Batal"
            no-caps
            flat
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="documentevent"
      persistent
    >
      <q-card
        class="icard"
        style="width: 800px"
        square
      >
        <q-bar class="entry-caption"
          >Dokumen
          <q-space />
          <q-btn
            v-close-popup
            dense
            glossy
            rounded
            icon="close"
            color="red-5"
            size="xs"
          >
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="q-pa-xs">
          <div class="row items-start q-col-gutter-sm q-mb-xs">
            <div class="col-3">
              <q-input
                v-model="edit.vehicle_no"
                dense
                outlined
                square
                label="No.Unit"
                stack-label
              />
            </div>
            <div class="col-7">
              <q-input
                v-model="edit.descriptions"
                dense
                outlined
                square
                label="Nama unit/kendaraan"
                stack-label
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm">
            <div class="col-3">
              <q-input
                v-model="edit.police_no"
                dense
                outlined
                square
                label="No.Polisi"
                stack-label
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.vin"
                dense
                outlined
                square
                label="Nomor mesin"
                stack-label
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.chasis_no"
                dense
                outlined
                square
                label="Nomor rangka kendaraan"
                stack-label
              />
            </div>
          </div>
        </q-card-section>
        <q-toolbar class="main-toolbar">
          <q-btn
            label="Upload dokumen"
            icon="fas fa-file-upload"
            dense
            flat
            no-caps
            @click="upload_document()"
          />
        </q-toolbar>
        <q-card-section class="q-pa-xs">
          <q-scroll-area style="height: 350px">
            <div class="row items-start q-col-gutter-xs q-mb-xs">
              <div
                class="col-xs-4"
                v-for="(item, index) in documents"
                :key="index"
              >
                <q-card
                  class="shadow-5 overflow-hidden"
                  style="border-radius: 15px"
                >
                  <q-img
                    :src="item.url_link"
                    :ratio="4 / 3"
                  >
                    <q-icon
                      class="absolute all-pointer-events"
                      size="xs"
                      name="fas fa-search-plus"
                      color="green-10"
                      style="top: 8px; left: 8px"
                      @click="preview_image(item.sysid)"
                    >
                      <q-tooltip> Preview </q-tooltip>
                    </q-icon>
                    <q-icon
                      class="absolute all-pointer-events"
                      size="xs"
                      name="fas fa-trash"
                      color="red-10"
                      style="top: 8px; left: 40px"
                      @click="remove_image(item.sysid)"
                    >
                      <q-tooltip> Hapus </q-tooltip>
                    </q-icon>
                  </q-img>
                </q-card>
              </div>
            </div>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="dlgUpload"
      persistent
    >
      <q-card
        class="icard"
        style="width: 500px"
        square
      >
        <q-bar class="entry-caption"
          >Upload dokumen - {{ edit.vehicle_no }} - {{ edit.descriptions }}
          <q-space />
          <q-btn
            v-close-popup
            dense
            glossy
            rounded
            icon="close"
            color="red-5"
            size="xs"
          >
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="q-pa-xs">
          <div class="row items-start q-col-gutter-sm q-mb-xs">
            <div class="col-12">
              <q-input
                v-model="doc.title"
                dense
                outlined
                square
                label="Judul"
                stack-label
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-xs">
            <div class="col-12">
              <q-file
                v-model="doc.document_link"
                outlined
                dense
                label="Dokumen (Max 2 MB)"
                accept=".jpg,image/*"
                max-file-size="2056000"
                @rejected="onRejected"
                square
                stack-label
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-xs">
            <div class="col-12">
              <q-input
                v-model="doc.descriptions"
                dense
                outlined
                square
                label="Keterangan"
                type="textarea"
                input-style="height:60px"
                stack-label
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section
          class="entry-caption q-pa-xs"
          align="right"
        >
          <q-btn
            label="Upload"
            :loading="btn_loading"
            no-caps
            icon="fas fa-file-upload"
            @click="send_upload()"
            flat
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dlgPreview">
      <q-img
        :src="imglink"
        :ratio="4 / 3"
      >
        <q-icon
          class="absolute all-pointer-events"
          size="xs"
          name="fas fa-times"
          color="red-10"
          style="top: 10px; left: 10px"
          @click="dlgPreview = false"
        >
          <q-tooltip> Tutup </q-tooltip>
        </q-icon>
      </q-img>
    </q-dialog>

    <driver
      v-if="dlgDriver"
      :show="dlgDriver"
      :pool_code="edit.pool_code"
      @CloseDriver="getDriver"
    />
  </q-page>
</template>

<script>
import driver from 'components/Driver.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'
import { Config } from 'boot/engine'

export default defineComponent({
  name: 'Vehicles',
  components: { driver },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const loading = ref(false)
    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')

    const pagination = ref({
      sortBy: 'vehicle_no',
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const btn_loading = ref(false)
    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const vehicle_types = ref([])
    const pools = ref([])
    const tab = ref('general')
    const documentevent = ref(false)
    const documents = ref([])
    const pg_document = ref({
      sortBy: 'create_date',
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })
    const sel_document = ref([])
    const col_document = ref([
      {
        name: 'update_timestamp',
        align: 'left',
        label: 'Tanggal & Jam',
        field: 'update_timestamp',
        sortable: true
      },
      {
        name: 'document_link',
        align: 'left',
        label: 'Dokumen',
        field: 'document_link'
      },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Catatan',
        field: 'descriptions'
      }
    ])
    const filter_document = ref('')
    const doc = ref({})
    const dlgUpload = ref(false)
    const dlgPreview = ref(false)
    const imglink = ref('')
    const gps_devices = ref([])
    const dlgDriver = ref(false)

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
          url: api_url.value.retrieve
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
    async function add_event() {
      loading.value = false
      dataevent.value = true
      edit.value = {
        old_vehicle_no: '',
        vehicle_no: '',
        descriptions: '',
        vehicle_type: null,
        model: '',
        manufactur: '',
        year_production: '',
        unit_type: '',
        police_no: '',
        vin: '',
        chasis_no: '',
        gps_vendor: 'N/A',
        gps_id: '',
        tire_type: '',
        pool_code: '',
        stnk_validate: null,
        kir_validate: null,
        vehicle_tax_validate: null,
        purchase_date: null,
        purchase_amount: 0,
        asset_number: '',
        asset_value: 0,
        employee_id: '',
        personal_name: '',
        is_active: '1'
      }
    }

    async function edit_event(primary = '') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          let item = selected.value[0]
          primary = item.vehicle_no
        }
        $q.loading.show({ delay: 100 })
        try {
          loading.value = false
          let props = {}
          props.url = api_url.value.edit
          props.vehicle_no = primary
          let respon = await $store.dispatch('master/GET_DATA', props)
          if (!(typeof respon === 'undefined')) {
            dataevent.value = true
            edit.value = respon
            edit.value.old_vehicle_no = respon.vehicle_no
          }
        } finally {
          $q.loading.hide()
        }
      }
    }

    async function document_event(primary = '') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          let item = selected.value[0]
          primary = item.vehicle_no
        }
        $q.loading.show({ delay: 100 })
        try {
          loading.value = false
          let doc = []
          let props = {}
          documents.value = []
          props.url = 'master/operational/vehicle/document'
          props.vehicle_no = primary
          let respon = await $store.dispatch('master/GET_DATA', props)
          if (!(typeof respon === 'undefined')) {
            documentevent.value = true
            edit.value = respon.vehicle
            doc = respon.document
          }
          let config = new Config()
          doc.forEach((el) => {
            el.url_link =
              config.UrlLink() +
              '/master/operational/vehicle/download?sysid=' +
              el.sysid
            documents.value.push(el)
          })
          config = null
        } finally {
          $q.loading.hide()
        }
      }
    }

    async function delete_event(primary = '') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          let item = selected.value[0]
          primary = item.vehicle_no
        }
        $q.dialog({
          title: 'Konfirmasi',
          message: 'Apakah data ini akan di hapus?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          let json = {}
          json.vehicle_no = primary
          json.url = api_url.value.delete
          $store.dispatch('master/DELETE_DATA', json).then((respon) => {
            if (!(typeof respon === 'undefined')) {
              let msg = respon.data
              if (respon.success) {
                dataevent.value = false
                $q.notify({
                  color: 'positive',
                  textcolor: 'white',
                  message: msg,
                  position: 'top',
                  timeout: 2000
                })
                loaddata()
              } else {
                $q.notify({
                  color: 'negative',
                  textcolor: 'white',
                  message: msg,
                  position: 'top',
                  timeout: 2000
                })
              }
            }
          })
        })
      }
    }

    async function save_data() {
      let sysid = -1
      try {
        let app = {}
        app.data = edit.value
        app.url = api_url.value.save
        loading.value = true
        let respon = await $store.dispatch('master/POST_DATA', app)
        if (!(typeof respon === 'undefined')) {
          let msg = respon.data
          if (respon.success) {
            dataevent.value = false
            $q.notify({
              color: 'positive',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
            loaddata()
          } else {
            $q.loading.hide()
            $q.notify({
              color: 'negative',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
          }
        }
      } finally {
        loading.value = false
      }
    }
    function upload_document() {
      dlgUpload.value = true
      doc.value = {
        sysid: -1,
        vehicle_no: edit.value.vehicle_no,
        title: '',
        descriptions: '',
        document_link: ''
      }
    }

    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function runMethod(method, primary = '') {
      this[method](primary)
    }
    function send_upload() {
      let json = {}
      json.url = 'master/operational/vehicle/upload'
      json.vehicle_no = doc.value.vehicle_no
      json.file = doc.value.document_link
      json.descriptions = doc.value.descriptions
      json.title = doc.value.title
      btn_loading.value = true
      $store
        .dispatch('master/UPLOAD_DATA', json)
        .then(async (respon) => {
          btn_loading.value = false
          let msg = respon.data
          if (respon.success === true) {
            dlgUpload.value = false
            this.$q.notify({
              icon: 'announcement',
              color: 'green-10',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
            refresh_image(edit.value.vehicle_no)
          } else {
            this.$q.notify({
              icon: 'announcement',
              color: 'red',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
          }
        })
        .finally(() => {
          btn_loading.value = false
        })
    }
    async function refresh_image(vehicle_no = '') {
      $q.loading.show({ delay: 100 })
      try {
        loading.value = false
        let doc = []
        let props = {}
        documents.value = []
        props.url = 'master/operational/vehicle/document'
        props.vehicle_no = vehicle_no
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          doc = respon.document
        }
        let config = new Config()
        doc.forEach((el) => {
          el.url_link =
            config.UrlLink() +
            '/master/operational/vehicle/download?sysid=' +
            el.sysid
          documents.value.push(el)
        })
        config = null
      } finally {
        $q.loading.hide()
      }
    }

    function preview_image(sysid = -1) {
      let config = new Config()
      imglink.value =
        config.UrlLink() + '/master/operational/vehicle/download?sysid=' + sysid
      config = null
      dlgPreview.value = true
    }

    function remove_image(sysid = -1) {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah dokumen/gambar ini akan di hapus?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        let json = {}
        json.sysid = sysid
        json.url = 'master/operational/vehicle/image-remove'
        $store.dispatch('master/DELETE_DATA', json).then((respon) => {
          if (!(typeof respon === 'undefined')) {
            let msg = respon.data
            if (respon.success) {
              refresh_image(edit.value.vehicle_no)
              $q.notify({
                color: 'positive',
                textcolor: 'white',
                message: msg,
                position: 'top',
                timeout: 2000
              })
              loaddata()
            } else {
              $q.notify({
                color: 'negative',
                textcolor: 'white',
                message: msg,
                position: 'top',
                timeout: 2000
              })
            }
          }
        })
      })
    }

    function open_driver() {
      dlgDriver.value = true
    }

    function getDriver(closed, data) {
      dlgDriver.value = closed
      if (typeof data.employee_id !== 'undefined') {
        edit.value.employee_id = data.employee_id
        edit.value.personal_name = data.employee_id + ' - ' + data.personal_name
      }
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
      let props = {}
      props.url = 'master/operational/vehicle-group/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        vehicle_types.value = response
      })
      props.url = 'master/operational/pool/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        pools.value = response
      })
      props.url = 'master/operational/gps-device/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        gps_devices.value = response
      })
      loaddata()
    })

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
      vehicle_types,
      pools,
      tab,
      documentevent,
      document_event,
      documents,
      pg_document,
      sel_document,
      col_document,
      filter_document,
      upload_document,
      dlgUpload,
      doc,
      send_upload,
      refresh_image,
      preview_image,
      remove_image,
      dlgPreview,
      imglink,
      gps_devices,
      dlgDriver,
      open_driver,
      getDriver
    }
  }
})
</script>
