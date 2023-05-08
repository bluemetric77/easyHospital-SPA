<template>
  <q-dialog
    v-model="dlgPriceClass"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card
      square
      class="icard"
      style="width: 500px; max-width: 80vw"
    >
      <q-toolbar class="entry-caption">
        <strong>{{ title }}</strong>
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
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="price_code"
        :filter="filter"
        separator="cell"
        selection="single"
        virtual-scroll
        dense
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        class="fit-table-dialog"
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
                <div v-if="col.name === 'price_code'">
                  <span
                    class="text-primary cursor-pointer"
                    @click="selectdata(props.row.sysid)"
                  >
                    {{ props.row.price_code }}
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
  name: 'priceclass',
  props: { show: Boolean, enumtype: String },
  setup(props, context) {
    const $store = useStore()
    const dlgPriceClass = ref(false)
    const pagination = ref({
      sortBy: 'price_code',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })
    const title = ref('Kelas Tarif/Perawatan')
    const filter = ref('')
    const selected = ref([])
    const columns = ref([
      {
        name: 'price_code',
        align: 'left',
        label: 'Kelas',
        field: 'price_code',
        sortable: true
      },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Keterangan',
        field: 'descriptions',
        sortable: true
      },
      {
        name: 'sort_name',
        align: 'left',
        label: 'Singkatan',
        field: 'sort_name',
        sortable: true
      }
    ])

    const vlastcolumn = ref('')
    const data = ref([])
    const loading = ref(false)
    const models = ref('')

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
          models: models.value,
          url: 'setup/class/open'
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
      dlgPriceClass.value = false
      filter.value = ''
      data.value = []
      context.emit('CloseData', false, record)
    }

    onMounted(async () => {
      dlgPriceClass.value = props.show
      models.value = props.enumtype
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
      dlgPriceClass,
      models,
      title,
      selectdata,
      onRequest,
      closedata
    }
  }
})
</script>
