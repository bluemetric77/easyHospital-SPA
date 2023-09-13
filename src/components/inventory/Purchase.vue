<template>
  <div>
    <q-dialog
      v-model="dlgShow"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card
        class="icard"
        style="width: 1000px; max-width: 80vw; max-height: 700px"
      >
        <q-bar class="entry-caption">
          Pembelian
          <q-space />
          <q-btn
            dense
            flat
            rounded
            icon="close"
            @click="closedata({})"
          />
        </q-bar>
        <q-card-section class="q-pa-sm">
          <div class="row items-center q-col-gutter-xs q-mb-xs">
            <div class="col-xs-6 col-sm-2">
              <q-input
                v-model="date1"
                type="date"
                dense
                class="q-mr-sm"
                label="Periode"
                outlined
                square
                @blur="loaddata()"
              />
            </div>
            <div class="col-xs-6 col-sm-2">
              <q-input
                v-model="date2"
                type="date"
                dense
                class="q-mr-sm"
                label="s/d"
                outlined
                square
                @blur="loaddata()"
              />
            </div>
            <div class="col-xs-12 col-sm-8">
              <q-input
                v-model="filter"
                dense
                square
                outlined
                label="Pencarian"
                debounce="500"
              >
                <template v-slot:append>
                  <q-icon
                    name="search"
                    color="green-10"
                    size="sm"
                    @click="loaddata()"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pa-xs">
          <q-table
            square
            :rows="data"
            :columns="columns"
            no-data-label="data kosong"
            no-results-label="data yang kamu cari tidak ditemukan"
            row-key="sysid"
            :filter="filter"
            separator="cell"
            selection="single"
            virtual-scroll
            dense
            class="fit-table-ui-dialog-with-parameter"
            v-model:selected="selected"
            v-model:pagination="pagination"
            binary-state-sort
            @request="onRequest"
            :loading="loading"
          >
            <template v-slot:loading>
              <q-inner-loading showing>
                <q-spinner-ios
                  size="70px"
                  color="primary"
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
                    <div v-if="col.name === 'doc_number'">
                      <q-btn
                        :label="props.row.doc_number"
                        :class="
                          props.row.is_posted === '1'
                            ? 'bg-green-10 text-white'
                            : props.row.is_void === '1'
                            ? 'bg-red-10 text-white'
                            : 'text-blue'
                        "
                        no-caps
                        dense
                        flat
                        @click="selectdata(props.row.uuid_rec)"
                      />
                    </div>
                    <div v-else-if="col.name === 'total'">
                      {{ $formatnumber(props.row.total) }}
                    </div>
                    <div v-else>
                      {{ col.value }}
                    </div>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ymd } from 'boot/engine'
import { defineComponent, ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'purcahse',
  props: { show: Boolean },
  setup(props, context) {
    const $store = useStore()
    const dlgShow = ref(false)
    const pagination = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })

    const filter = ref('')
    const selected = ref([])
    const date1 = ref(null)
    const date2 = ref(null)
    const columns = ref([
      {
        name: 'doc_number',
        align: 'left',
        label: 'No.Pemesanan',
        field: 'doc_number',
        sortable: true
      },
      {
        name: 'invoice_number',
        align: 'left',
        label: 'Referensi',
        field: 'invoice_number',
        sortable: true
      },
      {
        name: 'ref_date',
        align: 'left',
        label: 'Tanggal',
        field: 'ref_date',
        sortable: true
      },
      {
        name: 'due_date',
        align: 'left',
        label: 'Jatuh Tempo',
        field: 'due_date',
        sortable: false
      },
      {
        name: 'partner_name',
        align: 'left',
        label: 'Supplier',
        field: 'partner_name',
        sortable: true
      },
      {
        name: 'total',
        align: 'right',
        label: 'Total',
        field: 'total',
        sortable: false
      },
      {
        name: 'location_name',
        align: 'left',
        label: 'Lokasi',
        field: 'location_name',
        sortable: true
      },
      {
        name: 'order_number',
        align: 'left',
        label: 'No.Pemesanan',
        field: 'order_number',
        sortable: true
      },
      {
        name: 'payable_number',
        align: 'left',
        label: 'Invoice Hutang',
        field: 'payable_number',
        sortable: true
      }
    ])

    const vlastcolumn = ref('')
    const data = ref([])
    const loading = ref(false)

    async function loaddata() {
      await onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }
    function selectdata(uuid = '') {
      if (selected.value.length > 0 || uuid !== '') {
        let row = null
        if (uuid !== '') {
          data.value.forEach((el) => {
            if (uuid === el.uuid_rec) {
              row = el
            }
          })
        } else {
          let item = selected.value[0]
          row = item
        }
        closedata(row)
      }
    }

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading.value = true
      try {
        let prop = {
          page: page,
          limit: fetchCount,
          filter: filter,
          descending: descending,
          sortBy: sortBy,
          date1: date1.value,
          date2: date2.value,
          url: 'inventory/purchase/receive'
        }
        let respon = await $store.dispatch('master/GET_DATA', prop)
        data.value = respon.data
        pagination.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          sortBy: sortBy,
          descending: descending,
          rowsPerPage: respon.per_page
        }
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    function closedata(record) {
      dlgShow.value = false
      filter.value = ''
      data.value = []
      context.emit('CloseReceive', false, record)
    }
    function loaddata() {
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    onMounted(async () => {
      dlgShow.value = props.show
      let skrng = new Date()
      date1.value = ymd(skrng)
      date2.value = ymd(skrng)
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
      dlgShow,
      loaddata,
      date1,
      date2
    }
  }
})
</script>
