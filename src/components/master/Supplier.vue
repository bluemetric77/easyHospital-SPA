<template>
  <q-dialog
    v-model="dlgSupplier"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card
      square
      class="icard"
      style="width: 500px; max-width: 80vw"
    >
      <q-bar class="entry-caption">
        Data Supplier
        <q-space />
        <q-icon
          name="close"
          size="sm"
          flat
          @click="closedata()"
        />
      </q-bar>
      <q-card-section class="q-pa-xs">
        <div class="row items-start">
          <q-input
            v-model="filter"
            square
            dense
            outlined
            debounce="500"
            label-color="white"
            placeholder="Pencarian"
            class="full-width"
          >
            <template v-slot:append>
              <q-icon
                name="search"
                color="green-10"
                size="sm"
              />
            </template>
          </q-input>
        </div>
      </q-card-section>
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
                <div v-if="col.name === 'supplier_code'">
                  <span
                    class="btn-link cursor-pointer"
                    @click="selectdata(props.row.sysid)"
                  >
                    {{ props.row.supplier_code }}
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
          color="positive"
          icon="check"
          flat
          class="q-mr-sm"
          @click="selectdata()"
        />
        <q-btn
          no-caps
          color="negative"
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
  name: 'manufactur',
  props: { show: Boolean },
  setup(props, context) {
    const $store = useStore()
    const dlgSupplier = ref(false)
    const pagination = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })

    const filter = ref('')
    const selected = ref([])
    const columns = ref([
      {
        name: 'supplier_code',
        align: 'left',
        label: 'Kode',
        field: 'supplier_code',
        sortable: true
      },
      {
        name: 'supplier_name',
        align: 'left',
        label: 'Nama Supplier/Vendor',
        field: 'supplier_name',
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
    function selectdata(sysid = -1) {
      if (selected.value.length > 0 || sysid !== -1) {
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
          is_active: true,
          url: 'master/inventory/supplier'
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
      dlgSupplier.value = false
      filter.value = ''
      data.value = []
      context.emit('CloseData', false, record)
    }

    onMounted(async () => {
      dlgSupplier.value = props.show
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
      dlgSupplier
    }
  }
})
</script>
