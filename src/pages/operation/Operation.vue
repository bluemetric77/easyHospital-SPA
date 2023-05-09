<template>
  <q-page class="page-app">
    <q-card
      v-show="!stateform && mode_data === 'order'"
      square
      class="icard q-mb-sm"
    >
      <q-bar class="entry-caption">
        <span><strong>Periode</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-center q-col-gutter-sm">
          <div class="col-xs-12 col-sm-3 col-md-2">
            <q-select
              v-model="pool_code"
              :options="pools_all"
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
              @update:model-value="loaddata()"
            />
          </div>
          <div
            class="col-xs-6 col-sm-3 col-md-2"
            v-show="state === '1'"
          >
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
          <div
            class="col-xs-6 col-sm-3 col-md-2"
            v-show="state === '1'"
          >
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
          <div class="col-xs-12 col-sm-3 col-md-3">
            <q-select
              v-model="vehicle_group"
              :options="main_types"
              outlined
              dense
              options-dense
              label="Grup unit"
              option-value="main_group"
              option-label="main_group"
              emit-value
              map-options
              fill-input
              stack-label
              square
              @update:model-value="loaddata()"
            />
          </div>
          <div
            v-show="!stateform && state === '1'"
            class="col-xs-12 col-sm-12 offset-md-1 col-md-2"
          >
            <q-btn-toggle
              v-model="state"
              color="blue-grey-14"
              text-color="white"
              toggle-color="orange"
              toggle-text-color="primary"
              unelevated
              glossy
              no-caps
              spread
              :options="[
                { label: 'Semua', value: '1' },
                { label: 'Sedang Proses', value: '0' }
              ]"
              @click="loaddata()"
            />
          </div>
          <div
            v-show="!stateform && state === '0'"
            class="col-xs-12 offset-sm-2 col-sm-4 offset-md-5 col-md-2"
          >
            <q-btn-toggle
              v-model="state"
              color="blue-grey-14"
              text-color="white"
              toggle-color="orange"
              toggle-text-color="primary"
              unelevated
              glossy
              no-caps
              spread
              :options="[
                { label: 'Semua', value: '1' },
                { label: 'Sedang Proses', value: '0' }
              ]"
              @click="loaddata()"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card
      v-show="!stateform && mode_data === 'order'"
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
        no-results-label="data yang kamu cari tidak ditemukan"
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
        class="fit-table-ui-with-parameter"
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
                <div v-else-if="col.name === 'work_order_no'">
                  <span
                    :class="
                      props.row.work_status === 'Closed'
                        ? 'q-pa-xs bg-green-10 text-white'
                        : props.row.work_status === 'Canceled'
                        ? 'q-pa-xs bg-red-10 text-white'
                        : 'q-pa-xs'
                    "
                    >{{ props.row.work_order_no }}</span
                  >
                </div>
                <div v-else-if="col.name === 'price'">
                  {{ $formatnumber(props.row.price) }}
                </div>
                <div v-else-if="col.name === 'minmal_tonase'">
                  {{ $formatnumber(props.row.minmal_tonase) }}
                </div>
                <div v-else-if="col.name === 'tonase'">
                  {{ $formatnumber(props.row.tonase) }}
                </div>
                <div v-else-if="col.name === 'net_price'">
                  {{ $formatnumber(props.row.net_price) }}
                </div>
                <div v-else-if="col.name === 'other_bill'">
                  {{ $formatnumber(props.row.other_bill) }}
                </div>
                <div v-else-if="col.name === 'over_night'">
                  {{ $formatnumber(props.row.over_night) }}
                </div>
                <div v-else-if="col.name === 'total'">
                  {{ $formatnumber(props.row.total) }}
                </div>
                <div v-else-if="col.name === 'standart_fleet_cost'">
                  {{ $formatnumber(props.row.standart_fleet_cost) }}
                </div>
                <div v-else-if="col.name === 'dp_customer'">
                  {{ $formatnumber(props.row.dp_customer) }}
                </div>
                <div v-else-if="col.name === 'budget'">
                  {{ $formatnumber(props.row.budget) }}
                </div>
                <div v-else-if="col.name === 'expense'">
                  <div v-if="props.row.standart_fleet_cost < props.row.expense">
                    <span class="bg-red-10 text-white q-pa-xs">
                      {{ $formatnumber(props.row.expense) }}
                    </span>
                  </div>
                  <div v-else>
                    <span class="q-pa-xs">
                      {{ $formatnumber(props.row.expense) }}
                    </span>
                  </div>
                </div>
                <div v-else-if="col.name === 'ref_date'">
                  {{ $INDDate(props.row.ref_date) }}
                </div>
                <div v-else-if="col.name === 'start_operation'">
                  {{ $INDDateTime(props.row.start_operation) }}
                </div>
                <div v-else-if="col.name === 'end_operation'">
                  {{ $INDDateTime(props.row.end_operation) }}
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
      <q-separator />
    </q-card>

    <!-- Reservasi Order-->
    <q-card
      v-show="!stateform && mode_data === 'reservasi'"
      square
      class="icard q-mb-sm"
    >
      <q-bar class="entry-caption">
        <span><strong>Periode</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-center q-col-gutter-sm">
          <div class="col-xs-12 col-sm-4 col-md-3">
            <q-select
              v-model="pool_code"
              :options="pools_all"
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
              @update:model-value="
                onRequestRev({ pagination: pagination_rev, filter: filter_rev })
              "
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card
      v-show="!stateform && mode_data === 'reservasi'"
      square
      class="icard"
    >
      <q-bar class="entry-caption">
        <q-btn
          icon="refresh"
          color="green-10"
          size="sm"
          class="q-mr-sm"
          rounded
          dense
          @click="loaddata()"
        />
        <span><strong>Reservasi Order</strong></span>
        <q-space />
        <q-input
          v-model="filter_rev"
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
        :rows="data_rev"
        :columns="columns_rev"
        no-data-label="data kosong"
        :dense="$q.screen.md"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="transid"
        :filter="filter_rev"
        separator="cell"
        selection="single"
        v-model:selected="selected_rev"
        v-model:pagination="pagination_rev"
        binary-state-sort
        @request="onRequestRev"
        :virtual-scroll="mode_data === 'reservasi'"
        :loading="loading_rev"
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
              class="bg-teal-10 text-white"
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
                <div v-if="col.name === 'transid'">
                  <q-btn
                    glossy
                    rounded
                    label="Buat Planning"
                    dense
                    no-caps
                    class="bg-green-10 text-white"
                    @click="add_event(-1, props.row.transid)"
                  />
                </div>
                <div v-else-if="col.name === 'order_no'">
                  {{ props.row.order_no }}
                </div>
                <div v-else-if="col.name === 'order_date'">
                  {{ $INDDate(props.row.order_date) }}
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
        <div class="row items-start q-col-gutter-sm">
          <div class="col-xs-12 col-sm-12 col-md-6">
            <div class="row items-start q-col-gutter-sm q-mb-sm">
              <div class="col-xs-4 col-sm-4 col-md-4">
                <q-input
                  v-model="edit.work_order_no"
                  dense
                  outlined
                  square
                  label="No.Surat Muatan"
                  stack-label
                  readonly
                />
              </div>
              <div class="col-xs-4 col-sm-4 col-md-4">
                <q-input
                  v-model="edit.ref_date"
                  dense
                  outlined
                  square
                  type="date"
                  label="Tg. Muatan"
                  stack-label
                />
              </div>
              <div class="col-xs-4 col-sm-4 col-md-4">
                <q-select
                  v-model="edit.project_id"
                  dense
                  outlined
                  square
                  label="Proyek"
                  stack-label
                  :options="[
                    'BAK',
                    'BOX',
                    'DOKUMEN',
                    'GAS',
                    'KASBON',
                    'RCE',
                    'TRAILER',
                    'LAIN-LAIN'
                  ]"
                  options-dense
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-sm">
              <div class="col-xs-4 col-sm-4 col-md-4">
                <q-input
                  v-model="edit.order_no"
                  dense
                  outlined
                  square
                  label="No.Order"
                  stack-label
                  readonly
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      color="blue-grey-10"
                      size="xs"
                      @click="open_reservation()"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-xs-4 col-sm-4 col-md-4">
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
              <div class="col-xs-4 col-sm-4 col-md-4">
                <q-select
                  v-model="edit.work_type"
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
              <div class="col-xs-6 col-sm-8 col-md-8">
                <q-input
                  v-model="edit.partner_name"
                  dense
                  outlined
                  square
                  label="Nama Konsumen"
                  stack-label
                  readonly
                />
              </div>
              <div class="col-xs-6 col-sm-4 col-md-4">
                <q-input
                  v-model="edit.customer_no"
                  dense
                  outlined
                  square
                  label="Nomor order konsumen"
                  stack-label
                  readonly
                />
              </div>
            </div>
            <div
              class="row items-start q-col-gutter-sm q-mb-sm"
              v-show="edit.partner_id === '2103'"
            >
              <div class="col-12">
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
              <div class="col-xs-12 col-sm-6 col-md-6">
                <q-select
                  v-model="edit.vehicle_group"
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
                  disable
                />
              </div>
              <div class="col-xs-6 col-sm-2 col-md-2">
                <q-input
                  v-model="edit.eta"
                  dense
                  outlined
                  square
                  label="ETA"
                  stack-label
                />
              </div>
              <div class="col-xs-6 col-sm-4 col-md-4">
                <q-select
                  v-model="edit.work_type"
                  dense
                  outlined
                  square
                  label="Tipe Pekerjaan"
                  stack-label
                  :options="['EXPORT', 'IMPORT', 'DOMESTIC', 'CARGO', 'POK']"
                  options-dense
                  readonly
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-sm">
              <div class="col-xs-6 col-sm-6 col-md-6">
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
              <div class="col-xs-6 col-sm-6 col-md-6">
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
              <div class="col-xs-6 col-sm-6 col-md-6">
                <q-input
                  v-model="edit.warehouse"
                  dense
                  outlined
                  square
                  label="Pabrik/Gudang asal"
                  stack-label
                />
              </div>
              <div class="col-xs-6 col-sm-6 col-md-6">
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
              <div class="col-xs-12 col-sm-6 col-md-6">
                <q-input
                  v-model="edit.origins_geofance"
                  dense
                  outlined
                  square
                  label="Geofance Muat"
                  stack-label
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      color="blue-grey-10"
                      size="xs"
                      @click="open_geofance('origins')"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-xs-12 col-sm-6 col-md-6">
                <q-input
                  v-model="edit.destinations_geofance"
                  dense
                  outlined
                  square
                  label=" Geofance Bongkaran"
                  stack-label
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      color="blue-grey-10"
                      size="xs"
                      @click="open_geofance('destinations')"
                    />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-sm">
              <div class="col-xs-6 col-sm-3 col-md-3">
                <q-input
                  v-model="edit.vehicle_no"
                  dense
                  outlined
                  square
                  label="No.Unit"
                  stack-label
                  readonly
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      color="blue-grey-10"
                      size="xs"
                      @click="open_vehicle()"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-xs-6 col-sm-3 col-md-3">
                <q-input
                  v-model="edit.police_no"
                  dense
                  outlined
                  square
                  label="No.Polisi"
                  stack-label
                  readonly
                />
              </div>
              <div class="col-xs-12 col-sm-6 col-md-6">
                <q-input
                  v-model="edit.driver_name"
                  dense
                  outlined
                  square
                  label="Pengemudi"
                  stack-label
                  readonly
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      color="blue-grey-10"
                      size="xs"
                      @click="open_driver()"
                    />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-sm">
              <div class="col-xs-3 col-sm-3 col-md-3">
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
                      readonly
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-3 col-sm-3 col-md-3">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.minimal_tonase"
                  label="Min.Tonase"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.minimal_tonase"
                      class="q-field__input text-right"
                      separator="."
                      readonly
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-3 col-sm-3 col-md-3">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.real_tonase"
                  label="Real Tonase"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.real_tonase"
                      class="q-field__input text-right"
                      separator="."
                      :precision="0"
                      @input="change_tonase()"
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-3 col-sm-3 col-md-3">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.tonase"
                  label="Tonase"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.tonase"
                      class="q-field__input text-right"
                      separator="."
                      :precision="0"
                      @input="calculate_price()"
                    />
                  </template>
                </q-field>
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-sm">
              <div class="col-xs-3 col-sm-3 col-md-3">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.net_price"
                  label="Net Tarif"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.net_price"
                      class="q-field__input text-right"
                      separator="."
                      :precision="0"
                      readonly
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-3 col-sm-3 col-md-3">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.over_night"
                  label="Biaya Inap"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.over_night"
                      class="q-field__input text-right"
                      separator="."
                      readonly
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-3 col-sm-3 col-md-3">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.other_bill"
                  label="Lain-Lain"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.other_bill"
                      class="q-field__input text-right"
                      separator="."
                      readonly
                    />
                  </template>
                </q-field>
              </div>
              <div class="col-xs-3 col-sm-3 col-md-3">
                <q-field
                  square
                  outlined
                  stack-label
                  dense
                  :model-value="edit.total"
                  label="Total Tarif"
                >
                  <template v-slot:control>
                    <vue-numeric
                      v-model="edit.total"
                      class="q-field__input text-right"
                      separator="."
                      :precision="0"
                      readonly
                    />
                  </template>
                </q-field>
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-sm">
              <div class="col-xs-12 col-sm-12 col-md-12">
                <q-input
                  v-model="edit.order_instructions"
                  dense
                  outlined
                  square
                  label="Keterangan"
                  stack-label
                  type="textarea"
                  input-style="min-height:30px"
                />
              </div>
            </div>
          </div>
          <div class="col-xs-12 col-sm-12 col-md-6">
            <q-card
              class="icard"
              square
            >
              <q-bar class="entry-caption">Pengajuan Biaya Operasional</q-bar>
              <q-card-section class="q-pa-xs">
                <div class="row items-start q-col-gutter-xs q-mb-xs">
                  <div class="col-xs-6 col-sm-4 col-md-3">
                    <q-input
                      v-model="cost.doc_number"
                      dense
                      outlined
                      square
                      label="No. Pengajuan"
                      stack-label
                      readonly
                    />
                  </div>
                  <div
                    class="col-xs-6 offset-sm-4 col-sm-4 offset-md-6 col-md-3"
                  >
                    <q-input
                      v-model="cost.ref_date"
                      dense
                      outlined
                      square
                      label="Tanggal"
                      stack-label
                      readonly
                    />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-xs q-mb-xs">
                  <div class="col-xs-6 col-sm-4 col-md-3">
                    <q-field
                      square
                      outlined
                      stack-label
                      dense
                      :model-value="edit.standart_fleet_cost"
                      label="B.O Standart"
                    >
                      <template v-slot:control>
                        <vue-numeric
                          v-model="edit.standart_fleet_cost"
                          class="q-field__input text-right"
                          separator="."
                          readonly
                        />
                      </template>
                    </q-field>
                  </div>
                  <div
                    class="col-xs-6 offset-sm-4 col-sm-4 offset-md-6 col-md-3"
                  >
                    <q-select
                      v-model="cost.dp_method"
                      dense
                      outlined
                      square
                      label="Terima UJO"
                      stack-label
                      options-dense
                      :options="['-', 'DITERIMA SUPIR', 'TRANSFER']"
                    />
                  </div>
                </div>
                <div class="row items-start q-col-gutter-xs q-mb-xs">
                  <div class="col-xs-6 col-sm-4 col-md-3">
                    <q-field
                      square
                      outlined
                      stack-label
                      dense
                      :model-value="cost.dp_customer"
                      label="UJO Konsumen"
                    >
                      <template v-slot:control>
                        <vue-numeric
                          v-model="cost.dp_customer"
                          class="q-field__input text-right"
                          separator="."
                        />
                      </template>
                    </q-field>
                  </div>
                  <div
                    class="col-xs-6 offset-sm-4 col-sm-4 offset-md-6 col-md-3"
                  >
                    <q-field
                      square
                      outlined
                      stack-label
                      dense
                      :model-value="cost.total"
                      label="B.O Pengajuan"
                    >
                      <template v-slot:control>
                        <vue-numeric
                          v-model="cost.total"
                          class="q-field__input text-right"
                          separator="."
                          readonly
                        />
                      </template>
                    </q-field>
                  </div>
                </div>
              </q-card-section>
              <q-table
                square
                :rows="costs"
                :columns="columns_cost"
                no-data-label="data kosong"
                dense
                no-results-label="data yang kamu cari tidak ditemukan"
                row-key="line_no"
                separator="cell"
                selection="single"
                v-model:selected="selected_cost"
                v-model:pagination="pagination_cost"
                binary-state-sort
                virtual-scroll
                hide-pagination
                class="fix-cost-table"
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
                      class="bg-teal-10 text-white"
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
                        <div v-if="col.name === 'standart_budget'">
                          {{ $formatnumber(props.row.standart_budget) }}
                        </div>
                        <div v-else-if="col.name === 'expense_budget'">
                          <q-field
                            square
                            outlined
                            stack-label
                            dense
                            :model-value="props.row.expense_budget"
                          >
                            <template v-slot:control>
                              <vue-numeric
                                v-model="props.row.expense_budget"
                                class="q-field__input text-right"
                                separator="."
                                :disabled="props.row.is_fix === '1'"
                                @input="calculate_cost()"
                              />
                            </template>
                          </q-field>
                        </div>
                        <div v-else-if="col.name === 'line_note'">
                          <q-input
                            v-model="props.row.line_note"
                            dense
                            outlined
                            square
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
            </q-card>
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
        <q-space />
        <q-btn-toggle
          v-model="mode_data"
          color="blue-grey-14"
          text-color="white"
          toggle-color="orange"
          toggle-text-color="primary"
          unelevated
          glossy
          no-caps
          spread
          :options="[
            { label: 'Order', value: 'order' },
            { label: 'Reservasi', value: 'reservasi' }
          ]"
        />
      </q-toolbar>
    </q-page-sticky>
    <partner
      v-if="dlgPartner"
      :show="dlgPartner"
      state="C"
      @ClosePartner="getPartner"
    />
    <driver
      v-if="dlgDriver"
      :show="dlgDriver"
      :pool_code="edit.pool_code"
      @CloseDriver="getDriver"
    />
    <vehicle
      v-if="dlgVehicle"
      :show="dlgVehicle"
      :pool_code="edit.pool_code"
      @CloseVehicle="getVehicle"
    />
    <geofance
      v-if="dlgGeofance"
      :show="dlgGeofance"
      state="C"
      @CloseGeofance="getGeofance"
    />

    <q-dialog
      v-model="dlgReservation"
      persistent
      transition-show="scale"
      transition-hide="scale"
      full-width
    >
      <q-card
        class="icard"
        style="width: 800px; max-width: 80vw; max-height: 700px"
      >
        <q-bar class="entry-caption"
          >Reservasi Order
          <q-space />
          <q-btn
            icon="close"
            color="red-10"
            size="xs"
            glossy
            dense
            rounded
            v-close-popup
          />
        </q-bar>
        <q-table
          square
          :rows="data_rev"
          :columns="columns_rev"
          no-data-label="data kosong"
          :dense="$q.screen.md"
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="transid"
          :filter="filter_rev"
          separator="cell"
          selection="single"
          v-model:selected="selected_rev"
          v-model:pagination="pagination_rev"
          binary-state-sort
          class="fit"
          table-style="min-height:302px; max-height: 450px"
          @request="onRequestRev"
          virtual-scroll
          :loading="loading_rev"
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
                class="bg-teal-10 text-white"
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
                  <div v-if="col.name === 'order_no'">
                    <q-btn
                      glossy
                      rounded
                      :label="props.row.order_no"
                      dense
                      no-caps
                      class="bg-green-10 text-white"
                      @click="get_reservation(props.row.transid)"
                    />
                  </div>
                  <div v-else-if="col.name === 'order_date'">
                    {{ $INDDate(props.row.order_date) }}
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
    </q-dialog>

    <q-dialog
      v-model="dlgCancel"
      persistent
    >
      <q-card
        class="icard"
        style="min-width: 600px"
      >
        <q-bar class="entry-caption"
          >Pembatalan Kegiatan Operasi
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
                v-model="edit.work_order_type"
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
                v-model="edit.work_order_no"
                dense
                outlined
                square
                label="Surat Muatan"
                stack-label
                disable
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.ref_date"
                dense
                outlined
                square
                label="Tgl.Muatan"
                stack-label
                type="date"
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
            <div class="col-4">
              <q-input
                v-model="edit.vehicle_no"
                dense
                outlined
                square
                label="No. Unit"
                stack-label
                disable
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.police_no"
                dense
                outlined
                square
                label="Nomor Polisi"
                stack-label
                disable
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="edit.driver_name"
                dense
                outlined
                square
                label="Pengemudi"
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
            label="Pembatalan Kegiatan"
            no-caps
            dense
            glossy
            icon="cancel"
            @click="cancel_order()"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import partner from 'components/Partner.vue'
import driver from 'components/Driver.vue'
import vehicle from 'components/Vehicle.vue'
import geofance from 'components/Geofance.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos, QSpinnerPie } from 'quasar'

export default defineComponent({
  name: 'Operation',
  components: { partner, driver, vehicle, geofance },
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
      sortBy: 'ref_date',
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
    const state = ref('0')
    const mode_data = ref('order')
    const pool_code = ref('ALL')
    const pools = ref([])
    const pools_all = ref([])
    const date1 = ref(null)
    const date2 = ref(null)
    const vehicle_types = ref([])
    const routes = ref([])

    const loading_rev = ref(false)
    const filter_rev = ref('')
    const pagination_rev = ref({
      sortBy: 'order_date',
      descending: true,
      page: 1,
      rowsPerPage: 25,
      rowsNumber: 25
    })
    const data_rev = ref([])
    const selected_rev = ref([])
    const columns_rev = ref([
      { name: 'transid', align: 'center', label: 'Planning', field: 'transid' },
      {
        name: 'order_no',
        align: 'left',
        label: 'Nomor Reservasi',
        field: 'order_no',
        sortable: true
      },
      {
        name: 'order_date',
        align: 'left',
        label: 'Tanggal',
        field: 'order_date',
        sortable: true
      },
      {
        name: 'pool_code',
        align: 'left',
        label: 'Pool',
        field: 'pool_code',
        sortable: true
      },
      {
        name: 'partner_name',
        align: 'left',
        label: 'Konsumen',
        field: 'partner_name',
        sortable: true
      },
      {
        name: 'vehicle_type',
        align: 'left',
        label: 'Tipe Unit',
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
        name: 'destination',
        align: 'left',
        label: 'Tujuan',
        field: 'destination',
        sortable: true
      },
      {
        name: 'warehouse',
        align: 'left',
        label: 'Lok.Muatan',
        field: 'warehouse',
        sortable: true
      },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Keterangan',
        field: 'descriptions'
      }
    ])
    const dlgDriver = ref(false)
    const dlgVehicle = ref(false)
    const dlgReservation = ref(false)

    const cost = ref({})
    const costs = ref([])
    const selected_cost = ref([])
    const columns_cost = ref([
      { name: 'line_no', align: 'center', label: '#No', field: 'line_no' },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Komponen Biaya',
        field: 'descriptions'
      },
      {
        name: 'standart_budget',
        align: 'right',
        label: 'Standar Biaya',
        field: 'standart_budget'
      },
      {
        name: 'expense_budget',
        align: 'right',
        label: 'Pengajuan Biaya',
        field: 'expense_budget'
      },
      {
        name: 'line_note',
        align: 'left',
        label: 'Catatan',
        field: 'line_note'
      },
      {
        name: 'account_no',
        align: 'left',
        label: 'No. Akun',
        field: 'account_no'
      }
    ])
    const pagination_cost = ref({
      sortBy: 'line_no',
      descending: true,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    })

    const dlgGeofance = ref(false)
    const geofance_flag = ref('')
    const dlgCancel = ref(false)
    const main_types = ref([])
    const vehicle_group = ref('ALL')

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
          all: state.value,
          pool_code: pool_code.value,
          vehicle_group: vehicle_group.value,
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

    async function onRequestRev(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading_rev.value = true
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          outstanding: '1',
          pool_code: pool_code.value,
          url: 'customer-service/order'
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        data_rev.value = respon.data
        pagination_rev.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending
        }
      } catch (error) {
      } finally {
        loading_rev.value = false
      }
    }

    async function add_event(primary = -1, reservation = -1) {
      let skrng = new Date()
      loading.value = false
      stateform.value = true
      title.value = 'Buat Reservasi Order'
      edit.value = {
        transid: -1,
        work_order_no: '(NEW)',
        ref_date: skrng.toLocaleDateString('en-CA'),
        order_no: '',
        partner_id: '',
        partner_name: '',
        customer_name: '',
        route_id: null,
        pool_code: '',
        vehicle_type: '',
        origins: '',
        destination: '',
        warehouse: '',
        warehouse_destination: '',
        order_type: 'RITASE',
        work_type: 'DOMESTIC',
        customer_no: '',
        customer_no1: '',
        customer_no2: '',
        vehicle_no: '',
        police_no: '',
        driver_id: '',
        employee_id: '',
        driver_name: '',
        chasis_no: '',
        price: 0,
        minimal_tonase: 0,
        real_tonase: 0,
        tonase: 0,
        net_price: 0,
        other_bill: 0,
        over_night: 0,
        total: 0,
        expense: 0,
        budget: 0,
        closing_budget: 0,
        dp_customer: 0,
        work_status: 'Open',
        order_instructions: '',
        cost_id: -1,
        standart_fleet_cost: 0,
        project_id: null,
        origins_geofance: '',
        destinations_geofance: ''
      }
      cost.value = {
        doc_number: '(NEW)',
        ref_date: skrng.toLocaleDateString('en-CA'),
        dp_customer: 0,
        dp_method: '-'
      }
      if (!(reservation === -1)) {
        let props = {}
        props.url = 'customer-service/order/get'
        props.transid = reservation
        props.state = 'order'
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          edit.value.order_no = respon.order_no
          edit.value.pool_code = respon.pool_code
          edit.value.customer_no = respon.customer_no
          edit.value.vehicle_group = respon.vehicle_type
          edit.value.work_order_type = respon.order_type
          edit.value.work_type = respon.work_type
          edit.value.partner_id = respon.partner_id
          edit.value.origins = respon.origins
          edit.value.destination = respon.destination
          edit.value.origins_geofance = respon.origins_geofance
          edit.value.destinations_geofance = respon.destinations_geofance
          edit.value.eta = respon.eta
          edit.value.warehouse = respon.warehouse
          edit.value.partner_id = respon.partner_id
          edit.value.partner_name = respon.partner_name
          edit.value.cost_id = respon.cost_id
          edit.value.order_instructions = respon.descriptions
          edit.value.price = respon.price
          edit.value.real_tonase = respon.qty === 0 ? 1 : respon.qty
          edit.value.tonase = edit.value.real_tonase
          edit.value.net_price = edit.value.standart_price
          edit.value.customer_name = respon.customer_name
        }
        costs.value = []
        if (respon.cost) {
          let line = {}
          let nomor = 0
          respon.cost.forEach((el) => {
            nomor = nomor + 1
            line = {
              transid: -1,
              line_no: nomor,
              expense_code: el.id,
              descriptions: el.descriptions,
              standart_budget: el.fleet_cost,
              expense_budget: el.fleet_cost,
              is_fix: el.is_fix,
              account_no: el.account_no,
              line_note: ''
            }
            costs.value.push(line)
          })
        }
        calculate_price()
        calculate_cost()
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
            edit.value = respon.data
            cost.value = respon.cost
            costs.value = respon.costs
          }
        } finally {
          $q.loading.hide()
        }
      }
    }

    async function lbo_event(primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0]
          primary = item.transid
        }
        $router.push({
          path: '/operational/work-order/lbo',
          query: { sysid: primary, pageback: 'operation' }
        })
      }
    }
    async function cost_event(primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0]
          primary = item.transid
        }
        $router.push({
          path: '/operational/work-order/closed-lbo',
          query: { sysid: primary }
        })
      }
    }
    async function save_data() {
      let success = false
      try {
        let app = {}
        app.data = edit.value
        app.cost = cost.value
        app.variable = costs.value
        app.url = api_url.value.save
        let respon = await $store.dispatch('master/POST_DATA', app)
        if (!(typeof respon === 'undefined')) {
          if (respon.success) {
            let msg = respon.data.message
            stateform.value = false
            $q.notify({
              color: 'positive',
              textcolor: 'white',
              message: msg,
              position: 'top',
              timeout: 2000
            })
            let props = {}
            props.url = 'operation/work-order/lbo/print'
            props.sysid = respon.data.lbo_sysid
            await $store.dispatch('master/GET_DOWNLOAD', props)
            loaddata()
            props = {}
            props.url = 'operation/work-order/print'
            props.sysid = respon.data.doc_sysid
            await $store.dispatch('master/GET_DOWNLOAD', props)
          } else {
            let msg = respon.data
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
      }
    }

    async function loaddata() {
      if (mode_data.value === 'order') {
        selected.value = []
        onRequest({
          pagination: pagination.value,
          filter: filter.value
        })
      } else {
        selected_rev.value = []
        onRequestRev({
          pagination: pagination_rev.value,
          filter: filter_rev.value
        })
      }
    }

    function runMethod(method, primary = -1) {
      this[method](primary)
    }

    function change_tonase() {
      edit.value.tonase = edit.value.real_tonase
      calculate_price()
    }

    function calculate_price() {
      edit.value.net_price = edit.value.tonase * edit.value.price
      edit.value.total =
        edit.value.net_price + edit.value.other_bill + edit.value.over_night
    }

    function open_driver() {
      dlgDriver.value = true
    }

    function getDriver(closed, data) {
      dlgDriver.value = closed
      if (typeof data.employee_id !== 'undefined') {
        edit.value.driver_id = data.personal_id
        edit.value.employee_id = data.employee_id
        edit.value.driver_name = data.employee_id + ' - ' + data.personal_name
      }
    }

    function open_vehicle() {
      dlgVehicle.value = true
    }

    function getVehicle(closed, data) {
      dlgVehicle.value = closed
      if (typeof data.vehicle_no !== 'undefined') {
        edit.value.vehicle_no = data.vehicle_no
        edit.value.police_no = data.police_no
      }
    }

    function open_reservation() {
      dlgReservation.value = true
      onRequestRev({
        pagination: pagination_rev.value,
        filter: filter_rev.value
      })
    }

    async function get_reservation(sysid) {
      if (!(sysid === -1)) {
        let props = {}
        props.url = 'customer-service/order/get'
        props.transid = sysid
        props.state = 'order'
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          edit.value.order_no = respon.order_no
          edit.value.pool_code = respon.pool_code
          edit.value.customer_no = respon.customer_no
          edit.value.vehicle_group = respon.vehicle_type
          edit.value.work_order_type = respon.order_type
          edit.value.work_type = respon.work_type
          edit.value.partner_id = respon.partner_id
          edit.value.origins = respon.origins
          edit.value.destination = respon.destination
          edit.value.origins_geofance = ''
          edit.value.destinations_geofance = ''
          edit.value.warehouse = respon.warehouse
          edit.value.partner_id = respon.partner_id
          edit.value.partner_name = respon.partner_name
          edit.value.cost_id = respon.cost_id
          edit.value.order_instructions = respon.descriptions
          edit.value.price = respon.price
          edit.value.real_tonase = respon.qty === 0 ? 1 : respon.qty
          edit.value.tonase = edit.value.real_tonase
          edit.value.net_price = edit.value.standart_price
        }
        costs.value = []
        if (respon.cost) {
          let line = {}
          let nomor = 0
          respon.cost.forEach((el) => {
            nomor = nomor + 1
            line = {
              transid: -1,
              line_no: nomor,
              expense_code: el.id,
              descriptions: el.descriptions,
              standart_budget: el.fleet_cost,
              expense_budget: el.fleet_cost,
              is_fix: el.is_fix,
              account_no: el.account_no,
              line_note: ''
            }
            costs.value.push(line)
          })
        }
        calculate_price()
        dlgReservation.value = false
      }
    }

    function open_geofance(state) {
      geofance_flag.value = state
      dlgGeofance.value = true
    }

    function getGeofance(closed, data) {
      dlgGeofance.value = closed
      if (typeof data.geofance_name !== 'undefined') {
        if (geofance_flag.value === 'origins') {
          edit.value.origins_geofance = data.geofance_name
        } else {
          edit.value.destinations_geofance = data.geofance_name
        }
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
          edit.value = respon.data
          edit.value.reason = ''
        }
      }
    }
    async function cancel_order() {
      $q.dialog({
        title: 'Konfirmasi',
        message: 'Apakah kegiatan/planning order akan dibatalkan/void?',
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
    function calculate_cost() {
      let standart = 0
      let expense = 0
      costs.value.forEach((el) => {
        standart = standart + el.standart_budget
        expense = expense + el.expense_budget
      })
      edit.value.standart_fleet_cost = standart
      cost.value.total = expense
    }

    async function printspj_event(primary = -1) {
      if (selected.value.length > 0 || !(primary === -1)) {
        if (primary === -1) {
          let item = selected.value[0]
          primary = item.transid
        }
        let props = {}
        props.url = 'operation/work-order/print'
        props.sysid = primary
        console.info(props)
        await $store.dispatch('master/GET_DOWNLOAD', props)
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
      let skrng = new Date()
      date1.value = skrng.toLocaleDateString('en-CA')
      date2.value = skrng.toLocaleDateString('en-CA')
      let props = {}
      props.url = 'master/operational/pool/list?all=0'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        pools.value = response
        pools_all.value = []
        pools_all.value.push({ pool_code: 'ALL', pool_name: 'SEMUA POOL' })
        pools.value.forEach((el) => {
          pools_all.value.push(el)
        })
      })
      props.url = 'master/operational/vehicle-group/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        vehicle_types.value = response
      })
      props.url = 'master/operational/vehicle-group/main/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        main_types.value = []
        main_types.value.push({ main_group: 'ALL' })
        response.forEach((el) => {
          main_types.value.push(el)
        })
      })
      loaddata()
      selected_rev.value = []
      onRequestRev({
        pagination: pagination_rev.value,
        filter: filter_rev.value
      })
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
      loaddata,
      save_data,
      btn_loading,
      stateform,
      date1,
      date2,
      pools,
      vehicle_types,
      state,
      mode_data,
      cancel_event,
      pools_all,
      pool_code,
      loading_rev,
      filter_rev,
      pagination_rev,
      data_rev,
      selected_rev,
      columns_rev,
      onRequestRev,
      change_tonase,
      calculate_price,
      open_driver,
      dlgDriver,
      getDriver,
      open_vehicle,
      dlgVehicle,
      getVehicle,
      dlgReservation,
      open_reservation,
      get_reservation,
      cost,
      costs,
      selected_cost,
      columns_cost,
      pagination_cost,
      dlgGeofance,
      geofance_flag,
      open_geofance,
      getGeofance,
      lbo_event,
      cost_event,
      cancel_order,
      dlgCancel,
      calculate_cost,
      printspj_event,
      main_types,
      vehicle_group
    }
  }
})
</script>
<style lang="sass">
.fix-cost-table
  height: -webkit-calc(100vh - 295px) !important
  height: -moz-calc(100vh - 295px) !important
  height: calc(100vh - 295px) !important
</style>
