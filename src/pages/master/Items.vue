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
        no-results-label="data yang kamu cari tidak ditemukan" row-key="item_code" :filter="filter" separator="cell"
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
                    @click="runMethod(btn.onclick, props.row.item_code)">
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'item_name'">
                  <span :class="
                    props.row.is_active === '0'
                      ? 'q-pa-xs bg-red-10 text-white'
                      : 'q-pa-xs'
                  ">{{ props.row.item_name }}
                  </span>
                </div>
                <div v-else-if="col.name === 'update_timestamp'">
                  {{ $INDDateTime(props.row.update_timestamp) }}
                </div>
                <div v-else-if="col.name === 'purchase_price'">
                  {{ $formatnumber(props.row.purchase_price) }}
                </div>
                <div v-else-if="col.name === 'purchase_discount'">
                  {{ $formatnumber(props.row.purchase_discount) }}
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle v-model="props.row.is_active" true-value="1" false-value="0" dense disable />
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
          <div class="row items-start q-col-gutter-sm">
            <div class="col-4">
              <q-input v-model="edit.item_code" dense outlined square label="Kode" stack-label />
            </div>
            <div class="col-8">
              <q-input v-model="edit.part_number" dense outlined square label="No.Part" stack-label />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-12">
              <q-input v-model="edit.descriptions" dense outlined square label="Nama Item" stack-label />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-5">
              <q-input v-model="edit.mou_purchase" dense outlined square label="Satuan Beli" stack-label />
            </div>
            <div class="col-2">
              <q-field square outlined stack-label dense :model-value="edit.convertion" label="Konversi">
                <template v-slot:control>
                  <vue-numeric v-model="edit.convertion" class="q-field__input text-right" separator="."
                    :precision="0" />
                </template>
              </q-field>
            </div>
            <div class="col-5">
              <q-input v-model="edit.mou_warehouse" dense outlined square label="Satuan Simpan" stack-label />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-12">
              <q-select v-model="edit.item_group" :options="itemgroupsopt" outlined dense options-dense
                label="Item Group" option-value="item_group" option-label="item_group_name" emit-value map-options
                fill-input stack-label square />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-6">
              <q-input v-model="edit.account_no" dense outlined square label="Akun Inventory" stack-label>
                <template v-slot:append>
                  <q-icon name="search" size="sm" class="append-icon" @click="account('account_no')" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input v-model="edit.expense_account" dense outlined square label="Akun Biaya" stack-label>
                <template v-slot:append>
                  <q-icon name="search" size="sm" class="append-icon" @click="account('expense_account')" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-6">
              <q-input v-model="edit.cogs_account" dense outlined square label="Akun COGS" stack-label>
                <template v-slot:append>
                  <q-icon name="search" size="sm" class="append-icon" @click="account('cogs_account')" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input v-model="edit.variant_account" dense outlined square label="Akun varian inventory" stack-label>
                <template v-slot:append>
                  <q-icon name="search" size="sm" class="append-icon" @click="account('variant_account')" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row items-start">
            <q-toggle v-model="edit.is_active" true-value="1" false-value="0" dense label="Aktif" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="dialog-action q-pa-sm" align="left">
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
import coa from 'components/COA.vue'
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerIos } from "quasar";

export default defineComponent({
  name: "Item",
  components :{coa},
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
      sortBy: "item_code",
      descending: false,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 15,
    });
    const data = ref([]);
    const selected = ref([]);
    const columns = ref([]);

    const pagetitle = ref("");
    const api_url = ref({});
    const btns = ref([]);
    const access = ref({});
    const itemgroupsopt = ref([]);
    const dlgAccount=ref(false);
    const object_account=ref("");

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
      edit.value = {
        item_code: "",
        part_number: "",
        descriptions: "",
        mou_warehouse: "PCS",
        mou_purchase: "PCS",
        convertion:1,
        item_group:null,
        is_sales:'1',
        is_purchase:'1',
        is_stock_record:'1',
        is_hold:'0',
        notes:'',
        account_no:'',
        cogs_account:'',
        expense_account:'',
        variant_account:'',
        is_active: "1",
      };
      let props = {};
      props.url = "master/inventory/item-group/list";
      $store.dispatch("master/GET_DATA", props).then((response) => {
        itemgroupsopt.value = response;
        console.info(JSON.stringify(response));
      });
    }

    async function edit_event(item_code ="") {
      if (selected.value.length > 0 || !(item_code === "")) {
        if (item_code === "") {
          let item = selected.value[0];
          item_code = item.item_code;
        }
        $q.loading.show({ delay: 100 });
        try {
          loading.value = false;
          let props = {};
          props.url = api_url.value.edit;
          props.item_code = item_code;
          let respon = await $store.dispatch("master/GET_DATA", props);
          if (!(typeof respon === "undefined")) {
            dataevent.value = true;
            edit.value = respon;
          }
          props = {};
          props.url = "master/inventory/item-group/list";
          $store.dispatch("master/GET_DATA", props).then((response) => {
            itemgroupsopt.value = response; 
          });
        } finally {
          $q.loading.hide();
        }
      }
    }

    async function delete_event(item_code = "") {
      if (selected.value.length > 0 || !(item_code === "")) {
        if (item_code === "") {
          let item = selected.value[0];
          item_code = item.item_code;
        }
        $q.dialog({
          title: "Konfirmasi",
          message: "Apakah data ini akan di hapus?",
          cancel: true,
          persistent: true,
        }).onOk(() => {
          let json = {};
          json.item_code = item_code;
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
                  timeout: 200,
                });
                loaddata();
              } else {
                $q.dialog({
                  title: "Peringatan",
                  message: msg,
                  persistent: true,
                });
              }
            }
          });
        });
      }
    }

    async function save_data() {
      let item_code = -1;
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
              timeout: 200,
            });
            loaddata();
          } else {
            $q.loading.hide();
            $q.notify({
              color: "red-10",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 200,
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

    function runMethod(method, item_code = "") {
      this[method](item_code);
    }

    function account(label=''){
      dlgAccount.value=true;
      object_account.value=label
    }

    function getCOA (closed, data) {
      dlgAccount.value = closed;
      if (typeof data.account_no !== "undefined") {
        if (object_account.value === 'account_no') {
          edit.value.account_no = data.account_no
        } else if (object_account.value === 'expense_account') {
          edit.value.expense_account = data.account_no
        } else if (object_account.value === 'cogs_account') {
          edit.value.cogs_account = data.account_no
        } else if (object_account.value === 'variant_account') {
          edit.value.variant_account = data.account_no
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
      itemgroupsopt,
      dlgAccount,
      object_account,
      account,
      getCOA,
      runMethod,
      onRequest,
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data,
    };
  },
});
</script>
