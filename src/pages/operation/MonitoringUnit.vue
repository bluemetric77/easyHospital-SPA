<template>
  <q-page class="page-app">
    <q-card v-show="!isInfo" square class="icard q-mb-sm">
      <q-bar class="entry-caption">
        <span><strong>Pool</strong></span>
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-center q-col-gutter-sm">
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-select v-model="pool_code" :options="pools_all" outlined dense options-dense label="Pool kendaraan"
              option-value="pool_code" option-label="pool_name" emit-value map-options fill-input stack-label square
              @update:model-value="refresh_page()" />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2" v-show="all==='1'">
            <q-input v-model="date1" dense outlined square label="Tanggal Mulai" type="date" stack-label />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2" v-show="all==='1'">
            <q-input v-model="date2" dense outlined square label="s.d Tanggal" type="date" stack-label />
          </div>
          <div class="col-xs-6 col-sm-3 col-md-2">
            <q-select v-model="vehicle_type" :options="vehicle_types" outlined dense options-dense
              label="Jenis kendaraan/unit" option-value="main_group" option-label="main_group" emit-value map-options
              fill-input stack-label square @update:model-value="refresh_page()" />
          </div>
          <div class="col-xs-12 col-sm-12 offset-md-2 col-md-2" v-show="all==='1'">
            <q-btn-toggle v-model="all" color="blue-grey-14" text-color="white" toggle-color="orange"
              toggle-text-color="primary" unelevated glossy no-caps spread :options="[
                {label: 'Semua', value: '1'},
                {label: 'Sedang Kegiatan', value: '0'}
              ]" @click="refresh_page()" />
          </div>
          <div class="col-xs-12 offset-sm-2 col-sm-4 offset-md-6 col-md-2" v-show="all==='0'">
            <q-btn-toggle v-model="all" color="blue-grey-14" text-color="white" toggle-color="orange"
              toggle-text-color="primary" unelevated glossy no-caps spread :options="[
                {label: 'Semua', value: '1'},
                {label: 'Sedang Kegiatan', value: '0'}
              ]" @click="refresh_page()" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="q-pa-sm row justify-between q-col-gutter-sm">
      <div class="col-xs-12 col-sm-12 col-md-4">
        <q-card class="icard shaddow-8" style="height:131px">
          <q-bar class="entry-caption">Unit/Kendaraan</q-bar>
          <q-card-section class="q-pa-xs">
            <div class="row justify-between q-col-gutter-sm">
              <div class="col-4">
                <q-card class="dashboard-card">
                  <q-card-section horizontal>
                    <q-card-section class="col-0 bg-teal-5">
                      <q-icon name="fas fa-truck" color="light-blue-10" size="md">
                      </q-icon>
                    </q-card-section>
                    <q-card-section class="q-pt-md col-11 text-center">
                      <div class="text-weight-bold text-green-10" style="font-size:2.25em">
                        {{ $formatnumber(dashboard.total) }}
                      </div>
                      <div class="text-body3 q-mt-sm q-mb-xs">
                        Total Unit
                      </div>
                    </q-card-section>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card class="dashboard-card" @click="show_state('Update')">
                  <q-card-section horizontal>
                    <q-card-section class="col-0 bg-green-10">
                      <q-icon name="fas fa-sync" color="green-14" size="md">
                      </q-icon>
                    </q-card-section>
                    <q-card-section class="q-pt-md col-11 text-center">
                      <div class="text-weight-bold text-green-10" style="font-size:2.25em">
                        {{ $formatnumber(dashboard.update) }}
                      </div>
                      <div class="text-body3 q-mt-sm q-mb-xs">
                        GPS Update
                      </div>
                    </q-card-section>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card class="dashboard-card" @click="show_state('not-update')">
                  <q-card-section horizontal>
                    <q-card-section class="col-0 bg-red-10">
                      <q-icon name="fas fa-unlink" color="red-14" size="md">
                      </q-icon>
                    </q-card-section>
                    <q-card-section class="q-pt-md col-11 text-center">
                      <div class="text-weight-bold text-green-10" style="font-size:2.25em">
                        {{ $formatnumber(dashboard.non_update) }}
                      </div>
                      <div class="text-body3 q-mt-sm q-mb-xs">
                        Tidak Update
                      </div>
                    </q-card-section>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-xs-12 col-sm-12 col-md-8">
        <q-card class="icard shaddow-8">
          <q-bar class="entry-caption">Status Unit</q-bar>
          <q-card-section class="q-pa-xs">
            <div class="row justify-between q-col-gutter-sm">
              <div class="col-xs-4 col-sm-2">
                <q-card class="dashboard-card" @click="show_state('Driving')">
                  <q-bar class="entry-caption">
                    <q-icon name="fas fa-truck" class="q-mr-sm" size="sm" />Jalan
                  </q-bar>
                  <q-card-section class="text-center q-pt-md col-11">
                    <div class="text-weight-bold text-green-10" style="font-size:2.25em">
                      {{ $formatnumber(dashboard.driving) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-xs-4 col-sm-2">
                <q-card class="dashboard-card" @click="show_state('Idle')">
                  <q-bar class="entry-caption">
                    <q-icon name="fas fa-clock" class="q-mr-sm" size="sm" />Idle
                  </q-bar>
                  <q-card-section class="text-center q-pt-md col-11">
                    <div class="text-weight-bold text-green-10" style="font-size:2.25em">
                      {{ $formatnumber(dashboard.idle) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-xs-4 col-sm-2">
                <q-card class="dashboard-card" @click="show_state('Parking')">
                  <q-bar class="entry-caption">
                    <q-icon name="fas fa-parking" class="q-mr-sm" size="sm" />Parkir
                  </q-bar>
                  <q-card-section class="text-center q-pt-md col-11">
                    <div class="text-weight-bold text-green-10" style="font-size:2.25em">
                      {{ $formatnumber(dashboard.parking) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-xs-4 col-sm-2">
                <q-card class="dashboard-card">
                  <q-bar class="entry-caption">
                    <q-icon name="fas fa-truck-loading" class="q-mr-sm" size="sm" />Muat
                  </q-bar>
                  <q-card-section class="text-center q-pt-md col-11">
                    <div class="text-weight-bold text-green-10" style="font-size:2.25em">
                      {{ $formatnumber(dashboard.loading) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-xs-4 col-sm-2">
                <q-card class="dashboard-card">
                  <q-bar class="entry-caption">
                    <q-icon name="fas fa-dolly-flatbed" class="q-mr-sm" size="sm" />Bongkar
                  </q-bar>
                  <q-card-section class="text-center q-pt-md col-11">
                    <div class="text-weight-bold text-green-10" style="font-size:2.25em">
                      {{ $formatnumber(dashboard.unloading) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-xs-4 col-sm-2">
                <q-card class="dashboard-card">
                  <q-bar class="entry-caption">
                    <q-icon name="fas fa-tools" class="q-mr-sm" size="sm" />Perbaikan
                  </q-bar>
                  <q-card-section class="text-center q-pt-md col-11">
                    <div class="text-weight-bold text-green-10 text-center" style="font-size:2.25em">
                      {{ $formatnumber(dashboard.service) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-tabs v-model="tab" inline-label dense active-color="primary" indicator-color="primary" align="justify"
      narrow-indicator>
      <q-tab name="units" icon="photo" label="Unit" />
      <q-tab name="detail" icon="alarm" label="Kegiatan" />
    </q-tabs>
    <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
      <q-tab-panel name="units">
        <q-card square class="icard">
          <q-bar class="entry-caption">
            <span><strong>{{ pagetitle }}</strong></span>
            <q-space />
            <q-input v-model="filter" dense outline debounce="300" label-color="white" borderless placeholder="Pencarian"
              input-class="text-white">
              <template v-slot:append>
                <q-icon v-if="filter === ''" name="search" color="white" size="sm" />
                <q-icon v-else name="clear" class="cursor-mouer" color="white" size="sm" @click="filter = ''" />
              </template>
            </q-input>
          </q-bar>
          <q-table square :rows="data" :columns="columns" no-data-label="data kosong" :dense="$q.screen.md"
            no-results-label="data yang kamu cari ttransidak ditemukan" row-key="vehicle_no" :filter="filter"
            separator="cell" selection="single" v-model:selected="selected" v-model:pagination="pagination"
            binary-state-sort @request="onRequest" :loading="loading" virtual-scroll>
            <template v-slot:loading>
              <q-inner-loading showing>
                <q-spinner-ball size="75px" color="red-10" />
              </q-inner-loading>
            </template>
            <template v-slot:no-data="{ icon, message, filter }">
              <div class="full-wtransidth row flex-top text-accent q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied" />
                <span>{{ message }}</span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props" @click="props.selected = !props.selected">
                <q-td v-for="col in props.cols" :key="col.name" :props="props">
                  <div class="grid-data">
                    <div v-if="col.name === 'action'">
                      <q-icon name="fas fa-info-circle" size="xs" color="green-10" class="q-mr-sm"
                        @click="show_info(props.row.vehicle_no)" />
                    </div>
                    <div v-else-if="col.name === 'work_order_no'">
                      <span
                        :class="(props.row.work_status === 'Closed') ? 'q-pa-xs bg-green text-white' : (props.row.work_status ==='Cancel') ? 'q-pa-xs bg-red-10 text white':'bg-white text-black'">{{props.row.work_order_no}}</span>
                    </div>
                    <div v-else-if="col.name === 'state_gps'">
                      <span :class="(props.row.state_gps==='Parking') ? 'q-pa-xs bg-red-10 text-white'
                      :(props.row.state_gps==='Driving') ? 'q-pa-xs bg-green-10 text-white'
                      :(props.row.state_gps==='Idle') ? 'q-pa-xs bg-yellow-10 text-white'
                      :'q-pa-xs'">{{props.row.state_gps}}</span>
                    </div>
                    <div v-else-if="col.name === 'gps_last_update'">
                      {{ $INDDateTime(props.row.gps_last_update) }}
                    </div>
                    <div v-else-if="col.name === 'speed'">
                      {{ $formatnumber(props.row.speed) }}
                    </div>
                    <div v-else-if="col.name === 'work_order_number'">
                      <div v-if="(!(props.row.work_order_number===''))">
                        <q-btn :label="props.row.work_order_number" dense glossy rounded class="bg-green-10 text-white"
                          @click="entry_vehicle(props.row.work_order_sysid)" />
                      </div>
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

      </q-tab-panel>

      <q-tab-panel name="detail">
        <q-card square class="icard">
          <q-bar class="entry-caption">
            <span><strong>Surat Muatan (Sedang Operasi)</strong></span>
            <q-space />
            <q-input v-model="filter_spj" dense outline debounce="300" label-color="white" borderless
              placeholder="Pencarian" input-class="text-white">
              <template v-slot:append>
                <q-icon v-if="filter_spj === ''" name="search" color="white" size="sm" />
                <q-icon v-else name="clear" class="cursor-mouer" color="white" size="sm" @click="filter_spj = ''" />
              </template>
            </q-input>
          </q-bar>
          <q-table square :rows="data_spj" :columns="columns_spj" no-data-label="data kosong" :dense="$q.screen.md"
            no-results-label="data yang kamu cari ttransidak ditemukan" row-key="transid" :filter="filter_spj"
            separator="cell" selection="single" v-model:selected="selected_spj" v-model:pagination="pagination_spj"
            binary-state-sort @request="onRequestSPJ" :loading="loading_spj" virtual-scroll>
            <template v-slot:loading>
              <q-inner-loading showing>
                <q-spinner-ball size="75px" color="red-10" />
              </q-inner-loading>
            </template>
            <template v-slot:no-data="{ icon, message, filter }">
              <div class="full-wtransidth row flex-top text-accent q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied" />
                <span>{{ message }}</span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-teal-10 text-white">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props" @click="props.selected = !props.selected">
                <q-td v-for="col in props.cols" :key="col.name" :props="props">
                  <div class="grid-data">
                    <div v-if="col.name === 'vehicle_no'">
                      <q-btn :label="props.row.vehicle_no" dense glossy rounded class="bg-green-10 text-white"
                        @click="entry_vehicle(props.row.transid)" />
                    </div>
                    <div v-else-if="col.name === 'work_order_no'">
                      <span
                        :class="(props.row.is_closed_order === '1') ? 'q-pa-xs bg-green text-white' :'bg-white text-black'">{{props.row.work_order_no}}</span>
                    </div>
                    <div v-else-if="col.name === 'origins_geofance_in'">
                      {{$INDDateTime(props.row.origins_geofance_in)}} s/d {{$INDDateTime(props.row.origins_geofance_out)}}
                    </div>
                    <div v-else-if="col.name === 'destinations_geofance_in'">
                      {{ $INDDateTime(props.row.destinations_geofance_in)}} s/d
                      {{ $INDDateTime(props.row.destinations_geofance_out)}}
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
      </q-tab-panel>
    </q-tab-panels>

    
    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top">
      <q-toolbar class="main-toolbar">
        <q-btn v-for="(btn, index) in btns" :key="index" dense no-caps flat v-show="(btn.is_allowed && !stateform)"
          class="btn-toolbar q-mr-xs" :icon="btn.icon" :label="btn.caption" @click="runMethod(btn.onclick)">
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-page-sticky>

    <q-dialog v-model="dlgState" persistent transition-show="flip-down" transition-hide="flip-up">
      <q-card class="icard" style="min-width: 700px" square>
        <q-bar class="entry-caption">
          Status Unit - {{state}}
          <q-space />
          <q-btn v-close-popup dense glossy rounded icon="close" color="red-5" size="xs">
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-table square :rows="data_state" :columns="columns_state" no-data-label="data kosong" :dense="$q.screen.md"
          no-results-label="data yang kamu cari ttransidak ditemukan" row-key="vehicle_no" :filter="filter_state"
          separator="cell" selection="single" v-model:selected="selected_state" v-model:pagination="pagination_state"
          binary-state-sort @request="onRequestState" :loading="loading_state" virtual-scroll>
          <template v-slot:loading>
            <q-inner-loading showing>
              <q-spinner-ball size="75px" color="red-10" />
            </q-inner-loading>
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-wtransidth row flex-top text-accent q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>{{ message }}</span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" class="bg-blue-grey-14 text-white">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click="props.selected = !props.selected">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <div class="grid-data">
                  <div v-if="col.name === 'action'">
                    <q-icon name="fas fa-info-circle" size="xs" color="green-10" class="q-mr-sm" />
                    <q-icon name="fas fa-map" size="xs" color="green-10" class="q-mr-sm" />
                  </div>
                  <div v-else-if="col.name === 'work_order_no'">
                    <span
                      :class="(props.row.work_status === 'Closed') ? 'q-pa-xs bg-green text-white' : (props.row.work_status ==='Cancel') ? 'q-pa-xs bg-red-10 text white':'bg-white text-black'">{{props.row.work_order_no}}</span>
                  </div>
                  <div v-else-if="col.name === 'state_gps'">
                    <span :class="(props.row.state_gps==='Parking') ? 'q-pa-xs bg-red-10 text-white'
                    :(props.row.state_gps==='Driving') ? 'q-pa-xs bg-green-10 text-white'
                    :(props.row.state_gps==='Idle') ? 'q-pa-xs bg-yellow-10 text-white'
                    :'q-pa-xs'">{{props.row.state_gps}}</span>
                  </div>
                  <div v-else-if="col.name === 'gps_last_update'">
                    {{ $INDDateTime(props.row.gps_last_update) }}
                  </div>
                  <div v-else-if="col.name === 'state_gps_datetime'">
                    {{ $INDDateTime(props.row.state_gps_datetime) }}
                  </div>
                  <div v-else-if="col.name === 'speed'">
                    {{ $formatnumber(props.row.speed) }}
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

    <q-dialog v-model="dlgInfo" persistent>
      <q-card class="icard" square style="min-width:500px">
        <q-bar class="entry-caption">Detail Info Unit
          <q-space />
          <q-btn glossy rounded dense color="red-10" size="xs" v-close-popup icon="close" />
        </q-bar>
        <q-card-section class="q-pa-xs">
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="vehicle.vehicle_no" label="No. Unit" dense outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="vehicle.police_no" label="No. Polisi" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="vehicle.latitude" label="Latitude" dense outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="vehicle.longitude" label="Longitude" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input v-model="vehicle.last_address" label="Alamat" dense type="textarea" outlined square stack-label
                disable input-style="max-height:50px" />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input v-model="vehicle.province" label="Provinsi" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="vehicle.district" label="Kabupaten" dense outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="vehicle.sub_district" label="Kecamatan" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="vehicle.ignation" label="Status Mesin" dense outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="vehicle.speed" label="Kecepatan (Kpj)" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="vehicle.gps_vendor" label="Vendor GPS" dense outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="vehicle.gps_id" label="ID GPS" dense outlined square stack-label disable />
            </div>
          </div>
          <q-separator />
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="vehicle.work_order_number" label="Surat Muatan" dense outlined square stack-label
                disable />
            </div>
            <div class="col-6">
              <q-input v-model="vehicle.work_order_date" label="Tgl.Kegiatan" dense type="date" outlined square
                stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input v-model="vehicle.work_order_driver_name" label="Pengemudi" dense outlined square stack-label
                disable />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dlgMonitoring" persistent>
      <q-card class="icard" square style="min-width:700px">
        <q-bar class="entry-caption">Informasi Kegiatan
          <q-space />
          <q-btn glossy rounded dense color="red-10" size="xs" v-close-popup icon="close" />
        </q-bar>
        <q-card-section class="q-pa-xs">
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="edit.work_order_no" label="Surat Muatan" dense outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="edit.order_no" label="No.Reservasi" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="edit.ref_date" label="Tanggal" dense type="date" outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="edit.driver_name" label="Pengemudi" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="edit.partner_name" label="Nama Rekanan" dense outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="edit.customer_namr" label="Nama Konsumen" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="edit.origins" label="Asal" dense outlined square stack-label disable />
            </div>
            <div class="col-6">
              <q-input v-model="edit.destination" label="Tujuan" dense outlined square stack-label disable />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12 text-bold">
              Waktu Muat Barang
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input v-model="edit.origins_geofance" dense outlined square label="Geofance Muat" stack-label>
                <template v-slot:append>
                  <q-icon name="search" color="blue-grey-10" size="xs" @click="open_geofance('origins')" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-input v-model="edit.origins_geofance_in" label="Tgl Mulai" type="date" dense outlined square
                stack-label />
            </div>
            <div class="col-2">
              <q-input v-model="edit.origins_geofance_in_time" label="Jam Mulai" type="time" dense outlined square
                stack-label />
            </div>
            <div class="col-4">
              <q-input v-model="edit.origins_geofance_out" label="Tgl Selesai" type="date" dense outlined square
                stack-label />
            </div>
            <div class="col-2">
              <q-input v-model="edit.origins_geofance_out_time" label="Jam Selesai" type="time" dense outlined square
                stack-label />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12 text-bold">
              Waktu Bongkar Barang
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-input v-model="edit.destinations_geofance" dense outlined square label="Geofance Bongkaran"
                stack-label>
                <template v-slot:append>
                  <q-icon name="search" color="blue-grey-10" size="xs" @click="open_geofance('destinations')" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-input v-model="edit.destinations_geofance_in" label="Tgl Mulai" type="date" dense outlined square
                stack-label />
            </div>
            <div class="col-2">
              <q-input v-model="edit.destinations_geofance_in_time" label="Jam Mulai" type="time" dense outlined square
                stack-label />
            </div>
            <div class="col-4">
              <q-input v-model="edit.destinations_geofance_out" label="Tgl Selesai" type="date" dense outlined square
                stack-label />
            </div>
            <div class="col-2">
              <q-input v-model="edit.destinations_geofance_out_time" label="Jam Selesai" type="time" dense outlined
                square stack-label />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-12">
              <q-checkbox v-model="edit.is_closed_order" label="Kegiatan operasi selesai" dense true-value="1"
                false-value="0" />
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pa-xs entry-caption" align="right">
          <q-btn flat icon="save" label="Simpan" @click="save_operation()" no-caps no-wrap />
        </q-card-section>
      </q-card>
    </q-dialog>

    <geofance v-if="dlgGeofance" :show="dlgGeofance" state="C" @CloseGeofance="getGeofance" />

  </q-page>
</template>

<script>
import geofance from 'components/Geofance.vue';
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerIos } from "quasar";

export default defineComponent({
  name: "MonitoringUnit",
  components:{geofance},
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();

    const loading = ref(false);
    const edit = ref({});
    const dataevent = ref(false);
    const title = ref("Tambah Data");
    const filter = ref("");
    const stateform=ref(false);

    const pagination = ref({
      sortBy: "vehicle_no",
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });
    const data = ref([]);
    const selected = ref([]);
    const columns = ref([]);

    const pagetitle = ref("");
    const api_url = ref({});
    const btns = ref([]);
    const access = ref({});

    const all=ref("1");
    const pool_code = ref("ALL");
    const pools = ref([]);
    const pools_all = ref([]);
    const vehicle_types=ref([]);
    const dashboard=ref({
      total:0,
      update:0,
      non_update:0,
      driving:0,
      idle:0,
      parking:0,
      loading:0,
      unloading:0,
      service:0
    })
    const dlgState=ref(false);
    const state=ref('');
    const columns_state = ref([
      { name: 'pool_code', align: 'left', label: 'Pool', field:'pool_code'},
      { name: 'vehicle_no', align: 'left', label: 'Unit', field: 'vehicle_no', sortable: true },
      { name: 'police_no', align: 'left', label: 'No.Polisi', field: 'police_no', sortable: true },
      { name: 'state_gps', align: 'left', label: 'Status', field:'state_gps',sortable:true},
      { name: 'minutes_text', align: 'left', label: 'Lama', field: 'minutes_text'},
      { name: 'state_gps_datetime', align: 'left', label: 'Mulai', field: 'state_gps_datetime' },
      { name: 'geofance_name', align: 'left', label: 'Geofance', field: 'geofance_name', sortable: true },
      { name: 'province', align: 'left', label: 'Provinsi', field: 'province', sortable: true },
      { name: 'district', align: 'left', label: 'Kab.', field:'district',sortable:true},
      { name: 'sub_district', align: 'left', label: 'Kec.', field:'sub_district',sortable:true},
      { name: 'last_address', align: 'left', label: 'Alamat', field:'last_address',sortable:true},
      { name: 'gps_vendor', align: 'left', label: 'Vendor GPS', field: 'gps_vendor', sortable: true },
      { name: 'gps_last_update', align: 'left', label: 'GPS Update', field: 'gps_last_update', sortable: true },
    ]);
    const loading_state=ref(false);
    const pagination_state=ref({
      sortBy: "vehicle_no",
      descending: false,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 15,
    })
    const filter_state=ref('');
    const data_state=ref([]);
    const selected_state=ref([]);
    const center = { lat: 40.689247, lng: -74.044502 };
    const isInfo =ref(false);
    const vehicle_type=ref('ALL');
    const dlgInfo=ref(false);
    const vehicle=ref({})
    const dlgMonitoring=ref(false)
    const loading_spj = ref(false);
    const filter_spj = ref("");
    const pagination_spj= ref({
      sortBy: "transid",
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });
    const data_spj = ref([]);
    const selected_spj = ref([]);
    const columns_spj = ref([
      { name: 'pool_code', align: 'left', label: 'Pool', field: 'pool_code' },
      { name: 'vehicle_no', align: 'left', label: 'Unit', field: 'vehicle_no', sortable: true },
      { name: 'police_no', align: 'left', label: 'No.Polisi', field: 'police_no', sortable: true },
      { name: 'work_order_no', align: 'left', label: 'Surat Muatan', field: 'work_order_no', sortable: true },
      { name: 'order_no', align: 'left', label: 'Reservasi', field: 'order_no' },
      { name: 'ref_date', align: 'left', label: 'Tanggal', field: 'ref_date',sortable:true },
      { name: 'partner_name', align: 'left', label: 'Konsumen', field: 'partner_name', sortable: true },
      { name: 'origins', align: 'left', label: 'Asal', field: 'origins', sortable: true },
      { name: 'destination', align: 'left', label: 'Tujuan', field: 'destination', sortable: true },
      { name: 'eta', align: 'center', label: 'ETA (Jam)', field: 'eta'},
      { name: 'duration', align: 'center', label: 'LeadTime (Jam)', field: 'duration'},
      { name: 'origins_geofance', align: 'left', label: 'Geofance Muat', field: 'origins_geofance'},
      { name: 'origins_geofance_in', align: 'center', label: 'Keluar/Masuk Muat', field: 'origins_geofance_in'},
      { name: 'destinations_geofance', align: 'left', label: 'Geofance Bongkaran', field: 'destinations_geofance'},
      { name: 'destinations_geofance_in', align: 'center', label: 'Keluar Masuk Bongkaran', field: 'destinations_geofance_in'},
    ]);
    const dlgGeofance=ref(false)
    const geofance_flag=ref('')
    const tab=ref('units')
    const date1=ref(null)
    const date2=ref(null)


    async function show_gps(row) {
      let lat = 0
      let lng = 0
      if (row.latitude !== '') {
        lat = Number(row.latitude)
      }
      if (row.longitude !== '') {
        lng = Number(row.longitude)
      }
      // props.row.sysid_operation,props.row.vehicle_no,props.row.police_no
      center.value = {
        lat: lat,
        lng: lng
      }
      gps.value = {
        device_id: row.device_id,
        device_name: row.devicename,
        vehicle_no: row.vehicle_no,
        lat: row.latitude,
        lng: row.longitude,
        road_name: row.road_name
      }
      zoom.value = 14
      addmarker()
    }

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination;
      let filter = props.filter;

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage;
      loading.value = true;
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          pool_code:pool_code.value,
          all: all.value,
          vehicle_type:vehicle_type.value,
          url: api_url.value.retrieve
        };
        let respon = await $store.dispatch("master/GET_DATA", props);
        data.value = respon.data;
        pagination.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending,
        };
      } catch (error) {
      } finally {
        loading.value = false;
      }
    }

    async function onRequestSPJ (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination;
      let filter = props.filter;

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage;
      loading_spj.value = true;
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          pool_code: pool_code.value,
          vehicle_group: vehicle_type.value,
          date1:date1.value,
          date2:date2.value,
          all:all.value,
          url: 'operation/monitoring-unit/spj'
        };
        let respon = await $store.dispatch("master/GET_DATA", props);
        data_spj.value = respon.data;
        pagination_spj.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending,
        };
      } catch (error) {
      } finally {
        loading_spj.value = false;
      }
    }

    async function onRequestState (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination;
      let filter = props.filter;

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage;
      loading_state.value = true;
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          pool_code: pool_code.value,
          url: 'operation/monitoring-unit-state',
          state:state.value
        };
        let respon = await $store.dispatch("master/GET_DATA", props);
        data_state.value = respon.data;
        pagination_state.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending,
        };
      } catch (error) {
      } finally {
        loading_state.value = false;
      }
    }

    async function loaddata() {
      let props={}
      props.url ='master/operational/dashboard1';
      props.pool_code=pool_code.value;
      $store.dispatch("master/GET_DATA", props).then((response) => {
        dashboard.value = response
      });

      selected.value = [];
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });

      selected_spj.value = [];
      onRequestSPJ({
        pagination: pagination_spj.value,
        filter: filter_spj.value,
      });
    }

    function refresh_page() {
      loaddata()      
    }

    function runMethod(method, primary = -1) {
      this[method](primary);
    }

    
    function show_state(state_dialog){
      state.value = state_dialog
      dlgState.value=true
      selected_state.value = [];
      onRequestState({
        pagination: pagination_state.value,
        filter: filter_state.value,
      });
    }

    function entry_vehicle(sysid=-1) {
      let props = {}
      props.url = "operation/monitoring-unit/operation"
      props.sysid = sysid;
      $store.dispatch("master/GET_DATA", props).then((response) => {
        dlgMonitoring.value = true
        edit.value = response
      });
    }

    onMounted(async () => {
      let property = await $store.dispatch(
        "home/GET_PAGEPROPERTY",
        $router.currentRoute.value.fullPath
      );
      columns.value = property.columns;
      pagetitle.value = property.title;
      api_url.value = property.url;
      btns.value = property.btn;
      access.value = property.access;
      let props = {};
      props.url = "master/operational/pool/list";
      props.all='1';
      $store.dispatch("master/GET_DATA", props).then((response) => {
        pools_all.value = response;
      });
      props={}
      props.url = "master/operational/vehicle-group/main/list";
      vehicle_types.value=[];
      $store.dispatch("master/GET_DATA", props).then((response) => {
        vehicle_types.value.push({main_group:'ALL'})
        response.forEach(el=>{
          vehicle_types.value.push(el) 
        })
      });
      let skrng = new Date();
      date1.value= skrng.toLocaleDateString("en-CA");
      date2.value= skrng.toLocaleDateString("en-CA");
      refresh_page();
    });
    function show_info(vehicleno=''){
      let props={}
      props.url ="operation/gps_update"
      props.vehicle_no=vehicleno;
      $store.dispatch("master/GET_DATA", props).then((response) => {
        if (!(response===null)){
          vehicle.value = response
          dlgInfo.value = true
        } 
      });
    }

    function show_map(row){
      $router.push({ path: '/operational/map', query: {} });
    }

    async function save_operation () {
      try {
        let app = {};
        app.data = edit.value;
        app.url = "operation/monitoring-unit/operation";
        loading.value = true;
        let respon = await $store.dispatch("master/POST_DATA", app);
        if (!(typeof respon === "undefined")) {
          let msg = respon.data;
          if (respon.success) {
            stateform.value = false;
            $q.notify({
              color: "positive",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
            dlgMonitoring.value=false;
            refresh_page();
          } else {
            $q.loading.hide();
            $q.notify({
              color: "negative",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
          }
        }
      } finally {
        loading.value = false;
      }
    }
   
    function open_geofance (state) {
      geofance_flag.value = state
      dlgGeofance.value = true;
    }

    function getGeofance (closed, data) {
      dlgGeofance.value = closed;
      if (typeof data.geofance_name !== "undefined") {
        if (geofance_flag.value === 'origins') {
          edit.value.origins_geofance = data.geofance_name
        } else {
          edit.value.destinations_geofance = data.geofance_name
        }
      }
    }

    return {
      open_geofance,
      getGeofance,
      dlgGeofance,
      geofance_flag,
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
      loaddata,
      pools,
      vehicle_types,
      vehicle_type,
      all,
      pools_all,
      pool_code,
      dashboard,
      refresh_page,
      dlgState,
      show_state,
      state,
      onRequestState,
      pagination_state,
      filter_state,
      data_state,
      selected_state,
      columns_state,
      show_info,
      show_map,
      dlgInfo,
      vehicle,
      entry_vehicle,
      dlgMonitoring,
      save_operation,
      show_gps,
      loading_spj,
      filter_spj,
      pagination_spj,
      data_spj,
      selected_spj,
      columns_spj,
      onRequestSPJ,
      tab,
      date1,
      date2
    };
  },
});
</script>
sho