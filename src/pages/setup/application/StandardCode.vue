<template>
  <q-page class="page-app">
    <q-splitter
      v-model="splitter"
      style="height: calc(100vh - 100px) !important"
    >
      <template v-slot:before>
        <q-card
          square
          class="icard"
        >
          <q-bar class="entry-caption">
            <strong>Kelompok</strong>
            <q-space />
            <q-input
              v-model="filter_groups"
              dark
              standout
              dense
              outline
              debounce="500"
              label-color="white"
              borderless
              placeholder="Pencarian"
              input-class="text-white"
            >
              <template v-slot:append>
                <q-icon
                  v-if="filter_groups === ''"
                  name="search"
                  color="white"
                  size="sm"
                />
                <q-icon
                  v-else
                  name="clear"
                  class="cursor-pointer"
                  color="white"
                  size="sm"
                  @click="filter_groups = ''"
                />
              </template>
            </q-input>
          </q-bar>

          <q-table
            dense
            square
            :rows="groups"
            :columns="col_groups"
            no-data-label="data kosong"
            no-results-label="data yang cari tidak ditemukan"
            row-key="sysid"
            :filter="filter_groups"
            separator="cell"
            selection="single"
            v-model:selected="sel_groups"
            v-model:pagination="pg_groups"
            binary-state-sort
            @request="onRequestGroup"
            :loading="loading_groups"
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
                  class="bg-blue-grey-10 text-white"
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
                    <div v-if="col.name === 'descriptions'">
                      <q-btn
                        :label="props.row.descriptions"
                        no-caps
                        dense
                        flat
                        @click="load_item(props.row.sysid)"
                        class="btn-operation q-mr-sm"
                      />
                    </div>
                    <div v-else-if="col.name === 'parent_code'">
                      <q-btn
                        :label="props.row.parent_code"
                        no-caps
                        dense
                        flat
                        @click="load_item(props.row.sysid)"
                        class="btn-operation q-mr-sm"
                      />
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
      </template>

      <template v-slot:after>
        <q-card
          square
          class="icard"
        >
          <q-bar class="entry-caption">
            <strong>{{ pagetitle }}</strong>
            <q-space />
            <q-input
              v-model="filter"
              dark
              standout
              dense
              outline
              debounce="500"
              label-color="white"
              borderless
              placeholder="Pencarian"
            >
              <template v-slot:append>
                <q-icon
                  v-if="filter === ''"
                  name="search"
                  color="white"
                  size="sm"
                />
                <q-icon
                  v-else
                  name="clear"
                  class="cursor-pointer"
                  color="white"
                  size="sm"
                  @click="filter = ''"
                />
              </template>
            </q-input>
          </q-bar>
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
                        @click="runMethod(btn.onclick, props.row.uuid_rec)"
                      >
                        <q-tooltip content-class="tooltips-app">
                          {{ btn.tooltips }}
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div v-else-if="col.name === 'is_active'">
                      <q-toggle
                        v-model="props.row.is_active"
                        true-value="1"
                        false-value="0"
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
      </template>
    </q-splitter>

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
        style="width: 400px; max-width: 95vw"
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
            size="sm"
          >
            <q-tooltip>Tutup</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-gutter-sm">
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-input
                v-model="edit.standard_code"
                dense
                outlined
                square
                label="Kode"
                stack-label
              />
            </div>
            <div class="col-8">
              <q-input
                v-model="edit.descriptions"
                dense
                outlined
                square
                label="Nilai"
                stack-label
              />
            </div>
          </div>
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input
                v-model="edit.value"
                dense
                outlined
                square
                label="Nilai"
                stack-label
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-toggle
                v-model="edit.is_active"
                label="Data aktif"
                true-value="1"
                false-value="0"
                dense
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
  name: 'Clinic',
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()
    const splitter = ref(30)
    const field = ref('')

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

    const groups = ref([])
    const sel_groups = ref([])
    const col_groups = ref([
      {
        name: 'parent_code',
        label: 'Grup',
        align: 'left',
        field: 'parent_code'
      },
      {
        name: 'descriptions',
        label: 'Keterangan',
        align: 'left',
        field: 'descriptions'
      }
    ])
    const pg_groups = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })
    const filter_groups = ref('')
    const loading_groups = ref(false)
    const parent_id = ref(-1)

    async function onRequestGroup(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading_groups.value = true
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          url: api_url.value.groups
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        groups.value = respon.data
        pg_groups.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending
        }
      } catch (error) {
      } finally {
        loading_groups.value = false
      }
    }

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
          parent_id: parent_id.value,
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
        standard_code: '',
        descriptions: '',
        parent_id: parent_id.value,
        value: '',
        is_active: '1'
      }
    }

    async function edit_event(primary = '') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          let item = selected.value[0]
          primary = item.uuid_rec
        }
        let props = {}
        props.url = api_url.value.edit
        props.uuidrec = primary
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          title.value = 'Ubah Data'
          dataevent.value = true
          edit.value = respon
        }
      }
    }

    async function delete_event(primary = '') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          let item = selected.value[0]
          primary = item.uuid_rec
        }
        $q.dialog({
          title: 'Konfirmasi',
          message: 'Apakah data ini akan di hapus ?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          let json = {}
          json.uuidrec = primary
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
          load_item(parent_id.value)
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
      sel_groups.value = []
      onRequestGroup({
        pagination: pg_groups.value,
        filter: filter_groups.value
      })
    }

    async function load_item(sysid = -1) {
      parent_id.value = sysid
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
      onRequestGroup({
        pagination: pg_groups.value,
        filter: filter_groups.value
      })
    })

    return {
      splitter,
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
      field,
      runMethod,
      onRequest,
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data,
      onRequestGroup,
      loading_groups,
      groups,
      sel_groups,
      col_groups,
      pg_groups,
      filter_groups,
      parent_id,
      load_item
    }
  }
})
</script>
