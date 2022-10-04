<template>
    <q-dialog v-model="dlgDriver" persistent transition-show="scale" transition-hide="scale">
      <q-card square class="icard" style="width: 500px; max-width: 80vw; max-height: 700px">
        <q-bar class="entry-caption">
          <span>Pengemudi</span>
          <q-space />
          <q-input v-model="filter" dense outline label-color="white" borderless placeholder="Pencarian"
            input-class="text-white" debounce="200">
            <template v-slot:append>
              <q-icon name="search" color="white" size="xs" />
            </template>
          </q-input>
        </q-bar>
        <q-table square :rows="data" :columns="columns" no-data-label="data kosong"
          no-results-label="data yang kamu cari tidak ditemukan" row-key="personal_id" :filter="filter" separator="cell"
          selection="single" virtual-scroll dense v-model:selected="selected" v-model:pagination="pagination"
          binary-state-sort @request="onRequest" class="fit" table-style="min-height:302px; max-height: 450px"
          :loading="loading">
          <template v-slot:loading>
            <q-inner-loading showing>
              <q-spinner-ball size="70px" color="red-10" />
            </q-inner-loading>
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-width row flex-center text-accent q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>{{ message }}</span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-blue-grey-14 text-white">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click="props.selected = !props.selected">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <div class="grid-data">
                  <div v-if="col.name === 'employee_id'">
                    <div class="q-mb-sm">
                      <span @click="selectdata(props.row.employee_id)">
                        NIK :{{props.row.employee_id}}
                      </span>
                    </div>
                    <div class="q-mb-sm">
                      Nama : {{props.row.personal_name}}
                    </div>
                    <div>
                      Tgl.Lahir : {{$INDDate(props.row.dob)}}
                    </div>
                  </div>
                  <div v-else-if="col.name==='photo_link'">
                    <q-img :src="props.row.photo_link" style="max-height:80px" :ratio="1" fit="contain" class="q-mb-sm">
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-negative text-white">
                          Tidak ada foto
                        </div>
                      </template>
                    </q-img>
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
        <q-card-section class="entry-caption q-pa-sm" align="right">
          <q-btn no-caps label="Pilih" color="positive" icon="check" flat class="q-mr-sm" @click="selectdata()" />
          <q-btn no-caps color="negative" label="Tutup" icon="close" flat @click="closedata({})" />
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "driver",
  props: { show: Boolean, pool_code: String },
  setup(props, context) {
    const $store = useStore();
    const dlgDriver = ref(false);
    const pagination = ref({
      sortBy: "personal_name",
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25,
    });

    const filter = ref("");
    const selected = ref([]);
    const columns = ref([
      {
        name: "employee_id",
        align: "left",
        label: "ID Pengemudi",
        field: "employee_id",
        sortable: true,
      },
      {
        name: "photo_link",
        align: "left",
        label: "Photo",
        field: "photo_link",
        sortable: true,
      },
    ]);

    const vlastcolumn = ref("");
    const data = ref([]);
    const loading = ref(false);
    const poolcode =ref("");

    async function loaddata() {
      await onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    }
    function selectdata(employee_id='') {
      if ((selected.value.length > 0) || (employee_id !=='')){
        let row=null
        if (employee_id !==''){
           data.value.forEach(el=>{
             if (employee_id === el.employee_id) {
              row =el
            }
           }) 
        } else {
          let item = selected.value[0];
          row = item;
        }
        closedata(row);
      }
    }

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination;
      let filter = props.filter;
      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage;
      loading.value = true;
      try {
        let prop = {
          page: page,
          limit: fetchCount,
          filter: filter,
          descending: descending,
          sortBy: sortBy,
          pool_code: poolcode.value,
          url: "master/partner/driver/open",
        };
        let respon = await $store.dispatch("master/GET_DATA", prop);
        data.value = respon.data;
        pagination.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          sortBy: sortBy,
          descending: descending,
          rowsPerPage: respon.per_page,
        };
      } catch (error) {
      } finally {
        loading.value = false;
      }
    }

    function closedata(record) {
      dlgDriver.value = false;
      filter.value = "";
      data.value = [];
      context.emit("CloseDriver", false, record);
    }

    onMounted(async () => {
      dlgDriver.value = props.show;
      poolcode.value=props.pool_code
      loaddata();
    });

    return {
      loading,
      data,
      vlastcolumn,
      filter,
      selected,
      columns,
      pagination,
      selectdata,
      onRequest,
      closedata,
      dlgDriver,
      poolcode
    };
  },
});
</script>
