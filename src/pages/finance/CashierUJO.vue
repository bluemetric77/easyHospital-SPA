<template>
  <q-page class="page-app">
    <!-- Dialog Data Location-->
    <q-card
      class="icard"
      square
    >
      <q-bar class="entry-caption">
        Pengeluran UJO -
        {{ stateform === 'new' ? ' Dokumen Baru' : edit.doc_number }}
      </q-bar>
      <q-card-section class="q-gutter-sm">
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-6 col-md-2">
            <q-select
              v-model="edit.pool_code"
              :options="pools"
              outlined
              dense
              options-dense
              label="Pool"
              option-value="pool_code"
              option-label="pool_name"
              emit-value
              map-options
              fill-input
              stack-label
              square
              :readonly="!(edit.no_jurnal === -1)"
            />
          </div>
          <div class="col-xs-6 col-sm-6 col-md-2">
            <q-input
              v-model="edit.expense_no"
              dense
              outlined
              square
              label="LBO"
              stack-label
              readonly
            >
              <template v-slot:append>
                <q-icon
                  name="search"
                  size="xs"
                  color="green-10"
                  @click="OpenLBO()"
                  v-show="edit.no_jurnal === -1"
                />
              </template>
            </q-input>
          </div>
          <div class="col-xs-6 col-sm-6 offset-md-4 col-md-2">
            <q-input
              v-model="edit.ref_date"
              dense
              outlined
              square
              label="Tanggal"
              stack-label
              type="date"
            />
          </div>
          <div class="col-xs-6 col-sm-6 col-md-2">
            <q-input
              v-model="edit.driver_name"
              dense
              outlined
              square
              label="Pengemudi"
              stack-label
              readonly
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-select
              v-model="edit.cash_id"
              :options="cashbanks"
              outlined
              dense
              options-dense
              label="Kas/Bank"
              option-value="cash_id"
              option-label="descriptions"
              emit-value
              map-options
              fill-input
              stack-label
              square
              @update:model-value="change_payment()"
            />
          </div>
          <div class="col-xs-6 col-sm-3 offset-md-4 col-md-2">
            <q-input
              v-model="edit.trans_code"
              dense
              outlined
              square
              label="Voucher"
              stack-label
              readonly
            />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="edit.trans_series"
              dense
              outlined
              square
              label="No.Seri"
              stack-label
              readonly
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.standart"
              label="LBO Standar"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.standart"
                  class="q-field__input text-right"
                  separator="."
                />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.dp_customer"
              label="DP Konsumen"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.dp_customer"
                  class="q-field__input text-right"
                  separator="."
                />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3 offset-md-4 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.cashier"
              label="Total LBO"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.cashier"
                  class="q-field__input text-right"
                  separator="."
                  @input="edit.total = edit.expense + edit.adm_fee"
                />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="edit.dp_method"
              dense
              outlined
              square
              label="Cara DP"
              stack-label
              readonly
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="edit.project_id"
              dense
              outlined
              square
              label="Proyek"
              stack-label
              readonly
            />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.expense"
              label="Biaya"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.expense"
                  class="q-field__input text-right"
                  separator="."
                />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3 offset-md-4 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.adm_fee"
              label="By.Admin"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.adm_fee"
                  class="q-field__input text-right"
                  separator="."
                  @input="edit.total = edit.expense + edit.adm_fee"
                />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.total"
              label="Total"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.total"
                  class="q-field__input text-right"
                  separator="."
                  readonly
                />
              </template>
            </q-field>
          </div>
        </div>
      </q-card-section>
      <q-table
        square
        :rows="costs"
        :columns="columns"
        no-data-label="data kosong"
        dense
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="line_no"
        separator="cell"
        selection="single"
        v-model:selected="selected_cost"
        v-model:pagination="pagination"
        binary-state-sort
        virtual-scroll
        hide-pagination
      >
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
              class="bg-teal-10 text-white"
            >
              <div v-if="col.name === 'budget'">
                <q-btn
                  label="Semua"
                  glossy
                  class="bg-red-14 text-white q-mr-sm"
                  rounded
                  dense
                  no-caps
                  @click="expense(-1, 1)"
                />{{ col.label }}
              </div>
              <div v-else>
                {{ col.label }}
              </div>
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
                <div v-if="col.name === 'budget'">
                  <div v-if="props.row.budget === 0">
                    {{ $formatnumber(props.row.budget) }}
                  </div>
                  <div v-else>
                    <q-btn
                      :label="$formatnumber(props.row.budget)"
                      rounded
                      glossy
                      class="bg-red-14 text-white"
                      @click="expense(props.row.line_no, 0)"
                    />
                  </div>
                </div>
                <div v-else-if="col.name === 'expense_out'">
                  {{ $formatnumber(props.row.expense_out) }}
                </div>
                <div v-else-if="col.name === 'expense'">
                  <q-field
                    square
                    outlined
                    stack-label
                    dense
                    :model-value="props.row.expense"
                  >
                    <template v-slot:control>
                      <vue-numeric
                        v-model="props.row.expense"
                        class="q-field__input text-right"
                        separator="."
                        @input="calculate_cost()"
                      />
                    </template>
                  </q-field>
                </div>
                <div v-else-if="col.name === 'line_note'">
                  <q-input
                    v-model="props.row.line_note"
                    dense
                    outlined
                    square
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
          dense
          no-caps
          flat
          class="btn-toolbar q-mr-xs"
          icon="save"
          label="Simpan"
          @click="save_data()"
        >
          <q-tooltip content-class="tooltips-app"> Simpan </q-tooltip>
        </q-btn>
        <q-btn
          dense
          no-caps
          flat
          class="btn-toolbar q-mr-xs"
          icon="undo"
          label="Batal"
          @click="clear_data()"
        >
          <q-tooltip content-class="tooltips-app"> Batal </q-tooltip>
        </q-btn>
        <q-space />
        <q-btn
          label="Kembali"
          icon="far fa-arrow-alt-circle-left"
          flat
          no-caps
          rounded
          :to="{ name: 'cash-bank', force: true }"
        />
      </q-toolbar>
    </q-page-sticky>
    <q-dialog
      v-model="dlglbo"
      persistent
      full-width
    >
      <q-card
        class="icard"
        square
      >
        <q-bar class="entry-caption">
          Pengajuan Biaya Operasional - {{ edit.pool_code }}
          <q-space />
          <q-input
            v-model="filter_lbo"
            dense
            outline
            debounce="300"
            label-color="white"
            borderless
            placeholder="Pencarian"
            input-class="text-white"
          />
          <q-btn
            icon="close"
            color="red-10"
            size="xs"
            dense
            glossy
            rounded
            v-close-popup
          />
        </q-bar>
        <q-table
          square
          :rows="lbos"
          :columns="columns_lbo"
          no-data-label="data kosong"
          dense
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="transid"
          :filter="filter_lbo"
          separator="cell"
          selection="single"
          v-model:selected="selected_lbo"
          v-model:pagination="pagination_lbo"
          class="fit my-sticky-dynamic"
          table-style="min-height:302px; max-height: 370px"
          :virtual-scroll-item-size="48"
          :virtual-scroll-sticky-size-start="48"
          binary-state-sort
          virtual-scroll
          :loading="loading"
          @request="onRequestLBO"
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
                class="bg-teal-10 text-white"
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
                  <div v-if="col.name === 'doc_number'">
                    <q-btn
                      :label="props.row.doc_number"
                      glossy
                      dense
                      no-caps
                      rounded
                      class="bg-green-10 text-white"
                      @click="create_cashier(props.row.transid)"
                    />
                  </div>
                  <div v-else-if="col.name === 'ref_date'">
                    {{ $INDDate(props.row.ref_date) }}
                  </div>
                  <div v-else-if="col.name === 'authorize_date'">
                    {{ $INDDateTime(props.row.authorize_date) }}
                  </div>
                  <div v-else-if="col.name === 'other_expsene'">
                    {{ $formatnumber(props.row.other_expense) }}
                  </div>
                  <div v-else-if="col.name === 'dp_customer'">
                    {{ $formatnumber(props.row.dp_customer) }}
                  </div>
                  <div v-else-if="col.name === 'total'">
                    {{ $formatnumber(props.row.total) }}
                  </div>
                  <div v-else-if="col.name === 'cashier'">
                    {{ $formatnumber(props.row.cashier) }}
                  </div>
                  <div v-else-if="col.name === 'cash_amount'">
                    {{ $formatnumber(props.row.cash_amount) }}
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
    </q-dialog>

    <vJournalEntry
      v-if="dlgJurnal"
      :show="dlgJurnal"
      :sysid="jurnal_id"
      @CloseJurnal="getJurnal"
    />
  </q-page>
</template>

<script>
import vJournalEntry from 'components/ViewJurnal.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'

export default defineComponent({
  name: 'CashierUJO',
  props: { sysid: BigInt, state: String },
  components: { vJournalEntry },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()
    const $route = useRoute()

    const loading = ref(false)
    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')
    const costs = ref([])
    const pagination = ref({
      sortBy: 'ref_date',
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })
    const stateform = ref('')
    const selected = ref([])
    const columns = ref([
      { name: 'line_no', align: 'center', label: '#No', field: 'line_no' },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Komponen Biaya',
        field: 'descriptions'
      },
      { name: 'budget', align: 'right', label: 'Pengajuan', field: 'budget' },
      {
        name: 'expense_out',
        align: 'right',
        label: 'Realisasi',
        field: 'expense_out'
      },
      {
        name: 'expense',
        align: 'right',
        label: 'Biaya',
        field: 'expense',
        style: 'min-width:100px'
      },
      {
        name: 'line_note',
        align: 'left',
        label: 'Catatan',
        field: 'line_note',
        style: 'min-width:150px'
      },
      {
        name: 'account_no',
        align: 'left',
        label: 'No. Akun',
        field: 'account_no'
      }
    ])

    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const dlgJurnal = ref(false)
    const jurnal_id = ref(-1)
    const cashbanks = ref([])
    const dlglbo = ref(false)
    const lbos = ref([])
    const pagination_lbo = ref({
      sortBy: 'ref_date',
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })
    const selected_lbo = ref([])
    const columns_lbo = ref([
      {
        name: 'doc_number',
        align: 'center',
        label: 'No.LBO',
        field: 'doc_number',
        sortable: true
      },
      {
        name: 'ref_date',
        align: 'left',
        label: 'Tanggal',
        field: 'ref_date',
        sortable: true
      },
      {
        name: 'standart',
        align: 'right',
        label: 'Standar UJO',
        field: 'standart'
      },
      {
        name: 'other_expense',
        align: 'right',
        label: 'Lain2',
        field: 'other_expense'
      },
      { name: 'total', align: 'right', label: 'Total', field: 'total' },
      {
        name: 'dp_customer',
        align: 'right',
        label: 'DP Konsumen',
        field: 'dp_customer'
      },
      { name: 'cashier', align: 'right', label: 'Pengajuan', field: 'cashier' },
      {
        name: 'cash_amount',
        align: 'right',
        label: 'Kasir',
        field: 'cash_amount'
      },
      {
        name: 'driver_name',
        align: 'left',
        label: 'Pengemudi',
        field: 'driver_name',
        sortable: true
      },
      {
        name: 'vehicle_no',
        align: 'left',
        label: 'No. Unit',
        field: 'vehicle_no',
        sortable: true
      },
      {
        name: 'police_no',
        align: 'left',
        label: 'No. Polisi',
        field: 'police_no',
        sortable: true
      },
      {
        name: 'authorize_userid',
        align: 'left',
        label: 'Otorisasi Oleh',
        field: 'authorize_userid'
      },
      {
        name: 'authorize_date',
        align: 'left',
        label: 'Tgl.Otorisasi',
        field: 'authorize_date'
      }
    ])
    const filter_lbo = ref('')
    const pools = ref([])

    function show_jurnal(sysid) {
      dlgJurnal.value = true
      jurnal_id.value = sysid
    }

    function getJurnal(closed, data) {
      dlgJurnal.value = closed
    }

    function calculate_cost() {
      let expense = 0
      costs.value.forEach((el) => {
        expense = expense + el.expense
      })
      edit.value.expense = expense
      edit.value.total = edit.value.expense + edit.value.adm_fee
    }

    function clear_data() {
      let skrng = new Date()
      edit.value = {
        transid: -1,
        ref_date: skrng.toLocaleDateString('en-CA'),
        doc_number: '(NEW)',
        expense_transid: -1,
        expense_no: '',
        pool_code: '',
        cash_id: null,
        account_no: '',
        account_name: '',
        expense: 0,
        adm_fee: 0,
        total: 0,
        descriptions: '',
        no_jurnal: -1,
        trans_code: '',
        trans_series: '',
        project_id: null,
        driver_name: '',
        is_canceled: '0'
      }
      costs.value = []
    }
    function OpenLBO() {
      if (edit.value.pool_code === '') {
        $q.notify({
          color: 'negative',
          textcolor: 'white',
          message: 'Silahkan pilih pool terlebih dahulu',
          position: 'top',
          timeout: 2000
        })
      } else {
        dlglbo.value = true
        selected_lbo.value = []
        onRequestLBO({
          pagination: pagination_lbo.value,
          filter: filter_lbo.value
        })
      }
    }

    async function onRequestLBO(props) {
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
          pool_code: edit.value.pool_code,
          url: 'finance/cash_bank/open-lbo'
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        lbos.value = respon.data
        pagination_lbo.value = {
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
    async function create_cashier(transid = -1) {
      dlglbo.value = false
      clear_data()
      let props = {}
      props.url = 'finance/cash_bank/open-lbo/get'
      props.sysid = transid
      $store.dispatch('master/GET_DATA', props).then((response) => {
        let cost = response.cost
        let detail = response.costs
        let skrng = new Date()
        edit.value = {
          transid: -1,
          ref_date: skrng.toLocaleDateString('en-CA'),
          doc_number: '(NEW)',
          expense_transid: cost.transid,
          expense_no: cost.doc_number,
          pool_code: cost.pool_code,
          driver_name: cost.driver_name,
          cash_id: null,
          account_no: '',
          account_name: '',
          expense: 0,
          adm_fee: 0,
          total: 0,
          descriptions: '',
          no_jurnal: -1,
          trans_code: '',
          trans_series: '',
          project_id: cost.project_id,
          standart: cost.standart,
          dp_customer: cost.dp_customer,
          dp_method: cost.dp_method,
          cashier: cost.cashier,
          is_canceled: '0'
        }
        let line = {}
        detail.forEach((el) => {
          line = {
            transid: -1,
            line_no: el.line_no,
            expense_code: el.expense_code,
            descriptions: el.descriptions,
            account_no: el.account_no,
            budget: el.expense_budget,
            expense_out: el.expense,
            expense: 0,
            line_note: ''
          }
          costs.value.push(line)
        })
      })
    }

    function change_payment() {
      cashbanks.value.forEach((el) => {
        if (el.cash_id === edit.value.cash_id) {
          edit.value.trans_code = el.voucher_out
        }
      })
    }

    async function save_data() {
      try {
        let app = {}
        app.header = edit.value
        app.cost = costs.value
        app.url = 'finance/cash_bank/lbo'
        let respon = await $store.dispatch('master/POST_DATA', app)
        if (!(typeof respon === 'undefined')) {
          if (respon.success) {
            let msg = respon.data.message
            $q.notify({
              color: 'positive',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
            let props = {}
            props.url = 'finance/cash_bank/cashier_ujo/print'
            props.sysid = respon.data.sysid
            await $store.dispatch('master/GET_DOWNLOAD', props)
            clear_data()
          } else {
            let msg = respon.data
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
      }
    }
    function expense(line = -1, all = 0) {
      let i = -1
      costs.value.forEach((el) => {
        i++
        if (el.line_no === line || all === 1) {
          costs.value[i].expense =
            costs.value[i].budget - costs.value[i].expense_out
        }
      })
      calculate_cost()
    }

    onMounted(async () => {
      stateform.value = $route.query.state
      clear_data()
      let props = {}
      props.url = 'master/finance/cash-bank/list/user'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        cashbanks.value = response
      })
      props.url = 'master/operational/pool/list?all=0'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        pools.value = response
      })
      if ($route.query.state === 'update') {
        props = {}
        props.url = 'finance/cash_bank/lbo'
        props.sysid = $route.query.sysid
        $store.dispatch('master/GET_DATA', props).then((response) => {
          edit.value = response.cost
          costs.value = response.costs
        })
      }
    })

    return {
      loading,
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
      costs,
      show_jurnal,
      dlgJurnal,
      jurnal_id,
      getJurnal,
      calculate_cost,
      stateform,
      cashbanks,
      clear_data,
      OpenLBO,
      dlglbo,
      pagination_lbo,
      columns_lbo,
      selected_lbo,
      filter_lbo,
      onRequestLBO,
      pools,
      lbos,
      create_cashier,
      change_payment,
      save_data,
      expense
    }
  }
})
</script>
<style lang="sass">
.my-sticky-dynamic
  /* height or max-height is important */
  height: 410px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  thead tr:first-child th
    top: 0
</style>
