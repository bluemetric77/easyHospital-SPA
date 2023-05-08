<template>
  <q-page class="page-app">
    <div v-show="stateform">
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
          <div class="row items-start q-col-gutter-xs q-mb-sm">
            <div class="col-xs-12 col-sm-6 col-md-6">
              <div class="row items-start q-mb-sm q-col-gutter-xs">
                <div class="col-xs-8 col-sm-5 col-md-5">
                  <q-select
                    v-model="edit.trans_code"
                    :options="voucher"
                    outlined
                    dense
                    options-dense
                    label="Voucher"
                    option-value="voucher_code"
                    option-label="voucher_name"
                    emit-value
                    map-options
                    fill-input
                    square
                    stack-label
                  />
                </div>
                <div class="col-xs-4 col-sm-3 col-md-2">
                  <q-input
                    v-model="edit.trans_series"
                    dense
                    outlined
                    readonly
                    type="text"
                    label="Series"
                    square
                    stack-label
                  />
                </div>
                <div class="col-xs-12 col-sm-4 col-md-3">
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
              </div>
              <div class="row items-start q-col-gutter-xs q-mb-sm">
                <div class="col-xs-6 col-sm-6 col-md-5">
                  <q-input
                    v-model="edit.reference1"
                    dense
                    outlined
                    type="text"
                    label="Referensi 1"
                    square
                    stack-label
                  />
                </div>
                <div class="col-xs-6 col-sm-6 col-md-5">
                  <q-input
                    v-model="edit.reference2"
                    dense
                    outlined
                    type="text"
                    label="Referensi 2"
                    square
                    stack-label
                  />
                </div>
              </div>
              <div class="row items-start q-col-gutter-xs q-mb-sm">
                <div class="col-xs-12 col-sm-12 col-md-10">
                  <q-input
                    v-model="edit.notes"
                    dense
                    outlined
                    type="text"
                    label="Catatan"
                    square
                    stack-label
                  />
                </div>
              </div>
            </div>
            <div class="col-xs-12 offset-sm-1 col-sm-5 offset-md-2 col-md-4">
              <div class="row items-start q-col-gutter-xs q-mb-sm">
                <div class="col-6">
                  <q-field
                    square
                    outlined
                    stack-label
                    dense
                    :model-value="edit.debit"
                    label="Debit"
                  >
                    <template v-slot:control>
                      <vue-numeric
                        v-model="edit.debit"
                        class="q-field__input text-right"
                        separator="."
                        :precision="2"
                      />
                    </template>
                  </q-field>
                </div>
                <div class="col-6">
                  <q-field
                    square
                    outlined
                    stack-label
                    dense
                    :model-value="edit.credit"
                    label="Kredit"
                  >
                    <template v-slot:control>
                      <vue-numeric
                        v-model="edit.credit"
                        class="q-field__input text-right"
                        separator="."
                        :precision="2"
                      />
                    </template>
                  </q-field>
                </div>
              </div>
              <div class="row items-start q-mb-sm q-col-gutter-xs q-mb-sm">
                <div class="col-6">
                  <q-input
                    v-model="edit.fiscal_month"
                    dense
                    outlined
                    readonly
                    type="text"
                    label="Bulan Fiscal"
                    square
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="edit.fiscal_year"
                    dense
                    outlined
                    readonly
                    type="text"
                    label="Tahun Fiscal"
                    square
                  />
                </div>
              </div>
              <div class="row items-start q-mb-sm q-col-gutter-xs q-mb-sm">
                <div class="col-12">
                  <q-select
                    v-model="edit.transtype"
                    :options="jurnal_type"
                    outlined
                    dense
                    options-dense
                    label="Tipe Jurnal"
                    option-value="jurnal_type"
                    option-label="descriptions"
                    emit-value
                    map-options
                    fill-input
                    readonly
                    square
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-table
          class="grid-tables"
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
          style="min-height: 150px"
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
            <img
              v-show="posted"
              src="statics/logo/Posted.png"
              spinner-color="white"
              style="height: 30px; max-width: 300px"
            />
            <img
              v-show="deleted"
              src="statics/logo/Deleted.png"
              spinner-color="white"
              style="height: 30px; max-width: 300px"
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
                      name="delete"
                      color="red"
                      size="xs"
                      @click="removeRow(props.row.line_no)"
                    />
                  </div>
                  <div v-else-if="col.name === 'no_account'">
                    <input
                      v-model="props.row.no_account"
                      type="text"
                      style="width: 80px"
                      class="q-field__input input"
                    />
                    <q-icon
                      name="search"
                      color="blue"
                      size="sm"
                      @click="openAccount(props.row.line_no)"
                    />
                  </div>
                  <div v-else-if="col.name === 'line_memo'">
                    <input
                      v-model="props.row.line_memo"
                      type="text"
                      style="width: 300px"
                      class="q-field__input input"
                    />
                  </div>
                  <div v-else-if="col.name === 'reference1'">
                    <input
                      v-model="props.row.reference1"
                      type="text"
                      style="width: 150px"
                      class="q-field__input input"
                    />
                  </div>
                  <div v-else-if="col.name === 'reference2'">
                    <input
                      v-model="props.row.reference2"
                      type="text"
                      style="width: 150px"
                      class="q-field__input input"
                    />
                  </div>
                  <div v-else-if="col.name === 'debit'">
                    <vue-numeric
                      v-model="props.row.debit"
                      precision="2"
                      thousand-separator="."
                      style="width: 80px"
                      class="q-field__input right-input"
                      @input="calculate()"
                    />
                  </div>
                  <div v-else-if="col.name === 'credit'">
                    <vue-numeric
                      v-model="props.row.credit"
                      precision="2"
                      style="width: 80px"
                      thousand-separator="."
                      class="q-field__input right-input"
                      @input="calculate()"
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
    </div>
    <q-card
      v-show="!stateform"
      square
      class="icard q-mb-sm"
    >
      <q-bar
        class="entry-caption"
        style="font-size: 10px"
      >
        <span><strong>Filter</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm q-mb-xs">
        <div class="row items-center q-col-gutter-xs q-mb-xs">
          <div class="col-xs-6 col-sm-2 col-md-2">
            <q-input
              v-model="date1"
              outlined
              dense
              square
              type="date"
              stack-label
            />
          </div>
          <div class="col-xs-6 col-sm-2 col-md-2">
            <q-input
              v-model="date2"
              outlined
              dense
              square
              type="date"
              stack-label
            />
          </div>
          <div class="col-xs-3 col-sm-3 col-md-3">
            <q-select
              v-model="trans_code"
              :options="voucher_all"
              outlined
              dense
              options-dense
              label="Voucher"
              option-value="voucher_code"
              option-label="voucher_code"
              emit-value
              map-options
              fill-input
              square
              stack-label
            />
          </div>
          <div class="col-xs-8 col-sm-3 col-md-3">
            <q-select
              v-model="transtype"
              :options="jurnal_type"
              outlined
              dense
              options-dense
              label="Tipe Jurnal"
              option-value="jurnal_type"
              option-label="descriptions"
              emit-value
              map-options
              fill-input
              square
            />
          </div>
          <div class="col-xs-1 col-sm-1 col-md-2">
            <q-icon
              name="search"
              size="sm"
              color="primary"
              class="q-ml-sm"
              @click="loaddata()"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card
      v-show="!stateform"
      square
      class="icard q-mb-sm"
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
              class="cursor-pointer"
              color="white"
              size="sm"
              @click="filter = ''"
            />
          </template>
        </q-input>
      </q-bar>
      <q-table
        square
        class="grid-tables"
        :rows="data"
        :columns="columns"
        dense
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="transid"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        :loading="loading"
        virtual-scroll
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
          <div class="full-width row flex-center text-accent q-gutter-sm">
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
                    @click="runMethod(btn.onclick, props.row.transid)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'debit'">
                  {{ $formatnumber(props.row.debit, 2, ',', '-') }}
                </div>
                <div v-else-if="col.name === 'credit'">
                  {{ $formatnumber(props.row.credit, 2, ',', '-') }}
                </div>
                <div v-else-if="col.name === 'ref_date'">
                  {{ $INDDate(props.row.ref_date) }}
                </div>
                <div v-else-if="col.name === 'verified_date'">
                  {{ $INDDateTime(props.row.verified_date) }}
                </div>
                <div v-else-if="col.name === 'is_void'">
                  <q-toggle
                    v-model="props.row.is_void"
                    true-value="1"
                    false-value="0"
                    dense
                    disable
                  />
                </div>
                <div v-else-if="col.name === 'is_verified'">
                  <q-toggle
                    v-model="props.row.is_verified"
                    true-value="1"
                    false-value="0"
                    dense
                    disable
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
      <q-toolbar
        v-show="!stateform"
        class="main-toolbar"
      >
        <q-btn
          v-for="(btn, index) in btns"
          :key="index"
          dense
          no-caps
          flat
          v-show="btn.is_allowed"
          class="q-mr-xs"
          :icon="btn.icon"
          :label="btn.caption"
          @click="runMethod(btn.onclick)"
        >
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
      </q-toolbar>
      <q-toolbar
        v-show="stateform"
        class="main-toolbar"
      >
        <q-btn
          :label="lblSave"
          class="q-mr-xs"
          no-caps
          flat
          :disable="posted || deleted"
          icon="save"
          color="positive"
          @click="save_event()"
        />
        <q-btn
          label="Batal"
          icon="undo"
          no-caps
          color="negative"
          flat
          @click="stateform = false"
        />
      </q-toolbar>
    </q-page-sticky>

    <coa
      v-if="dlgAccount"
      :show="dlgAccount"
      @CloseCOA="getCOA"
    />
  </q-page>
</template>

<script>
import coa from 'components/COA.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'

export default defineComponent({
  name: 'JournalEntry',
  components: { coa },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()
    const operation = ref('')
    const loading = ref(false)
    const data = ref([])
    const lblSave = ref('Simpan')
    const voucher = ref([])
    const jurnal_type = ref([])
    const stateform = ref(false)
    const edit = ref({})
    const is_suspend = ref(1)
    const title = ref('Tambah Data')
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
    const date1 = ref(null)
    const date2 = ref(null)
    const dlgAccount = ref(false)
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
        name: 'no_account',
        align: 'left',
        sytle: 'width: 100px',
        headerStyle: 'width: 100px',
        label: 'No. Akun',
        field: 'no_account'
      },
      {
        name: 'description',
        align: 'left',
        label: 'Nama Akun',
        field: 'description'
      },
      {
        name: 'line_memo',
        align: 'left',
        sytle: 'width: 170px',
        headerStyle: 'width: 170px',
        label: 'Keterangan',
        field: 'line_memo'
      },
      {
        name: 'debit',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Debit',
        field: 'debit'
      },
      {
        name: 'credit',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Kredit',
        field: 'credit'
      },
      {
        name: 'reference1',
        align: 'left',
        label: 'No. Referensi 1',
        field: 'reference1'
      },
      {
        name: 'reference2',
        align: 'center',
        label: 'No. Referensi 2',
        field: 'reference2'
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
    const deleted = ref(false)
    const posted = ref(false)
    const trans_code = ref('ALL')
    const voucher_all = ref([])
    const transtype = ref(-1)

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
          start_date: date1.value,
          end_date: date2.value,
          trans_code: trans_code.value,
          transtype: transtype.value,
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
      let skrng = new Date()
      stateform.value = true
      operation.value = 'inserted'
      edit.value = {
        transid: -1,
        ref_date: skrng.toLocaleDateString('en-CA'),
        trans_code: '',
        trans_series: '(NEW)',
        reference1: '-',
        reference2: '-',
        debit: 0,
        credit: 0,
        fiscal_month: -1,
        fiscal_year: -1,
        transtype: 0
      }
      detail.value = []
      lblSave.value = 'Simpan'
    }

    async function edit_event(transid = -1) {
      if (selected.value.length > 0 || !(transid === -1)) {
        operation.value = 'updated'
        if (transid === -1) {
          let item = selected.value[0]
          transid = item.transid
        }
        $q.loading.show({ delay: 100 })
        try {
          let props = {}
          props.url = api_url.value.edit
          props.transid = transid
          let respon = await $store.dispatch('master/GET_DATA', props)
          console.info(JSON.stringify(respon))
          if (!(typeof respon === 'undefined')) {
            stateform.value = true
            edit.value = respon.header
            detail.value = respon.detail
            lblSave.value = 'Simpan'
            if (posted.value || deleted.value) {
              $q.notify({
                color: 'negative',
                textcolor: 'white',
                message: respon.message,
                position: 'top',
                timeout: 2000
              })
            }
          }
        } finally {
          $q.loading.hide()
        }
      }
    }

    async function delete_event(transid = -1) {
      if (selected.value.length > 0 || !(transid === -1)) {
        operation.value = 'deleted'
        let item = null
        if (!(transid === -1)) {
          data.value.forEach((el) => {
            if (el.transid === transid) {
              item = el
            }
          })
        } else {
          item = selected.value[0]
        }
        $q.dialog({
          dark: false,
          title: 'Konfirmasi',
          message: 'Apakah data ini [' + item.voucher + '] akan divoid ?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          let props = {}
          props.url = api_url.value.delete
          props.transid = item.transid
          $store.dispatch('master/DELETE_DATA', props).then((respon) => {
            if (!(typeof respon === 'undefined')) {
              let msg = respon.data
              if (respon.success) {
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

    async function save_event() {
      this.$q
        .dialog({
          title: 'Konfirmasi',
          message: 'Apakah Jurnal ini akan disimpan ?',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          let where = {}
          let app = {}
          where.transid = edit.value.transid
          app.operation = operation.value
          app.header = edit.value
          app.detail = detail.value
          app.where = where
          app.url = api_url.value.save
          $store.dispatch('master/POST_DATA', app).then((respon) => {
            if (!(typeof respon === 'undefined')) {
              let msg = respon.data
              if (respon.success) {
                stateform.value = false
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
          props.sysid = transid
          await $store.dispatch('master/GET_DOWNLOAD', props)
        } finally {
          $q.loading.hide()
        }
      }
    }
    async function addrow() {
      let data = {}
      data = {
        transid: -1,
        line_no: detail.value.length + 1,
        no_account: '',
        description: '',
        line_memo: '',
        debit: 0,
        credit: 0,
        reference1: '',
        reference2: ''
      }
      detail.value.push(data)
      openAccount(data.line_no)
    }

    function removeRow(lineno) {
      $q.dialog({
        dark: false,
        title: 'Konfirmasi',
        message: 'Apakah line akun ini akan dihapus ?',
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

    function openAccount(lineno) {
      dlgAccount.value = true
      current_row.value = lineno
    }

    function getCOA(closed, data) {
      dlgAccount.value = closed
      if (!(typeof data.account_no === 'undefined')) {
        let i = 0
        for (i = 0; i < detail.value.length; i++) {
          if (detail.value[i].line_no === current_row.value) {
            detail.value[i].no_account = data.account_no
            detail.value[i].description = data.account_name
          }
        }
      }
    }

    function calculate() {
      let debit = 0
      let credit = 0
      detail.value.forEach((el) => {
        debit = debit + el.debit
        credit = credit + el.credit
      })
      edit.value.debit = debit
      edit.value.credit = credit
    }

    onMounted(async () => {
      let props = {}
      props.url = 'master/accounting/voucher/list'
      voucher.value = await $store.dispatch('master/GET_DATA', props)
      voucher_all.value = []
      voucher_all.value.push({
        voucher_code: 'ALL',
        voucher_name: 'SEMUA VOUCHER'
      })
      voucher.value.forEach((el) => {
        voucher_all.value.push(el)
      })
      props = {}
      props.url = 'master/accounting/jurnal_type'
      jurnal_type.value = await $store.dispatch('master/GET_DATA', props)

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
      date1.value = skrng.toLocaleDateString('en-CA')
      date2.value = skrng.toLocaleDateString('en-CA')
      loaddata()
    })

    return {
      data,
      lblSave,
      operation,
      voucher,
      jurnal_type,
      stateform,
      edit,
      is_suspend,
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
      date1,
      date2,
      dlgAccount,
      coldetail,
      detail,
      selected_detail,
      pagination_detail,
      current_row,
      deleted,
      posted,
      runMethod,
      loaddata,
      onRequest,
      add_event,
      edit_event,
      save_event,
      print_event,
      delete_event,
      addrow,
      loading,
      calculate,
      openAccount,
      getCOA,
      removeRow,
      voucher_all,
      trans_code,
      transtype
    }
  }
})
</script>
