<template>
  <q-page class="page-app">
    <q-card
      square
      class="icard"
    >
      <q-bar class="entry-caption">
        <strong>{{ pagetitle }}</strong>
        <q-space />
        <q-input
          dark
          v-model="filter"
          flat
          dense
          outline
          debounce="500"
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
                <div
                  v-else-if="
                    col.name === 'on_hand' || col.name === 'on_hand_unit'
                  "
                >
                  {{ $formatnumber(col.value, 2, ',', '0', true) }}
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
    >
      <q-card
        class="icard"
        square
        style="width: 900px; max-width: 90vw"
      >
        <q-bar class="entry-caption">
          Formula Produksi
          <q-space />
          <q-btn
            v-close-popup
            dense
            flat
            rounded
            size="sm"
            icon="close"
          >
            <q-tooltip>Tutup</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="q-pa-sm">
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-xs-12 col-sm-2">
              <q-input
                v-model="edit.item_code"
                label="Kode"
                square
                dense
                flat
                outlined
                disable
              />
            </div>
            <div class="col-xs-12 offset-sm-8 col-sm-2">
              <q-field
                square
                outlined
                stack-label
                dense
                :model-value="edit.quantity_production"
                label="Standar Produksi"
              >
                <template v-slot:control>
                  <vue-numeric
                    v-model="edit.quantity_production"
                    class="q-field__input text-right"
                    separator="."
                    :precision="0"
                    disable
                  />
                </template>
              </q-field>
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-xs-12 col-sm-5">
              <q-input
                v-model="edit.item_name1"
                label="Nama Item"
                square
                dense
                flat
                outlined
                disable
              />
            </div>
            <div class="col-xs-12 offset-md-5 col-sm-2">
              <q-input
                v-model="edit.mou_inventory"
                label="Satuan Produksi"
                square
                dense
                flat
                outlined
                disable
              />
            </div>
          </div>
        </q-card-section>
        <q-table
          dense
          square
          :rows="bom"
          :columns="columns_bom"
          no-data-label="data kosong"
          no-results-label="data yang cari tidak ditemukan"
          row-key="line_no"
          :filter="filter"
          separator="cell"
          selection="single"
          v-model:selected="selected_bom"
          v-model:pagination="pagination_bom"
          binary-state-sort
          virtual-scroll
          table-class="fit-table-entry"
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
                class="bg-teal-8 text-white"
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
                  <div v-if="col.name === 'line_no'">
                    {{ props.row.line_no }}
                    <q-icon
                      no-caps
                      flat
                      class="q-mr-sm"
                      size="xs"
                      color="red-10"
                      name="delete"
                      @click="removeRow(props.row.line_no)"
                    />
                  </div>
                  <div v-else-if="col.name === 'quantity_bom'">
                    <vue-numeric
                      v-model="props.row.quantity_bom"
                      class="q-field__input right-input"
                      separator="."
                      precision="2"
                    />
                  </div>
                  <div v-else-if="col.name === 'descriptions'">
                    <input
                      v-model="props.row.remarks"
                      class="q-field__input input-normal full-width"
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
        <q-card-section class="dialog-action q-pa-xs">
          <div class="row items-starts">
            <q-btn
              class="q-mr-sm"
              label="Tambah material produksi"
              icon="add"
              dense
              flat
              no-caps
              @click="dlgItem = true"
            />
            <q-space />
            <q-btn
              class="q-mr-sm"
              label="Simpan"
              icon="save"
              dense
              flat
              no-caps
              @click="save_data()"
            />
            <q-btn
              label="Batal"
              icon="undo"
              dense
              flat
              no-caps
              v-close-popup
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <items
      v-if="dlgItem"
      :show="dlgItem"
      :state="edit.inventory_group"
      @CloseItems="getItem"
    />
  </q-page>
</template>

<script>
import items from 'components/master/Items.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { Config } from 'boot/engine'

export default defineComponent({
  name: 'BillOfMaterial',
  components: { items },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const dlgItem = ref(false)
    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const bom = ref([])
    const columns_bom = ref([
      { name: 'line_no', align: 'left', label: 'No', field: 'line_no' },
      { name: 'item_code', align: 'left', label: 'Kode', field: 'item_code' },
      {
        name: 'item_name',
        align: 'left',
        label: 'Item material (BOM)',
        field: 'item_name'
      },
      {
        name: 'quantity_bom',
        align: 'right',
        label: 'Jumlah',
        field: 'quantity_bom',
        sytle: 'width: 60px',
        headerStyle: 'width:60px'
      },
      {
        name: 'mou_inventory',
        align: 'left',
        label: 'Unit',
        field: 'mou_inventory'
      },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Catatan',
        field: 'descriptions'
      }
    ])
    const selected_bom = ref([])
    const pagination_bom = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    })

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
          url: 'master/inventory/inventory-item/bom'
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

    async function formula_event(uuid_rec = '') {
      if (selected.value.length > 0 || !(uuid_rec === '')) {
        if (uuid_rec === '') {
          uuid_rec = selected.value[0].uuid_rec
        }
        let props = {}
        props.url = 'master/inventory/inventory-item/bom/get'
        props.uuidrec = uuid_rec
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          dataevent.value = true
          edit.value = respon.item
          bom.value = respon.bom
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

    function runMethod(method, uuid_rec = '') {
      this[method](uuid_rec)
    }

    function getItem(closed, data) {
      dlgItem.value = closed
      if (typeof (data.item_code !== 'undefined')) {
        let row = {
          item_sysid: -1,
          line_no: bom.value.length + 1,
          bom_sysid: data.sysid,
          item_code: data.item_code,
          item_name: data.item_name1,
          quantity_bom: 0,
          mou_inventory: data.mou_inventory,
          descriptions: ''
        }
        bom.value.push(row)
      }
    }

    function removeRow(lineno) {
      let i = -1
      for (i = 0; i < bom.value.length; i++) {
        if (bom.value[i].line_no === lineno) {
          bom.value.splice(i, 1)
        }
      }
      selected_bom.value = []
    }

    function save_data() {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah formula produksi ini sudah benar ?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        let app = {}
        app.header = edit.value
        app.detail = bom.value
        app.url = 'master/inventory/inventory-item/bom'
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
            edit.value = {}
            bom.value = []
          } else {
            $q.notify({
              color: 'red-10',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 3000
            })
          }
        }
      })
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
      let props = {}
      props.url = 'master/inventory/bom/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        mou.value = response
      })
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
      formula_event,
      loaddata,
      bom,
      columns_bom,
      pagination_bom,
      selected_bom,
      getItem,
      dlgItem,
      removeRow,
      save_data
    }
  }
})
</script>
<style lang="scss">
.fit-table-entry {
  height: -webkit-calc(100vh - 355px) !important;
  height: -moz-calc(100vh - 355px) !important;
  height: calc(100vh - 355px) !important;

  thead tr th {
    position: sticky;
    z-index: 1;
  }
  thead tr:first-child th {
    top: 0;
  }
  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }
}
</style>
