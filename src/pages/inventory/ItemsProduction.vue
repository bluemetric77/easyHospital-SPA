<template>
  <q-page class="page-app">
    <q-card
      class="icard"
      square
    >
      <q-bar class="entry-caption">
        {{ pagetitle }}
      </q-bar>

      <q-card-section class="q-pa-sm">
        <div class="row items-start q-col-gutter-xs q-mb-sm">
          <div class="col-xs-12 col-sm-7 col-md-6">
            <div class="row items-center q-mb-sm q-col-gutter-xs">
              <div class="col-xs-6 col-sm-4 col-md-3">
                <q-input
                  v-model="edit.doc_number"
                  readonly
                  dense
                  outlined
                  type="text"
                  label="No.Pengeluaran"
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
                  label="Referensi Dokumen"
                  square
                  stack-label
                  :disable="ref_action !== 'save'"
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-12 col-sm-8 col-md-7">
                <q-select
                  v-model="edit.location_id"
                  :options="warehouse_opt"
                  outlined
                  dense
                  options-dense
                  label="Dari Lokasi"
                  option-value="sysid"
                  option-label="location_name"
                  emit-value
                  map-options
                  use-input
                  square
                  stack-label
                  :disable="ref_action !== 'save'"
                  v-on:update:model-value="change_group()"
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-12 col-sm-8 col-md-7">
                <q-input
                  v-model="edit.item_name"
                  outlined
                  dense
                  label="Item Produksi"
                  square
                  stack-label
                  readonly
                  :disable="ref_action !== 'save'"
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      color="green-10"
                      size="sm"
                      @click="openitem()"
                    />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-12 col-sm-8 col-md-2">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.output_standard"
                  label="Jml. Standar"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.output_standard"
                      class="q-field__input text-right"
                      separator="."
                      precision="0"
                      disabled
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-12 col-sm-8 col-md-2">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.output_planning"
                  label="Rencana Produksi"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.output_planning"
                      class="q-field__input text-right"
                      separator="."
                      :precision="0"
                      :disabled="ref_action !== 'save'"
                      @input="calculate_production()"
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-12 col-sm-8 col-md-3">
                <q-input
                  v-model="edit.mou_inventory"
                  dense
                  outlined
                  type="text"
                  label="Satuan"
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
                  :disable="ref_action !== 'save'"
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
                  :disable="ref_action !== 'save'"
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-12">
                <q-select
                  v-model="edit.item_group"
                  :options="item_group_opt"
                  outlined
                  dense
                  options-dense
                  label="Kelompok Barang"
                  option-value="standard_code"
                  option-label="descriptions"
                  emit-value
                  map-options
                  use-input
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
                  :disable="ref_action !== 'save'"
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-6 col-sm-6 col-md-6">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.output_production"
                  label="Hasil Produksi"
                  disabled
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.output_production"
                      class="q-field__input text-right"
                      separator="."
                      precision="0"
                      disabled
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-6 col-sm-6 col-md-6">
                <q-input
                  v-model="edit.mou_inventory"
                  dense
                  outlined
                  type="text"
                  label="Satuan"
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
                <div v-else-if="col.name === 'quantity_item'">
                  <vue-numeric
                    v-model="props.row.quantity_item"
                    class="q-field__input right-input"
                    separator="."
                    precision="2"
                    disabled
                  />
                </div>
                <div v-else-if="col.name === 'package'">
                  1 {{ props.row.mou_issue }} = {{ props.row.convertion }}
                  {{ props.row.mou_inventory }}
                </div>
                <div v-else-if="col.name === 'quantity_standard'">
                  {{
                    $formatnumber(
                      props.row.quantity_standard,
                      2,
                      ',',
                      '0',
                      true
                    )
                  }}
                </div>
                <div v-else-if="col.name === 'quantity_update'">
                  {{ $formatnumber(props.row.quantity_update, 2) }}
                  {{ props.row.mou_inventory }}
                </div>
                <div v-else-if="col.name === 'item_cost'">
                  {{ $formatnumber(props.row.item_cost, 2, ',', 0, true) }}
                </div>
                <div v-else-if="col.name === 'line_cost'">
                  {{ $formatnumber(props.row.line_cost, 2, ',', 0, true) }}
                </div>
                <div v-else-if="col.name === 'remarks'">
                  <input
                    v-model="props.row.remarks"
                    class="q-field__input input-normal full-width"
                  />
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
          v-show="btn.is_allowed && !stateform"
          class="btn-toolbar q-mx-xs"
          :icon="btn.icon"
          :label="btn.caption"
          @click="runMethod(btn.onclick)"
        >
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
        <q-btn
          v-show="stateform"
          flat
          icon="save"
          :label="
            ref_action === 'production'
              ? 'Hasil Distribusi'
              : ref_action === 'deleted'
              ? 'Pembatalan '
              : 'Simpan'
          "
          class="btn-toolbar q-mx-sm"
          no-caps
          dense
          @click="save_data()"
          :loading="loading"
        >
          <template v-slot:loading>
            <q-spinner class="on-left" />
            Proses
          </template>
        </q-btn>
        <q-btn
          v-show="stateform"
          flat
          icon="undo"
          label="Batal"
          class="btn-toolbar q-mx-sm"
          no-caps
          dense
          @click="cancel_entry()"
        />
        <q-space />
        <q-btn
          icon="more_vert"
          flat
          dense
          class="btn-toolbar"
          label="Info"
          no-caps
        />
      </q-toolbar>
    </q-page-sticky>

    <itemsStock
      v-if="dlgItem"
      :show="dlgItem"
      :state="inv_group"
      :location="edit.location_id"
      flag="PRODUCTION"
      @CloseItems="getItem"
    />

    <itemsproduction
      v-if="dlgProduction"
      :show="dlgProduction"
      @CloseProduction="getProduction"
    />

    <q-dialog
      v-model="dlgResult"
      persistent
      position="top"
    >
      <q-card
        class="icard"
        square
        style="width: 500px; max-width: 80vw; max-height: 700px"
      >
        <q-bar class="entry-caption">
          Hasil Produksi<q-space />
          <q-btn
            flat
            dense
            icon="close"
            @click="close_production_form()"
          />
        </q-bar>
        <q-card-section class="q-pa-xs">
          <div class="row item-start q-col-gutter-sm q-mb-sm">
            <div class="col-xs-6 col-sm-4">
              <q-input
                v-model="edit.doc_number"
                disable
                dense
                outlined
                square
                label="No Produksi"
              />
            </div>
            <div class="col-xs-6 col-sm-4">
              <q-input
                v-model="edit.ref_date"
                disable
                dense
                outlined
                square
                label="Tanggal Produksi"
              />
            </div>
          </div>
          <div class="row item-start q-col-gutter-sm q-mb-sm">
            <div class="col-xs-6 col-sm-4">
              <q-input
                v-model="edit.item_code"
                disable
                dense
                outlined
                square
                label="Item Barang"
              />
            </div>
          </div>
          <div class="row item-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input
                v-model="edit.item_name"
                disable
                dense
                outlined
                square
                label="Item Barang"
              />
            </div>
          </div>
          <div class="row item-start q-col-gutter-sm q-mb-sm">
            <div class="col-xs-6 col-sm-4">
              <q-field
                square
                outlined
                stack-label
                dense
                :model-value="edit.output_planning"
                label="Rencana Produksi"
              >
                <template v-slot:control>
                  <vue-numeric
                    v-model="edit.output_planning"
                    class="q-field__input text-right"
                    separator="."
                    precision="0"
                    disabled
                  />
                </template>
              </q-field>
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.mou_inventory"
                disable
                dense
                outlined
                square
                label="Item Barang"
              />
            </div>
          </div>
          <div class="row item-start q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-input
                v-model="edit.production_date"
                dense
                outlined
                square
                type="date"
                label="Tgl. Selesai Produksi"
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.production_time"
                dense
                outlined
                square
                type="time"
                label="Jam Selesai Produksi"
              />
            </div>
          </div>
          <div class="row item-start q-col-gutter-sm q-mb-sm">
            <div class="col-xs-6 col-sm-4">
              <q-field
                square
                outlined
                stack-label
                dense
                :model-value="edit.output_production"
                label="Hasil Produksi"
              >
                <template v-slot:control>
                  <vue-numeric
                    v-model="edit.output_production"
                    class="q-field__input text-right"
                    separator="."
                    precision="0"
                  />
                </template>
              </q-field>
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.mou_inventory"
                disable
                dense
                outlined
                square
                label="Item Barang"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section
          class="q-pa-xs entry-caption"
          align="right"
        >
          <q-btn
            flat
            dense
            icon="save"
            label="Simpan"
            no-caps
            class="q-mr-md"
            square
            @click="save_production()"
          />
          <q-btn
            flat
            dense
            icon="cancel"
            label="Batal"
            no-caps
            square
            @click="close_production_form()"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ymd } from 'boot/engine'
import itemsproduction from 'components/inventory/ItemsProduction.vue'
import itemsStock from 'components/master/ItemsStock.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ItemsProduction',
  components: { itemsStock, itemsproduction },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const loading = ref(false)
    const date1 = ref(null)
    const date2 = ref(null)
    const stateform = ref(false)
    const edit = ref({})
    const title = ref('Tambah Data')
    const filter = ref('')
    const dlgItem = ref(false)
    const operation = ref('')
    const ref_action = ref('')
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})

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
        label: 'Item barang',
        sytle: 'width: 250px',
        headerStyle: 'width: 250px',
        field: 'item_name'
      },
      {
        name: 'quantity_standard',
        align: 'right',
        sytle: 'width: 50px',
        headerStyle: 'width: 50px',
        label: 'Standar',
        field: 'quantity_standard'
      },
      {
        name: 'quantity_item',
        align: 'right',
        sytle: 'width: 50px',
        headerStyle: 'width: 50px',
        label: 'Kebutuhan',
        field: 'quantity_item'
      },
      {
        name: 'mou_inventory',
        align: 'left',
        sytle: 'width: 60px',
        headerStyle: 'width: 60px',
        label: 'Satuan',
        field: 'mou_inventory'
      },
      {
        name: 'item_cost',
        align: 'right',
        sytle: 'width: 90px',
        headerStyle: 'width: 90px',
        label: 'Harga Item',
        field: 'item_cost'
      },
      {
        name: 'line_cost',
        align: 'right',
        sytle: 'width: 120px',
        headerStyle: 'width: 120px',
        label: 'Total',
        field: 'line_cost'
      },
      {
        name: 'remarks',
        align: 'left',
        label: 'Catatan',
        field: 'remarks'
      }
    ])
    const detail = ref([])
    const selected_detail = ref([])
    const pagination_detail = ref({
      sortBy: 'line_no',
      descending: false,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 50
    })
    const current_row = ref(-1)
    const Filtered = ref(false)
    const postate = ref(false)
    const posted = ref(false)
    const deleted = ref(false)
    const is_posted = ref(false)
    const is_cancel = ref(false)
    const lblSave = ref('Simpan')
    const warehouse_opt = ref([])
    const item_group_opt = ref([])
    const inv_group = ref('')
    const dlgProduction = ref(false)
    const dlgResult = ref(false)

    function runMethod(method, transid = -1) {
      this[method](transid)
    }

    async function add_event() {
      let today = new Date()
      stateform.value = true
      ref_action.value = 'save'
      edit.value = {
        sysid: -1,
        ref_date: ymd(today),
        ref_time: today.getHours() + ':' + today.getMinutes() + ':00',
        doc_number: '(NEW)',
        location_id: null,
        item_group: '',
        remarks: '',
        total: 0,
        ref_number: '',
        item_sysid: -1,
        item_code: '',
        item_name: '',
        uuid_rec: '(NEW)'
      }
      detail.value = []
    }

    async function edit_event(uuidrec = '') {
      dlgProduction.value = true
      ref_action.value = 'save'
    }

    async function delete_event(uuidrec = '') {
      dlgProduction.value = true
      ref_action.value = 'deleted'
    }

    function result_event(uuidrec = '') {
      dlgProduction.value = true
      ref_action.value = 'result'
    }

    function save_data() {
      $q.dialog({
        title: 'Konfirmasi',
        message:
          ref_action.value === 'save'
            ? 'Apakah Pengeluaran bahan baku/material produksi akan disimpan ?'
            : 'Apakah Pengeluaran bahan baku/material produksi akan dibatalkan (void) ?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          let app = {}
          app.header = edit.value
          app.detail = detail.value
          app.url = 'inventory/item/production'
          app.progress = true
          let respon = {}
          if (ref_action.value !== 'deleted') {
            respon = await $store.dispatch('master/POST_DATA', app)
          } else {
            respon = await $store.dispatch('master/DELETE_DATA', app)
          }
          if (!(typeof respon === 'undefined')) {
            let msg = respon.data
            if (respon.success) {
              stateform.value = false
              ref_action.value = ''
              $q.notify({
                color: 'positive',
                textcolor: 'white',
                message: msg,
                position: 'top',
                timeout: 2000
              })
              edit.value = {}
              detail.value = []
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

    async function print_event(transid = -1) {
      if (selected.value.length > 0 || !(transid === -1)) {
        if (transid === -1) {
          let item = selected.value[0]
          transid = item.transid
        }
        $q.loading.show({ delay: 200 })
        try {
          let props = {}
          props.url = api_url.value.print
          props.transid = transid
          await $store.dispatch('master/GET_DOWNLOAD', props)
        } finally {
          $q.loading.hide()
        }
      }
    }

    function openitem() {
      dlgItem.value = true
    }

    function getItem(closed, data) {
      dlgItem.value = closed
      if (!(typeof data.item_code === 'undefined')) {
        edit.value.item_sysid = data.sysid
        edit.value.item_code = data.item_code
        edit.value.item_name = data.item_name + '( ' + data.item_code + ' )'
        edit.value.mou_inventory = data.mou_inventory
        if (data.inventory_group === 'MEDICAL') {
          edit.value.item_group = 'C004@M'
        } else if (data.inventory_group === 'GENERAL') {
          edit.value.item_group = 'C004@G'
        } else if (data.inventory_group === 'NUTRITION') {
          edit.value.item_group = 'C004@G'
        }
        let props = {}
        props.url = 'inventory/item/production/billofmaterial'
        props.sysid = data.sysid
        props.location_id = edit.value.location_id
        console.info(JSON.stringify(data))
        $store.dispatch('master/GET_DATA', props).then((response) => {
          edit.value.output_standard = response.item.quantity_production
          edit.value.output_planning = response.item.quantity_production
          detail.value = []

          let row = {}
          response.bom.forEach((el) => {
            row = {
              line_no: detail.value.length,
              item_sysid: el.bom_sysid,
              item_code: el.item_code,
              item_name: el.item_name,
              quantity_standard: el.quantity_bom,
              quantity_item: el.quantity_bom,
              mou_inventory: el.mou_inventory,
              item_cost: el.cogs,
              line_cost: el.cogs * el.quantity_bom,
              remarks: ''
            }
            detail.value.push(row)
          })
        })
      }
    }

    function cancel_entry() {
      stateform.value = false
      edit.value = {}
      detail.value = []
      ref_action.value = ''
    }

    function getProduction(closed, data) {
      dlgProduction.value = closed
      if (typeof data.uuid_rec !== 'undefined') {
        let props = {}
        props.url = 'inventory/item/production/get'
        props.uuidrec = data.uuid_rec
        $store.dispatch('master/GET_DATA', props).then((response) => {
          edit.value = response.header
          detail.value = response.detail
          stateform.value = true
          if (ref_action.value === 'result') {
            dlgResult.value = true
          }
        })
      }
    }

    function calculate_production() {
      let i = 0
      let recalculate = edit.value.output_planning / edit.value.output_standard
      for (i = 0; i < detail.value.length; i++) {
        detail.value[i].quantity_item =
          detail.value[i].quantity_standard * recalculate
        detail.value[i].quantity_update =
          detail.value[i].quantity_standard * recalculate
        detail.value[i].line_cost =
          detail.value[i].quantity_item * detail.value[i].item_cost
      }
    }

    function close_production_form() {
      dlgResult.value = false
      stateform.value = false
      edit.value = {}
      detail.value = []
      ref_action.value = ''
    }

    function save_production() {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah hasil produksi ini sudah benar dan akan disimpan ?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          let app = {}
          app.data = {
            uuid_rec: edit.value.uuid_rec,
            production_date: edit.value.production_date,
            production_time: edit.value.production_time,
            output_production: edit.value.output_production
          }
          app.url = 'inventory/item/production/result'
          app.progress = true
          let respon = {}
          respon = await $store.dispatch('master/POST_DATA', app)
          if (!(typeof respon === 'undefined')) {
            let msg = respon.data
            if (respon.success) {
              stateform.value = false
              ref_action.value = ''
              $q.notify({
                color: 'positive',
                textcolor: 'white',
                message: msg,
                position: 'top',
                timeout: 2000
              })
              edit.value = {}
              detail.value = []
              dlgResult.value = false
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
      let skrng = new Date()
      date1.value = ymd(skrng)
      date2.value = ymd(skrng)

      let props = {}
      props.url = 'master/inventory/warehouse/list'
      props.type = 'DISTRIBUSTION'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        warehouse_opt.value = response
      })

      props = {}
      props.url = 'setup/application/standard-code/list'
      props.parent_code = 'C004'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        item_group_opt.value = response
      })
    })

    return {
      loading,
      stateform,
      data,
      edit,
      title,
      filter,
      selected,
      columns,
      pagetitle,
      api_url,
      btns,
      access,
      runMethod,
      add_event,
      edit_event,
      delete_event,
      save_data,
      date1,
      date2,
      pagination_detail,
      detail,
      selected_detail,
      current_row,
      print_event,
      Filtered,
      postate,
      coldetail,
      dlgItem,
      getItem,
      operation,
      openitem,
      posted,
      deleted,
      is_posted,
      is_cancel,
      lblSave,
      warehouse_opt,
      item_group_opt,
      inv_group,
      ref_action,
      cancel_entry,
      dlgProduction,
      result_event,
      calculate_production,
      getProduction,
      dlgResult,
      close_production_form,
      save_production
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
