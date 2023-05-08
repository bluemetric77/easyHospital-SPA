<template>
  <q-page class="page-app">
    <q-card
      square
      class="icard q-mb-sm"
    >
      <q-bar class="entry-caption">
        <span><strong>Periode Akunting</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row">
          <q-input
            v-model="year_period"
            label="Periode Akunting"
            dense
            outlined
            stack-label
            square
            style="width: 300px"
          >
            <template v-slot:append>
              <q-btn
                label="Cek data"
                glossy
                rounded
                dense
                no-caps
                color="blue-grey-10"
                @click="loaddata()"
              />
            </template>
          </q-input>
          <q-space />
          <q-btn
            label="Simpan data"
            glossy
            rounded
            dense
            no-caps
            color="blue-grey-10"
            @click="save_data()"
          />
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
      </q-bar>
      <q-table
        square
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        :dense="$q.screen.md"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="fiscal_id"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
      >
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
                    @click="runMethod(btn.onclick, props.row.fiscal_id)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'is_closed'">
                  <q-checkbox
                    v-model="props.row.is_closed"
                    dense
                    true-value="1"
                    false-value="0"
                  />
                </div>
                <div v-else-if="col.name === 'start_date'">
                  <q-input
                    v-model="props.row.start_date"
                    dense
                    outlined
                    square
                    type="date"
                  />
                </div>
                <div v-else-if="col.name === 'end_date'">
                  <q-input
                    v-model="props.row.end_date"
                    dense
                    outlined
                    square
                    type="date"
                  />
                </div>
                <div v-else-if="col.name === 'update_timestamp'">
                  {{ $INDDateTime(props.row.update_timestamp) }}
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
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'

export default defineComponent({
  name: 'FiscalYear',
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const loading = ref(false)
    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')

    const pagination = ref({
      sortBy: 'fiscal_id',
      descending: false,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 15
    })
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const btn_loading = ref(false)
    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const year_period = ref('')

    async function save_data() {
      try {
        let app = {}
        app.data = data.value
        app.url = api_url.value.save
        loading.value = true
        let respon = await $store.dispatch('master/POST_DATA', app)
        if (!(typeof respon === 'undefined')) {
          let msg = respon.data
          if (respon.success) {
            $q.notify({
              color: 'positive',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
            loaddata()
          } else {
            $q.loading.hide()
            $q.notify({
              color: 'negative',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
          }
        }
      } finally {
        loading.value = false
      }
    }

    async function loaddata() {
      selected.value = []
      let props = {}
      props.year_period = year_period.value
      props.url = api_url.value.retrieve
      $store.dispatch('master/GET_DATA', props).then((response) => {
        data.value = response
      })
    }

    function runMethod(method, primary = '') {
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
    })

    return {
      loading,
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
      runMethod,
      loaddata,
      save_data,
      btn_loading,
      year_period
    }
  }
})
</script>
