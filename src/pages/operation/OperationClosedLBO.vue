<template>
  <q-page class="page-app">
    <!-- Dialog Data Location-->
    <q-card
      class="icard"
      square
    >
      <q-bar class="entry-caption">
        Registrasi biaya operasional - {{ edit.work_order_no }}
      </q-bar>
      <q-card-section class="q-gutter-sm">
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input
              v-model="edit.order_no"
              dense
              outlined
              square
              label="No.Order"
              stack-label
              readonly
            />
          </div>
          <div class="col-xs-2 col-sm-4 col-md-2">
            <q-input
              v-model="edit.pool_code"
              dense
              outlined
              square
              label="Pool"
              stack-label
              readonly
            />
          </div>
          <div class="col-xs-2 col-sm-4 offset-md-4 col-md-2">
            <q-input
              v-model="edit.work_order_no"
              dense
              outlined
              square
              label="No. Muatan"
              stack-label
              readonly
            />
          </div>
          <div class="col-xs-4 col-sm-4 col-md-2">
            <q-select
              v-model="edit.work_type"
              dense
              outlined
              square
              label="Tipe Order"
              stack-label
              :options="['RITASE', 'TONASE']"
              options-dense
              disable
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-8 col-md-4">
            <q-input
              v-model="edit.partner_name"
              dense
              outlined
              square
              label="Nama Konsumen"
              stack-label
              readonly
            />
          </div>
          <div class="col-xs-6 col-sm-4 offset-md-4 col-md-4">
            <q-input
              v-model="edit.customer_no"
              dense
              outlined
              square
              label="Nomor order konsumen"
              stack-label
              readonly
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-select
              v-model="edit.vehicle_group"
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
              readonlu
            />
          </div>
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-select
              v-model="edit.work_type"
              dense
              outlined
              square
              label="Tipe Pekerjaan"
              stack-label
              :options="['EXPORT', 'IMPORT', 'DOMESTIC', 'CARGO', 'POK']"
              options-dense
              readonly
            />
          </div>
          <div class="col-xs-12 col-sm-4 offset-md-4 col-md-4">
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
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input
              v-model="edit.origins"
              dense
              outlined
              square
              label="Asal"
              stack-label
              disable
            />
          </div>
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input
              v-model="edit.destination"
              dense
              outlined
              square
              label="Tujuan"
              stack-label
              disable
            />
          </div>
          <div class="col-xs-6 col-sm-2 offset-md-4 col-md-2">
            <q-input
              v-model="edit.vehicle_no"
              dense
              outlined
              square
              label="No.Unit"
              stack-label
              readonly
            />
          </div>
          <div class="col-xs-6 col-sm-2 col-md-2">
            <q-input
              v-model="edit.police_no"
              dense
              outlined
              square
              label="No.Polisi"
              stack-label
              readonly
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input
              v-model="edit.ref_date"
              dense
              outlined
              square
              label="Tgl.Kegiatan"
              stack-label
              type="date"
              disable
            />
          </div>
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input
              v-model="edit.cost_date"
              dense
              outlined
              square
              label="Tgl.Reg.Biaya"
              stack-label
              type="date"
            />
          </div>
        </div>
      </q-card-section>
      <q-table
        square
        :rows="costs"
        :columns="columns_cost"
        no-data-label="data kosong"
        dense
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="line_no"
        separator="cell"
        selection="single"
        v-model:selected="selected_cost"
        v-model:pagination="pagination_cost"
        binary-state-sort
        virtual-scroll
        hide-pagination
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
                <div v-if="col.name === 'standar_budget'">
                  {{ $formatnumber(props.row.standar_budget) }}
                </div>
                <div v-else-if="col.name === 'budget'">
                  {{ $formatnumber(props.row.budget) }}
                </div>
                <div v-else-if="col.name === 'expense'">
                  <q-field
                    square
                    outlined
                    stack-label
                    dense
                    :model-value="props.row.expense"
                    borderless
                  >
                    <template v-slot:control>
                      <vue-numeric
                        v-model="props.row.expense"
                        class="q-field__input text-right"
                        separator="."
                      />
                    </template>
                  </q-field>
                </div>
                <div v-else-if="col.name === 'is_invoice'">
                  <q-checkbox
                    v-model="props.row.is_invoice"
                    true-value="1"
                    false-value="0"
                    dense
                  />
                </div>
                <div v-else-if="col.name === 'acuan'">
                  <q-select
                    v-model="props.row.acuan"
                    :options="['COST', 'FEE']"
                    dense
                    options-dense
                    outlined
                    square
                  />
                </div>
                <div v-else-if="col.name === 'fee'">
                  <q-field
                    square
                    outlined
                    stack-label
                    dense
                    :model-value="props.row.fee"
                    borderless
                  >
                    <template v-slot:control>
                      <vue-numeric
                        v-model="props.row.fee"
                        class="q-field__input text-right"
                        separator="."
                        :disabled="props.row.is_invoice === '0'"
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
          icon="refresh"
          label="Perbaharui"
          @click="refresh_data()"
        >
          <q-tooltip content-class="tooltips-app"> Perbaharui </q-tooltip>
        </q-btn>
        <q-btn
          dense
          no-caps
          flat
          class="btn-toolbar q-mr-xs"
          icon="save"
          label="Simpan"
          @click="save_cost()"
        >
          <q-tooltip
            content-class="tooltips-app"
            :loading="btn_loading"
          >
            Simpan registrasi biaya
          </q-tooltip>
        </q-btn>
        <q-space />
        <q-btn
          label="Kembali"
          icon="far fa-arrow-alt-circle-left"
          flat
          no-caps
          rounded
          :to="{ name: 'work-order', force: true }"
        />
      </q-toolbar>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'

export default defineComponent({
  name: 'OperationClosedLBO',
  props: { sysid: BigInt },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()
    const $route = useRoute()

    const loading = ref(false)
    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const btn_loading = ref(false)

    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const cost = ref([])
    const costs = ref([])
    const selected_cost = ref([])
    const columns_cost = ref([
      { name: 'line_no', align: 'center', label: '#No', field: 'line_no' },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Komponen Biaya',
        field: 'descriptions'
      },
      {
        name: 'standar_budget',
        align: 'right',
        label: 'Standar',
        field: 'standar_budget'
      },
      { name: 'budget', align: 'right', label: 'Kasir', field: 'budget' },
      { name: 'expense', align: 'right', label: 'Realisasi', field: 'expense' },
      {
        name: 'is_invoice',
        align: 'center',
        label: 'Invoice',
        field: 'is_invoice'
      },
      { name: 'fee', align: 'right', label: 'Ditagihkan', field: 'fee' },
      { name: 'acuan', align: 'left', label: 'Acuan', field: 'acuan' },
      { name: 'line_note', align: 'left', label: 'Catatan', field: 'line_note' }
    ])
    const pagination_cost = ref({
      sortBy: 'line_no',
      descending: true,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    })
    const dlglbo = ref(false)

    async function refresh_data() {
      let prop = {}
      prop.url = 'operation/work-order/get3'
      prop.transid = $route.query.sysid
      let respon = await $store.dispatch('master/GET_DATA', prop)
      if (!(typeof respon === 'undefined')) {
        edit.value = respon.data
        costs.value = respon.costs
      }
    }

    async function save_cost() {
      try {
        let app = {}
        app.data = edit.value
        app.variable = costs.value
        app.url = 'operation/work-order/closed-lbo'
        btn_loading.value = true
        let respon = await $store.dispatch('master/POST_DATA', app)
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
            $router.push({ path: '/operational/work-order', query: {} })
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
        btn_loading.value = false
      }
    }

    onMounted(async () => {
      refresh_data()
    })

    return {
      loading,
      edit,
      title,
      pagetitle,
      api_url,
      btns,
      access,
      costs,
      selected_cost,
      columns_cost,
      pagination_cost,
      refresh_data,
      save_cost,
      btn_loading
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
