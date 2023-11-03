<template>
  <q-page class="page-app">
    <q-card
      square
      class="icard"
    >
      <q-bar
        dense
        class="entry-caption"
      >
        <span
          ><strong>{{ pagetitle }}</strong></span
        >
        <q-space />
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-start q-mb-sm q-col-gutter-xs">
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="edit.doc_number"
              readonly
              dense
              outlined
              type="text"
              label="No.Opname"
              square
              stack-label
            />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="edit.reference"
              dense
              outlined
              type="text"
              label="Referesi Dokumen"
              square
              stack-label
            />
          </div>
          <div class="col-xs-6 col-sm-3 offset-md-4 col-md-2">
            <q-input
              v-model="edit.ref_date"
              dense
              outlined
              type="date"
              label="Tanggal"
              square
              stack-label
            />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="edit.ref_time"
              dense
              outlined
              type="time"
              label="Jam"
              square
              stack-label
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-xs q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-select
              v-model="edit.location_id"
              :options="warehouse_opt"
              outlined
              dense
              options-dense
              label="Lokasi/Gudang"
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
          <div class="col-xs-12 col-sm-6 offset-md-4 col-md-4">
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
      </q-card-section>
      <q-table
        flat
        square
        :rows="detail"
        :columns="coldetail"
        dense
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="line_no"
        separator="cell"
        selection="single"
        v-model:selected="selected_detail"
        v-model:pagination="pagination_detail"
        class="grid-tables fit-table-entry"
      >
        <template v-slot:top>
          <q-btn
            v-show="!viewonly"
            label="Tambah"
            dense
            no-caps
            flat
            icon="add"
            class="text-primary"
            @click="addrow"
          />
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
                    v-show="!viewonly"
                    name="delete"
                    color="red"
                    size="xs"
                    @click="removeRow(props.row.line_no)"
                  />
                </div>
                <div v-else-if="col.name === 'notes'">
                  <input
                    v-model="props.row.notes"
                    type="text"
                    style="width: 150px"
                    class="input"
                    :disabled="viewonly === true"
                  />
                </div>
                <div v-else-if="col.name === 'current_stock'">
                  <span>{{ $formatnumber(props.row.current_stock, 2) }}</span>
                </div>
                <div v-else-if="col.name === 'opname_stock'">
                  <vue-numeric
                    v-model="props.row.opname_stock"
                    precision="2"
                    style="width: 80px"
                    thousand-separator="."
                    class="right-input"
                    @input="calculate(props.row.line_no)"
                    :disabled="viewonly === true"
                  />
                </div>
                <div v-else-if="col.name === 'adjustment_stock'">
                  <span>{{
                    $formatnumber(props.row.adjustment_stock, 2)
                  }}</span>
                </div>
                <div v-else-if="col.name === 'cost_current'">
                  <span>{{ $formatnumber(props.row.cost_current, 2) }}</span>
                </div>
                <div v-else-if="col.name === 'cost_adjustment'">
                  <vue-numeric
                    v-model="props.row.cost_adjustment"
                    precision="2"
                    style="width: 80px"
                    thousand-separator="."
                    class="right-input"
                    @input="calculate(props.row.line_no)"
                    :disabled="viewonly === true"
                  />
                </div>
                <div v-else-if="col.name === 'final_adjustment'">
                  {{ $formatnumber(props.row.final_adjustment,2) }}
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
          class="btn-toolbar q-mr-sm"
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
          dense
          icon="save"
          label="Simpan"
          class="btn-toolbar q-mx-sm"
          no-caps
          :disable="viewonly === true"
          @click="save_event()"
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
          dense
          icon="undo"
          label="Batal"
          class="btn-toolbar q-mr-sm"
          no-caps
          @click="cancel_event()"
        />
        <q-space />
        <q-btn
          icon="more_vert"
          flat
          rounded
          dense
        />
      </q-toolbar>
    </q-page-sticky>
    <itemsStock
      v-if="dlgItem"
      :show="dlgItem"
      :state="inv_group"
      :location="edit.location_id"
      flag=""
      @CloseItems="getItem"
    />
    <ItemsAdjustment
      v-if="dlgAdjustment"
      :show="dlgAdjustment"
      @CloseAdjustment="GetAddjustment"
    />
  </q-page>
</template>

<script>
import itemsStock from 'components/master/ItemsStock.vue'
import ItemsAdjustment from 'src/components/inventory/ItemsAdjustment.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ItemCorrection',
  components: { itemsStock, ItemsAdjustment },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()
    const ref_action = ref('')
    const dlgItem = ref(false)
    const warehouse_opt = ref([])
    const stateform = ref(false)
    const edit = ref({})
    const title = ref('Tambah Data')
    const item_group_opt = ref([])

    const filter = ref('')
    const disable = ref(false)
    const pagination = ref({
      sortBy: 'ref_date',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })

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
        sytle: 'width: 100px',
        headerStyle: 'width: 100px',
        label: 'Kode',
        field: 'item_code'
      },
      {
        name: 'item_name',
        align: 'left',
        label: 'Nama Item/Barang',
        sytle: 'width: 250px',
        field: 'item_name'
      },
      {
        name: 'current_stock',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Stock Komputer',
        field: 'current_stock'
      },
      {
        name: 'opname_stock',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Stock Real',
        field: 'opname_stock'
      },
      {
        name: 'adjustment_stock',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Koreksi',
        field: 'adjustment_stock'
      },
      {
        name: 'cost_current',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Harga Komputer',
        field: 'cost_current'
      },
      {
        name: 'mou_inventory',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Satuan Stock',
        field: 'mou_inventory'
      },
      {
        name: 'cost_adjustment',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Harga Real',
        field: 'cost_adjustment'
      },
      {
        name: 'final_adjustment',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Selisih',
        field: 'final_adjustment'
      },
      {
        name: 'notes',
        align: 'left',
        sytle: 'width: 150px',
        headerStyle: 'width: 150px',
        label: 'Catatan',
        field: 'notes'
      }
    ])
    const detail = ref([])
    const selected_detail = ref([])
    const pagination_detail = ref({
      sortBy: 'line_no',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
    const current_row = ref(-1)
    const itemcode = ref('')
    const viewonly = ref(false)
    const loading = ref(false)
    const operation = ref(false)
    const inv_group = ref('')
    const dlgAdjustment = ref(false)

    function runMethod(method) {
      this[method]()
    }

    async function add_event() {
      let skrng = new Date()
      stateform.value = true
      ref_action.value = 'save'
      viewonly.value = false
      edit.value = {
        sysid: -1,
        ref_date: skrng.toLocaleDateString('en-CA'),
        ref_time: skrng.getHours() + ':' + skrng.getMinutes(),
        doc_number: '(NEW)',
        location_name: '',
        location_id: null,
        reference: '',
        notes: '-',
        item_group: '',
        adjustment_cost: 0,
        document_type: '',
        uuid_rec: '(NEW)'
      }
      detail.value = []
    }

    async function view_event(uuidrec = '') {
      ref_action.value = 'save'
      viewonly.value = true
      dlgAdjustment.value = true
    }

    async function save_event() {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah koreksi stock ini akan disimpan ?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        let app = {}
        app.header = edit.value
        app.detail = detail.value
        app.url = 'inventory/item/adjustment'
        app.progress = true
        $store.dispatch('master/POST_DATA', app).then((respon) => {
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
                timeout: 2000
              })
            }
          }
        })
      })
    }

    async function print_event(uuidrec = '') {}

    async function addrow() {
      dlgItem.value = true
    }

    function removeRow(lineno) {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah item ini akan dihapus ?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        let i = -1
        for (i = 0; i < detail.value.length; i++) {
          if (detail.value[i].line_no === lineno) {
            detail.value.splice(i, 1)
          }
        }
        for (i = 0; i < detail.value.length; i++) {
          detail.value[i].line_no = i + 1
        }
        selected_detail.value = []
      })
    }

    function getItem(closed, data) {
      dlgItem.value = closed
      if (!(typeof data.item_code === 'undefined')) {
        let row = {}
        row = {
          sysid: -1,
          line_no: detail.value.length + 1,
          item_sysid: data.sysid,
          item_code: data.item_code,
          item_name: data.item_name,
          mou_inventory: data.mou_inventory,
          current_stock: data.on_hand,
          opname_stock: data.on_hand,
          adjustment_stock: 0,
          end_stock: 0,
          cost_current: data.cogs,
          cost_adjustment: data.cogs,
          final_adjustment: 0,
          notes: ''
        }
        detail.value.push(row)
      }
    }

    function calculate(lineno) {
      let idx = lineno - 1
      let current = detail.value[idx].current_stock
      let opname = detail.value[idx].opname_stock
      let realcost = detail.value[idx].cost_adjustment
      detail.value[idx].adjustment_stock = opname - current
      detail.value[idx].end_stock = opname
      detail.value[idx].final_adjustment = realcost * (opname - current)
    }

    function change_group() {
      item_group_opt.value.forEach((el) => {
        if (edit.value.item_group === el.standard_code) {
          inv_group.value = el.value
          detail.value = []
        }
      })
    }

    function cancel_event() {
      stateform.value = false
      edit.value = {}
      detail.value = []
      ref_action.value = ''
    }

    function GetAddjustment(closed, data) {
      dlgAdjustment.value = closed
      if (typeof data.uuid_rec !== 'undefined') {
        let props = {}
        props.url = 'inventory/item/adjustment/get'
        props.uuidrec = data.uuid_rec
        $store.dispatch('master/GET_DATA', props).then((response) => {
          edit.value = response.header
          detail.value = response.detail
          stateform.value = true
        })
      }
    }

    onMounted(async () => {
      let props = {}
      props.url = 'master/inventory/warehouse/list'
      props.type = 'DISTRIBUSTION'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        warehouse_opt.value = response
      })

      let property = await $store.dispatch(
        'home/GET_PAGEPROPERTY',
        $router.currentRoute.value.fullPath
      )
      columns.value = property.columns
      pagetitle.value = property.title
      api_url.value = property.url
      btns.value = property.btn
      access.value = property.access

      props = {}
      props.url = 'setup/application/standard-code/list'
      props.parent_code = 'C004'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        item_group_opt.value = response
      })
    })

    return {
      change_group,
      inv_group,
      operation,
      dlgItem,
      warehouse_opt,
      stateform,
      edit,
      title,
      filter,
      disable,
      pagination,
      selected,
      columns,
      pagetitle,
      api_url,
      btns,
      access,
      coldetail,
      detail,
      selected_detail,
      pagination_detail,
      current_row,
      runMethod,
      add_event,
      save_event,
      print_event,
      addrow,
      removeRow,
      getItem,
      calculate,
      itemcode,
      view_event,
      viewonly,
      loading,
      item_group_opt,
      ref_action,
      cancel_event,
      dlgAdjustment,
      GetAddjustment
    }
  }
})
</script>
<style lang="scss">
.fit-table-entry {
  height: -webkit-calc(100vh - 230px) !important;
  height: -moz-calc(100vh - 230px) !important;
  height: calc(100vh - 230px) !important;

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
