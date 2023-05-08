<template>
  <q-page class="page-app">
    <q-card
      v-show="stateform"
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
        <q-btn
          label="Kembali"
          flat
          dense
          no-caps
          size="sm"
          icon="mdi-arrow-collapse-left"
          @click="stateform = false"
        />
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-start q-col-gutter-xs q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-6">
            <div class="row items-start q-mb-sm q-col-gutter-xs">
              <div class="col-xs-8 col-sm-8 col-md-5">
                <q-select
                  v-model="edit.trans_code"
                  :options="voucher"
                  outlined
                  dense
                  options-dense
                  label="Voucher"
                  option-value="voucher_code"
                  option-label="descriptions"
                  emit-value
                  map-options
                  fill-input
                  square
                />
              </div>
              <div class="col-xs-4 col-sm-4 col-md-2">
                <q-input
                  v-model="edit.trans_series"
                  dense
                  outlined
                  readonly
                  type="text"
                  label="Series"
                  square
                />
              </div>
              <div class="col-xs-6 col-sm-6 col-md-3">
                <q-input
                  v-model="edit.ref_date"
                  dense
                  outlined
                  type="date"
                  label="Tanggal"
                  square
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
                />
              </div>
            </div>
          </div>
          <div class="col-xs-12 offset-sm-1 col-sm-5 offset-md-2 col-md-4">
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <q-field
                  v-model="edit.debit"
                  dense
                  outlined
                  label="Debit"
                  square
                >
                  <template v-slot:control="{ id, value, emitValue }">
                    <vue-numeric
                      :id="id"
                      precision="2"
                      :value="value"
                      thousand-separator="."
                      class="q-field__input text-right"
                      read-only
                      @input="emitValue"
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-6">
                <q-field
                  v-model="edit.credit"
                  dense
                  outlined
                  label="Kredit"
                  square
                >
                  <template v-slot:control="{ id, value, emitValue }">
                    <vue-numeric
                      :id="id"
                      precision="2"
                      :value="value"
                      thousand-separator="."
                      class="q-field__input text-right"
                      read-only
                      @input="emitValue"
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
                  :options="Jurnaltypes"
                  outlined
                  dense
                  options-dense
                  label="Tipe Jurnal"
                  option-value="jurnal_type"
                  option-label="descriptions"
                  emit-value
                  map-options
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
                <div v-if="col.name === 'debit'">
                  {{ localnumber(props.row.debit, 2, ',', '') }}
                </div>
                <div v-else-if="col.name === 'credit'">
                  {{ localnumber(props.row.credit, 2, ',', '') }}
                </div>
                <div v-else>
                  {{ col.value }}
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-card-actions v-show="isvoid">
        <q-btn
          label="Void Jurnal"
          no-caps
          class="glossy"
          color="red"
          icon="remove_circle_outline"
        />
      </q-card-actions>
    </q-card>
    <q-card
      v-show="!stateform"
      square
      class="q-mb-sm icard"
    >
      <q-bar
        dense
        class="entry-caption"
      >
        <span><strong>Buku Besar</strong></span>
      </q-bar>
      <q-card-section class="q-pa-xs">
        <div class="row items-center q-mb-sm q-col-gutter-sm">
          <div class="col-xs-12 col-sm-3 col-md-2">
            <q-input
              v-model="no_account"
              outlined
              dense
              label="No.Akun"
              square
            >
              <template v-slot:append>
                <q-icon
                  name="search"
                  @click="openaccount()"
                />
              </template>
            </q-input>
          </div>
          <div class="col-xs-12 col-sm-5 col-md-4">
            <q-input
              v-model="nm_account"
              outlined
              dense
              label="Nama Akun"
              disable
              square
            />
          </div>
        </div>
        <div class="row items-center q-col-gutter-xs q-mb-sm">
          <div class="col-xs-12 col-sm-5 col-md-4">
            <q-select
              v-model="project_code"
              :options="projects"
              outlined
              dense
              options-dense
              label="Proyek Akunting"
              option-value="project_code"
              option-label="project_name"
              emit-value
              map-options
              fill-input
              square
            />
          </div>
        </div>
        <div class="row items-center q-mb-sm q-col-gutter-sm">
          <div class="col-xs-4 col-sm-3 col-md-2">
            <q-input
              v-model="date1"
              outlined
              dense
              label="Tanggal"
              square
              type="date"
            />
          </div>
          <div class="col-xs-4 col-sm-3 col-md-2">
            <q-input
              v-model="date2"
              type="date"
              dense
              label="s/d"
              outlined
              square
            />
          </div>
          <div class="col-xs-4 col-sm-3 col-md-2">
            <q-btn
              icon="refresh"
              label="Query"
              class="glossy"
              no-caps
              color="teal-8"
              size="md"
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
        class="grid-tables"
        square
        :data="data"
        :columns="columns"
        dense
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="sysid"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
      >
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
            @dblclick="onDoubleClick(props.row)"
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
                    v-show="
                      !(btn.action === 'refresh') && !(btn.action === 'add')
                    "
                    :key="index"
                    flat
                    no-caps
                    dense
                    class="q-mr-xs"
                    :name="btn.icon"
                    size="xs"
                    color="teal-8"
                    @click="runMethod(btn.onclick, props.row.sysid)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'is_void'">
                  <q-toggle
                    v-model="props.row.is_void"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    false-value="0"
                    true-value="1"
                    disable
                    dense
                  />
                </div>
                <div v-else-if="col.name === 'is_verified'">
                  <q-toggle
                    v-model="props.row.is_verified"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    false-value="0"
                    true-value="1"
                    disable
                    dense
                  />
                </div>
                <div v-else-if="col.name === 'debit'">
                  {{ localnumber(props.row.debit, 2, ',', '') }}
                </div>
                <div v-else-if="col.name === 'credit'">
                  {{ localnumber(props.row.credit, 2, ',', '') }}
                </div>
                <div v-else-if="col.name === 'begining'">
                  {{ localnumber(props.row.begining, 2, ',', '') }}
                </div>
                <div v-else-if="col.name === 'last'">
                  {{ localnumber(props.row.last, 2, ',', '') }}
                </div>
                <div v-else-if="col.name === 'ref_date'">
                  {{ indonesiadate(props.row.ref_date) }}
                </div>
                <div v-else-if="col.name === 'verified_date'">
                  {{ indonesiadate(props.row.verified_date) }}
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
        <!-- <span class="page-title">User Akses</span> -->
        <div
          v-for="(btn, index) in btns"
          :key="index"
        >
          <q-btn
            :dense="xs"
            flat
            no-caps
            :stack="xs"
            class="btn-toolbar q-mr-sm"
            :icon="btn.icon"
            :label="btn.caption"
            @click="runMethod(btn.onclick)"
          >
            <q-tooltip content-class="tooltips-app">
              {{ btn.tooltips }}
            </q-tooltip>
          </q-btn>
        </div>
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
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'

export default defineComponent({
  name: 'Generalledger',
  components: { coa },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const data = ref([])
    const Jurnaltypes = ref([])
    const voucher = ref([])
    const projects = ref([])
    const jurnaltype = ref(-1)
    const filter = ref('')
    const pagination = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
    const selected = ref([])
    const columns = ref([])
    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const date1 = ref(null)
    const date2 = ref(null)
    const stateform = ref(false)
    const detail = ref([])
    const edit = ref({})
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
      { name: 'project', align: 'left', label: 'proyek', field: 'project' },
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
    const selected_detail = ref([])
    const pagination_detail = ref({
      sortBy: 'line_no',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
    const dlgAccount = ref(false)
    const no_account = ref('-')
    const nm_account = ref('-')
    const isvoid = ref(false)

    function xs() {
      return this.$q.screen.xs
    }

    onMounted(async () => {
      this.$q.loading.show({ delay: 200 })
      try {
        let props = {}
        props.url = 'master/account/jurnaltype'
        this.Jurnaltypes = await this.$store.dispatch('master/GET_DATA', props)

        props = {}
        props.url = 'master/voucher/getvoucher'
        this.voucher = await this.$store.dispatch('master/GET_DATA', props)

        props = {}
        props.url = 'master/pool/project'
        this.projects = await this.$store.dispatch('master/GET_DATA', props)

        let skrng = new Date()
        this.date1 = skrng.toLocaleDateString('en-CA')
        this.date2 = skrng.toLocaleDateString('en-CA')

        let property = await this.$store.dispatch(
          'home/GET_PAGEPROPERTY',
          this.$route.path
        )
        this.columns = property.columns
        this.pagetitle = property.title
        this.api_url = property.url
        this.btns = property.btn
        this.access = property.access
        let account = this.$route.query.account
        if (!(typeof account === 'undefined')) {
          this.no_account = account
          this.date1 = this.$route.query.startdate
          this.date2 = this.$route.query.enddate
          this.project = this.$route.query.project
          this.loaddata()
        }
      } finally {
        this.$q.loading.hide()
      }
    })

    function runMethod(method, sysid = -1) {
      this[method](sysid)
    }

    async function loaddata() {
      selected.value = []
      this.onRequest({
        pagination: this.pagination,
        filter: this.filter
      })
    }

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      this.$q.loading.show({ delay: 200 })
      try {
        let props = {}
        props.page = page
        props.limit = fetchCount
        props.descending = descending
        props.jwt = this.jwt
        props.no_account = this.no_account
        props.project = this.project_code
        props.date1 = this.date1
        props.date2 = this.date2
        props.url = this.api_url.retrieve
        props.url = this.api_url.retrieve
        let respon = await this.$store.dispatch('master/GET_DATA', props)
        this.data = respon.data
        this.pagination.rowsNumber = respon.total
        this.pagination.page = respon.current_page
        this.pagination.rowsPerPage = respon.per_page
        this.pagination.sortBy = sortBy
        this.pagination.descending = descending
      } catch (error) {
      } finally {
        this.$q.loading.hide()
      }
    }

    function localdate(value) {
      if (!(value === null)) {
        let dat = this.$INDDate(value)
        return dat
      } else {
        return value
      }
    }
    return {
      data,
      Jurnaltypes,
      voucher,
      projects,
      jurnaltype,
      filter,
      pagination,
      selected,
      columns,
      pagetitle,
      api_url,
      btns,
      access,
      date1,
      date2,
      stateform,
      detail,
      edit,
      coldetail,
      selected_detail,
      pagination_detail,
      dlgAccount,
      no_account,
      nm_account,
      isvoid,
      runMethod,
      loaddata,
      onRequest,
      localdate
    }
  }
})
</script>
