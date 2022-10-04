<template>
  <q-page class="page-app">
    <!-- Dialog Data Location-->
    <q-card class="icard" square>
      <q-bar class="entry-caption">
        Droping UJO/Bank - {{(stateform==='new') ?' Dokumen Baru' : edit.doc_number}}
      </q-bar>
      <q-card-section class="q-gutter-sm">
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-6 col-md-2">
            <q-input v-model="edit.ref_date" dense outlined square label="Tanggal" stack-label type="date" />
          </div>
        </div> 
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-select v-model="edit.cashbank_source" :options="cashbanks_source" outlined dense options-dense label="Kas/Bank (Sumber/Asal)"
              option-value="cash_id" option-label="descriptions" emit-value map-options fill-input stack-label square
              @update:model-value="change_payment()" />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input v-model="edit.trans_code" dense outlined square label="Voucher" stack-label readonly />
          </div>
          <div class="col-xs-6 col-sm-3  col-md-2">
            <q-input v-model="edit.trans_series" dense outlined square label="No.Seri" stack-label readonly />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-select v-model="edit.cashbank_destination" :options="cashbanks_destination" outlined dense options-dense label="Kas/Bank (Tujuan)"
              option-value="cash_id" option-label="descriptions" emit-value map-options fill-input stack-label square/>
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-input v-model="edit.descriptions" dense outlined square label="Keterangan" stack-label />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-field square outlined stack-label dense :model-value="edit.amount">
              <template v-slot:control>
                <vue-numeric v-model="edit.amount" class="q-field__input text-right" separator="."/>
              </template>
            </q-field>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top">
      <q-toolbar class="main-toolbar">
        <q-btn dense no-caps flat class="btn-toolbar q-mr-xs" icon="save" label="Simpan" @click="save_data()">
          <q-tooltip content-class="tooltips-app">
            Simpan
          </q-tooltip>
        </q-btn>
        <q-btn dense no-caps flat class="btn-toolbar q-mr-xs" icon="undo" label="Batal" @click="clear_data()">
          <q-tooltip content-class="tooltips-app">
            Batal
          </q-tooltip>
        </q-btn>
        <q-space />
        <q-btn label="Kembali" icon="far fa-arrow-alt-circle-left" flat no-caps rounded :to="{ name:
        'cash-bank', force: true }" />
      </q-toolbar>
    </q-page-sticky>
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
  name: "CashierUJO",
  props: { sysid: BigInt,state: String},
  components: { vJournalEntry },
  setup () {
    const $q = useQuasar();
    const $store = useStore();
    const $route = useRoute();

    const loading = ref(false);
    const edit = ref({});
    const dataevent = ref(false);
    const title = ref("Tambah Data");
    const filter = ref("");
    const stateform =ref('');
    const pagetitle = ref("");
    const api_url = ref({});
    const btns = ref([]);
    const access = ref({});
    const dlgJurnal=ref(false);
    const jurnal_id=ref(-1);
    const cashbanks_source=ref([]);
    const cashbanks_destination=ref([]);
    const operation=ref('');

    function show_jurnal(sysid) {
      dlgJurnal.value=true;
      jurnal_id.value=sysid
    }

    function getJurnal (closed, data) {
      dlgJurnal.value = closed
    }

    function clear_data(){
      operation.value='inserted'
      let skrng = new Date();
      edit.value = {
        transid: -1,
        ref_date: skrng.toLocaleDateString("en-CA"),
        trans_code: '',
        trans_series: '',
        cashbank_source: '',
        cashbank_destination: '',
        amount: 0,
        no_jurnal: -1,
        descriptions: '',
        is_void: 0,
      }
    }
    async function save_data () {
      try {
        let app = {};
        app.data = edit.value;
        app.operation=operation.value
        app.url = 'finance/cash_bank/droping';
        let respon = await $store.dispatch("master/POST_DATA", app);
        if (!(typeof respon === "undefined")) {
          if (respon.success) {
            let msg = respon.data.message;
            $q.notify({
              color: "positive",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
            let props = {};
            props.url = "finance/cash_bank/print2";
            props.sysid = respon.data.sysid;
            await $store.dispatch("master/GET_DOWNLOAD", props);
            clear_data();
          } else {
            let msg = respon.data;
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
      }
    }

    function change_payment(){
      cashbanks_source.value.forEach(el=>{
        if (el.cashbank_source===edit.value.cash_id) {
          edit.value.trans_code=el.voucher_out
        }
      })
    }



    onMounted(async () => {
      stateform.value = $route.query.state
      clear_data()
      cashbanks_source.value=[];
      cashbanks_destination.value=[];
      let props = {};
      props.url = "master/finance/cash-bank/list";
      $store.dispatch("master/GET_DATA", props).then((response) => {
        response.forEach(el=>{
          if (el.is_headoffice==='1') {
            cashbanks_source.value.push(el)
          } else {
            cashbanks_destination.value.push(el)
          }
        })
      });
      if ($route.query.state==='update') {
        props = {};
        props.url = "finance/cash_bank/get";
        props.sysid = $route.query.sysid
        $store.dispatch("master/GET_DATA", props).then((response) => {
          edit.value = response;
          operation.value='inserted'
        });
      }

    });

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
      change_payment
    };
  },
});
</script>
