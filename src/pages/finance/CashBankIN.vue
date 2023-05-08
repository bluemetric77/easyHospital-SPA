<template>
  <q-page class="page-app">
    <!-- Dialog Data Location-->
    <q-card
      class="icard"
      square
    >
      <q-bar class="entry-caption">
        Penerimaan Kas/Bank -
        {{
          stateform === 'new'
            ? ' Dokumen Baru'
            : edit.trans_code + '-' + edit.trans_series
        }}
      </q-bar>
      <q-card-section class="q-gutter-sm">
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-6 col-md-2">
            <q-input
              v-model="edit.transid"
              dense
              outlined
              square
              label="No.Dokumen"
              stack-label
              readonly
            />
          </div>
          <div class="col-xs-6 col-sm-6 col-md-2">
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
          <div class="col-xs-6 col-sm-6 offset-md-4 col-md-2">
            <q-input
              v-model="edit.reference1"
              dense
              outlined
              square
              label="Referensi 1"
              stack-label
            />
          </div>
          <div class="col-xs-6 col-sm-6 col-md-2">
            <q-input
              v-model="edit.reference2"
              dense
              outlined
              square
              label="Referensi 2"
              stack-label
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
            <q-input
              v-model="edit.due_date"
              dense
              outlined
              square
              label="Jatuh tempo"
              stack-label
              type="date"
            />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="edit.cheque_no"
              dense
              outlined
              square
              label="No. Cek/Giro"
              stack-label
            />
          </div>
          <div class="col-xs-12 col-sm-6 offset-md-4 col-md-4">
            <q-input
              v-model="edit.descriptions"
              dense
              outlined
              square
              label="Keterangan"
              stack-label
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-6 col-md-4">
            <q-checkbox
              v-model="edit.is_ge"
              true-value="1"
              false-value="0"
              label="Transaksi ini merupakan General Ledger"
            />
          </div>
          <div class="col-xs-6 col-sm-3 offset-md-4 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.amount"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.amount"
                  class="q-field__input text-right"
                  separator="."
                />
              </template>
            </q-field>
          </div>
        </div>
      </q-card-section>
      <q-table
        square
        :rows="details"
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
        <template v-slot:top>
          <q-btn
            v-show="!posted && !deleted"
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
                    name="delete"
                    color="red"
                    size="xs"
                    @click="removeRow(props.row.line_no)"
                  />
                </div>
                <div v-else-if="col.name === 'line_memo'">
                  <input
                    v-model="props.row.line_memo"
                    class="input"
                    style="width: 100%"
                  />
                </div>
                <div v-else-if="col.name === 'amount'">
                  <vue-numeric
                    v-model="props.row.amount"
                    class="right-input"
                    separator="."
                    @input="calculate_amount()"
                    style="width: 100%"
                  />
                </div>
                <div v-else-if="col.name === 'enum_type'">
                  <select
                    v-model="props.row.eum_type"
                    class="input"
                    style="width=100%"
                  >
                    <option>-</option>
                    <option>UANG MUKA</option>
                    <option>PIUTANG</option>
                    <option>DP UJO</option>
                  </select>
                </div>
                <div v-else-if="col.name === 'work_order_no'">
                  <input
                    v-model="props.row.work_order_no"
                    class="input q-mr-sm"
                    readonly
                  />
                  <q-icon
                    name="search"
                    color="green-10"
                  />
                </div>
                <div v-else-if="col.name === 'partner_name'">
                  <input
                    v-model="props.row.partner_name"
                    class="input q-mr-sm"
                    readonly
                  />
                  <q-icon
                    name="search"
                    color="green-10"
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
  name: 'BankIN',
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
    const details = ref([])
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
        name: 'line_memo',
        align: 'left',
        label: 'Keterangan',
        field: 'line_memo',
        style: 'min-width:400px'
      },
      { name: 'amount', align: 'right', label: 'Jumlah', field: 'amount' },
      { name: 'enum_type', align: 'right', label: 'Tipe', field: 'enum_type' },
      {
        name: 'work_order_no',
        align: 'left',
        label: 'BPartner',
        field: 'work_order_no',
        style: 'min-width:150px'
      },
      {
        name: 'partner_name',
        align: 'left',
        label: 'BPartner',
        field: 'partner_name',
        style: 'min-width:250px'
      },
      {
        name: 'no_account',
        align: 'left',
        label: 'Akun',
        field: 'no_account',
        style: 'min-width:100px'
      }
    ])

    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const dlgJurnal = ref(false)
    const jurnal_id = ref(-1)
    const cashbanks = ref([])
    const pools = ref([])
    const operation = ref('')

    function show_jurnal(sysid) {
      dlgJurnal.value = true
      jurnal_id.value = sysid
    }

    function getJurnal(closed, data) {
      dlgJurnal.value = closed
    }

    function calculate_amount() {
      let amount = 0
      details.value.forEach((el) => {
        amount = amount + el.amount
      })
      edit.value.amount = amount
    }

    function clear_data() {
      operation.value = 'inserted'
      let skrng = new Date()
      edit.value = {
        transid: -1,
        ref_date: skrng.toLocaleDateString('en-CA'),
        due_date: skrng.toLocaleDateString('en-CA'),
        reference1: '',
        reference1: '',
        cheque_no: '',
        descriptions: '',
        amount: 0,
        is_ge: '0',
        trans_code: '',
        trans_series: '',
        no_jurnal: -1
      }
      details.value = []
    }
    function change_payment() {
      cashbanks.value.forEach((el) => {
        if (el.cash_id === edit.value.cash_id) {
          edit.value.trans_code = el.voucher_in
        }
      })
    }

    async function save_data() {
      try {
        let app = {}
        app.header = edit.value
        app.detail = details.value
        app.url = 'finance/cash_bank/transaction-in'
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
            props.url = 'finance/cash_bank/print'
            props.sysid = respon.data.sysid
            props.document_type = 'BOU'
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
    async function addrow() {
      let data = {}
      data = {
        transid: -1,
        line_no: details.value.length + 1,
        line_memo: '',
        amount: 0,
        enum_type: '-',
        partner_id: '',
        partner_name: '',
        work_order_no: '',
        work_order_id: -1
      }
      details.value.push(data)
    }

    function removeRow(lineno) {
      $q.dialog({
        dark: false,
        title: 'Konfirmasi',
        message: 'Apakah line pengeluaran ini akan dihapus ?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        let i = -1
        for (i = 0; i < details.value.length; i++) {
          if (details.value[i].line_no === lineno) {
            details.value.splice(i, 1)
          }
        }
        for (i = 0; i < details.value.length; i++) {
          details.value[i].line_no = i + 1
        }
        selected.value = []
      })
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
        props.url = 'finance/cash_bank/get2'
        props.sysid = $route.query.sysid
        $store.dispatch('master/GET_DATA', props).then((response) => {
          edit.value = response.header
          details.value = response.detail
          operation.value = 'updated'
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
      details,
      show_jurnal,
      dlgJurnal,
      jurnal_id,
      getJurnal,
      calculate_amount,
      stateform,
      cashbanks,
      clear_data,
      pools,
      change_payment,
      save_data,
      addrow,
      removeRow,
      operation
    }
  }
})
</script>
