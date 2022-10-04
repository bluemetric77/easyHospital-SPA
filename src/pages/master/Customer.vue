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
            <q-icon v-else name="clear" class="cursor-mouer" color="white" size="sm" @click="filter = ''" />
          </template>
        </q-input>
      </q-bar>
      <q-table square :rows="data" :columns="columns" no-data-label="data kosong" :dense="$q.screen.md"
        no-results-label="data yang kamu cari tidak ditemukan" row-key="partner_id" :filter="filter" separator="cell"
        selection="single" v-model:selected="selected" v-model:pagination="pagination" binary-state-sort
        @request="onRequest" :loading="loading">
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
                    @click="runMethod(btn.onclick, props.row.partner_id)">
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'partner_name'">
                  <span v-if="props.row.is_active==='1'">{{props.row.partner_name}}</span>
                  <span class="text-red-10" v-else>{{props.row.partner_name}}</span>
                </div>
                <div v-else-if="col.name === 'partner_address'">
                  <q-input v-model="props.row.partner_address" borderless autogrow type="textarea"
                    input-style="width:300px" dense readonly />
                </div>
                <div v-else-if="col.name === 'invoice_address'">
                  <q-input v-model="props.row.invoice_address" borderless autogrow type="textarea"
                    input-style="width:300px" dense readonly />
                </div>
                <div v-else-if="col.name === 'maximum_credit'">
                  {{ $formatnumber(props.row.maximum_credit) }}
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle v-model="props.row.is_active" true-value="1" false-value="0" dense disable />
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
            <div class="col-3">
              <q-input v-model="edit.partner_id" dense outlined square label="Kode" stack-label />
            </div>
            <div class="col-7">
              <q-input v-model="edit.partner_name" dense outlined square label="Nama Konsumen" stack-label />
            </div>
            <div class="col-2">
              <q-checkbox v-model="edit.is_active" dense true-value="1" false-value="0" label="Aktif" stack-label />
            </div>
          </div>
        </q-card-section>
        <q-tabs v-model="tab" class="text-teal" dense inline-label>
          <q-tab name="general" icon="fas fa-address-card" label="Umum" />
          <q-tab name="configuration" icon="fas fa-cog" label="Seting" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
          <q-tab-panel name="general">
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.partner_address" dense outlined square label="Alamat" stack-label type="textarea"
                  input-style="height:50px" />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-6">
                <q-input v-model="edit.phone_number" dense outlined square label="Telepon" stack-label />
              </div>
              <div class="col-6">
                <q-input v-model="edit.fax_number" dense outlined square label="Fax" stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.email" dense outlined square label="Email" stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-6">
                <q-input v-model="edit.contact_person" dense outlined square label="Orang yang dapat dihubungi"
                  stack-label />
              </div>
              <div class="col-6">
                <q-input v-model="edit.contact_phone" dense outlined square label="No Telepon" stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.invoice_address" dense outlined square label="Alamat Penagihan" stack-label
                  type="textarea" input-style="height:50px" />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="edit.invoice_handler" dense outlined square label="U/P Invoice" stack-label />
              </div>
              <div class="col-6">
                <q-select v-model="edit.cash_id" :options="itemgroupsopt" outlined dense options-dense
                  label="Pembayaran via" option-value="item_group" option-label="item_group_name" emit-value map-options
                  fill-input stack-label square />
              </div>
            </div>

          </q-tab-panel>

          <q-tab-panel name="configuration">
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.tax_number" dense outlined square label="N.P.W.P" stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-field square outlined stack-label dense :model-value="edit.fee_of_storage"
                  label="Tarif Inap perhari">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.fee_of_storage" class="q-field__input text-right" separator="."
                      :precision="0" />
                  </template>
                </q-field>
              </div>
              <div class="col-4">
                <q-field square outlined stack-label dense :model-value="edit.fee_of_storage"
                  label="% Tarif Inap perhari">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.fee_of_storage" class="q-field__input text-right" separator="."
                      :precision="0" />
                  </template>
                </q-field>
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-field square outlined stack-label dense :model-value="edit.fee_of_tonase" label="Tarif per Tonase">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.fee_of_tonase" class="q-field__input text-right" separator="."
                      :precision="0" />
                  </template>
                </q-field>
              </div>
              <div class="col-4">
                <q-field square outlined stack-label dense :model-value="edit.minimum_tonase" label="Minimum Tonase">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.minimum_tonase" class="q-field__input text-right" separator="."
                      :precision="0" />
                  </template>
                </q-field>
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-input v-model="edit.ar_account" dense outlined square label="Akun Piutang" stack-label>
                  <template v-slot:append>
                    <q-icon name="search" size="sm" class="append-icon" @click="account('ar_account')" />
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-input v-model="edit.ap_account" dense outlined square label="Akun Hutang" stack-label>
                  <template v-slot:append>
                    <q-icon name="search" size="sm" class="append-icon" @click="account('ap_account')" />
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-input v-model="edit.dp_account" dense outlined square label="Akun DP" stack-label>
                  <template v-slot:append>
                    <q-icon name="search" size="sm" class="append-icon" @click="account('dp_account')" />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-field square outlined stack-label dense :model-value="edit.maximum_credit"
                  label="Tarif per Tonase (/Kg)">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.maximum_credit" class="q-field__input text-right" separator="."
                      :precision="0" />
                  </template>
                </q-field>
              </div>
              <div class="col-4">
                <q-field square outlined stack-label dense :model-value="edit.due_interval"
                  label="Interval Jatuh Tempo (x hari)">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.due_interval" class="q-field__input text-right" separator="."
                      :precision="0" />
                  </template>
                </q-field>
              </div>
              <div class="col-4">
                <q-field square outlined stack-label dense :model-value="edit.maximum_credit"
                  label="Maks. Kredit (0<=tanpa batas)">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.maximum_credit" class="q-field__input text-right" separator="."
                      :precision="0" />
                  </template>
                </q-field>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
        <q-separator />
        <q-card-section class="dialog-action q-pa-sm" position="bottom" align="right">
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
  name: "ItemGroup",
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
    const tab=ref("general");

    const pagination = ref({
      sortBy: "partner_id",
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
    const object_account=ref('');
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
          enum:'C',
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
      edit.value = {
        partner_id: "",
        partner_type:"C",
        partner_name: "",
        partner_address: "",
        invoice_address: "",
        invoice_handler: "",
        phone_number: "",
        fax_number: "",
        email: "",
        cash_id: null,
        contact_person: "",
        contact_phone: "",
        tax_number: "",
        fee_of_storage: 0,
        percent_of_storage: 0,
        minimum_tonase: 0,
        fee_of_tonase: 0,
        maximum_credit:0,
        due_interval:30,
        is_active:'1',
        ar_account:null,
        ap_account:null,
        dp_account:null,
      };
    }

    async function edit_event(primary ='') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          let item = selected.value[0];
          primary = item.partner_id;
        }
        $q.loading.show({ delay: 100 });
        try {
          loading.value = false;
          let props = {};
          props.url = api_url.value.edit;
          props.partner_id = primary;
          let respon = await $store.dispatch("master/GET_DATA", props);
          if (!(typeof respon === "undefined")) {
            dataevent.value = true;
            edit.value = respon;
          }
        } finally {
          $q.loading.hide();
        }
      }
    }

    async function delete_event(primary='') {
      if (selected.value.length > 0 || !(primary==='')) {
        if (primary === '') {
          let item = selected.value[0];
          primary = item.partner_id;
        }
        $q.dialog({
          title: "Konfirmasi",
          message: "Apakah data ini akan di hapus?",
          cancel: true,
          persistent: true,
        }).onOk(() => {
          let json = {};
          json.partner_id = primary;
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

    function runMethod(method, primary = '') {
      this[method](primary);
    }

    function account(label=''){
      dlgAccount.value=true;
      object_account.value=label;
    }

    function getCOA (closed, data) {
      dlgAccount.value = closed;
      if (typeof data.account_no !== "undefined") {
        if (object_account.value==='ar_account') {
          edit.value.ar_account =data.account_no
        } else if (object_account.value === 'ap_account') {
          edit.value.ap_account = data.account_no
        } else if (object_account.value === 'dp_account') {
          edit.value.dp_account = data.account_no
        }
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
      tab,
      runMethod,
      onRequest,
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data,
      btn_loading,
      dlgAccount,
      object_account,
      getCOA,
      account
    };
  },
});
</script>
