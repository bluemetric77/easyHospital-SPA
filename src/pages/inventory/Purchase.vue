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
            class="glossy"
            :color="edit.is_process === '1' ? 'green-10' : ''"
            text-color="white"
            :icon-right="edit.is_process === '1' ? 'thumb_up' : ''"
          >
            {{ edit.is_posted === '1' ? 'TERINVOICE' : '' }}
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
                  label="No.Pembelian"
                  square
                  stack-label
                />
              </div>
              <div class="col-xs-6 col-sm-4 col-md-4">
                <q-input
                  v-model="edit.invoice_number"
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
            <div class="row items-start q-mb-sm q-col-gutter-xs">
              <div class="col-xs-6 col-sm-4 col-md-3">
                <q-select
                  v-model="edit.ref_document"
                  :options="refopt"
                  outlined
                  dense
                  options-dense
                  label="Jenis Pembelian"
                  emit-value
                  map-options
                  fill-input
                  square
                  stack-label
                  :disable="ref_action !== 'save'"
                  @update:model-value="changeref"
                />
              </div>
              <div class="col-xs-6 col-sm-4 col-md-4">
                <q-input
                  v-model="edit.order_number"
                  label="Dokumen Pemesanan"
                  outlined
                  dense
                  square
                  stack-label
                  :readonly="edit.ref_document === 'Penerimaan PO'"
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      size="sm"
                      v-show="edit.ref_document === 'Penerimaan PO'"
                      @click="open_Order()"
                    />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-12 col-sm-8 col-md-7">
                <q-input
                  v-model="edit.partner_name"
                  dense
                  outlined
                  square
                  readonly
                  label="Nama Supplier"
                  stack-label
                  :disable="ref_action !== 'save'"
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      size="sm"
                      @click="dlgSupplier = true"
                    />
                  </template>
                </q-input>
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
                  label="Tanggal Pembelian"
                  square
                  stack-label
                  :disable="ref_action !== 'save'"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="edit.term_id"
                  :options="term_opt"
                  outlined
                  dense
                  options-dense
                  label="Termin Pembayaran"
                  option-value="standard_code"
                  option-label="descriptions"
                  emit-value
                  map-options
                  square
                  stack-label
                  :disable="ref_action !== 'save'"
                  v-on:update:model-value="change_term()"
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <q-input
                  v-model="edit.due_date"
                  dense
                  outlined
                  type="date"
                  label="Jatuh Tempo"
                  square
                  stack-label
                  :disable="ref_action !== 'save'"
                />
              </div>
              <div class="col-6">
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
                  square
                  stack-label
                  :disable="ref_action !== 'save'"
                  v-on:update:model-value="change_group()"
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-12">
                <q-select
                  v-model="edit.location_id"
                  :options="warehouse_opt"
                  outlined
                  dense
                  options-dense
                  label="Lokasi"
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
                label="Tambah"
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
                <div v-if="col.name === 'qty_order'">
                  {{ $formatnumber(props.row.qty_order, 2) }}
                </div>
                <div v-else-if="col.name === 'qty_received'">
                  <vue-numeric
                    v-model="props.row.qty_received"
                    class="q-field__input right-input"
                    separator="."
                    @input="calculate(props.row.line_no)"
                    :disabled="edit.is_process === '1'"
                  />
                </div>
                <div v-else-if="col.name === 'package'">
                  {{ props.row.conversion }} {{ props.row.mou_inventory }}
                </div>
                <div v-else-if="col.name === 'price'">
                  <vue-numeric
                    v-model="props.row.price"
                    class="q-field__input right-input"
                    separator="."
                    @input="calculate(props.row.line_no, true)"
                    :disabled="edit.is_process === '1'"
                  />
                </div>
                <div v-else-if="col.name === 'prc_discount1'">
                  <vue-numeric
                    v-model="props.row.prc_discount1"
                    class="q-field__input right-input"
                    separator="."
                    precision="2"
                    @input="calculate(props.row.line_no)"
                    :disabled="edit.is_process === '1'"
                  />
                </div>
                <div v-else-if="col.name === 'prc_discount2'">
                  <vue-numeric
                    v-model="props.row.prc_discount2"
                    class="q-field__input right-input"
                    separator="."
                    precision="2"
                    @input="calculate(props.row.line_no)"
                    :disabled="edit.is_process === '1'"
                  />
                </div>
                <div v-else-if="col.name === 'prc_tax'">
                  <vue-numeric
                    v-model="props.row.prc_tax"
                    class="q-field__input right-input"
                    precision="2"
                    separator="."
                    @input="calculate(props.row.line_no)"
                    :disabled="edit.is_process === '1'"
                  />
                </div>
                <div v-else-if="col.name === 'total'">
                  <vue-numeric
                    v-model="props.row.total"
                    class="q-field__input right-input"
                    separator="."
                    @input="calculate(props.row.line_no)"
                    disabled
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
          label="Simpan"
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
          v-show="stateform"
          flat
          icon="more_vert"
          class="btn-toolbar q-mr-sm text-yellow-10 text-bold"
          no-caps
          dense
          rounded
          @click="stateform = false"
        />
      </q-toolbar>
    </q-page-sticky>

    <q-dialog
      v-model="dlgOrder"
      persistent
    >
      <q-card
        square
        style="width: 1000px; max-width: 95vw"
      >
        <q-bar class="entry-caption">
          Pemesanan Pembelian
          <q-space />
          <q-btn
            icon="close"
            size="sm"
            dense
            flat
            rounded
            v-close-popup
          />
        </q-bar>
        <q-card-section class="q-pa-xs">
          <div class="row items-start q-gutter-sm">
            <q-input
              v-model="filter_order"
              placeholder="Pencarian data"
              outlined
              square
              dense
              class="full-width"
              debounce="500"
            >
              <template v-slot:append>
                <q-icon
                  name="search"
                  color="green-10"
                  size="sm"
                />
              </template>
            </q-input>
          </div>
        </q-card-section>
        <q-table
          square
          dense
          :rows="Orders"
          :columns="colOrder"
          no-data-label="data kosong"
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="sysid"
          separator="cell"
          selection="single"
          v-model:selected="selected_Order"
          v-model:pagination="pagination_Order"
          binary-state-sort
          class="grid-tables fit-table-ui-dialog-with-parameter"
          virtual-scroll
          @request="onRequestOrder"
          :loading="loading_table"
          :filter="filter_order"
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
                class="bg-blue-grey-10 text-white"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              @click="props.selected = !props.selected"
              :class="
                props.row.is_cancel === '1'
                  ? 'q-pa-xs text-grey'
                  : props.row.is_posted === '1'
                  ? 'q-pa-xs text-green-10'
                  : props.row.is_cancel === '1'
                  ? 'q-pa-xs text-red-10 text-strike'
                  : 'q-pa-xs'
              "
            >
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                <div class="grid-data">
                  <div v-if="col.name === 'doc_number'">
                    <q-btn
                      :label="props.row.doc_number"
                      dense
                      flat
                      class="btn-link"
                      @click="select_Order(props.row.uuid_rec)"
                    />
                  </div>
                  <div v-else-if="col.name === 'ref_date'">
                    {{ $INDDate(props.row.ref_date) }}
                  </div>
                  <div v-else-if="col.name === 'posted_date'">
                    {{ $INDDateTime(props.row.posted_date) }}
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
          class="q-pa-xs dialog-action"
          align="right"
        >
          <q-btn
            label="Pilih"
            icon="check"
            flat
            class="q-mr-sm"
            no-caps
            @click="select_Order('')"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="dlgOrderDtl"
      persistent
    >
      <q-card
        square
        style="width: 1000px; max-width: 95vw"
      >
        <q-bar class="entry-caption"
          >Detail Pemesanan Pembelian
          <q-space />
          <q-btn
            icon="close"
            size="sm"
            dense
            flat
            rounded
            v-close-popup
          />
        </q-bar>
        <q-table
          square
          dense
          :rows="OrderDtl"
          :columns="colOrderDtl"
          no-data-label="data kosong"
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="line_no"
          separator="cell"
          selection="multiple"
          v-model:selected="selected_OrderDtl"
          v-model:pagination="pagination_OrderDtl"
          binary-state-sort
          class="grid-tables fit-table-ui-dialog-with-parameter"
          virtual-scroll
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
                class="bg-blue-grey-10 text-white"
                style="width: 20px"
              >
                <q-checkbox
                  v-model="props.selected"
                  dense
                  class="bg-white"
                />
              </q-th>
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-blue-grey-10 text-white"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:header-selection="scope">
            <q-toggle v-model="scope.selected" />
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              @click="props.selected = !props.selected"
            >
              <q-td>
                <q-checkbox
                  v-model="props.selected"
                  dense
                />
              </q-td>
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                <div class="grid-data">
                  <div v-if="col.name === 'conversion'">
                    1 {{ props.row.mou_purchase }} ({{ props.row.conversion }}
                    {{ props.row.mou_inventory }})
                  </div>
                  <div v-else-if="col.name === 'qty_received'">
                    {{ $formatnumber(props.row.qty_received) }}
                  </div>
                  <div v-else-if="col.name === 'qty_order'">
                    {{ $formatnumber(props.row.qty_order) }}
                  </div>
                  <div v-else-if="col.name === 'price'">
                    {{ $formatnumber(props.row.price) }}
                  </div>
                  <div v-else-if="col.name === 'prc_discount1'">
                    {{ $formatnumber(props.row.prc_discount1, 2) }}
                  </div>
                  <div v-else-if="col.name === 'prc_discount2'">
                    {{ $formatnumber(props.row.prc_discount2, 2) }}
                  </div>
                  <div v-else-if="col.name === 'prc_tax'">
                    {{ $formatnumber(props.row.prc_tax) }}
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
          class="q-pa-sm dialog-action"
          align="right"
        >
          <q-btn
            label="Pilih"
            no-caps
            icon="check"
            flat
            class="q-mr-sm"
            @click="select_Orderdtl()"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <items
      v-if="dlgItem"
      :show="dlgItem"
      :state="inv_group"
      @CloseItems="getItem"
    />
    <supplier
      v-if="dlgSupplier"
      :show="dlgSupplier"
      @CloseData="getSupplier"
    />
    <receive
      v-if="dlgReceive"
      :show="dlgReceive"
      @CloseReceive="getReceive"
    />
  </q-page>
</template>

<script>
import { ymd } from 'boot/engine'
import items from 'components/master/Items.vue'
import supplier from 'components/master/Supplier.vue'
import receive from 'components/inventory/Purchase.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'

export default defineComponent({
  name: 'PurchaseReceive',
  components: { items, supplier, receive },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const dlgPurchaseReceive = ref(false)
    const loading = ref(false)
    const loading_table = ref(false)
    const date1 = ref(null)
    const date2 = ref(null)
    const stateform = ref(false)
    const edit = ref({})
    const patient = ref({})
    const title = ref('Tambah Data')
    const filter = ref('')
    const refopt = ref(['Penerimaan PO', 'Pembelian Bebas'])
    const dlgItem = ref(false)
    const operation = ref('')
    const ref_action = ref('')

    const pagination = ref({
      sortBy: 'transid',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
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
        name: 'qty_order',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Jml.Pesan',
        field: 'qty_order'
      },
      {
        name: 'qty_received',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Jml.Terima',
        field: 'qty_received'
      },
      {
        name: 'mou_purchase',
        align: 'left',
        label: 'Unit Beli',
        field: 'mou_purchase'
      },
      {
        name: 'package',
        align: 'left',
        label: 'Kemasan',
        field: 'package'
      },
      {
        name: 'price',
        align: 'right',
        label: 'Harga/Unit Beli',
        field: 'price'
      },
      {
        name: 'prc_discount1',
        align: 'right',
        label: 'Diskon 1(%)',
        field: 'prc_discount1'
      },
      {
        name: 'prc_discount2',
        align: 'right',
        label: 'Diskon 2(%)',
        field: 'prc_discount2'
      },
      { name: 'prc_tax', align: 'right', label: 'PPN (%)', field: 'prc_tax' },
      { name: 'total', align: 'right', label: 'Total', field: 'total' }
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
    const dlgSupplier = ref(false)
    const posted = ref(false)
    const deleted = ref(false)
    const is_posted = ref(false)
    const is_cancel = ref(false)
    const lblSave = ref('Simpan')
    const warehouse_opt = ref([])
    const dlgOrder = ref(false)
    const colOrder = ref([
      {
        name: 'doc_number',
        align: 'Left',
        label: 'No.Pemesanan',
        field: 'doc_number'
      },
      { name: 'ref_date', align: 'left', label: 'Tanggal', field: 'ref_date' },
      {
        name: 'location_name',
        align: 'left',
        label: 'Lokasi',
        field: 'location_name'
      },
      {
        name: 'ref_number',
        align: 'left',
        label: 'Referensi',
        field: 'ref_number'
      },
      {
        name: 'partner_name',
        align: 'left',
        label: 'Supplier',
        field: 'partner_name'
      },
      {
        name: 'posted_date',
        align: 'left',
        label: 'Waktu Posting',
        field: 'posted_date'
      },
      {
        name: 'purchase_type',
        align: 'left',
        label: 'Jenis Pembelian',
        field: 'purchase_type'
      },
      {
        name: 'order_type',
        align: 'left',
        label: 'Jenis Pemesanan',
        field: 'order_type'
      }
    ])
    const Orders = ref([])
    const filter_Order = ref('')
    const selected_Order = ref([])
    const pagination_Order = ref({
      sortBy: 'sysid',
      descending: true,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    })
    const dlgOrderDtl = ref(false)
    const colOrderDtl = ref([
      { name: 'item_code', align: 'Left', label: 'Kode', field: 'item_code' },
      {
        name: 'item_name',
        align: 'left',
        label: 'Nama Barang/Jasa',
        field: 'item_name'
      },
      {
        name: 'qty_order',
        align: 'right',
        label: 'Pemesanan',
        field: 'qty_order'
      },
      {
        name: 'qty_received',
        align: 'right',
        label: 'Terkirim',
        field: 'qty_received'
      },
      {
        name: 'conversion',
        align: 'right',
        label: 'Kemasan',
        field: 'conversion'
      },
      {
        name: 'price',
        align: 'right',
        label: 'Harga',
        field: 'price'
      },
      {
        name: 'prc_discount1',
        align: 'right',
        label: 'Diskon 1 (%)',
        field: 'prc_discount1'
      },
      {
        name: 'prc_discount2',
        align: 'right',
        label: 'Diskon 2 (%)',
        field: 'prc_discount2'
      },
      {
        name: 'prc_tax',
        align: 'right',
        label: 'PPN (%)',
        field: 'prc_tax'
      }
    ])
    const OrderDtl = ref([])
    const selected_OrderDtl = ref([])
    const pagination_OrderDtl = ref({
      sortBy: 'line_no',
      descending: true,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    })

    const term_opt = ref([])
    const item_group_opt = ref([])
    const inv_group = ref('')
    const dlgReceive = ref(false)
    const filter_order = ref('')

    function runMethod(method, transid = -1) {
      this[method](transid)
    }
    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function refresh_po() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      $q.loading.show({ delay: 100 })
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          date1: date1.value,
          date2: date2.value,
          url: api_url.value.retrieve,
          isopen: Filtered.value ? '1' : '0',
          all: postate.value === 'ALL' ? '1' : '0'
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
        $q.loading.hide()
      }
    }

    async function add_event() {
      let skrng = new Date()
      stateform.value = true
      ref_action.value = 'save'
      edit.value = {
        sysid: -1,
        ref_date: ymd(skrng),
        due_date: null,
        doc_number: '(NEW)',
        location_id: '',
        invoice_number: '',
        ref_document: 'Penerimaan PO',
        curr_rate: 1,
        curr_code: 'IDR',
        partner_id: '',
        partner_name: '',
        order_number: '-',
        order_sysid: -1,
        remarks: '',
        total: 0,
        term_id: 'C003@0',
        is_tax: '0',
        uuid_rec: '(NEW)',
        uuid_rec_order: '',
        is_process: '0'
      }
      detail.value = []
    }

    async function edit_event(uuidrec = '') {
      dlgReceive.value = true
      ref_action.value = 'save'
    }

    function save_data() {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah invoice pembelian ini akan disimpan ?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          let app = {}
          app.header = edit.value
          app.detail = detail.value
          app.url = 'inventory/purchase/receive'
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

    async function addrow() {
      if (edit.value.order_number === '-') {
        let data = {}
        data = {
          transid: -1,
          line_no: detail.value.length + 1,
          item_code: '',
          descriptions: '',
          mou_purchase: '',
          mou_warehouse: '',
          convertion: 0,
          qty_order: 0,
          qty_received: 0,
          price: 0,
          prc_discount1: 0,
          discount1: 0,
          prc_discount2: 0,
          discount2: 0,
          prc_tax: 0,
          tax: 0,
          total: 0,
          order_sysid: -1,
          order_number: ''
        }
        detail.value.push(data)
        openitem(data.line_no)
      } else {
        selected_OrderDtl.value = []
        dlgOrderDtl.value = true
        let props = {}
        props.url = 'inventory/purchase/order/detail'
        props.uuid_rec = edit.value.uuid_rec_order
        OrderDtl.value = await $store.dispatch('master/GET_DATA', props)
      }
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
        let i = 0
        for (i = 0; i < detail.value.length; i++) {
          if (detail.value[i].line_no === current_row.value) {
            detail.value[i].item_code = data.item_code
            detail.value[i].item_name = data.item_name1
            detail.value[i].mou_purchase = data.mou_purchase
            detail.value[i].mou_inventory = data.mou_inventory
            detail.value[i].current_stock = 0
            detail.value[i].conversion = data.conversion
            detail.value[i].price = 0
            detail.value[i].prc_discount1 = 0
            detail.value[i].prc_discount2 = 0
            detail.value[i].prc_tax = 0
          }
        }
      }
    }
    function getItemByCode(item_code, line_no = -1, invgroup = '') {
      let props = {}
      props.url = 'master/inventory/inventory-item/getitem'
      props.item_code = item_code
      props.group_name = invgroup
      props.progress = true
      $store.dispatch('master/GET_DATA', props).then((respon) => {
        let item = respon
        if (item) {
          let i = 0
          for (i = 0; i < detail.value.length; i++) {
            if (detail.value[i].line_no === line_no) {
              detail.value[i].item_code = item.item_code
              detail.value[i].item_name = item.item_name1
              detail.value[i].mou_purchase = item.mou_purchase
              detail.value[i].mou_inventory = item.mou_inventory
              detail.value[i].current_stock = 0
              detail.value[i].conversion = data.value.conversion
              detail.value[i].price = 0
              detail.value[i].prc_discount1 = 0
              detail.value[i].prc_discount2 = 0
              detail.value[i].prc_tax = 0
            }
          }
        } else {
          $q.notify({
            color: 'orange-10',
            textcolor: 'white',
            message: 'Item inventory tidak ditemukan:',
            position: 'top',
            timeout: 1000
          })
        }
      })
    }

    function calculate(lineno) {
      let idx = lineno - 1
      let qty = 0
      qty = detail.value[idx].qty_received
      let price = detail.value[idx].price
      let disc1 = detail.value[idx].prc_discount1
      let disc2 = detail.value[idx].prc_discount2
      let tax = detail.value[idx].prc_tax
      let total = qty * price
      disc1 = Math.round(total * (disc1 / 100), 2)
      disc2 = Math.round((total - disc1) * (disc2 / 100), 2)
      tax = Math.round((total - (disc1 + disc2)) * (tax / 100), 2)
      detail.value[idx].discount1 = disc1
      detail.value[idx].discount2 = disc2
      detail.value[idx].tax = tax
      total = total - (disc1 + disc2) + tax
      detail.value[idx].total = total
      let total_inv = 0
      detail.value.forEach((el) => {
        total_inv = total_inv + el.total
      })
      edit.value.total = total_inv
    }

    async function changeref() {}

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
              calculate(detail.value[i].line_no)
            }
          }
        }
      })
    }

    function getSupplier(closed, data) {
      dlgSupplier.value = closed
      if (typeof data.sysid !== 'undefined') {
        edit.value.partner_id = data.sysid
        edit.value.partner_name = data.supplier_name
      }
    }
    function open_Order() {
      selected_Order.value = []
      onRequestOrder({
        pagination: pagination_Order.value,
        filter: filter_Order.value
      })
      dlgOrder.value = true
    }

    async function onRequestOrder(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading_table.value = true
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          url: 'inventory/purchase/order/open'
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        Orders.value = respon.data
        pagination_Order.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending
        }
      } catch (error) {
      } finally {
        loading_table.value = false
      }
    }

    function select_Order(uuidrec = '') {
      let item = null
      if (uuidrec !== '') {
        Orders.value.forEach((el) => {
          if (uuidrec === el.uuid_rec) {
            item = el
          }
        })
      } else {
        if (selected_Order.value.length > 0) {
          item = selected_Order.value[0]
        }
      }
      if (typeof item !== 'undefined') {
        edit.value.order_sysid = item.sysid
        edit.value.order_number = item.doc_number
        edit.value.partner_id = item.partner_id
        edit.value.partner_name = item.partner_name
        edit.value.location_id = item.location_id
        edit.value.term_id = item.term_id
        edit.value.item_group = item.item_group
        edit.value.uuid_rec_order = item.uuid_rec
        change_term()
        dlgOrder.value = false
        detail.value = []
      }
    }
    function select_Orderdtl() {
      if (selected_OrderDtl.value.length > 0) {
        let founded = false
        selected_OrderDtl.value.forEach((el) => {
          founded = false
          detail.value.forEach((dtl) => {
            if (dtl.item_code === el.item_code) {
              founded = true
            }
          })

          if (!founded && el.qty_order - el.qty_received > 0) {
            let data = {}
            data = {
              sysid: -1,
              line_no: detail.value.length + 1,
              item_code: el.item_code,
              item_name: el.item_name,
              mou_purchase: el.mou_purchase,
              mou_inventory: el.mou_inventory,
              conversion: el.conversion,
              qty_order: el.qty_order - el.qty_received,
              qty_received: el.qty_order - el.qty_received,
              price: el.price,
              prc_discount1: el.prc_discount1,
              discount1: 0,
              prc_discount2: el.prc_discount2,
              discount2: 0,
              prc_tax: el.prc_tax,
              tax: 0,
              total: 0
            }
            detail.value.push(data)
            calculate(data.line_no)
          }
        })
        dlgOrderDtl.value = false
      }
    }

    function change_group() {
      item_group_opt.value.forEach((el) => {
        if (edit.value.item_group === el.standard_code) {
          inv_group.value = el.value
          detail.value = []
        }
      })
    }
    function change_term() {
      term_opt.value.forEach((el) => {
        if (edit.value.term_id === el.standard_code) {
          console.info(JSON.stringify(el))
          let date = new Date(edit.value.ref_date)
          date.setDate(date.getDate() + parseInt(el.value))
          edit.value.due_date = ymd(date)
        }
      })
    }
    function getReceive(closed, data) {
      dlgReceive.value = closed
      if (typeof data.uuid_rec !== 'undefined') {
        let props = {}
        props.url = 'inventory/purchase/receive/get'
        props.uuidrec = data.uuid_rec
        $store.dispatch('master/GET_DATA', props).then((response) => {
          edit.value = response.header
          detail.value = response.detail
          stateform.value = true
        })
      }
    }

    function cancel_entry() {
      stateform.value = false
      edit.value = {}
      detail.value = []
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
      props.type = 'RECEIVE'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        warehouse_opt.value = response
      })

      props = {}
      props.url = 'setup/application/standard-code/list'
      props.parent_code = 'C003'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        term_opt.value = response
      })
      props = {}
      props.url = 'setup/application/standard-code/list'
      props.parent_code = 'C004'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        item_group_opt.value = response
      })
    })

    return {
      dlgPurchaseReceive,
      loading,
      loading_table,
      stateform,
      data,
      patient,
      edit,
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
      loaddata,
      save_data,
      refopt,
      date1,
      date2,
      pagination_detail,
      detail,
      selected_detail,
      current_row,
      Filtered,
      postate,
      coldetail,
      dlgItem,
      getItem,
      dlgSupplier,
      removeRow,
      refresh_po,
      operation,
      addrow,
      calculate,
      changeref,
      openitem,
      posted,
      deleted,
      is_posted,
      is_cancel,
      lblSave,
      warehouse_opt,
      getSupplier,
      getItemByCode,
      open_Order,
      dlgOrder,
      colOrder,
      Orders,
      selected_Order,
      pagination_Order,
      filter_Order,
      select_Order,
      dlgOrderDtl,
      colOrderDtl,
      OrderDtl,
      selected_OrderDtl,
      pagination_OrderDtl,
      select_Orderdtl,
      term_opt,
      item_group_opt,
      change_group,
      inv_group,
      changeitem_mou,
      dlgReceive,
      getReceive,
      cancel_entry,
      change_term,
      onRequestOrder,
      ref_action,
      filter_order
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
