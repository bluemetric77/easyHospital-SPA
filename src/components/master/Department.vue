<template>
  <q-dialog
    v-model="dlgDepartment"
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
        row-key="dept_code"
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
                <div v-if="col.name === 'dept_code'">
                  <span
                    class="text-primary cursor-pointer"
                    @click="selectdata(props.row.sysid)"
                  >
                    {{ props.row.dept_code }}
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
  name: 'depatment',
  props: { show: Boolean, enumtype: String },
  setup(props, context) {
    const $store = useStore()
    const dlgDepartment = ref(false)
    const lblcolumn = ref('Klinik')
    const pagination = ref({
      sortBy: 'dept_code',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })
    const title = ref('')
    const filter = ref('')
    const selected = ref([])
    const columns = ref([
      {
        name: 'dept_code',
        align: 'left',
        label: 'Kode',
        field: 'dept_code',
        sortable: true
      },
      {
        name: 'dept_name',
        align: 'left',
        label: lblcolumn.value,
        field: 'dept_name',
        sortable: true
      }
    ])

    const vlastcolumn = ref('')
    const data = ref([])
    const loading = ref(false)
    const group_name = ref('')

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
          group_name: group_name.value,
          is_active: true,
          url: 'setup/department'
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
      dlgDepartment.value = false
      filter.value = ''
      data.value = []
      context.emit('CloseData', false, record)
    }

    onMounted(async () => {
      dlgDepartment.value = props.show
      group_name.value = props.enumtype
      if (props.enumtype === 'PHARMACY') {
        title.value = 'Farmasi'
        lblcolumn.value = 'Lokasi Farmasi'
      } else if (props.enumtype === 'OUTPATIENT') {
        title.value = 'Rawat Jalan'
        lblcolumn.value = 'Nama Klinik'
      } else if (props.enumtype === 'DIAGNOSTIC') {
        title.value = 'Penunjang Medis'
        lblcolumn.value = 'Penunjang Medis'
      } else if (props.enumtype === 'MCU') {
        title.value = 'Medical Check Up'
        lblcolumn.value = 'Medical Checkup'
      } else if (props.enumtype === 'INPATIENT') {
        title.value = 'Pelayanan Rawat Inap'
        lblcolumn.value = 'Layanan Rawat Inap'
      } else if (props.enumtype === 'IGD') {
        title.value = 'Instalasi Gawat Darutat'
        lblcolumn.value = 'Layanan IGD'
      }
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
      dlgDepartment,
      group_name,
      title,
      lblcolumn,
      selectdata,
      onRequest,
      closedata
    }
  }
})
</script>
