<template>
  <q-page class="page-app">
    <q-card
      class="q-mb-sm"
      square
    >
      <q-bar class="entry-caption"> Filter data </q-bar>
      <q-card-section
        class="q-pa-sm"
        square
      >
        <div class="row items-center q-col-gutter-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <q-input
              v-model="location_name"
              label="Lokasi"
              dense
              square
              outlined
              readonly
            >
              <template v-slot:append>
                <q-icon
                  name="search"
                  color="green-10"
                  size="sm"
                  @click="dlgWarehouse = true"
                >
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-xs-12 col-sm-6 offset-md-5 col-md-3">
            <q-btn-toggle
              v-model="status"
              spread
              style="border: 1px solid #027be3"
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="[
                { label: 'Lokasi tertentu', value: '0' },
                { label: 'Semua lokasi', value: '1' }
              ]"
              @update:model-value="loaddata()"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card
      square
      class="icard"
    >
      <q-bar class="entry-caption">
        <span
          ><strong>{{ pagetitle }}</strong></span
        >
        <q-space />
        <q-input
          v-model="filter"
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
              v-if="filter === ''"
              name="search"
              color="white"
              size="sm"
            />
            <q-icon
              v-else
              name="clear"
              class="cursor-mouer"
              color="white"
              size="sm"
              @click="filter = ''"
            />
          </template>
        </q-input>
      </q-bar>
      <q-table
        square
        dense
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="_index"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        :loading="loading"
        class="grid-tables fit-table-ui-with-parameter-1"
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
          <div class="full-width row flex-top text-accent q-gutter-sm">
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
                <div v-else-if="col.name === 'location_name'">
                  {{ props.row.location_name }} (<strong>
                    {{ props.row.location_code }}</strong
                  >)
                </div>
                <div v-else-if="col.name === 'nearest_expired_date'">
                  {{ $INDDate(props.row.nearest_expired_date) }}
                </div>
                <div v-else-if="col.name === 'far_expired_date'">
                  {{ $INDDate(props.row.far_expired_date) }}
                </div>
                <div v-else-if="col.name === 'on_hand'">
                  {{ $formatnumber(props.row.on_hand, 2, ',', '0', true) }}
                </div>
                <div v-else-if="col.name === 'on_demand'">
                  {{ $formatnumber(props.row.on_demand, 2, ',', '0', true) }}
                </div>
                <div v-else-if="col.name === 'on_order'">
                  {{ $formatnumber(props.row.on_order, 2, ',', '0', true) }}
                </div>
                <div v-else-if="col.name === 'on_delivery'">
                  {{ $formatnumber(props.row.on_delivery, 2, ',', '0', true) }}
                </div>
                <div v-else-if="col.name === 'on_request'">
                  {{ $formatnumber(props.row.on_request, 2, ',', '0', true) }}
                </div>
                <div v-else-if="col.name === 'minimum_stock'">
                  {{
                    $formatnumber(props.row.minimum_stock, 2, ',', '0', true)
                  }}
                </div>
                <div v-else-if="col.name === 'maximum_stock'">
                  {{
                    $formatnumber(props.row.maximum_stock, 2, ',', '0', true)
                  }}
                </div>
                <div v-else-if="col.name === 'is_hold'">
                  <q-checkbox
                    v-model="props.row.is_hold"
                    true-value="1"
                    false-value="0"
                    dense
                    disable
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
    <warehouse
      v-if="dlgWarehouse"
      :show="dlgWarehouse"
      warehouse_group=""
      :allgroup="1"
      @CloseData="getWarehouse"
    />
  </q-page>
</template>

<script>
import Warehouse from 'src/components/master/Warehouse.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { ymd } from 'boot/engine'

export default defineComponent({
  name: 'DistributionConfirm',
  components: { Warehouse },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()
    const status = ref('0')
    const location_id = ref(-1)
    const location_name = ref('')

    const loading = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')

    const pagination = ref({
      sortBy: 'item_name',
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
    const mode = ref('')

    const dlgWarehouse = ref(false)

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
          location_id: location_id.value,
          status: status.value,
          url: 'inventory/item/stock'
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

    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function runMethod(method, uuidrec = '') {
      this[method](uuidrec)
    }

    function getWarehouse(closed, data) {
      dlgWarehouse.value = closed

      if (typeof data.location_code !== 'undefined') {
        location_id.value = data.sysid
        location_name.value = data.location_name
        status.value = '0'
        loaddata()
      }
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
      data,
      title,
      filter,
      pagination,
      selected,
      columns,
      pagetitle,
      api_url,
      btns,
      access,
      runMethod,
      onRequest,
      loaddata,
      dlgWarehouse,
      getWarehouse,
      location_id,
      location_name,
      status
    }
  }
})
</script>
