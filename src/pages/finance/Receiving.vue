<template>
  <q-page class="page-app">
    <!-- Dialog Data Location-->
    <q-card
      class="icard"
      square
    >
      <q-bar class="entry-caption">
        Penerimaan droping UJO/Bank -
        {{ stateform === 'new' ? ' Dokumen Baru' : edit.doc_number }}
      </q-bar>
      <q-card-section class="q-gutter-sm">
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
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
          <div class="col-xs-6 col-sm-3 col-md-2">
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
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-select
              v-model="edit.cashbank_source"
              :options="cashbanks_source"
              outlined
              dense
              options-dense
              label="Diterima oleh"
              option-value="cash_id"
              option-label="descriptions"
              emit-value
              map-options
              fill-input
              stack-label
              square
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-select
              v-model="edit.cashbank_destination"
              :options="cashbanks_source"
              outlined
              dense
              options-dense
              label="Dikirim oleh"
              option-value="cash_id"
              option-label="descriptions"
              emit-value
              map-options
              fill-input
              stack-label
              square
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
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
          <div class="col-xs-12 col-sm-6 col-md-4">
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
          <div class="col-xs-6 col-sm-3 col-md-2">
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
          icon="fas fa-coins"
          label="Droping UJO"
          @click="show_droping()"
        >
          <q-tooltip content-class="tooltips-app"> Droping UJO </q-tooltip>
        </q-btn>
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
    <q-dialog
      v-model="dlgDroping"
      persistent
    >
      <q-card
        square
        class="icard"
      >
        <q-bar class="entry-caption"
          >List Droping UJO
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
          :rows="droping"
          :columns="columns"
          no-data-label="data kosong"
          class="my-sticky-table"
          dense
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="transid"
          separator="cell"
          selection="single"
          v-model:selected="selected"
          v-model:pagination="pagination"
          binary-state-sort
          virtual-scroll
          :filter="filter"
          @request="onRequest"
          :loading="loading"
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
                  <div v-if="col.name === 'amount'">
                    {{ $formatnumber(props.row.amount) }}
                  </div>
                  <div v-else>
                    {{ col.value }}
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-separator />
        <q-card-section
          class="entry-caption q-pa-sm"
          align="right"
        >
          <q-btn
            no-caps
            label="Pilih"
            icon="check"
            flat
            class="q-mr-sm"
            @click="selectdata()"
          />
          <q-btn
            no-caps
            label="Tutup"
            icon="close"
            flat
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>
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
    const $route = useRoute()

    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')
    const stateform = ref('')
    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const dlgJurnal = ref(false)
    const jurnal_id = ref(-1)
    const cashbanks_source = ref([])
    const cashbanks_destination = ref([])
    const operation = ref('')
    const pools = ref([])
    const dlgDroping = ref(false)
    const droping = ref([])
    const pagination = ref({
      sortBy: 'ref_date',
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })
    const selected = ref([])
    const columns = ref([
      {
        name: 'doc_number',
        align: 'center',
        label: 'Dokumen Droping',
        field: 'doc_number'
      },
      { name: 'ref_date', align: 'right', label: 'Tanggal', field: 'ref_date' },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Komponen Biaya',
        field: 'descriptions'
      },
      { name: 'amount', align: 'right', label: 'Jumlah', field: 'amount' },
      {
        name: 'cashbank_sname',
        align: 'right',
        label: 'Kas/Bank Pengirim',
        field: 'cashbank_sname'
      }
    ])
    const loading = ref(false)

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
          url: 'finance/cash_bank/droping/open'
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        droping.value = respon.data
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

    function show_jurnal(sysid) {
      dlgJurnal.value = true
      jurnal_id.value = sysid
    }

    function getJurnal(closed, data) {
      dlgJurnal.value = closed
    }

    function clear_data() {
      operation.value = 'inserted'
      let skrng = new Date()
      edit.value = {
        transid: -1,
        ref_date: skrng.toLocaleDateString('en-CA'),
        trans_code: '',
        trans_series: '',
        cashbank_source: null,
        cashbank_destination: null,
        linkdocument_id: -1,
        linkdoc_number: '',
        amount: 0,
        no_jurnal: -1,
        descriptions: '',
        is_void: 0
      }
    }
    async function save_data() {
      try {
        let app = {}
        app.data = edit.value
        app.operation = operation.value
        app.url = 'finance/cash_bank/droping-receive'
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
            props.url = 'finance/cash_bank/print2'
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

    function change_payment() {
      cashbanks_source.value.forEach((el) => {
        if (el.cashbank_source === edit.value.cash_id) {
          edit.value.trans_code = el.voucher_out
        }
      })
    }

    function show_droping() {
      dlgDroping.value = true
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function selectdata() {
      if (selected.value.length > 0) {
        let data = selected.value[0]
        edit.value.linkdoc_number = data.doc_number
        edit.value.linkdocument_id = data.transid
        edit.value.cashbank_source = data.cashbank_destination
        edit.value.cashbank_destination = data.cashbank_source
        edit.value.amount = data.amount
        edit.value.descriptions =
          'PENERIMAAN DROPING ' + data.ref_date + ' NO BUKTI ' + data.doc_number
      }
      change_payment()
      dlgDroping.value = false
    }

    onMounted(async () => {
      stateform.value = $route.query.state
      clear_data()
      cashbanks_source.value = []
      cashbanks_destination.value = []
      let props = {}
      props.url = 'master/finance/cash-bank/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        cashbanks_source.value = response
      })
      props.url = 'master/operational/pool/list?all=0'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        pools.value = response
      })

      if ($route.query.state === 'update') {
        props = {}
        props.url = 'finance/cash_bank/get'
        props.sysid = $route.query.sysid
        $store.dispatch('master/GET_DATA', props).then((response) => {
          edit.value = response
          operation.value = 'inserted'
        })
      }
    })

    return {
      loading,
      edit,
      dataevent,
      title,
      filter,
      pagetitle,
      api_url,
      btns,
      access,
      show_jurnal,
      dlgJurnal,
      jurnal_id,
      getJurnal,
      stateform,
      cashbanks_source,
      cashbanks_destination,
      clear_data,
      save_data,
      change_payment,
      pools,
      dlgDroping,
      show_droping,
      droping,
      pagination,
      selected,
      columns,
      onRequest,
      selectdata
    }
  }
})
</script>
