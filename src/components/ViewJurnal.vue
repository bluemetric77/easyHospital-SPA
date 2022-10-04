<template>
  <q-dialog v-model="dlgJurnal" persistent transition-show="scale" transition-hide="scale" full-width>
    <q-card square class="icard">
      <q-bar class="entry-caption">
        <span>
          <q-btn icon="print" color="red-10" class="q-mr-sm" rounded dense glossy @click="print_gl(edit.transid)" />
          <strong>Jurnal</strong>
        </span>
        <q-space />
        <q-btn glossy rounded dense icon="close" size="xs" color="red-10" @click="closedata({})" />
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-start q-col-gutter-xs q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-6">
            <div class="row items-start q-mb-sm q-col-gutter-xs">
              <div class="col-xs-8 col-sm-12 col-md-5">
                <q-select v-model="edit.trans_code" :options="voucher" outlined dense options-dense label="Voucher"
                  option-value="voucher_code" option-label="voucher_name" emit-value map-options fill-input square
                  stack-label />
              </div>
              <div class="col-xs-4 col-sm-6 col-md-2">
                <q-input v-model="edit.trans_series" dense outlined readonly type="text" label="Series" square
                  stack-label />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-input v-model="edit.ref_date" dense outlined type="date" label="Tanggal" square stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-6 col-sm-6 col-md-5">
                <q-input v-model="edit.reference1" dense outlined type="text" label="Referensi 1" square stack-label />
              </div>
              <div class="col-xs-6 col-sm-6 col-md-5">
                <q-input v-model="edit.reference2" dense outlined type="text" label="Referensi 2" square stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-12 col-sm-12 col-md-10">
                <q-input v-model="edit.notes" dense outlined type="text" label="Catatan" square stack-label />
              </div>
            </div>
          </div>
          <div class="col-xs-12 offset-sm-1 col-sm-5 offset-md-2 col-md-4">
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <q-field square outlined stack-label dense :model-value="edit.debit" label="Debit">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.debit" class="q-field__input text-right" separator="." :precision="2" />
                  </template>
                </q-field>
              </div>
              <div class="col-6">
                <q-field square outlined stack-label dense :model-value="edit.credit" label="Kredit">
                  <template v-slot:control>
                    <vue-numeric v-model="edit.credit" class="q-field__input text-right" separator="." :precision="2" />
                  </template>
                </q-field>
              </div>
            </div>
            <div class="row items-start q-mb-sm q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <q-input v-model="edit.fiscal_month" dense outlined readonly type="text" label="Bulan Fiscal" square />
              </div>
              <div class="col-6">
                <q-input v-model="edit.fiscal_year" dense outlined readonly type="text" label="Tahun Fiscal" square />
              </div>
            </div>
            <div class="row items-start q-mb-sm q-col-gutter-xs q-mb-sm">
              <div class="col-12">
                <q-select v-model="edit.transtype" :options="jurnal_type" outlined dense options-dense
                  label="Tipe Jurnal" option-value="jurnal_type" option-label="descriptions" emit-value map-options
                  fill-input readonly square />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-table class="grid-tables" square :rows="detail" :columns="coldetail" dense no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan" row-key="line_no" separator="cell" selection="single"
        v-model:selected="selected_detail" v-model:pagination="pagination_detail" style="min-height: 150px;"
        virtual-scroll hide-bottom hide-no-data>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-teal-8 text-white">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" @click="props.selected = !props.selected">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div class="grid-data">
                <div v-if="col.name === 'debit'">
                  {{ $formatnumber(props.row.debit, 2, ',', '-') }}
                </div>
                <div v-else-if="col.name === 'credit'">
                  {{ $formatnumber(props.row.credit, 2, ',', '-') }}
                </div>
                <div v-else>
                  {{ col.value }}
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-space/>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar} from "quasar";

export default defineComponent({
  name: 'vJournalEntry',
  props: { show: Boolean, sysid: BigInt },
  setup (props, context) {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();
    const coldetail = ref([
      { name: 'line_no', align: 'Left', sytle: 'width: 60px', headerStyle: 'width: 60px', label: '#', field: 'line_no' },
      { name: 'no_account', align: 'left', sytle: 'width: 100px', headerStyle: 'width: 100px', label: 'No. Akun', field: 'no_account' },
      { name: 'description', align: 'left', label: 'Nama Akun', field: 'description' },
      { name: 'line_memo', align: 'left', sytle: 'width: 170px', headerStyle: 'width: 170px', label: 'Keterangan', field: 'line_memo' },
      { name: 'debit', align: 'right', sytle: 'width: 30px', headerStyle: 'width: 30px', label: 'Debit', field: 'debit' },
      { name: 'credit', align: 'right', sytle: 'width: 30px', headerStyle: 'width: 30px', label: 'Kredit', field: 'credit'},
      { name: 'reference1', align: 'left', label: 'No. Referensi 1', field: 'reference1' },
      { name: 'reference2', align: 'center', label: 'No. Referensi 2', field: 'reference2' }
    ]);
    const voucher=ref([]);
    const jurnal_type=ref([]);
    const edit=ref({});
    const dlgJurnal=ref(false);
    const detail = ref([]);
    const selected_detail = ref([]);
    const pagination_detail = ref({
      sortBy: 'line_no',
      descending: false,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    })

    function closedata (record) {
      dlgJurnal.value = false;
      context.emit("CloseJurnal", false, record);
    }
    
    async function print_gl(sysid){
      let prop = {};
      prop.url = "acc/journal/print";
      prop.sysid = sysid;
      await $store.dispatch("master/GET_DOWNLOAD", prop);
    }


    onMounted(async () => {
      dlgJurnal.value = props.show
      let prop = {}
      prop.url = 'master/accounting/voucher/list'
      voucher.value = await $store.dispatch('master/GET_DATA', prop)

      prop = {}
      prop.url = 'master/accounting/jurnal_type'
      jurnal_type.value = await $store.dispatch('master/GET_DATA', prop)
      $q.loading.show({ delay: 100 })
      try {
        let prop = {}
        prop.url = 'acc/journal/get'
        prop.transid = props.sysid
        let respon = await $store.dispatch('master/GET_DATA', prop)
        if (!(typeof respon === 'undefined')) {
          edit.value = respon.header
          detail.value = respon.detail
        }
      } finally {
        $q.loading.hide()
      }
    });

    return {
      voucher,
      jurnal_type,
      dlgJurnal,
      edit,
      detail,
      closedata,
      coldetail,
      selected_detail,
      pagination_detail,
      print_gl
    };
  }
});
</script>
