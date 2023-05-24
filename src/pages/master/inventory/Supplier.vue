<template>
  <q-page class="page-app">
    <q-card
      square
      class="icard"
    >
      <q-toolbar class="entry-caption">
        <strong>{{ pagetitle }}</strong>
        <q-space />
        <q-input
          dark
          v-model="filter"
          standout
          rounded
          dense
          outline
          debounce="500"
          label-color="white"
          placeholder="Pencarian"
        >
          <template v-slot:append>
            <q-icon
              v-if="filter === ''"
              name="search"
              size="sm"
            />
            <q-icon
              v-else
              name="clear"
              class="cursor-pointer"
              size="sm"
              @click="filter = ''"
            />
          </template>
        </q-input>
      </q-toolbar>
      <q-table
        dense
        square
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        no-results-label="data yang cari tidak ditemukan"
        row-key="sysid"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        :loading="loading"
        virtual-scroll
        table-class="fit-table-ui"
      >
        <template v-slot:loading>
          <q-inner-loading showing>
            <q-spinner-ball
              size="75px"
              color="red-10"
            />
          </q-inner-loading>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
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
                <div v-if="col.name === 'action'">
                  <q-icon
                    v-for="(btn, index) in btns"
                    v-show="btn.is_allowed && btn.is_show"
                    :key="index"
                    no-caps
                    flat
                    class="q-mr-sm"
                    :name="btn.icon"
                    size="xs"
                    color="green-10"
                    @click="runMethod(btn.onclick, props.row.sysid)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle
                    v-model="props.row.is_active"
                    dense
                    disable
                  />
                </div>
                <div v-else-if="col.name === 'create_date'">
                  {{ $INDDateTime(props.row.create_date) }}
                </div>
                <div v-else-if="col.name === 'update_date'">
                  {{ $INDDateTime(props.row.update_date) }}
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
          v-for="(btn, index) in btns"
          :key="index"
          dense
          no-caps
          flat
          v-show="btn.is_allowed"
          class="btn-toolbar q-mr-xs"
          :icon="btn.icon"
          :label="btn.caption"
          @click="runMethod(btn.onclick)"
        >
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-page-sticky>

    <!-- Dialog UI Interface-->
    <q-dialog
      v-model="dataevent"
      persistent
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <q-card
        class="icard"
        square
        style="width: 500px; max-width: 90vw"
      >
        <q-bar class="entry-caption">
          {{ title }}
          <q-space />
          <q-btn
            v-close-popup
            dense
            flat
            rounded
            icon="close"
            color="red-5"
            size="sm"
          >
            <q-tooltip>Tutup</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section
          style="height: 79vh"
          class="q-pa-sm scroll"
        >
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input
                v-model="edit.supplier_code"
                dense
                outlined
                square
                label="Kode"
                stack-label
              />
            </div>
            <div class="col-6">
              <q-checkbox
                v-model="edit.is_active"
                dense
                outlined
                square
                label="Status (Aktif)"
                stack-label
              />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input
                v-model="edit.supplier_name"
                dense
                outlined
                square
                label="Nama Supplier"
                stack-label
              />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input
                v-model="edit.address"
                dense
                outlined
                square
                label="Alamat"
                stack-label
                type="textarea"
                input-style="max-height:50px"
              />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-input
                v-model="edit.phone1"
                dense
                outlined
                square
                label="Telepon 1"
                stack-label
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.phone2"
                dense
                outlined
                square
                label="Telepoon 2"
                stack-label
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.fax"
                dense
                outlined
                square
                label="Fax"
                stack-label
              />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input
                v-model="edit.email"
                dense
                outlined
                square
                label="Email"
                stack-label
              />
            </div>
          </div>
          <q-bar class="entry-caption q-my-sm">Kontak Person</q-bar>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input
                v-model="edit.contact_person"
                dense
                outlined
                square
                label="Nama Kontak"
                stack-label
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input
                v-model="edit.contact_phone"
                dense
                outlined
                square
                label="Telepon"
                stack-label
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="edit.contact_email"
                dense
                outlined
                square
                label="Email"
                stack-label
              />
            </div>
          </div>
          <q-bar class="entry-caption q-my-sm">Bank Pembayaran</q-bar>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input
                v-model="edit.bank_name"
                dense
                outlined
                square
                label="Nama Bank"
                stack-label
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input
                v-model="edit.bank_account_name"
                dense
                outlined
                square
                label="Nama Akun/Rekening"
                stack-label
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="edit.bank_account_number"
                dense
                outlined
                square
                label="Nomor Rekening"
                stack-label
              />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section
          class="dialog-action q-pa-sm"
          align="right"
        >
          <q-btn
            class="q-mr-sm"
            icon="save"
            label="Simpan"
            flat
            no-caps
            @click="save_data()"
          >
            <template v-slot:loading>
              <q-spinner class="on-left" />
              Proses
            </template>
          </q-btn>
          <q-btn
            icon="undo"
            label="Batal"
            no-caps
            flat
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'Supplier',
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading.value = true
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          url: api_url.value.retrieve
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        data.value = respon.data
        pagination.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending
        }
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    async function add_event() {
      dataevent.value = true
      title.value = 'Tambah Data'
      edit.value = {
        sysid: -1,
        supplier_code: '',
        supplier_name: '',
        address: '',
        phone1: '',
        phone2: '',
        fax: '',
        email: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        bank_name: '',
        bank_account_name: '',
        bank_account_number: '',
        lead_time: 1,
        is_active: true
      }
    }

    async function edit_event(primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0]
          primary = item.sysid
        }
        let props = {}
        props.url = api_url.value.edit
        props.sysid = primary
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          title.value = 'Ubah Data'
          dataevent.value = true
          edit.value = respon
        }
      }
    }

    async function delete_event(primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0]
          primary = item.sysid
        }
        $q.dialog({
          title: 'Konfirmasi',
          message: 'Apakah data ini akan di hapus ?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          let json = {}
          json.sysid = primary
          json.url = api_url.value.delete
          $store.dispatch('master/DELETE_DATA', json).then((respon) => {
            if (!(typeof respon === 'undefined')) {
              let msg = respon.data
              if (respon.success) {
                dataevent.value = false
                $q.notify({
                  color: 'positive',
                  textcolor: 'white',
                  message: msg,
                  position: 'top',
                  timeout: 2000
                })
                loaddata()
              } else {
                $q.notify({
                  color: 'negative',
                  textcolor: 'white',
                  message: msg,
                  position: 'top',
                  timeout: 2000
                })
              }
            }
          })
        })
      }
    }

    async function save_data() {
      let app = {}
      app.data = edit.value
      app.operation = edit.value.sysid === -1 ? 'inserted' : 'updated'
      app.url = api_url.value.save
      app.progress = true
      let respon = await $store.dispatch('master/POST_DATA', app)
      if (!(typeof respon === 'undefined')) {
        let msg = respon.data
        if (respon.success) {
          dataevent.value = false
          $q.notify({
            color: 'positive',
            textcolor: 'white',
            message: msg,
            position: 'top',
            timeout: 2000
          })
          loaddata()
        } else {
          $q.notify({
            color: 'negative',
            textcolor: 'white',
            message: msg,
            position: 'top',
            timeout: 2000
          })
        }
      }
    }

    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function runMethod(method, primary = -1) {
      this[method](primary)
    }

    onMounted(async () => {
      let property = await $store.dispatch(
        'home/GET_PAGEPROPERTY',
        $router.currentRoute.value.fullPath
      )
      columns.value = property.columns
      pagetitle.value = property.title
      api_url.value = property.url
      btns.value = property.btn
      access.value = property.access
      loaddata()
    })

    return {
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
      loading,
      runMethod,
      onRequest,
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data
    }
  }
})
</script>
