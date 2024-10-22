<template>
  <q-dialog
    v-model="dlgWarehouse"
    persistent
  >
    <q-card
      square
      class="icard"
      style="width: 500px; max-width: 80vw"
    >
      <q-toolbar class="entry-caption">
        Gudang/Lokasi
        <q-space />
        <q-btn
          icon="close"
          dense
          outline
          flat
          rounded
          @click="closedata({})"
        />
      </q-toolbar>
      <q-card-section class="q-pa-xs">
        <q-input
          v-model="filter"
          square
          dense
          outlined
          debounce="500"
          placeholder="Pencarian"
        >
          <template v-slot:append>
            <q-icon
              name="search"
              size="sm"
              color="blue-10"
              @click="loaddata()"
            />
          </template>
        </q-input>
      </q-card-section>
      <q-table
        square
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="location_code"
        :filter="filter"
        separator="cell"
        selection="single"
        virtual-scroll
        dense
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        class="fit-table-ui-dialog"
        :loading="loading"
      >
        <template v-slot:loading>
          <q-inner-loading showing>
            <q-spinner-ball
              size="70px"
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
              class="bg-blue-grey-14 text-white"
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
                <div v-if="col.name === 'location_code'">
                  <span
                    class="text-primary cursor-pointer"
                    @click="selectdata(props.row.sysid)"
                  >
                    {{ props.row.location_code }}
                  </span>
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
      <q-card-section
        class="entry-caption q-pa-sm"
        align="right"
      >
        <q-btn
          no-caps
          label="Pilih"
          icon="check"
          flat
          class="q-mr-sm"
          @click="selectdata()"
        />
        <q-btn
          no-caps
          label="Tutup"
          icon="close"
          flat
          @click="closedata({})"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'warehouse',
  props: { show: Boolean, warehouse_group: String, allgroup: String },
  setup(props, context) {
    const $store = useStore()
    const dlgWarehouse = ref(false)
    const pagination = ref({
      sortBy: 'location_code',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })

    const filter = ref('')
    const selected = ref([])
    const columns = ref([
      {
        name: 'location_code',
        align: 'left',
        label: 'Kode',
        field: 'location_code',
        sortable: true
      },
      {
        name: 'location_name',
        align: 'left',
        label: 'Nama Lokasi',
        field: 'location_name',
        sortable: true
      },
      {
        name: 'warehouse_group',
        align: 'left',
        label: 'Tipe',
        field: 'warehouse_group',
        sortable: true
      }
    ])

    const vlastcolumn = ref('')
    const data = ref([])
    const loading = ref(false)
    const wh_group = ref('')
    const is_all = ref('0')

    function loaddata() {
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function selectdata(sysid = -1) {
      if (selected.value.length <= 0 && sysid === -1) {
        return 0
      }
      let row = null
      if (sysid !== -1) {
        data.value.forEach((el) => {
          if (sysid === el.sysid) {
            row = el
          }
        })
      } else {
        let item = selected.value[0]
        row = item
      }
      closedata(row)
    }

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter
      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading.value = true
      let payload = {
        page: page,
        limit: fetchCount,
        filter: filter,
        descending: descending,
        sortBy: sortBy,
        group_name: wh_group.value,
        all: is_all.value,
        is_active: true,
        url: 'master/inventory/warehouse'
      }
      data.value = []
      let respon = await $store.dispatch('master/GET_DATA', payload)
      loading.value = false

      data.value = respon.data
      pagination.value = {
        rowsNumber: respon.total,
        page: respon.current_page,
        sortBy: sortBy,
        descending: descending,
        rowsPerPage: respon.per_page
      }
    }

    function closedata(record) {
      dlgWarehouse.value = false
      filter.value = ''
      data.value = []
      context.emit('CloseData', false, record)
    }

    onMounted(async () => {
      dlgWarehouse.value = props.show
      wh_group.value = props.warehouse_group
      is_all.value = props.allgroup
      loaddata()
    })

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
      dlgWarehouse,
      wh_group,
      is_all
    }
  }
})
</script>
