<template>
  <q-page class="page-app">
    <q-card square class="icard">
      <q-bar class="entry-caption">
        <span><strong>{{ pagetitle }}</strong></span>
        <q-space />
        <q-input v-model="filter" dense outline debounce="300" label-color="white" borderless placeholder="Pencarian"
          input-class="text-white">
          <template v-slot:append>
            <q-icon v-if="filter === ''" name="search" color="white" size="sm" />
            <q-icon v-else name="clear" class="cursor-pointer" color="white" size="sm" @click="filter = ''" />
          </template>
        </q-input>
      </q-bar>
      <q-table square :rows="data" :columns="columns" no-data-label="data kosong" :dense="$q.screen.md"
        no-results-label="data yang kamu cari tidak ditemukan" row-key="cash_id" :filter="filter" separator="cell"
        selection="single" v-model:selected="selected" v-model:pagination="pagination" binary-state-sort
        @request="onRequest" :loading="loading">
        <q-inner-loading showing>
          <q-spinner-ball size="75px" color="red-10" />
        </q-inner-loading>
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
                    @click="runMethod(btn.onclick, props.row.cash_id)">
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'is_headoffice'">
                  <q-toggle v-model="props.row.is_headoffice" dense true-value="1" false-value="0" disable />
                </div>
                <div v-else-if="col.name === 'is_operasional'">
                  <q-toggle v-model="props.row.is_operasional" dense true-value="1" false-value="0" disable />
                </div>
                <div v-else-if="col.name === 'is_usedinvoice'">
                  <q-toggle v-model="props.row.is_usedinvoice" dense true-value="1" false-value="0" disable />
                </div>
                <div v-else-if="col.name === 'is_bank'">
                  <q-toggle v-model="props.row.is_bank" dense true-value="1" false-value="0" disable />
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle v-model="props.row.is_active" dense true-value="1" false-value="0" disable />
                </div>
                <div v-else-if="col.name === 'update_timestamp'">
                  {{ $INDDateTime(props.row.update_timestamp) }}
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
        <q-btn v-for="(btn, index) in btns" :key="index" dense no-caps flat v-show="btn.is_allowed"
          class="btn-toolbar q-mr-xs" :icon="btn.icon" :label="btn.caption" @click="runMethod(btn.onclick)">
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-page-sticky>

    <!-- Dialog Data Location-->
    <q-dialog v-model="dataevent" persistent transition-show="flip-down" transition-hide="flip-up">
      <q-card class="icard" style="width: 700px" square>
        <q-bar class="entry-caption">
          {{ title }}
          <q-space />
          <q-btn v-close-popup dense glossy rounded icon="close" color="red-5" size="xs">
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-gutter-sm">
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-8">
              <q-input v-model="edit.descriptions" dense outlined square label="Nama Kas/Bank" stack-label />
            </div>
            <div class="col-4">
              <q-toggle v-model="edit.is_active" label="Aktif" true-value="1" false-value="0" dense />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-input v-model="edit.bank_account" dense outlined square label="Nama Bank" stack-label />
            </div>
            <div class="col-4">
              <q-input v-model="edit.account_name" dense outlined square label="Nama rekening" stack-label />
            </div>
            <div class="col-4">
              <q-input v-model="edit.account_number" dense outlined square label="Nomor rekening" stack-label />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="edit.no_account" dense outlined square label="Kode Akun" stack-label>
                <template v-slot:append>
                  <q-icon name="search" size="sm" class="append-icon" @click="account()" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-select v-model="edit.pool_id" :options="pools" outlined dense options-dense label="Pool kendaraan"
                option-value="id" option-label="pool_name" emit-value map-options fill-input stack-label square />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-toggle v-model="edit.is_headoffice" label="Kas/Bank khsusu kantor pusat" true-value="1" false-value="0"
                dense />
            </div>
            <div class="col-6">
              <q-toggle v-model="edit.is_bank" label="Rekening Bank" true-value="1" false-value="0" dense />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-toggle v-model="edit.is_operasional" label="Rekening Operasional" true-value="1" false-value="0"
                dense />
            </div>
            <div class="col-6">
              <q-toggle v-model="edit.is_usedinvoice" label="Rekening untuk penagihann (Invoice)" true-value="1"
                false-value="0" dense />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-select v-model="edit.voucher_in" :options="vouchers" option-label="voucher_name"
                option-value="voucher_code" emit-value options-dense dense outlined square label="Voucher Masuk"
                stack-label clearable />
            </div>
            <div class="col-4">
              <q-select v-model="edit.voucher_out" :options="vouchers" option-label="voucher_name"
                option-value="voucher_code" emit-value options-dense dense outlined square label="Voucher Keluar"
                stack-label clearable />
            </div>
            <div class="col-4">
              <q-select v-model="edit.voucher_ge" :options="vouchers" option-label="voucher_name"
                option-value="voucher_code" emit-value options-dense dense outlined square label="Voucher GE"
                stack-label clearable />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="dialog-action q-pa-sm" align="right">
          <q-btn class="q-mr-sm" icon="save" label="Simpan" flat no-caps @click="save_data()" :loading="loading">
            <template v-slot:loading>
              <q-spinner class="on-left" />
              Proses
            </template>
          </q-btn>
          <q-btn icon="undo" label="Batal" no-caps flat v-close-popup />
        </q-card-section>
      </q-card>
    </q-dialog>

    <coa v-if="dlgAccount" :show="dlgAccount" @CloseCOA="getCOA" />

  </q-page>
</template>

<script>
import coa from 'components/COA.vue';
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerIos } from "quasar";

export default defineComponent({
  name: "CashBank",
  components:{coa},
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();

    const loading = ref(false);
    const edit = ref({});
    const dataevent = ref(false);
    const title = ref("Tambah Data");
    const filter = ref("");

    const pagination = ref({
      sortBy: "cash_id",
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20,
    });
    const data = ref([]);
    const selected = ref([]);
    const columns = ref([]);

    const btn_loading = ref(false);
    const pagetitle = ref("");
    const api_url = ref({});
    const btns = ref([]);
    const access = ref({});

    const dlgAccount = ref(false);
    const pools=ref([]);
    const vouchers=ref([]);

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
          url: api_url.value.retrieve,
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

    async function add_event() {
      loading.value = false;
      dataevent.value = true;
      title.value = "Tambah Data"
      edit.value = {
        cash_id: -1,
        descriptions: "",
        bank_account:"",
        account_name: "",
        account_number:"",
        no_account:null,
        voucher_in:"",
        voucher_out:"",
        voucher_ge: "",
        pool_id:'',
        is_headoffice:'0',
        is_operasional: "0",
        is_bank: "0",
        is_usedinvoice: "0",
        is_active:"1"
      };
    }

    async function edit_event(primary =-1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0];
          primary = item.cash_id;
        }
        $q.loading.show({ delay: 100 });
        try {
          loading.value = false;
          let props = {};
          props.url = api_url.value.edit;
          props.cash_id = primary;
          let respon = await $store.dispatch("master/GET_DATA", props);
          if (!(typeof respon === "undefined")) {
            title.value = "Ubah Data"
            dataevent.value = true;
            edit.value = respon;
          }
        } finally {
          $q.loading.hide();
        }
      }
    }

    async function delete_event (primary=-1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0];
          primary = item.cash_id;
        }
        $q.dialog({
          title: "Konfirmasi",
          message: "Apakah data ini akan di hapus?",
          cancel: true,
          persistent: true,
        }).onOk(() => {
          let json = {};
          json.cash_id = primary;
          json.url = api_url.value.delete;
          $store.dispatch("master/DELETE_DATA", json).then((respon) => {
            if (!(typeof respon === "undefined")) {
              let msg = respon.data;
              if (respon.success) {
                dataevent.value = false;
                $q.notify({
                  color: "positive",
                  textcolor: "white",
                  message: msg,
                  position: "top",
                  timeout: 2000,
                });
                loaddata();
              } else {
                $q.notify({
                  color: "negative",
                  textcolor: "white",
                  message: msg,
                  position: "top",
                  timeout: 2000,
                });
              }
            }
          });
        });
      }
    }

    async function save_data() {
      let sysid = -1;
      try {
        let app = {};
        app.data = edit.value;
        app.url = api_url.value.save;
        loading.value = true;
        let respon = await $store.dispatch("master/POST_DATA", app);
        if (!(typeof respon === "undefined")) {
          let msg = respon.data;
          if (respon.success) {
            dataevent.value = false;
            $q.notify({
              color: "positive",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
            loaddata();
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
        loading.value = false;
      }
    }

    async function loaddata() {
      selected.value = [];
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    }

    function runMethod(method, primary = -1) {
      this[method](primary);
    }

    function account(){
      dlgAccount.value=true;
    }

    function getCOA (closed, data) {
      dlgAccount.value = closed;
      if (typeof data.account_no !== "undefined") {
          edit.value.no_account=data.account_no
      }
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
      loaddata();
      let props={}
      props.url = "master/operational/pool/list";
      $store.dispatch("master/GET_DATA", props).then((response) => {
        pools.value = response;
      });
      props.url = "master/accounting/voucher/list";
      $store.dispatch("master/GET_DATA", props).then((response) => {
        vouchers.value = response;
      });

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
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data,
      btn_loading,
      dlgAccount,
      getCOA,
      account,
      pools,
      vouchers
    };
  },
});
</script>
