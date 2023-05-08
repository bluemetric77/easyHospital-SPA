<template>
  <q-dialog
    v-model="dlgCOA"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card
      class="icard"
      bordered
      style="width: 800px; max-width: 80vw; max-height: 700px"
    >
      <q-bar class="entry-caption">
        <span>Master Akun</span>
        <q-space />
        <q-input
          v-model="filter"
          dense
          outline
          label-color="white"
          borderless
          placeholder="Pencarian"
          input-class="text-white"
          debounce="200"
        >
          <template v-slot:append>
            <q-icon
              name="search"
              color="white"
              size="xs"
            />
          </template>
        </q-input>
      </q-bar>
      <q-table
        square
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="account_no"
        :filter="filter"
        separator="cell"
        selection="single"
        virtual-scroll
        dense
        class="fit"
        table-style="min-height:302px; max-height: 450px"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
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
                <div v-if="col.name === 'account_no'">
                  <q-btn
                    :label="props.row.account_no"
                    no-caps
                    dense
                    flat
                    @click="selectdata(props.row.account_no)"
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
  name: 'coa',
  props: { show: Boolean, state: String },
  setup(props, context) {
    const $store = useStore()
    const dlgCOA = ref(false)
    const pagination = ref({
      sortBy: 'account_no',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })

    const filter = ref('')
    const selected = ref([])
    const columns = ref([
      {
        name: 'account_no',
        align: 'left',
        label: 'No. Akun',
        field: 'account_no',
        sortable: true
      },
      {
        name: 'account_name',
        align: 'left',
        label: 'Nama Akun',
        field: 'account_name',
        sortable: true
      },
      {
        name: 'clasification',
        align: 'left',
        label: 'Jenis',
        field: 'clasification',
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
    function selectdata(account = '') {
      if (selected.value.length > 0 || account !== '') {
        let row = null
        if (account !== '') {
          data.value.forEach((el) => {
            if (account === el.account_no) {
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
          url: 'master/accounting/coa/list'
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
      dlgCOA.value = false
      filter.value = ''
      data.value = []
      context.emit('CloseCOA', false, record)
    }

    onMounted(async () => {
      dlgCOA.value = props.show
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
      dlgCOA
    }
  }
})
</script>
