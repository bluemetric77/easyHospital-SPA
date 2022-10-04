<template>
  <q-page class="page-app">
    <!-- Dialog Data Location-->
    <q-card class="icard" square>
      <q-bar class="entry-caption">
        Pengajuan Biaya - {{edit.work_order_no}}
      </q-bar>
      <q-card-section class="q-gutter-sm">
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input v-model="edit.order_no" dense outlined square label="No.Order" stack-label readonly />
          </div>
          <div class="col-xs-2 col-sm-4 col-md-2">
            <q-input v-model="edit.pool_code" dense outlined square label="Pool" stack-label readonly />
          </div>
          <div class="col-xs-2 col-sm-4 offset-md-4 col-md-2">
            <q-input v-model="edit.work_order_no" dense outlined square label="No. Muatan" stack-label readonly />
          </div>
          <div class="col-xs-4 col-sm-4  col-md-2">
            <q-select v-model="edit.work_type" dense outlined square label="Tipe Order" stack-label
              :options="['RITASE','TONASE']" options-dense disable />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-8 col-md-4">
            <q-input v-model="edit.partner_name" dense outlined square label="Nama Konsumen" stack-label readonly />
          </div>
          <div class="col-xs-6 col-sm-4 offset-md-4 col-md-4">
            <q-input v-model="edit.customer_no" dense outlined square label="Nomor order konsumen" stack-label
              readonly />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-select v-model="edit.vehicle_group" :options="vehicle_types" outlined dense options-dense
              label="Jenis kendaraan/unit" option-value="vehicle_type" option-label="vehicle_type_name" emit-value
              map-options fill-input stack-label square readonlu />
          </div>
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-select v-model="edit.work_type" dense outlined square label="Tipe Pekerjaan" stack-label
              :options="['EXPORT','IMPORT','DOMESTIC','CARGO','POK']" options-dense readonly />
          </div>
          <div class="col-xs-12 col-sm-4 offset-md-4 col-md-4">
            <q-input v-model="edit.driver_name" dense outlined square label="Pengemudi" stack-label readonly />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input v-model="edit.origins" dense outlined square label="Asal" stack-label disable />
          </div>
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input v-model="edit.destination" dense outlined square label="Tujuan" stack-label disable />
          </div>
          <div class="col-xs-6 col-sm-2 offset-md-4 col-md-2">
            <q-input v-model="edit.vehicle_no" dense outlined square label="No.Unit" stack-label readonly />
          </div>
          <div class="col-xs-6 col-sm-2 col-md-2">
            <q-input v-model="edit.police_no" dense outlined square label="No.Polisi" stack-label readonly />
          </div>
        </div>
      </q-card-section>
      <q-toolbar class="main-toolbar">
        <q-btn label="Pengajuan biaya operasional" icon="add" dense flat @click="add_lbo(-1)" />
      </q-toolbar>
      <q-table square :rows="lbo" :columns="columns" no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan" row-key="transid" :filter="filter" separator="cell"
        selection="single" v-model:selected="selected" v-model:pagination="pagination" binary-state-sort virtual-scroll
        :loading="loading" hide-bottom hide-no-data>
        <template v-slot:loading>
          <q-inner-loading showing>
            <q-spinner-ball size="75px" color="red-10" />
          </q-inner-loading>
        </template>
        <template v-slot:no-data="{ icon, message, filter }">
          <div class="full-width row flex-top text-accent q-gutter-sm">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>{{ message }}</span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-teal-10 text-white">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" @click="props.selected = !props.selected">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div class="grid-data">
                <div v-if="col.name === 'doc_number'">
                  <q-btn glossy rounded :label="props.row.doc_number" dense no-caps class="bg-green-10 text-white"
                    @click="edit_lbo(props.row.transid)" />
                  <q-btn glossy rounded icon="print" dense no-caps class="q-ml-sm bg-red-10 text-white"
                    @click="printlbo_event(props.row.transid)" />
                </div>
                <div v-else-if="col.name === 'voucher'">
                  <div v-if="props.row.voucher==='-'">
                    {{props.row.voucher}}
                  </div>
                  <div v-else>
                    <q-btn glossy rounded :label="props.row.voucher" dense no-caps class="bg-red-10 text-white q-mr-sm"
                      @click="show_jurnal(props.row.no_jurnal)" />
                    <q-btn glossy rounded label="...." dense no-caps class="bg-teal-10 text-white"
                      @click="show_cashierUJO(props.row.transid)" />
                  </div>
                </div>
                <div v-else-if="col.name === 'authorize_userid'">
                  <div v-if="props.row.is_authorize==='1'">
                    {{props.row.authorize_userid}}
                  </div>
                  <div v-else>
                    <q-btn glossy rounded no-caps label="Otorisasi" @click="authorize_lbo(props.row.transid)"
                      class="bg-red-10 text-white" />
                  </div>
                </div>
                <div v-else-if="col.name === 'authorize_date'">
                  {{$INDDateTime(props.row.authorize_date)}}
                </div>
                <div v-else-if="col.name === 'ref_date'">
                  {{ $INDDate(props.row.ref_date) }}
                </div>
                <div v-else-if="col.name === 'standart'">
                  {{ $formatnumber(props.row.standart) }}
                </div>
                <div v-else-if="col.name === 'other_expense'">
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

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top">
      <q-toolbar class="main-toolbar">
        <q-btn dense no-caps flat class="btn-toolbar q-mr-xs" icon="refresh" label="Perbaharui" @click="refresh_data()">
          <q-tooltip content-class="tooltips-app">
            Perbaharui
          </q-tooltip>
        </q-btn>
        <q-space />
        <q-btn v-show="pageback==='operation'" label="Kembali" icon="far fa-arrow-alt-circle-left" flat no-caps rounded
          :to="{ name:
          'work-order', force: true }" />
        <q-btn v-show="pageback==='UJO'" label="Kembali" icon="far fa-arrow-alt-circle-left" flat no-caps rounded :to="{ name:
        'ujo-list', force: true }" />
      </q-toolbar>
    </q-page-sticky>

    <q-dialog v-model="dlglbo" persistent>
      <q-card class="icard" square style="min-width: 500px; max-width: 80vw; max-height: 600px">
        <q-bar class="entry-caption">
          {{ (is_authorize === '0') ? 'Pengajuan LBO' : 'Otorisasi LBO'}}
          <q-space />
          <q-btn icon="close" color="red-5" size="xs" glossy dense rounded v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-sm">
          <div class="row items-start q-col-gutter-xs q-mb-xs">
            <div class="col-xs-6 col-sm-4 col-md-3">
              <q-input v-model="cost.doc_number" dense outlined square label="No. Pengajuan" stack-label readonly />
            </div>
            <div class="col-xs-6 offset-sm-4 col-sm-4 offset-md-6 col-md-3">
              <q-input v-model="cost.ref_date" dense outlined square label="Tanggal" stack-label />
            </div>
          </div>
          <div v-show="(cost.is_primary==='1')" class="row items-start q-col-gutter-xs q-mb-xs">
            <div class="col-xs-6 col-sm-4 col-md-3">
              <q-field square outlined stack-label dense :model-value="cost.dp_customer" label="UJO Konsumen">
                <template v-slot:control>
                  <vue-numeric v-model="cost.dp_customer" class="q-field__input text-right" separator="." />
                </template>
              </q-field>
            </div>
            <div class="col-xs-6 offset-sm-4 col-sm-4 offset-md-6 col-md-3">
              <q-select v-model="cost.dp_method" dense outlined square label="Terima UJO" stack-label options-dense
                :options="['-','DITERIMA SUPIR','TRANSFER']" />
            </div>
          </div>
          <div class="row items-start q-col-gutter-xs q-mb-xs">
            <div class="col-xs-6 col-sm-4 col-md-3">
              <q-field square outlined stack-label dense :model-value="cost.standart" label="Standar UJO">
                <template v-slot:control>
                  <vue-numeric v-model="cost.standart" class="q-field__input text-right" separator="." readonly />
                </template>
              </q-field>
            </div>
            <div class="col-xs-6 offset-sm-4 col-sm-4 offset-md-6 col-md-3">
              <q-field square outlined stack-label dense :model-value="cost.total" label="Total Pengajuan">
                <template v-slot:control>
                  <vue-numeric v-model="cost.total" class="q-field__input text-right" separator="." readonly />
                </template>
              </q-field>
            </div>
          </div>
        </q-card-section>
        <q-table square :rows="costs" :columns="columns_cost" no-data-label="data kosong" dense
          no-results-label="data yang kamu cari tidak ditemukan" row-key="line_no" separator="cell" selection="single"
          v-model:selected="selected_cost" v-model:pagination="pagination_cost" binary-state-sort virtual-scroll
          class="fit my-sticky-dynamic" table-style="min-height:302px; max-height: 370px" hide-pagination
          :virtual-scroll-item-size="48" :virtual-scroll-sticky-size-start="48">
          <template v-slot:loading>
            <q-inner-loading showing>
              <q-spinner-ball size="75px" color="red-10" />
            </q-inner-loading>
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-width row flex-top text-accent q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>{{ message }}</span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-teal-10 text-white">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click="props.selected = !props.selected">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <div class="grid-data">
                  <div v-if="col.name === 'standart_budget'">
                    {{ $formatnumber(props.row.standart_budget) }}
                  </div>
                  <div v-else-if="col.name === 'expense_budget'">
                    <q-field square outlined stack-label dense :model-value="props.row.expense_budget">
                      <template v-slot:control>
                        <vue-numeric v-model="props.row.expense_budget" class="q-field__input text-right" separator="."
                          :disabled="((cost.is_primary==='1') || (is_authorize==='1'))" @input="calculate_cost()" />
                      </template>
                    </q-field>
                  </div>
                  <div v-else-if="col.name === 'line_note'">
                    <q-input v-model="props.row.line_note" dense outlined square />
                  </div>
                  <div v-else>
                    {{ col.value }}
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-card-section class="q-pa-xs entry-caption" align="right" v-show="cost.is_primary==='0'">
          <div v-if="is_authorize==='0'">
            <q-btn icon="save" label="Simpan" :loading="btn_loading" @click="save_lbo()" no-caps glossy />
          </div>
          <div v-else>
            <q-btn icon="save" label="Otorisasi" :loading="btn_loading" @click="save_lbo()" no-caps glossy />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dlgCashierUJO" persistent full-width>
      <q-card class="icard" square>
        <q-bar class="entry-caption">
          Pengeluaran Kasir UJO
          <q-space />
          <q-btn icon="close" color="red-5" size="xs" glossy dense rounded v-close-popup />
        </q-bar>
        <q-table square :rows="cashier_ujos" :columns="columns_cashier" no-data-label="data kosong" dense
          no-results-label="data yang kamu cari tidak ditemukan" row-key="transid" separator="cell" selection="single"
          v-model:selected="selected_cashier" v-model:pagination="pagination_cashier" binary-state-sort virtual-scroll
          class="fit my-sticky-dynamic" table-style="min-height:302px; max-height: 370px" hide-pagination
          :virtual-scroll-item-size="48" :virtual-scroll-sticky-size-start="48">
          <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-width row flex-top text-accent q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>{{ message }}</span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-teal-10 text-white">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click="props.selected = !props.selected">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <div class="grid-data">
                  <div v-if="col.name === 'expense'">
                    {{ $formatnumber(props.row.expense) }}
                  </div>
                  <div v-else-if="col.name === 'adm_fee'">
                    {{ $formatnumber(props.row.adm_fee) }}
                  </div>
                  <div v-else-if="col.name === 'total'">
                    {{ $formatnumber(props.row.total) }}
                  </div>
                  <div v-else-if="col.name === 'voucher'">
                    <q-btn :label="props.row.voucher" glossy dense class="bg-green-10 text-white" rounded
                      @click="show_jurnal(props.row.no_jurnal)" />
                  </div>
                  <div v-else-if="col.name === 'is_canceled'">
                    <q-toggle v-model="props.row.is_canceled" disable true-value="1" false-value="0" dense
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
    </q-dialog>

    <vJournalEntry v-if="dlgJurnal" :show="dlgJurnal" :sysid="jurnal_id" @CloseJurnal="getJurnal" />
  </q-page>
</template>

<script>
import vJournalEntry from 'components/ViewJurnal.vue';
import { defineComponent, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerIos } from "quasar";

export default defineComponent({
  name: "Operation",
  props: { sysid: BigInt},
  components: { vJournalEntry },
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();
    const $route = useRoute();

    const loading = ref(false);
    const edit = ref({});
    const dataevent = ref(false);
    const title = ref("Tambah Data");
    const filter = ref("");
    const lbo=ref([]);
    const pagination = ref({
      sortBy: "ref_date",
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20,
    });
    const selected = ref([]);
    const columns = ref([
      { name: 'doc_number', align: 'center', label: 'No.LBO', field: 'doc_number' },
      { name: 'ref_date', align: 'left', label: 'Tanggal', field: 'ref_date' },
      { name: 'standart', align: 'right', label: 'Standar UJO', field: 'standart' },
      { name: 'other_expense', align: 'right', label: 'Lain2', field: 'other_expense' },
      { name: 'total', align: 'right', label: 'Total', field: 'total' },
      { name: 'dp_customer', align: 'right', label: 'DP Konsumen', field: 'dp_customer' },
      { name: 'cashier', align: 'right', label: 'Pengajuan', field: 'cashier' },
      { name: 'dp_method', align: 'left', label: 'Cara DP', field: 'dp_method' },
      { name: 'voucher', align: 'left', label: 'Voucher', field: 'voucher' },
      { name: 'cash_amount', align: 'right', label: 'Kasir', field: 'cash_amount' },
      { name: 'authorize_userid', align: 'left', label: 'Otorisasi Oleh', field: 'authorize_userid' },
      { name: 'authorize_date', align: 'left', label: 'Tgl.Otorisasi', field: 'authorize_date' }
    ]);

    const btn_loading = ref(false);
    const pagetitle = ref("");
    const api_url = ref({});
    const btns = ref([]);
    const access = ref({});
    const cost =ref([]);
    const costs = ref([]);
    const selected_cost = ref([]);
    const columns_cost = ref([
      { name: 'line_no', align: 'center', label: '#No', field: 'line_no' },
      { name: 'descriptions', align: 'left', label: 'Komponen Biaya', field: 'descriptions' },
      { name: 'standart_budget', align: 'right', label: 'Standar Biaya', field: 'standart_budget' },
      { name: 'expense_budget', align: 'right', label: 'Pengajuan Biaya', field: 'expense_budget' },
      { name: 'line_note', align: 'left', label: 'Catatan', field: 'line_note' },
      { name: 'account_no', align: 'left', label: 'No. Akun', field: 'account_no' }
    ]);
    const pagination_cost = ref({
      sortBy: "line_no",
      descending: true,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0,
    });
    const dlglbo=ref(false);
    const dlgJurnal=ref(false);
    const jurnal_id=ref(-1);
    const is_authorize=ref('0')
    const pageback=ref('');
    const dlgCashierUJO=ref(false)
    const cashier_ujos=ref([])
    const selected_cashier=ref([])
    const columns_cashier=ref([
      { name: 'voucher', align: 'left', label: 'Voucher', field: 'voucher' },
      { name: 'ref_date', align: 'left', label: 'Tanggal', field: 'ref_date' },
      { name: 'expense_no', align: 'left', label: 'LBO', field: 'expense_no' },
      { name: 'pool_code', align: 'left', label: 'Pool', field: 'pool_code' },
      { name: 'expense', align: 'right', label: 'Total', field: 'expense' },
      { name: 'adm_fee', align: 'right', label: 'By.Admin', field: 'adm_fee' },
      { name: 'total', align: 'right', label: 'Total', field: 'total' },
      { name: 'descriptions', align: 'left', label: 'Keterangan', field: 'descriptions' },
      { name: 'project_id', align: 'left', label: 'Proyek', field: 'project_id' },
      { name: 'is_canceled', align: 'center', label: 'Batal', field: 'is_canceled' },
      { name: 'canceled_date', align: 'left', label: 'Tgl.Batal', field: 'canceled_date' },
      { name: 'canceled_by', align: 'left', label: 'Dibatalkan oleh', field: 'canceled_by' }
    ]);
    const pagination_cashier = ref({
      sortBy: "transid",
      descending: false,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0,
    });


    async function add_lbo(sysid=-1) {
      let skrng=new Date();
      dlglbo.value= true;
      cost.value={
        transid:sysid,
        doc_number:'(NEW)',
        ref_date: skrng.toLocaleDateString("en-CA"),
        is_closed:'0',
        fleet_orderid:edit.value.transid,
        work_order_no:edit.value.work_order_no,
        pool_code:edit.value.pool_code,
        other_expense:0,
        dp_customer:0,
        total:0,
        cashier:0,
        dp_method:'-',
        is_primary:'0'        
      }
      let prop = {};
      prop.url = 'operation/work-order/lbo';
      prop.transid = sysid;
      prop.state='new';
      prop.fleetorderid = edit.value.transid
      let respon = await $store.dispatch("master/GET_DATA", prop);
      if (!(typeof respon === "undefined")) {
        costs.value = respon.costs
        dlglbo.value = true;
      }
    }
    async function save_lbo(){
      try {
        let app = {};
        app.cost = cost.value;
        app.variable = costs.value;
        app.is_authorize=is_authorize.value
        app.url = 'operation/work-order/lbo';
        btn_loading.value = true;
        let respon = await $store.dispatch("master/POST_DATA", app);
        if (!(typeof respon === "undefined")) {
          let msg = respon.data;
          if (respon.success) {
            dlglbo.value = false;
            $q.notify({
              color: "positive",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
            refresh_data();
          } else {
            $q.loading.hide();
            $q.notify({
              color: "negative",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
          }
        }
      } finally {
        btn_loading.value = false;
      }
    }

    async function edit_lbo(sysid=-1){
      is_authorize.value='0';
      cost.value = {}
      costs.value = []
      let prop = {};
      prop.url = 'operation/work-order/lbo';
      prop.transid = sysid;
      prop.state = 'update';
      let respon = await $store.dispatch("master/GET_DATA", prop);
      if (!(typeof respon === "undefined")) {
        cost.value = respon.cost
        costs.value = respon.costs
        dlglbo.value = true;
      }
    }

    async function refresh_data() {
      let prop = {};
      prop.url = 'operation/work-order/get2';
      prop.transid = $route.query.sysid;
      let respon = await $store.dispatch("master/GET_DATA", prop);
      if (!(typeof respon === "undefined")) {
        edit.value = respon.data
        lbo.value = respon.cost
      }
    }

    async function printlbo_event (primary = -1) {
      let props = {};
      props.url = 'operation/work-order/lbo/print';
      props.sysid = primary;
      await $store.dispatch("master/GET_DOWNLOAD", props);
    }

    function show_jurnal(sysid=-1) {
      if (!(sysid===-1)) {
        dlgJurnal.value=true;
        jurnal_id.value=sysid
      }
    }
    async function show_cashierUJO(sysid=-1) {
      dlgCashierUJO.value=true
      let prop = {};
      prop.url = 'finance/cash_bank/cashier_ujo';
      prop.sysid = sysid;
      let respon = await $store.dispatch("master/GET_DATA", prop);
      if (!(typeof respon === "undefined")) {
        cashier_ujos.value = respon
        console.info(JSON.stringify(cashier_ujos.value))
      }
    }

    function getJurnal (closed, data) {
      dlgJurnal.value = closed
    }

    function calculate_cost () {
      let standart = 0
      let expense = 0
      costs.value.forEach(el => {
        standart = standart + el.standart_budget
        expense = expense + el.expense_budget
      })
      cost.value.standart= standart
      cost.value.total = expense
    }
    async function authorize_lbo (sysid = -1) {
      is_authorize.value = '1';
      cost.value = {}
      costs.value = []
      let prop = {};
      prop.url = 'operation/work-order/lbo';
      prop.transid = sysid;
      prop.state = 'update';
      let respon = await $store.dispatch("master/GET_DATA", prop);
      if (!(typeof respon === "undefined")) {
        cost.value = respon.cost
        costs.value = respon.costs
        dlglbo.value = true;
      }
      console.info(is_authorize.value)
    }

    onMounted(async () => {
      pageback.value=$route.query.pageback;
      refresh_data()
    });

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
      cost,
      lbo,
      costs,
      selected_cost,
      columns_cost,      
      pagination_cost,
      dlglbo,
      add_lbo,
      edit_lbo,
      save_lbo,
      refresh_data,
      printlbo_event,
      show_jurnal,
      dlgJurnal,
      jurnal_id,
      getJurnal,
      calculate_cost,
      authorize_lbo,
      is_authorize,
      pageback,
      show_cashierUJO,
      dlgCashierUJO,
      cashier_ujos,
      selected_cashier,
      columns_cashier,
      pagination_cashier,
    };
  },
});
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