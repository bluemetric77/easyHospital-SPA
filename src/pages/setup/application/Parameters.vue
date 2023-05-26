<template>
  <q-page class="page-app">
    <q-card
      square
      class="icard q-mb-sm"
    >
      <q-bar class="entry-caption">
        <span>
          <strong>{{ pagetitle }}</strong>
        </span>
        <q-space />
        <q-input
          v-model="filter"
          dark
          standout
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
              class="cursor-pointer"
              color="white"
              size="sm"
              @click="filter = ''"
            />
          </template>
        </q-input>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-center">
          <div class="col-5">
            <q-select
              v-model="groups"
              dense
              outlined
              stack-label
              label="Grup parameter"
              square
              :options="paramgroups"
              option-value="key_groups"
              option-label="key_groups"
              emit-value
              map-options
              options-dense
              @update:model-value="loaddata()"
            />
          </div>
        </div>
      </q-card-section>
      <q-table
        class="fit-table-ui-with-parameter-0 grid-tables"
        square
        dense
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        no-results-label="Data yang cari tidak ditemukan"
        row-key="key_word"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        virtual-scroll
        :loading="loading"
        @request="onRequest"
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
                    v-show="btn.is_show && btn.is_allowed"
                    :key="index"
                    class="q-mr-xs"
                    :name="btn.icon"
                    size="xs"
                    color="green-9"
                    dense
                    @click="runMethod(btn.onclick, props.row.key_word)"
                  />
                </div>
                <div v-else-if="col.name === 'key_descriptions'">
                  <q-input
                    v-model="props.row.key_descriptions"
                    autogrow
                    dense
                    borderless
                    readonly
                    class="full-width"
                  />
                </div>
                <div v-else-if="col.name === 'value'">
                  <div v-if="props.row.key_type === 'C'">
                    <div v-if="props.row.key_ref === 'PASSWORD'">
                      **********
                    </div>
                    <div v-else-if="props.row.key_ref === 'TEXT'">
                      <q-input
                        v-model="props.row.key_value_nvarchar"
                        autogrow
                        dense
                        borderless
                        readonly
                      />
                    </div>
                    <div v-else>
                      {{ props.row.key_value_nvarchar }}
                    </div>
                  </div>
                  <div v-else-if="props.row.key_type === 'D'">
                    {{ $INDDate(props.row.key_value_date) }}
                  </div>
                  <div v-else-if="props.row.key_type === 'N'">
                    {{ props.row.key_value_decimal }}
                  </div>
                  <div v-else-if="props.row.key_type === 'I'">
                    {{ props.row.key_value_integer }}
                  </div>
                  <div v-else-if="props.row.key_type === 'B'">
                    <q-checkbox
                      v-model="props.row.key_value_boolean"
                      true-value="1"
                      false-value="0"
                      dense
                      disable
                    />
                  </div>
                </div>
                <div v-else-if="col.name === 'update_date'">
                  {{ $INDDateTime2(props.row.update_date) }}
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
      <q-toolbar
        insert
        class="main-toolbar"
      >
        <q-btn
          v-for="(btn, index) in btns"
          v-show="btn.is_allowed"
          :key="index"
          flat
          dense
          no-caps
          class="btn-toolbar q-mr-sm"
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

    <q-dialog
      v-model="dlgParameter"
      persistent
    >
      <q-card
        class="icard"
        flat
        square
        style="width: 700px; max-width: 90vw"
      >
        <q-bar class="entry-caption q-pa-md">
          Ubah Parameter
          <q-space />
          <q-btn
            v-close-popup
            icon="close"
            no-caps
            size="sm"
            dense
            flat
            class="mouse-pointer"
          />
        </q-bar>
        <q-card-section class="q-pa-sm">
          <div class="row items-start q-mb-sm">
            <div class="col-4">
              <q-input
                v-model="edit.key_word"
                dense
                outlined
                stack-label
                label="Kode"
                square
                readonly
              />
            </div>
          </div>
          <div class="row items-start q-mb-sm">
            <div class="col-12">
              <q-input
                v-model="edit.key_descriptions"
                dense
                outlined
                stack-label
                label="Keterangan"
                square
                readonly
              />
            </div>
          </div>
          <div
            v-show="edit.key_type === 'C'"
            class="row items-start q-mb-sm"
          >
            <div class="col-12">
              <div v-if="edit.key_ref === ''">
                <q-input
                  v-model="edit.key_value_nvarchar"
                  dense
                  outlined
                  stack-label
                  label="Nilai"
                  square
                />
              </div>
              <div v-else-if="edit.key_ref === 'SELECT'">
                <q-select
                  v-model="edit.key_value_nvarchar"
                  dense
                  outlined
                  stack-label
                  label="Nilai"
                  square
                  :options="parameters"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  options-dense
                />
              </div>
              <div v-else-if="edit.key_ref === 'PASSWORD'">
                <q-input
                  v-model="edit.key_value_nvarchar"
                  dense
                  outlined
                  stack-label
                  label="Nilai"
                  square
                  type="password"
                />
              </div>
              <div v-else-if="edit.key_ref === 'TEXT'">
                <q-input
                  v-model="edit.key_value_nvarchar"
                  dense
                  outlined
                  stack-label
                  label="Nilai"
                  square
                  type="textarea"
                />
              </div>
            </div>
          </div>
          <div
            v-show="edit.key_type === 'D'"
            class="row items-start q-mb-sm"
          >
            <div class="col-6">
              <q-input
                v-model="edit.key_value_date"
                dense
                outlined
                stack-label
                label="Nilai"
                square
                type="Date"
              />
            </div>
          </div>
          <div
            v-show="edit.key_type === 'I'"
            class="row items-start q-mb-sm"
          >
            <div class="col-3">
              <q-field
                v-model="edit.key_value_integer"
                dense
                outlined
                label="Nilai"
                square
                stack-label
              >
                <template v-slot:control="{ id, value, emitValue }">
                  <vue-numeric
                    :id="id"
                    :precision="0"
                    :value="value"
                    thousand-separator="."
                    decimal-separator=","
                    class="q-field__input text-right"
                    @input="emitValue"
                  />
                </template>
              </q-field>
            </div>
          </div>
          <div
            v-show="edit.key_type === 'B'"
            class="row items-start q-mb-sm"
          >
            <div class="col-6">
              <q-checkbox
                v-model="edit.key_value_boolean"
                true-value="1"
                false-value="0"
                dense
                label="Ya"
              />
            </div>
          </div>
          <div
            v-show="edit.key_type === 'N'"
            class="row items-start q-mb-sm"
          >
            <div class="col-3">
              <q-field
                v-model="edit.key_value_decimal"
                dense
                outlined
                label="Nilai"
                square
                stack-label
              >
                <template v-slot:control="{ id, value, emitValue }">
                  <vue-numeric
                    :id="id"
                    :precision="3"
                    :value="value"
                    thousand-separator="."
                    decimal-separator=","
                    class="q-field__input text-right"
                    @input="emitValue"
                  />
                </template>
              </q-field>
            </div>
          </div>
        </q-card-section>

        <q-card-section
          class="dialog-action"
          align="right"
        >
          <q-btn
            flat
            no-caps
            label="Simpan"
            icon="save"
            class="q-mr-sm"
            @click="save_event()"
          />
          <q-btn
            v-close-popup
            flat
            no-caps
            label="Batal"
            icon="undo"
            class="text-red"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'Analyzer',
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()
    const data = ref([])
    const edit = ref({})
    const is_suspend = ref(1)
    const title = ref('Tambah Data')
    const filter = ref('')
    const operation = ref('none')
    const pagination = ref({
      sortBy: 'key_word',
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })
    const groups = ref('')
    const paramgroups = ref([])
    const selected = ref([])
    const columns = ref([])
    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const dlgParameter = ref(false)
    const parameters = ref([])
    const url = ref('')
    const jwt = ref('')
    const loading = ref(false)

    function localdatetime(value) {
      return $INDDateTime(value)
    }

    function runMethod(method, keyword = '') {
      this[method](keyword)
    }

    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    async function onRequest(props) {
      var { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      var filter = props.filter

      var fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading.value = true
      try {
        var prop = {}
        prop.page = page
        prop.limit = fetchCount
        prop.filter = filter
        prop.sortBy = sortBy
        prop.descending = descending
        prop.url = api_url.value.retrieve
        prop.groups = groups.value
        var respon = await $store.dispatch('master/GET_DATA', prop)
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

    async function edit_event(keyword = '') {
      if (selected.value.length > 0 || !(keyword === '')) {
        operation.value = 'updated'
        if (keyword === '') {
          var item = selected.value[0]
          keyword = item.key_word
        }
        try {
          var props = {}
          props.url = api_url.value.edit
          props.keyword = keyword
          var respon = await $store.dispatch('master/GET_DATA', props)
          if (!(typeof respon === 'undefined')) {
            dlgParameter.value = true
            edit.value = respon
            parameters.value = []
            if (edit.value.key_ref === 'SELECT') {
              parameters.value = JSON.parse(edit.value.key_ref_value)
            }
          }
        } finally {
        }
      }
    }

    async function save_event() {
      $q.loading.show({ delay: 100 })
      try {
        var app = {}
        let valueparameters = ''
        if (edit.value.key_type === 'C') {
          valueparameters = edit.value.key_value_nvarchar
        } else if (edit.value.key_type === 'I') {
          valueparameters = edit.value.key_value_integer
        } else if (edit.value.key_type === 'N') {
          valueparameters = edit.value.key_value_decimal
        } else if (edit.value.key_type === 'D') {
          valueparameters = edit.value.key_value_date
        } else if (edit.value.key_type === 'B') {
          valueparameters = edit.value.key_value_boolean
        }
        app.data = {
          key_word: edit.value.key_word,
          value: valueparameters
        }
        app.url = api_url.value.save
        var respon = await $store.dispatch('master/POST_DATA', app)
        if (!(typeof respon === 'undefined')) {
          var msg = respon.data
          if (respon.success) {
            dlgParameter.value = false
            $q.notify({
              color: 'green-8',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
            loaddata()
          } else {
            $q.notify({
              color: 'red-10',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
          }
        }
      } finally {
        $q.loading.hide()
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

      let props = {}
      props.url = 'setup/application/parameter/group'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        paramgroups.value = response
      })
      loaddata()
    })

    return {
      data,
      edit,
      is_suspend,
      title,
      filter,
      operation,
      pagination,
      selected,
      columns,
      pagetitle,
      api_url,
      btns,
      access,
      dlgParameter,
      parameters,
      url,
      jwt,
      loading,
      loaddata,
      onRequest,
      edit_event,
      runMethod,
      localdatetime,
      save_event,
      paramgroups,
      groups
    }
  }
})
</script>
