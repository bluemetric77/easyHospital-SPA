<template>
  <q-dialog
    v-model="dlgPartner"
    persistent
    transition-show="scale"
    transition-hide="scale"
    full-width
  >
    <q-card
      square
      class="icard"
      style="width: 800px; max-width: 80vw; max-height: 700px"
    >
      <q-bar class="entry-caption">
        <span>Partner</span>
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
        row-key="partner_id"
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
                <div v-if="col.name === 'partner_id'">
                  <q-btn
                    :label="props.row.partner_id"
                    no-caps
                    dense
                    glossy
                    @click="selectdata(props.row.partner_id)"
                    class="bg-green-10 text-white"
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
  name: 'partner',
  props: { show: Boolean, state: String },
  setup(props, context) {
    const $store = useStore()
    const dlgPartner = ref(false)
    const pagination = ref({
      sortBy: 'partner_id',
      descending: false,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })

    const filter = ref('')
    const selected = ref([])
    const columns = ref([
      {
        name: 'partner_id',
        align: 'left',
        label: 'Kode',
        field: 'partner_id',
        sortable: true
      },
      {
        name: 'partner_name',
        align: 'left',
        label: 'Nama Partner',
        field: 'partner_name',
        sortable: true
      },
      {
        name: 'partner_address',
        align: 'left',
        label: 'Alamat',
        field: 'partner_address'
      }
    ])

    const vlastcolumn = ref('')
    const data = ref([])
    const loading = ref(false)
    const enum_partner = ref('')

    async function loaddata() {
      await onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }
    function selectdata(partner_id = '') {
      if (selected.value.length > 0 || partner_id !== '') {
        let row = null
        if (partner_id !== '') {
          data.value.forEach((el) => {
            if (partner_id === el.partner_id) {
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
          enum: enum_partner.value,
          url: 'master/partner/partner/open'
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
      dlgPartner.value = false
      filter.value = ''
      data.value = []
      context.emit('ClosePartner', false, record)
    }

    onMounted(async () => {
      dlgPartner.value = props.show
      enum_partner.value = props.state
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
      dlgPartner,
      enum_partner
    }
  }
})
</script>
