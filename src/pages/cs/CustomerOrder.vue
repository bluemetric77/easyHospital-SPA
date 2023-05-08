<template>
  <q-page class="page-app">
    <q-card
      v-show="!stateform"
      square
      class="icard q-mb-sm"
    >
      <q-bar class="entry-caption">
        <span><strong>Konsumen</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-start q-col-gutter-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="date1"
              dense
              outlined
              square
              label="Tanggal Mulai"
              type="date"
              stack-label
            />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-input
              v-model="date2"
              dense
              outlined
              square
              label="s.d Tanggal"
              type="date"
              stack-label
            />
          </div>
          <div class="col-xs-12 offset-sm-4 col-sm-2 offset-md-6 col-md-2">
            <q-btn-toggle
              v-model="all"
              color="blue-grey-14"
              text-color="white"
              toggle-color="orange"
              toggle-text-color="primary"
              unelevated
              dense
              glossy
              no-caps
              spread
              :options="[
                { label: 'Semua', value: '1' },
                { label: 'Belum planning', value: '0' }
              ]"
              @click="loaddata()"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card
      v-show="!stateform"
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
          debounce="300"
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
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        :dense="$q.screen.md"
        no-results-label="data yang kamu cari ttransidak ditemukan"
        row-key="transid"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        :loading="loading"
        virtual-scroll
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
                    @click="runMethod(btn.onclick, props.row.transid)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'order_no'">
                  <span
                    :class="
                      props.row.order_status === 'Close'
                        ? 'q-pa-xs bg-green text-white'
                        : props.row.order_status === 'Cancel'
                        ? 'q-pa-xs bg-red-10 text white'
                        : 'bg-white text-black'
                    "
                    >{{ props.row.order_no }}</span
                  >
                </div>
                <div v-else-if="col.name === 'work_order_no'">
                  <span
                    :class="
                      props.row.is_closed_expense === '1'
                        ? 'q-pa-xs bg-green text-white'
                        : props.row.order_status === 'Cancel'
                        ? 'q-pa-xs bg-red-10 text white'
                        : 'bg-white text-black'
                    "
                    >{{ props.row.work_order_no }}</span
                  >
                </div>
                <div v-else-if="col.name === 'is_closed_order'">
                  <q-checkbox
                    v-model="props.row.is_closed_order"
                    true-value="1"
                    false-value="0"
                    dense
                    disable
                  />
                </div>
                <div v-else-if="col.name === 'is_closed_expense'">
                  <q-checkbox
                    v-model="props.row.is_closed_expense"
                    true-value="1"
                    false-value="0"
                    dense
                    disable
                  />
                </div>
                <div v-else-if="col.name === 'price'">
                  {{ $formatnumber(props.row.price) }}
                </div>
                <div v-else-if="col.name === 'standart_price'">
                  {{ $formatnumber(props.row.standart_price) }}
                </div>
                <div v-else-if="col.name === 'fleet_cost'">
                  {{ $formatnumber(props.row.fleet_cost) }}
                </div>
                <div v-else-if="col.name === 'order_date'">
                  {{ $INDDate(props.row.order_date) }}
                </div>
                <div v-else-if="col.name === 'planning_date'">
                  {{ $INDDate(props.row.planning_date) }}
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

    <!-- Dialog Data Location-->
    <q-card
      v-show="stateform"
      class="icard"
      square
    >
      <q-bar class="entry-caption">
        {{ title }}
        <q-space />
      </q-bar>

      <q-card-section class="q-gutter-sm">
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-4 col-md-2">
            <q-select
              v-model="edit.pool_code"
              :options="pools"
              outlined
              dense
              options-dense
              label="Pool kendaraan"
              option-value="pool_code"
              option-label="pool_name"
              emit-value
              map-options
              fill-input
              stack-label
              square
            />
          </div>
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input
              v-model="edit.order_no"
              dense
              outlined
              square
              label="No.Order"
              stack-label
              disable
            />
          </div>
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-select
              v-model="edit.order_type"
              dense
              outlined
              square
              label="Tipe Order"
              stack-label
              :options="['RITASE', 'TONASE']"
              options-dense
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input
              v-model="edit.order_date"
              dense
              outlined
              square
              label="Tgl.Order"
              stack-label
              type="date"
            />
          </div>
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-input
              v-model="edit.order_time"
              dense
              outlined
              square
              label="Jam.Order"
              stack-label
              type="time"
            />
          </div>
          <div class="col-xs-12 col-sm-4 col-md-2">
            <q-select
              v-model="edit.work_type"
              dense
              outlined
              square
              label="Tipe Pekerjaan"
              stack-label
              :options="['EXPORT', 'IMPORT', 'DOMESTIC', 'CARGO', 'POK']"
              options-dense
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-8 col-md-3">
            <q-input
              v-model="edit.partner_name"
              dense
              outlined
              square
              label="Nama Konsumen"
              stack-label
              placeholder="Klik tombol untuk mencari nama konsumen"
              readonly
            >
              <template v-slot:append>
                <q-icon
                  name="search"
                  color="blue-grey-10"
                  size="xs"
                  @click="open_customer()"
                />
              </template>
            </q-input>
          </div>
          <div class="col-xs-12 col-sm-4 col-md-3">
            <q-input
              v-model="edit.customer_no"
              dense
              outlined
              square
              label="Nomor order konsumen"
              stack-label
            />
          </div>
        </div>
        <div
          class="row items-start q-col-gutter-sm q-mb-sm"
          v-show="edit.partner_id === '2103'"
        >
          <div class="col-xs-12 col-sm-12 col-md-6">
            <q-input
              v-model="edit.customer_name"
              dense
              outlined
              square
              label="Nama Konsumen"
              stack-label
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-input
              v-model="edit.route_name"
              dense
              outlined
              square
              label="Rute operasional"
              stack-label
              placeholder="Klik tombol untuk mencari rute operasional"
              readonly
            >
              <template v-slot:append>
                <q-icon
                  name="search"
                  color="blue-grey-10"
                  size="xs"
                  @click="Open_routes()"
                />
              </template>
            </q-input>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-select
              v-model="edit.vehicle_type"
              :options="vehicle_types"
              outlined
              dense
              options-dense
              label="Jenis kendaraan/unit"
              option-value="vehicle_type"
              option-label="vehicle_type_name"
              emit-value
              map-options
              fill-input
              stack-label
              square
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-input
              v-model="edit.origins"
              dense
              outlined
              square
              label="Asal"
              stack-label
              disable
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-input
              v-model="edit.destination"
              dense
              outlined
              square
              label="Tujuan"
              stack-label
              disable
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-input
              v-model="edit.warehouse"
              dense
              outlined
              square
              label="Pabrik/Gudang asal"
              stack-label
            />
          </div>
          <div class="col-xs-12 col-sm-6 col-md-3">
            <q-input
              v-model="edit.warehouse_destination"
              dense
              outlined
              square
              label="Pabrik/Gudang tujuan"
              stack-label
            />
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-4 col-sm-4 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.price"
              label="Tarif"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.price"
                  class="q-field__input text-right"
                  separator="."
                  :precision="0"
                  @input="edit.standart_price = edit.price * edit.qty"
                />
              </template>
            </q-field>
          </div>
          <div class="col-xs-4 col-sm-4 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.qty"
              label="Jumlah"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.qty"
                  class="q-field__input text-right"
                  separator="."
                  :precision="0"
                  @input="edit.standart_price = edit.price * edit.qty"
                />
              </template>
            </q-field>
          </div>
          <div class="col-xs-4 col-sm-4 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.standart_price"
              label="Net Tarif"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.standart_price"
                  class="q-field__input text-right"
                  separator="."
                  :precision="0"
                  disable
                />
              </template>
            </q-field>
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-4 col-sm-4 col-md-2">
            <q-input
              v-model="edit.planning_date"
              dense
              outlined
              square
              label="Tgl.Kegiatan"
              stack-label
              type="date"
            />
          </div>
          <div class="col-xs-4 col-sm-4 col-md-2">
            <q-input
              v-model="edit.planning_time"
              dense
              outlined
              square
              label="Jam Kegiatan"
              stack-label
              type="time"
            />
          </div>
          <div class="col-xs-4 col-sm-4 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.fleet_cost"
              label="Biaya Operasional"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.fleet_cost"
                  class="q-field__input text-right"
                  separator="."
                  :precision="0"
                  disable
                />
              </template>
            </q-field>
          </div>
        </div>
        <div
          class="row items-start q-col-gutter-sm q-mb-sm"
          v-show="edit.order_no === '(NEW)'"
        >
          <div class="col-xs-4 col-sm-4 col-md-2">
            <q-field
              square
              outlined
              stack-label
              dense
              :model-value="edit.order_qty"
              label="Jml. Order"
            >
              <template v-slot:control>
                <vue-numeric
                  v-model="edit.order_qty"
                  class="q-field__input text-right"
                  separator="."
                  :precision="0"
                  disable
                />
              </template>
            </q-field>
          </div>
        </div>
        <div class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-xs-12 col-sm-12 col-md-6">
            <q-input
              v-model="edit.descriptions"
              dense
              outlined
              square
              label="Keterangan"
              stack-label
              type="textarea"
            />
          </div>
        </div>
      </q-card-section>
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
          v-show="btn.is_allowed && !stateform"
          class="btn-toolbar q-mr-xs"
          :icon="btn.icon"
          :label="btn.caption"
          @click="runMethod(btn.onclick)"
        >
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
        <q-btn
          dense
          no-caps
          flat
          v-show="stateform"
          class="btn-toolbar q-mr-xs"
          icon="save"
          label="Simpan"
          @click="save_data()"
        >
          <q-tooltip content-class="tooltips-app"> Simpan data </q-tooltip>
        </q-btn>
        <q-btn
          dense
          no-caps
          flat
          v-show="stateform"
          class="btn-toolbar q-mr-xs"
          icon="undo"
          label="Batal"
          @click="stateform = false"
        >
          <q-tooltip content-class="tooltips-app"> Batal </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-page-sticky>

    <q-dialog
      v-model="dlgCancel"
      persistent
    >
      <q-card
        class="icard"
        style="min-width: 600px"
      >
        <q-bar class="entry-caption"
          >Pembatalan reservasi
          <q-space />
          <q-btn
            dense
            glossy
            rounded
            icon="close"
            color="red-10"
            size="xs"
            v-close-popup
          />
        </q-bar>
        <q-card-section class="q-gutter-sm">
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-select
                v-model="edit.pool_code"
                :options="pools"
                outlined
                dense
                options-dense
                label="Pool kendaraan"
                option-value="pool_code"
                option-label="pool_name"
                emit-value
                map-options
                fill-input
                stack-label
                square
                disable
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.order_no"
                dense
                outlined
                square
                label="No.Order"
                stack-label
                disable
              />
            </div>
            <div class="col-4">
              <q-select
                v-model="edit.order_type"
                dense
                outlined
                square
                label="Tipe Order"
                stack-label
                :options="['RITASE', 'TONASE']"
                options-dense
                disable
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-input
                v-model="edit.order_date"
                dense
                outlined
                square
                label="Jam Order"
                stack-label
                type="date"
                disable
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.order_time"
                dense
                outlined
                square
                label="Tgl.Order"
                stack-label
                type="time"
                disable
              />
            </div>
            <div class="col-4">
              <q-select
                v-model="edit.work_type"
                dense
                outlined
                square
                label="Tipe Pekerjaan"
                stack-label
                :options="['EXPORT', 'IMPORT', 'DOMESTIC', 'CARGO', 'POK']"
                options-dense
                disable
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-8">
              <q-input
                v-model="edit.partner_name"
                dense
                outlined
                square
                label="Nama Konsumen"
                stack-label
                placeholder="Klik tombol untuk mencari nama konsumen"
                disable
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.customer_no"
                dense
                outlined
                square
                label="Nomor order konsumen"
                stack-label
                disable
              />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-select
                v-model="edit.reason"
                dense
                outlined
                square
                label="Alasan Pembatatalan"
                stack-label
                :options="[
                  'Unit tidak ada',
                  'Pengemudi tidak ada',
                  'Salah reservasi',
                  'Lain-Lain'
                ]"
                options-dense
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section
          class="q-pa-sm entry-caption"
          align="right"
        >
          <q-btn
            label="Pembatalan reservasi"
            no-caps
            dense
            glossy
            icon="cancel"
            @click="cancel_order()"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="dlgRoute"
      persistent
    >
      <q-card
        class="icard"
        style="min-width: 600px"
      >
        <q-bar class="entry-caption"
          >Route Operasional - {{ edit.partner_name }}
          <q-space />
          <q-input
            v-model="filter_routes"
            dense
            outline
            debounce="300"
            label-color="white"
            borderless
            placeholder="Pencarian"
            input-class="text-white"
          >
            <template v-slot:append>
              <q-icon
                name="search"
                color="white"
                size="sm"
              />
            </template>
          </q-input>
        </q-bar>
        <q-table
          square
          :rows="routes"
          :columns="col_routes"
          no-data-label="data kosong"
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="id"
          separator="cell"
          selection="single"
          virtual-scroll
          dense
          class="fit"
          table-style="min-height:302px; max-height: 350px"
          v-model:selected="sel_routes"
          v-model:pagination="pg_routes"
          binary-state-sort
          @request="onRequestRoutes"
          :loading="loading_routes"
          :filter="filter_routes"
        >
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
          <template v-slot:loading>
            <q-inner-loading showing>
              <q-spinner-ball
                size="75px"
                color="red-10"
              />
            </q-inner-loading>
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
                  <div
                    v-if="col.name === 'origins' || col.name === 'destinations'"
                  >
                    <q-btn
                      :label="col.value"
                      no-caps
                      dense
                      flat
                      @click="change_routes(props.row.id)"
                    />
                  </div>
                  <div v-else-if="col.name === 'fleet_price'">
                    {{ $formatnumber(props.row.fleet_price) }}
                  </div>
                  <div v-else-if="col.name === 'stanart_cost'">
                    {{ $formatnumber(props.row.stanart_cost) }}
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
            @click="change_routes(-1)"
          />
          <q-btn
            no-caps
            color="negative"
            label="Tutup"
            icon="close"
            flat
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <partner
      v-if="dlgPartner"
      :show="dlgPartner"
      state="C"
      @ClosePartner="getPartner"
    />
  </q-page>
</template>

<script>
import partner from 'components/Partner.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'

export default defineComponent({
  name: 'CustomerOrder',
  components: { partner },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const loading = ref(false)
    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')
    const stateform = ref(false)

    const pagination = ref({
      sortBy: 'order_date',
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20
    })
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const btn_loading = ref(false)
    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})

    const dlgPartner = ref(false)
    const all = ref('1')
    const pools = ref([])
    const date1 = ref(null)
    const date2 = ref(null)
    const vehicle_types = ref([])
    const routes = ref([])
    const dlgCancel = ref(false)
    const dlgRoute = ref(false)
    const pg_routes = ref({
      sortBy: 'id',
      descending: false,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 20
    })
    const sel_routes = ref([])
    const col_routes = ref([
      {
        name: 'vehicle_type',
        align: 'left',
        label: 'Type Unit',
        field: 'vehicle_type',
        sortable: true
      },
      {
        name: 'origins',
        align: 'left',
        label: 'Asal',
        field: 'origins',
        sortable: true
      },
      {
        name: 'destinations',
        align: 'left',
        label: 'Tujuan',
        field: 'destinations',
        sortable: true
      },
      {
        name: 'fleet_price',
        align: 'right',
        label: 'Tarif',
        field: 'fleet_price'
      },
      { name: 'eta', align: 'right', label: 'ETA', field: 'eta' },
      {
        name: 'standart_cost',
        align: 'right',
        label: 'Biaya Ops',
        field: 'standart_cost'
      }
    ])
    const loading_routes = ref(false)
    const filter_routes = ref('')
    const tab = ref('order')

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
          date1: date1.value,
          date2: date2.value,
          all: all.value,
          url: api_url.value.retrieve
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

    async function onRequestRoutes(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading_routes.value = true
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          partner_id: edit.value.partner_id,
          url: 'customer-service/customer-price/open'
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        routes.value = respon.data
        pg_routes.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending
        }
      } catch (error) {
      } finally {
        loading_routes.value = false
      }
    }

    async function add_event() {
      let skrng = new Date()
      loading.value = false
      stateform.value = true
      title.value = 'Buat Reservasi Order'
      edit.value = {
        transid: -1,
        order_no: '(NEW)',
        partner_id: '',
        partner_name: '',
        customer_name: '',
        route_id: null,
        route_name: '',
        pool_code: '',
        vehicle_type: '',
        origins: '',
        destination: '',
        order_date: skrng.toLocaleDateString('en-CA'),
        order_time: skrng.toLocaleTimeString('en-CA', {
          hour12: false,
          timeStyle: 'short'
        }),
        planning_date: skrng.toLocaleDateString('en-CA'),
        planning_time: skrng.toLocaleTimeString('en-CA', {
          hour12: false,
          timeStyle: 'short'
        }),
        warehouse: '',
        warehouse_destination: '',
        order_type: 'RITASE',
        work_type: 'DOMESTIC',
        price: 0,
        standart_price: 0,
        qty: 1,
        cost_id: null,
        fleet_cost: 0,
        descriptions: '',
        customer_no: '',
        order_qty: 1
      }
    }

    async function edit_event(primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0]
          primary = item.transid
        }
        $q.loading.show({ delay: 100 })
        try {
          loading.value = false
          let props = {}
          props.url = api_url.value.edit
          props.transid = primary
          let respon = await $store.dispatch('master/GET_DATA', props)
          if (!(typeof respon === 'undefined')) {
            title.value = 'Ubah Data'
            stateform.value = true
            edit.value = respon
            edit.value.order_qty = -1
          }
        } finally {
          $q.loading.hide()
        }
      }
    }

    async function delete_event(primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0]
          primary = item.transid
        }
        $q.dialog({
          title: 'Konfirmasi',
          message: 'Apakah data ini akan dihapus?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          let json = {}
          json.transid = primary
          json.url = api_url.value.delete
          $store.dispatch('master/DELETE_DATA', json).then((respon) => {
            if (!(typeof respon === 'undefined')) {
              let msg = respon.data
              if (respon.success) {
                dataevent.value = false
                $q.notify({
                  color: 'positive',
                  textcolor: 'white',
                  message: msg,
                  position: 'top',
                  timeout: 2000
                })
                loaddata()
              } else {
                $q.notify({
                  color: 'negative',
                  textcolor: 'white',
                  message: msg,
                  position: 'top',
                  timeout: 2000
                })
              }
            }
          })
        })
      }
    }

    async function cancel_event(primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0]
          primary = item.transid
        }
        let props = {}
        props.url = api_url.value.edit
        props.transid = primary
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          title.value = 'Pembatalan'
          dlgCancel.value = true
          edit.value = respon
          edit.value.reason = ''
        }
      }
    }
    async function cancel_order() {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah data ini akan dibatalkan/void?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        let json = {}
        json.transid = edit.value.transid
        json.reason = edit.value.reason
        json.url = api_url.value.cancel
        $store.dispatch('master/DELETE_DATA', json).then((respon) => {
          if (!(typeof respon === 'undefined')) {
            let msg = respon.data
            if (respon.success) {
              dlgCancel.value = false
              $q.notify({
                color: 'positive',
                textcolor: 'white',
                message: msg,
                position: 'top',
                timeout: 2000
              })
              loaddata()
            } else {
              $q.notify({
                color: 'negative',
                textcolor: 'white',
                message: msg,
                position: 'top',
                timeout: 2000
              })
            }
          }
        })
      })
    }

    async function save_data() {
      try {
        let app = {}
        app.data = edit.value
        app.url = api_url.value.save
        loading.value = true
        let respon = await $store.dispatch('master/POST_DATA', app)
        if (!(typeof respon === 'undefined')) {
          let msg = respon.data
          if (respon.success) {
            stateform.value = false
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
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function runMethod(method, primary = -1) {
      this[method](primary)
    }

    function open_customer() {
      dlgPartner.value = true
    }

    function Open_routes() {
      dlgRoute.value = true
      sel_routes.value = []
      onRequestRoutes({
        pagination: pg_routes.value,
        filter: ''
      })
    }

    function getPartner(closed, data) {
      dlgPartner.value = closed
      if (typeof data.partner_id !== 'undefined') {
        edit.value.partner_id = data.partner_id
        edit.value.partner_name = data.partner_id + ' - ' + data.partner_name
        edit.value.route_id = null
        edit.value.route_name = ''
        edit.value.cost_id = -1
        edit.value.standart_price = 0
        edit.value.fleet_cost = 0
        edit.value.price = 0
        edit.value.origins = ''
        edit.value.destination = ''
      }
    }

    function change_routes(id = -1) {
      let id_route = id
      if (id === -1) {
        if (sel_routes.value.length > 0) {
          id_route = sel_routes.value[0].id
        }
      }
      routes.value.forEach((el) => {
        if (el.id === id_route) {
          edit.value.route_id = el.id
          edit.value.cost_id = el.cost_id
          edit.value.price = el.fleet_price
          edit.value.qty = 1
          edit.value.standart_price = el.fleet_price
          edit.value.fleet_cost = el.standart_cost
          edit.value.origins = el.origins
          edit.value.destination = el.destinations
          edit.value.vehicle_type = el.vehicle_type
          edit.value.route_name =
            el.vehicle_type + '(' + el.origins + ' - ' + el.destinations + ' )'
        }
      })
      dlgRoute.value = false
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
      let skrng = new Date()
      date1.value = skrng.toLocaleDateString('en-CA')
      date2.value = skrng.toLocaleDateString('en-CA')
      let props = {}
      props.url = 'master/operational/pool/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        pools.value = response
      })
      props.url = 'master/operational/vehicle-group/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        vehicle_types.value = response
      })
      loaddata()
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
      onRequest,
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data,
      btn_loading,
      dlgPartner,
      getPartner,
      open_customer,
      stateform,
      date1,
      date2,
      pools,
      vehicle_types,
      all,
      Open_routes,
      change_routes,
      cancel_event,
      dlgCancel,
      cancel_order,
      dlgRoute,
      routes,
      col_routes,
      sel_routes,
      pg_routes,
      onRequestRoutes,
      loading_routes,
      filter_routes
    }
  }
})
</script>
