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
        square
        :rows="data"
        :columns="columns"
        dense
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="sysid"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        wrap-cells
      >
        <template v-slot:loading>
          <q-inner-loading showing>
            <q-spinner-ball
              size="75px"
              color="red-10"
            />
          </q-inner-loading>
        </template>
        <template v-slot:no-data="{ icon, message, filter }">
          <div class="full-width row flex-center text-accent q-gutter-sm">
            <q-icon
              size="2em"
              name="sentiment_dissatisfied"
            />
            <span>{{ message }}</span>
            <q-icon
              size="2em"
              :name="filter ? 'filter_b_and_w' : icon"
            />
          </div>
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
              :class="
                props.row.is_group === false
                  ? 'q-pa-xs text-black'
                  : 'q-pa-xs text-green-10 text-bold'
              "
            >
              <div class="grid-data">
                <div v-if="col.name === 'action'">
                  <q-btn
                    v-for="(btn, index) in btns"
                    v-show="btn.is_allowed && btn.is_show"
                    :key="index"
                    dense
                    no-caps
                    rounded
                    glossy
                    class="q-mr-xs q-mb-sm"
                    :icon="btn.icon"
                    color="green-10"
                    @click="runMethod(btn.onclick, props.row.uuid_rec)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-btn>
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle
                    v-model="props.row.is_active"
                    dense
                    disable
                  />
                </div>
                <div v-else-if="col.name === 'is_group'">
                  <q-toggle
                    v-model="props.row.is_group"
                    dense
                    disable
                  />
                </div>
                <div v-else-if="col.name === 'full_name'">
                  <div v-if="props.row.is_active === false">
                    <span
                      style="color: red"
                      class="flex flex-center"
                    >
                      <strike>{{ col.value }}</strike>
                    </span>
                  </div>
                  <div v-else>
                    <span class="flex flex-center">{{ col.value }}</span>
                  </div>
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

    <!-- Dialog Input-->
    <q-dialog
      v-model="dataevent"
      persistent
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <q-card
        class="icard"
        style="width: 500px"
        square
      >
        <q-bar class="dialog-caption">
          <div style="color: white; font-size: 0.7em">
            {{ title }}
          </div>
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

        <q-card-section class="q-pa-sm">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="edit.user_name"
                dense
                outlined
                square
                type="text"
                label="User ID"
                stack-label
              />
            </div>
            <div class="col-6">
              <q-toggle
                v-model="edit.is_group"
                label="User group"
                color="blue"
                dense
                stack-label
              />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mt-xs">
            <div class="col-xs-12 col-sm-6">
              <q-input
                v-model="edit.full_name"
                outlined
                dense
                square
                label="Nama User"
                stack-label
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-select
                v-model="edit.user_level"
                :options="['ADMIN', 'SUPVR', 'USER']"
                options-dense
                outlined
                dense
                square
                label="Level User"
                stack-label
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-xs-12 col-sm-6 col-md-6">
              <q-input
                v-model="edit.email"
                outlined
                dense
                square
                label="email"
                stack-label
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <q-input
                v-model="edit.phone"
                outlined
                dense
                square
                type="text"
                label="Nomor Telepon"
                stack-label
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <q-toggle
              v-model="edit.is_active"
              label="Aktif"
              color="blue"
              dense
            />
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
            :loading="loading"
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

    <!-- Dialog Change Password-->
    <q-dialog
      v-model="pwdevent"
      persistent
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <q-card
        class="icard"
        style="width: 500px"
        square
      >
        <q-bar class="dialog-caption">
          <div style="color: white; font-size: 0.7em">Ubah Password</div>
          <q-space />
          <q-btn
            v-close-popup
            dense
            icon="close"
            color="red-10"
            size="xs"
            rounded
            glossy
          >
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-sm q-gutter-xs">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-xs-12 col-sm-6">
              <q-input
                v-model="edit.user_name"
                dense
                outlined
                readonly
                square
                type="text"
                label="User ID"
              />
            </div>
            <div class="col-xs-9 col-sm-6">
              <q-input
                v-model="edit.full_name"
                outlined
                dense
                readonly
                square
                type="text"
                label="Nama User"
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-12">
              <q-input
                v-model="pwd1"
                outlined
                dense
                square
                :type="isPwd ? 'password' : 'text'"
                hint="Password dengan toggle"
                label="Password"
              >
                <template v-slot:append>
                  <q-icon
                    :class="isPwd ? 'fas fa-eye-slash' : 'fas fa-eye'"
                    @click="isPwd = !isPwd"
                    size="xs"
                    color="green-10"
                  />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-12">
              <q-input
                v-model="pwd2"
                outlined
                dense
                square
                :type="isPwd ? 'password' : 'text'"
                hint="Password dengan toggle"
                label="Konfirmasi Password"
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
            icon="save"
            label="Ubah Password"
            class="q-mr-sm"
            no-caps
            flat
            @click="save_pwd()"
          >
            <template v-slot:loading>
              <q-spinner class="on-left" />
              Proses
            </template>
          </q-btn>
          <q-btn
            icon="cancel"
            label="Batal"
            no-caps
            flat
            @click="pwdevent = false"
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
  name: 'User',
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const loading = ref(false)
    const isPwd = ref(true)
    const data = ref([])
    const sysid = ref(-1)
    const edit = ref({})
    const phone = ref('')
    const pwd1 = ref('')
    const pwd2 = ref('')

    const levellist = ref(['USER', 'SUPVR', 'ADMIN'])
    const dataevent = ref(false)
    const pwdevent = ref(false)
    const title = ref('Tambah Data')
    const operation = ref('')
    const filter = ref('')

    const pagination = ref({
      sortBy: 'user_name',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })
    const selected = ref([])
    const columns = ref([])
    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const userlevel = ref([])
    const foto = ref(null)
    const sign = ref(null)

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      $q.loading.show({ delay: 100 })
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
        $q.loading.hide()
      }
    }

    function add_event() {
      dataevent.value = true
      operation.value = 'inserted'
      edit.value = {
        sysid: -1,
        full_name: '',
        full_name: '',
        email: '@',
        phone: '-',
        is_group: false,
        user_level: 'USER',
        is_active: true
      }
      foto.value = null
      sign.value = null
    }

    async function edit_event(uuid = '') {
      if (selected.value.length > 0 || uuid !== '') {
        if (uuid === '') {
          let item = selected.value[0]
          uuid = item.uuid_rec
        }
        operation.value = 'updated'
        let props = {}
        props.url = api_url.value.edit
        props.uuid = uuid
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          //let config = new this.$Config();
          dataevent.value = true
          edit.value = respon
          //edit.value.photo = config.UrlPublic() + edit.value.photo;
          //edit.value.sign = config.UrlPublic() + edit.value.sign;
        }
        foto.value = null
        sign.value = null
      }
    }

    async function delete_event(uuid = '') {
      if (selected.value.length > 0 || uuid !== '') {
        if (uuid === '') {
          let item = selected.value[0]
          uuid = item.uuid_rec
        }
        operation.value = 'deleted'
        $q.dialog({
          title: 'Konfirmasi',
          message: 'Apakah user  ini akan di hapus?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          let json = {}
          json.uuid = uuid
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
                  color: 'red-10',
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
      let where = {}
      let app = {}
      where.uuid = edit.value.uuid_rec
      app.data = edit.value
      app.operation = operation.value
      app.where = where
      app.url = api_url.value.save
      app.progress = true
      let respon = await $store.dispatch('master/POST_DATA', app)
      if (!(typeof respon === 'undefined')) {
        let msg = respon.data.message
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
          $q.loading.hide()
          $q.notify({
            color: 'red-10',
            textcolor: 'white',
            message: msg,
            position: 'top',
            timeout: 2000
          })
        }
      }
    }

    async function password(uuid = '') {
      if (selected.value.length > 0 || uuid !== '') {
        if (uuid === '') {
          let item = selected.value[0]
          uuid = item.uuid_rec
        }
        operation.value = 'updated'
        let props = {}
        props.url = api_url.value.edit
        props.uuid = uuid
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          pwdevent.value = true
          edit.value = respon
        }
      }
    }

    function save_pwd() {
      operation.value = 'updated'
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah password sudah benar ?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        let props = {}
        props.uuid = edit.value.uuid_rec
        props.pwd1 = pwd1.value
        props.pwd2 = pwd2.value
        props.url = api_url.value.password
        props.progress = true
        $store.dispatch('master/POST_DATA', props).then((respon) => {
          if (!(typeof respon === 'undefined')) {
            let msg = respon.data
            if (respon.success) {
              pwdevent.value = false
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
                color: 'red-10',
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

    function access_setup(uuid = '') {
      if (selected.value.length > 0 || uuid !== '') {
        if (uuid === '') {
          let item = selected.value[0]
          uuid = item.uuid_rec
        }
        let url = '/access/useraccess'
        $router.push({ path: url, query: { uuid: uuid } })
      }
    }

    async function upload_foto() {
      let app = {}
      app.sysid = edit.value.sysid
      app.file = foto.value
      app.url = 'user/users/photo'
      $q.loading.show({ delay: 200 })
      try {
        let respon = await $store.dispatch('master/UPLOAD_DATA', app)
        if (!(typeof respon === 'undefined')) {
          if (respon.success) {
            edit.value.photo = respon.data.path_file
          } else {
            let msg = respon.data
            $q.dialog({
              title: 'Peringatan',
              message: msg,
              persistent: true
            })
          }
        } else {
          $q.dialog({
            title: 'Peringatan',
            message: 'Upload Gagal',
            persistent: true
          })
        }
      } finally {
        $q.loading.hide()
      }
    }

    async function upload_sign() {
      let app = {}
      app.sysid = edit.value.sysid
      app.file = sign.value
      app.url = 'user/users/sign'
      $q.loading.show({ delay: 200 })
      try {
        let respon = await $store.dispatch('master/UPLOAD_DATA', app)
        if (!(typeof respon === 'undefined')) {
          if (respon.success) {
            edit.value.sign = respon.data.path_file
          } else {
            let msg = respon.data
            $q.dialog({
              title: 'Peringatan',
              message: msg,
              persistent: true
            })
          }
        } else {
          $q.dialog({
            title: 'Peringatan',
            message: 'Upload Gagal',
            persistent: true
          })
        }
      } finally {
        $q.loading.hide()
      }
    }

    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function runMethod(method, uuid = '') {
      this[method](uuid)
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
      loading,
      isPwd,
      data,
      sysid,
      edit,
      phone,
      pwd1,
      pwd2,
      levellist,
      dataevent,
      pwdevent,
      title,
      operation,
      filter,
      pagination,
      selected,
      columns,
      pagetitle,
      api_url,
      btns,
      access,
      userlevel,
      foto,
      sign,
      runMethod,
      onRequest,
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data,
      save_pwd,
      upload_sign,
      upload_foto,
      password,
      access_setup
    }
  }
})
</script>
