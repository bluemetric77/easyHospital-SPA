<template>
  <q-page class="page-app">
    <q-card
      class="icard"
      square
    >
      <q-bar class="entry-caption">
        {{ pagetitle }}
        <q-space />
        <div
          v-if="
            typeof edit.is_posted !== 'undefined' &&
            typeof edit.is_void !== 'undefined'
          "
        >
          <q-chip
            flat
            outline
            :color="
              edit.is_approved === '1'
                ? 'green'
                : edit.is_void === '1'
                ? 'red'
                : ''
            "
            :icon-right="
              edit.is_approved === '1'
                ? 'thumb_up'
                : edit.is_void === '1'
                ? 'thumb_down'
                : ''
            "
            size="sm"
          >
            {{
              edit.is_approved === '1'
                ? 'SUDAH DISETUJUI'
                : edit.is_void === '1'
                ? 'SUDAH DIBATALKAN'
                : ''
            }}
          </q-chip>
        </div>
      </q-bar>

      <q-card-section class="q-pa-sm">
        <div class="row items-start q-col-gutter-xs q-mb-sm">
          <div class="col-xs-12 col-sm-7 col-md-6">
            <div class="row items-start q-mb-sm q-col-gutter-xs">
              <div class="col-xs-6 col-sm-4 col-md-3">
                <q-input
                  v-model="edit.doc_number"
                  readonly
                  dense
                  outlined
                  type="text"
                  label="No.Permintaan"
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
                  v-model="edit.location_id_from"
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
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-12 col-sm-8 col-md-7">
                <q-select
                  v-model="edit.location_id_to"
                  :options="warehouse_opt"
                  outlined
                  dense
                  options-dense
                  label="Kepada Lokasi"
                  option-value="sysid"
                  option-label="location_name"
                  emit-value
                  map-options
                  use-input
                  square
                  stack-label
                  :disable="ref_action !== 'save'"
                />
              </div>
            </div>
          </div>
          <div class="col-xs-12 col-sm-5 offset-md-2 col-md-4">
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-3">
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
              <div class="col-3">
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
                  :disable="ref_action !== 'save'"
                  v-on:update:model-value="change_group()"
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-sm">
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
        <template v-slot:top>
          <q-tr align="left">
            <q-td colspan="100%">
              <q-btn
                v-show="stateform === true && ref_action === 'save'"
                label="Tambah item"
                dense
                no-caps
                flat
                class="btn-link cursor-pointer"
                @click="addrow"
              />
            </q-td>
          </q-tr>
        </template>
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
                  <q-icon
                    v-show="ref_action !== 'deleted'"
                    name="delete"
                    color="red"
                    size="xs"
                    @click="removeRow(props.row.line_no)"
                  />
                </div>
                <div v-else-if="col.name === 'quantity_order'">
                  <vue-numeric
                    v-model="props.row.quantity_order"
                    class="q-field__input right-input"
                    separator="."
                    :disable="ref_action !== 'save'"
                    @input="
                      props.row.quantity_request =
                        props.row.quantity_order * props.row.convertion
                    "
                  />
                </div>
                <div v-else-if="col.name === 'quantity_distribution'">
                  {{ $formatnumber(props.row.quantity_distribution, 2) }}
                  {{ props.row.mou_inventory }}
                </div>
                <div v-else-if="col.name === 'package'">
                  {{ props.row.convertion }} {{ props.row.mou_inventory }}
                </div>
                <div v-else-if="col.name === 'request'">
                  {{ props.row.quantity_request }} {{ props.row.mou_inventory }}
                </div>
                <div v-else-if="col.name === 'quantity_received'">
                  {{ $formatnumber(props.row.quantity_received, 2) }}
                  {{ props.row.mou_inventory }}
                </div>
                <div v-else-if="col.name === 'distribution_date'">
                  {{ $INDDateTime2(props.row.distribution_date) }}
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
            ref_action === 'approved'
              ? 'Persetujuan'
              : ref_action === 'deleted'
              ? 'Pembatalan Permintaan'
              : ref_action === 'reopen'
              ? 'Batal Persetujuan'
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
      </q-toolbar>
    </q-page-sticky>

    <items
      v-if="dlgItem"
      :show="dlgItem"
      :state="inv_group"
      @CloseItems="getItem"
    />

    <ItemsRequest
      v-if="dlgRequest"
      :show="dlgRequest"
      state="A"
      @CloseRequest="getRequest"
    />
  </q-page>
</template>

<script>
import { ymd } from 'boot/engine'
import items from 'components/master/Items.vue'
import ItemsRequest from 'components/inventory/ItemsRequest.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ItemRequest',
  components: { items, ItemsRequest },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const loading = ref(false)
    const date1 = ref(null)
    const date2 = ref(null)
    const stateform = ref(false)
    const edit = ref({})
    const patient = ref({})
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
        label: 'Keterangan',
        sytle: 'width: 250px',
        headerStyle: 'width: 250px',
        field: 'item_name'
      },
      {
        name: 'quantity_order',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Jml.Permintaan',
        field: 'quantity_order'
      },
      {
        name: 'mou_request',
        align: 'left',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Satuan Minta',
        field: 'mou_request'
      },
      {
        name: 'package',
        align: 'left',
        label: 'Kemasan',
        field: 'package'
      },
      {
        name: 'request',
        align: 'left',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Permintaan',
        field: 'request'
      },
      {
        name: 'distribution_date',
        align: 'left',

        label: 'Tgl.Distribusi',
        field: 'distribution_date'
      },
      {
        name: 'distribution_number',
        align: 'left',
        label: 'No.Distribusi',
        field: 'distribution_number'
      },
      {
        name: 'quantity_distribution',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Jml.Distribusi',
        field: 'quantity_distribution'
      },
      {
        name: 'quantity_received',
        align: 'right',
        label: 'Jml.Terima',
        field: 'quantity_received'
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
    const dlgRequest = ref(false)

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
        ref_time: today.getHours() + ':' + today.getMinutes(),
        doc_number: '(NEW)',
        location_id_from: null,
        location_id_to: null,
        remarks: '',
        total: 0,
        uuid_rec: '(NEW)'
      }
      detail.value = []
    }

    async function edit_event(uuidrec = '') {
      dlgRequest.value = true
      ref_action.value = 'save'
    }

    async function approved_event(uuidrec = '') {
      dlgRequest.value = true
      ref_action.value = 'approved'
    }

    async function delete_event(transid = '') {
      dlgRequest.value = true
      ref_action.value = 'deleted'
    }
    async function reopen_event(transid = '') {
      dlgRequest.value = true
      ref_action.value = 'reopen'
    }
    function save_data() {
      $q.dialog({
        title: 'Konfirmasi',
        message:
          ref_action.value === 'save'
            ? 'Apakah permintaan barang ini akan disimpan ?'
            : ref_action.value === 'deleted'
            ? 'Apakah permintaan barang ini akan dibatalkan ?'
            : ref_action.value === 'reopen'
            ? 'Apakah permintaan barang ini akan dibuka kembali ?'
            : 'Apakah permintaan barang ini akan disetujui ?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          let app = {}
          app.header = edit.value
          app.detail = detail.value
          if (ref_action.value === 'save') {
            app.url = 'inventory/item/request'
          } else if (ref_action.value === 'approved') {
            app.url = 'inventory/item/request/posting'
          } else if (ref_action.value === 'deleted') {
            app.url = 'inventory/item/request'
          } else if (ref_action.value === 'reopen') {
            app.url = 'inventory/item/request/reopen'
          }
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

    async function addrow() {
      openitem(-1)
    }

    function removeRow(lineno) {
      let i = -1
      for (i = 0; i < detail.value.length; i++) {
        if (detail.value[i].line_no === lineno) {
          detail.value.splice(i, 1)
        }
      }
      let totalpo = 0
      for (i = 0; i < detail.value.length; i++) {
        detail.value[i].line_no = i + 1
        totalpo = totalpo + detail.value[i].total
      }
      selected_detail.value = []
      edit.value.total = totalpo
    }

    function openitem(lineno) {
      dlgItem.value = true
      current_row.value = lineno
    }

    function getItem(closed, data) {
      dlgItem.value = closed
      if (!(typeof data.item_code === 'undefined')) {
        let row = {}
        row = {
          transid: -1,
          line_no: detail.value.length + 1,
          item_id: data.sysid,
          item_code: data.item_code,
          item_name: data.item_name1,
          mou_request: data.mou_purchase,
          mou_inventory: data.mou_inventory,
          convertion: data.conversion,
          quantity_order: 0,
          quantity_request: 0,
          quantity_distribution: 0,
          quantity_received: 0
        }
        detail.value.push(row)
        console.info(JSON.stringify(row))
      }
    }

    function changeitem_mou(itemcode, mou) {
      let props = {}
      props.url = 'master/mou/itemmou'
      props.item_code = itemcode
      props.mou = mou
      $store.dispatch('master/GET_DATA', props).then((respon) => {
        let info = respon
        if (typeof info !== 'undefined') {
          let i = 0
          for (i = 0; i < detail.value.length; i++) {
            if (detail.value[i].item_code === itemcode) {
              detail.value[i].price = info.purchase_price
              detail.value[i].prc_discount1 = info.purchase_discount
              detail.value[i].prc_tax = info.vat
              detail.value[i].current_stock = 0
              detail.value[i].conversion = info.conversion
              calculate(detail.value[i].line_no, true)
            }
          }
        }
      })
    }
    function change_group() {
      item_group_opt.value.forEach((el) => {
        if (edit.value.item_group === el.standard_code) {
          inv_group.value = el.value
          detail.value = []
        }
      })
    }

    function cancel_entry() {
      stateform.value = false
      edit.value = {}
      detail.value = []
      ref_action.value = ''
    }

    function getRequest(closed, data) {
      dlgRequest.value = closed
      if (typeof data.uuid_rec !== 'undefined') {
        let props = {}
        props.url = 'inventory/item/request/get'
        props.uuidrec = data.uuid_rec
        $store.dispatch('master/GET_DATA', props).then((response) => {
          edit.value = response.header
          detail.value = response.detail
          stateform.value = true
        })
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
      getRequest,
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
      removeRow,
      operation,
      addrow,
      openitem,
      posted,
      deleted,
      is_posted,
      is_cancel,
      lblSave,
      warehouse_opt,
      dlgRequest,
      item_group_opt,
      change_group,
      inv_group,
      changeitem_mou,
      approved_event,
      ref_action,
      cancel_entry,
      reopen_event
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
