<template>
  <q-page class="page-app">
    <q-card square class="icard q-mb-sm">
      <q-bar class="entry-caption">
        <span><strong>Periode</strong></span>
        <q-space />
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-center q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-select v-model="cash_id" :options="cashbanks_all" outlined dense options-dense label="Kas/Bank"
              option-value="cash_id" option-label="descriptions" emit-value map-options fill-input stack-label square />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input v-model="date1" dense outlined square label="Tanggal Mulai" type="date" stack-label />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input v-model="date2" dense outlined square label="s.d Tanggal" type="date" stack-label />
          </div>
        </div>
        <div class="row items-center">
          <div class="col-12">
            <q-toggle v-model="is_void" dense true-value="1" false-value="0"
              label="Tampilkan transaksi yang sudah divoid" />
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card square class="icard q-mb-sm">
      <q-bar class="entry-caption">
        <span><strong>Mutasi</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-center q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-3">
            <q-field square outlined stack-label dense :model-value="balance.begining" label="Saldo Awal">
              <template v-slot:control>
                <vue-numeric v-model="balance.begining" class="q-field__input text-right" separator="." :precision="2"
                  style="font-weight:bold;font-size:12px" readonly />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3">
            <q-field square outlined stack-label dense :model-value="balance.debit" label="Mutasi Debit">
              <template v-slot:control>
                <vue-numeric v-model="balance.debit" class="q-field__input text-right" separator="." :precision="2"
                  style="font-weight:bold;font-size:12px;color:blue" readonly />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3">
            <q-field square outlined stack-label dense :model-value="balance.credit" label="Mutasi Kredit">
              <template v-slot:control>
                <vue-numeric v-model="balance.credit" class="q-field__input text-right" separator="." :precision="2"
                  style="font-weight:bold;font-size:12px;color:red" readonly />
              </template>
            </q-field>
          </div>
          <div class="col-xs-6 col-sm-3">
            <q-field square outlined stack-label dense :model-value="balance.last" label="Saldo Akhir">
              <template v-slot:control>
                <vue-numeric v-model="balance.last" class="q-field__input text-right" separator="." :precision="2"
                  style="font-weight:bold;font-size:12px" readonly />
              </template>
            </q-field>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card square class="icard">
      <q-bar class="entry-caption">
        <span><strong>{{ pagetitle }}</strong></span>
        <q-space />
        <q-input v-model="filter" dense outline debounce="300" label-color="white" borderless placeholder="Pencarian"
          input-class="text-white">
          <template v-slot:append>
            <q-icon v-if="filter === ''" name="search" color="white" size="sm" />
            <q-icon v-else name="clear" class="cursor-mouer" color="white" size="sm" @click="filter = ''" />
          </template>
        </q-input>
      </q-bar>
      <q-table square :rows="data" :columns="columns" no-data-label="data kosong" :dense="$q.screen.md"
        no-results-label="data yang kamu cari tidak ditemukan" row-key="transid" :filter="filter" separator="cell"
        selection="single" v-model:selected="selected" v-model:pagination="pagination" binary-state-sort
        @request="onRequest" :loading="loading" virtual-scroll>
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
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" @click="props.selected = !props.selected">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div class="grid-data">
                <div v-if="col.name === 'action'">
                  <q-icon v-for="(btn, index) in btns" v-show="btn.is_allowed && btn.is_show" :key="index" no-caps flat
                    class="q-mr-sm" :name="btn.icon" size="xs" color="green-10"
                    @click="runMethod(btn.onclick, props.row.transid)">
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'doc_number'">
                  <q-btn :label="props.row.doc_number" no-caps flat class="text-blue-6"
                    @click="edit_cashbank(props.row.linkdocument_id,props.row.document_type)" />
                </div>
                <div v-else-if="col.name === 'debet'">
                  {{ $formatnumber(props.row.debet) }}
                </div>
                <div v-else-if="col.name === 'credit'">
                  {{ $formatnumber(props.row.credit) }}
                </div>
                <div v-else-if="col.name === 'ref_date'">
                  {{ $INDDate(props.row.ref_date) }}
                </div>
                <div v-else-if="col.name === 'linkdoc_number'">
                  <q-btn icon="print" no-caps glossy dense rounded class="bg-green-10 text-white q-mr-xs"
                    @click="print_gl(props.row.no_jurnal)" />
                  <q-btn :label="props.row.linkdoc_number" no-caps flat class="text-green-10 "
                    @click="show_jurnal(props.row.no_jurnal)" />
                </div>
                <div v-else-if="col.name === 'is_void'">
                  <q-toggle v-model="props.row.is_void" true-value="1" false-value="0" dense disable />
                </div>
                <div v-else-if="col.name === 'is_posted'">
                  <q-toggle v-model="props.row.is_posted" true-value="1" false-value="0" dense disable />
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
    </q-card>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top">
      <q-toolbar class="main-toolbar">
        <q-btn v-for="(btn, index) in btns" :key="index" dense no-caps flat v-show="(btn.is_allowed && !stateform)"
          class="btn-toolbar q-mr-xs" :icon="btn.icon" :label="btn.caption" @click="runMethod(btn.onclick)">
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
        <q-btn dense no-caps flat v-show="stateform" class="btn-toolbar q-mr-xs" icon="save" label="Simpan"
          @click="save_data()">
          <q-tooltip content-class="tooltips-app">
            Simpan data
          </q-tooltip>
        </q-btn>
        <q-btn dense no-caps flat v-show="stateform" class="btn-toolbar q-mr-xs" icon="undo" label="Batal"
          @click="stateform=false">
          <q-tooltip content-class="tooltips-app">
            Batal
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-page-sticky>

    <vJournalEntry v-if="dlgJurnal" :show="dlgJurnal" :sysid="jurnal_id" @CloseJurnal="getJurnal" />

  </q-page>
</template>

<script>
import vJournalEntry from 'components/ViewJurnal.vue';
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerIos, QSpinnerPie } from "quasar";

export default defineComponent({
  name: "CashBank",
  components: { vJournalEntry },
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();

    const loading = ref(false);
    const edit = ref({});
    const dataevent = ref(false);
    const title = ref("Tambah Data");
    const filter = ref("");
    const stateform=ref(false);

    const pagination = ref({
      sortBy: "ref_date",
      descending: false,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 50,
    });
    const data = ref([]);
    const selected = ref([]);
    const columns = ref([]);

    const btn_loading = ref(false);
    const pagetitle = ref("");
    const api_url = ref({});
    const btns = ref([]);
    const access = ref({});

    const state=ref("0");
    const date1=ref(null)
    const date2=ref(null)
    const cashbanks_all=ref([]);
    const cashbanks=ref([]);
    const cash_id=ref(null);
    const dlgJurnal=ref(false);
    const jurnal_id=ref(-1);
    const is_void=ref('1');
    const balance=ref({});

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination;
      let filter = props.filter;

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage;
      loading.value = true;
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          date1:date1.value,
          date2: date2.value,
          cash_id: cash_id.value,
          is_void:is_void.value,
          url: api_url.value.retrieve
        };
        let respon = await $store.dispatch("master/GET_DATA", props);
        data.value = respon.data;
        pagination.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending,
        };
      } catch (error) {
      } finally {
        loading.value = false;
      }
    }

    async function loaddata() {
        let props = {};
        props.url = "finance/cash-bank/balance"
        props.cash_id=cash_id.value,
        props.date1=date1.value
        props.date2 = date2.value
        $store.dispatch("master/GET_DATA", props).then((response) => {
          balance.value = response;
        });
        selected.value = [];
        onRequest({
          pagination: pagination.value,
          filter: filter.value,
        });
    }

    function runMethod(method, primary = -1) {
      this[method](primary);
    }

    function ujo_event(sysid=-1) {
      $router.push({ path: '/finance/cash-bank/ujo', query: { sysid: -1,state:'new' } });
    }
    function edit_cashbank(transid=-1,document_type=''){
      if (document_type==='UJO'){
        $router.push({ path: '/finance/cash-bank/ujo', query: { sysid: transid, state: 'update' } });
      }
    }

    function show_jurnal (sysid) {
      dlgJurnal.value = true;
      jurnal_id.value = sysid
    }

    function getJurnal (closed, data) {
      dlgJurnal.value = closed
    }
    async function print_event (primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        let row={}
        if (primary === -1) {
          row = selected.value[0];
        } else {
          data.value.forEach(el=>{
            if (primary===el.transid) {
              row=el
            }
          })
        }
        let props = {};
        if (row.document_type==='UJO') {
          props.url = 'finance/cash_bank/cashier_ujo/print';
          props.sysid = row.linkdocument_id;
        }
        await $store.dispatch("master/GET_DOWNLOAD", props);
      }
    }

    async function print_gl (sysid) {
      let prop = {};
      prop.url = "acc/journal/print";
      prop.sysid = sysid;
      await $store.dispatch("master/GET_DOWNLOAD", prop);
    }

    onMounted(async () => {
      let property = await $store.dispatch(
        "home/GET_PAGEPROPERTY",
        $router.currentRoute.value.fullPath
      );
      columns.value = property.columns;
      pagetitle.value = property.title;
      api_url.value = property.url;
      btns.value = property.btn;
      access.value = property.access;
      let skrng = new Date();
      date1.value= skrng.toLocaleDateString("en-CA");
      date2.value= skrng.toLocaleDateString("en-CA");
      let props = {};
      props.url = "master/finance/cash-bank/list/user";
      $store.dispatch("master/GET_DATA", props).then((response) => {
        cashbanks_all.value = response;
      });
      loaddata()
    });

    return {
      loading,
      data,
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
      runMethod,
      onRequest,
      loaddata,
      btn_loading,
      stateform,
      date1,
      date2,
      cashbanks_all,
      cashbanks,
      cash_id,
      ujo_event,
      dlgJurnal,
      show_jurnal,
      getJurnal,
      jurnal_id,
      edit_cashbank,
      print_event,
      print_gl,
      is_void,
      balance
    };
  },
});
</script>
