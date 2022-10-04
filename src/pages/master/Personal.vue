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
        no-results-label="data yang kamu cari tidak ditemukan" row-key="personal_id" :filter="filter" separator="cell"
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
                    @click="runMethod(btn.onclick, props.row.personal_id)">
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name==='personal_name'">
                  <q-img :src="props.row.photo_link" spinner-color="white" :ratio="1" height="100px"
                    fill="contain" class="q-mb-sm">
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-negative text-white">
                        Tidak ada foto
                      </div>
                    </template>
                  </q-img>
                  <div v-if="props.row.is_active==='0'">
                    <span style="color:red" class="flex flex-center">
                      <strike>{{ col.value }}</strike>
                    </span>
                  </div>
                  <div v-else>
                    <span class="flex flex-center">{{ col.value }}</span>
                  </div>
                </div>
                <div v-else-if="col.name === 'personal_address'">
                  <q-input v-model="props.row.personal_address" borderless autogrow type="textarea"
                    input-style="width:300px" dense readonly />
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle v-model="props.row.is_active" true-value="1" false-value="0" dense disable />
                </div>
                <div v-else-if="col.name === 'driving_license_valid'">
                  {{ $INDDate(props.row.driving_license_valid) }}
                </div>
                <div v-else-if="col.name === 'dob'">
                  {{ $INDDate(props.row.dob) }}
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
        <q-space/>
        <q-btn-toggle
          v-model="flagactive"
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="[
            {label: 'Semua Pengemudi', value: '0'},
            {label: 'Pengemudi Aktif', value: '1'}
          ]"
        />
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
              <q-input v-model="edit.employee_id" dense outlined square label="ID Pengemudi" stack-label />
            </div>
            <div class="col-7">
              <q-input v-model="edit.personal_name" dense outlined square label="Nama Pengemudi" stack-label />
            </div>
            <div class="col-2">
              <q-checkbox v-model="edit.is_active" dense true-value="1" false-value="0" label="Aktif" stack-label />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-xs">
            <div class="col-10">
              <q-select v-model="edit.pool_code" :options="pools" outlined dense options-dense label="Pool kendaraan"
                option-value="pool_code" option-label="pool_name" emit-value map-options fill-input stack-label
                square />
            </div>
          </div>
        </q-card-section>
        <q-tabs v-model="tab" class="text-teal" dense inline-label no-caps>
          <q-tab name="general" icon="fas fa-address-card" label="Umum" />
          <q-tab name="bank" icon="fas fa-money-bill" label="Akun Bank" />
          <q-tab name="configuration" icon="fas fa-cog" label="Seting" />
          <q-tab name="photo" icon="fas fa-camera" label="Foto" />
          <q-tab name="cityzen" icon="fas fa-city" label="KTP" />
          <q-tab name="driver_license" icon="fas fa-trailer" label="SIM" />
          <q-tab name="kartu_keluarga" icon="fas fa-trailer" label="Kartu Keluarga" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
          <q-tab-panel name="general">
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-6">
                <q-input v-model="edit.dob" dense outlined square label="Tgl Lahir" stack-label type="date" />
              </div>
              <div class="col-6">
                <q-input v-model="edit.citizen_no" dense outlined square label="No. KTP" stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.personal_address" dense outlined square label="Alamat" stack-label
                  type="textarea" autogrow />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-6">
                <q-input v-model="edit.phone1" dense outlined square label="Telepon 1" stack-label />
              </div>
              <div class="col-6">
                <q-input v-model="edit.phone2" dense outlined square label="Telepon 2" stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-6">
                <q-input v-model="edit.emergency_contact" dense outlined square label="Nama kontak darurat"
                  stack-label />
              </div>
              <div class="col-6">
                <q-input v-model="edit.emergency_phone" dense outlined square label="Telp kontak darurat" stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.emergency_address" dense outlined square label="Alamat kontak darurat"
                  type="textarea" autogrow stack-label />
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="bank">
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.bank_name" dense outlined square label="Nama Bank" type="textarea" autogrow
                  stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.account_name" dense outlined square label="Pemilik rekening" type="textarea"
                  autogrow stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-12">
                <q-input v-model="edit.account_number" dense outlined square label="Nomor rekening" type="textarea"
                  autogrow stack-label />
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="configuration">
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-input v-model="edit.marital_state" dense outlined square label="Status Pernikahan" stack-label />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-xs">
              <div class="col-4">
                <q-input v-model="edit.driving_license_type" dense outlined square label="Jenis SIM" stack-label />
              </div>
              <div class="col-4">
                <q-input v-model="edit.driving_license_no" dense outlined square label="No. SIM" stack-label />
              </div>
              <div class="col-4">
                <q-input v-model="edit.driving_license_valid" dense outlined square label="Masa berlaku SIM" stack-label
                  type="date" />
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="photo">
            <q-card class="column">
              <q-img :src="edit.photo" style="max-height:270px" :ratio="3/4" fit="contain" />
              <q-separator />
              <q-card-section class="q-pa-xs">
                <div class="row items-start">
                  <div class="col-12">
                    <q-file v-model="photo" outlined dense rounded label="Upload foto indentitas (Max 2 MB)"
                      accept=".jpg,image/*" max-file-size="2056000" @rejected="onRejected" stack-label>
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                      <template v-slot:append>
                        <q-btn label="Upload" no-caps dense rounded glossy color="green-10"
                          @click="upload_file('photo')" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>
          <q-tab-panel name="cityzen">
            <q-card class="column">
              <q-img :src="edit.ktp" style="max-height:270px" :ratio="3/4" fit="contain" />
              <q-separator />
              <q-card-section class="q-pa-xs">
                <div class="row items-start">
                  <div class="col-12">
                    <q-file v-model="ktp" outlined dense label="Upload foto indentitas (Max 2 MB)" accept=".jpg,image/*"
                      max-file-size="2056000" @rejected="onRejected" rounded>
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                      <template v-slot:append>
                        <q-btn label="Upload" no-caps dense rounded glossy color="green-10"
                          @click="upload_file('ktp')" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>
          <q-tab-panel name="driver_license">
            <q-card class="column">
              <q-img :src="edit.sim" style="max-height:270px" :ratio="3/4" fit="contain" />
              <q-separator />
              <q-card-section class="q-pa-xs">
                <div class="row items-start">
                  <div class="col-12">
                    <q-file v-model="sim" outlined dense label="Upload foto indentitas (Max 2 MB)" accept=".jpg,image/*"
                      max-file-size="2056000" @rejected="onRejected" rounded>
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                      <template v-slot:append>
                        <q-btn label="Upload" no-caps dense rounded glossy color="green-10"
                          @click="upload_file('sim')" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>
          <q-tab-panel name="kartu_keluarga">
            <q-card class="column">
              <q-img :src="edit.kartu_keluarga" style="max-height:270px" :ratio="3/4" fit="contain" />
              <q-separator />
              <q-card-section class="q-pa-xs">
                <div class="row items-start">
                  <div class="col-12">
                    <q-file v-model="kartu_keluarga" outlined dense label="Upload foto indentitas (Max 2 MB)"
                      accept=".jpg,image/*" max-file-size="2056000" @rejected="onRejected" rounded>
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                      <template v-slot:append>
                        <q-btn label="Upload" no-caps dense rounded glossy color="green-10"
                          @click="upload_file('kartu_keluarga')" />
                      </template>
                    </q-file>
                  </div>
                </div>
              </q-card-section>
            </q-card>
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
import {Config} from 'boot/engine';

export default defineComponent({
  name: "Personal",
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
    const url=ref("");
    const photo=ref(null);
    const ktp=ref(null);
    const sim = ref(null);
    const kartu_keluarga=ref(null);
    const pagination = ref({
      sortBy: "personal_id",
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

    const pools = ref([]);
    const api_link=ref("");
    const flagactive=ref('1');

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
          flagactive:flagactive.value,
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
        personal_id:-1,
        employee_id: "",
        personal_name:"",
        personal_address: "",
        dob: null,
        phone1: "",
        phone2: "",
        citizen_no: "",
        marital_state: "",
        driving_license_type: "",
        driving_license_no: null,
        driving_license_valid: null,
        personal_type: "Driver",
        emergency_contact: "",
        emergency_address: "",
        emergency_phone: "",
        bank_name: "",
        account_name: "",
        account_number:"",
        pool_code:null,
        is_active:'1',
        photo:'',
        sim:'',
        ktp:'',
        kartu_keluarga:''
      };
      ktp.value=""
      sim.value=""
      photo.value=""
      kartu_keluarga.value=""
    }

    async function edit_event(primary ='') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          let item = selected.value[0];
          primary = item.personal_id;
        }
        $q.loading.show({ delay: 100 });
        try {
          loading.value = false;
          let props = {};
          props.url = api_url.value.edit;
          props.personal_id = primary;
          edit.value={}
          ktp.value = ""
          sim.value = ""
          photo.value = ""
          let respon = await $store.dispatch("master/GET_DATA", props);
          if (!(typeof respon === "undefined")) {
            dataevent.value = true;
            tab.value="general"
            edit.value = respon;
            let config = new Config()
            let url_link = config.UrlLink() + '/master/partner/driver/download'
            edit.value.sim = url_link + '?personal_id=' + edit.value.personal_id + '&document=sim'
            edit.value.ktp = url_link + '?personal_id=' + edit.value.personal_id + '&document=ktp'
            edit.value.kartu_keluarga = url_link + '?personal_id=' + edit.value.personal_id + '&document=kartu_keluarga'
            edit.value.photo = url_link +'?personal_id='+edit.value.personal_id+'&document=photo'
            config=null
            console.info(JSON.stringify(edit.value))
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
          primary = item.personal_id;
        }
        $q.dialog({
          title: "Konfirmasi",
          message: "Apakah data ini akan di hapus?",
          cancel: true,
          persistent: true,
        }).onOk(() => {
          let json = {};
          json.personal_id = primary;
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

    function upload_file(types=''){
      let json = {}
      json.url = 'master/partner/driver/upload'
      json.personal_id = edit.value.personal_id
      json.document = types
      if (types==='photo') {
        json.file=photo.value
      } else if (types === 'sim') {
        json.file = sim.value
      } else if (types === 'ktp') {
        json.file = ktp.value
      } else if (types === 'kartu_keluarga') {
        json.file = kartu_keluarga.value
      }
      $store.dispatch('master/UPLOAD_DATA', json)
        .then(async (respon) => {
          let msg = respon.data
          if (respon.success === true) {
            if (types==='photo'){
              edit.value.photo = URL.createObjectURL(photo.value)
            }else if (types === 'ktp') {
              edit.value.ktp = URL.createObjectURL(ktp.value)
            } else if (types === 'sim') {
              edit.value.sim = URL.createObjectURL(sim.value)
            } else if (types === 'kartu_keluarga') {
              edit.value.kartu_keluarga = URL.createObjectURL(kartu_keluarga.value)
            }
            this.$q.notify({
              icon: 'announcement',
              color: 'green-10',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000,
            })
          } else {
            this.$q.notify({
              icon: 'announcement',
              color: 'red',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000,
            })
          }
        })
    }

    function onRejected (rejectedEntries){
        this.$q.notify({
        icon: 'announcement',
        color: 'red',
        textcolor: 'white',
          message: '${rejectedEntries.length} Ukuran file yang diupload lebih dari 2MB',
        position: 'top',
        timeout: 2000,
      })
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
      let props={}
      props.url = "master/operational/pool/list";
      $store.dispatch("master/GET_DATA", props).then((response) => {
        pools.value = response;
      });
      let config = new Config()
      api_link.value = config.UrlLink() + '/master/partner/driver/download'
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
      url,
      photo,
      ktp,
      sim,
      kartu_keluarga,
      upload_file,
      pools,
      onRejected,
      api_link,
      flagactive
    };
  },
});
</script>
