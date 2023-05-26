<template>
  <q-page class="page-app">
    <q-card
      class="icard"
      square
    >
      <q-bar class="entry-caption">
        {{ pagetitle }}
      </q-bar>

      <q-card-section class="q-pa-sm">
        <div class="row items-start q-col-gutter-xs q-mb-sm">
          <div class="col-xs-12 col-sm-6 col-md-6">
            <div class="row items-start q-mb-sm q-col-gutter-xs">
              <div class="col-xs-6 col-sm-4 col-md-3">
                <q-input
                  v-model="edit.doc_number"
                  readonly
                  dense
                  outlined
                  type="text"
                  label="No.Pemesanan"
                  square
                  stack-label
                />
              </div>
              <div class="col-xs-6 col-sm-4 col-md-4">
                <q-input
                  v-model="edit.ref_number"
                  dense
                  outlined
                  type="text"
                  label="Referensi Dokumen"
                  square
                  stack-label
                />
              </div>
            </div>
            <div class="row items-start q-mb-sm q-col-gutter-xs">
              <div class="col-xs-6 col-sm-4 col-md-3">
                <q-select
                  v-model="edit.ref_document"
                  :options="refopt"
                  outlined
                  dense
                  options-dense
                  label="Jenis Pemesanan"
                  emit-value
                  map-options
                  fill-input
                  square
                  stack-label
                  @update:model-value="changeref"
                />
              </div>
              <div class="col-xs-6 col-sm-4 col-md-4">
                <q-input
                  v-model="edit.doc_purchase_request"
                  label="Dokumen Permintaan"
                  outlined
                  dense
                  square
                  stack-label
                  readonly
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      size="sm"
                      v-show="edit.ref_document === 'Purchase Request'"
                      @click="open_request()"
                    />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-6 col-sm-8 col-md-7">
                <q-input
                  v-model="edit.supplier_name"
                  dense
                  outlined
                  square
                  readonly
                  label="Nama Supplier"
                  stack-label
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      size="sm"
                      @click="dlgSupplier = true"
                    />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-xs-6 col-sm-8 col-md-7">
                <q-select
                  v-model="edit.location_id"
                  :options="warehouse_opt"
                  outlined
                  dense
                  options-dense
                  label="Lokasi"
                  option-value="sysid"
                  option-label="location_name"
                  emit-value
                  map-options
                  use-input
                  square
                  stack-label
                />
              </div>
            </div>
          </div>
          <div class="col-xs-12 offset-sm-1 col-sm-5 offset-md-2 col-md-4">
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <q-input
                  v-model="edit.ref_date"
                  dense
                  outlined
                  type="date"
                  label="Tanggal Pemesanan"
                  square
                  stack-label
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="edit.expired_date"
                  dense
                  outlined
                  type="date"
                  label="Berlaku s/d"
                  square
                  stack-label
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-xs q-mb-sm">
              <div class="col-6">
                <q-input
                  v-model="edit.delivery_date"
                  dense
                  outlined
                  type="date"
                  label="Tanggal Pengiriman"
                  square
                  stack-label
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="edit.warehouse_id"
                  :options="warehouse_opt"
                  outlined
                  dense
                  options-dense
                  label="Termin Pembayaran"
                  option-value="warehouse_id"
                  option-label="warehouse_name"
                  emit-value
                  map-options
                  use-input
                  square
                  stack-label
                />
              </div>
            </div>
            <div class="row items-start q-col-gutter-sm q-mb-sm">
              <div class="col-6">
                <q-select
                  v-model="edit.purchase_type"
                  :options="warehouse_opt"
                  outlined
                  dense
                  options-dense
                  label="Jenis Pembelian"
                  option-value="warehouse_id"
                  option-label="warehouse_name"
                  emit-value
                  map-options
                  use-input
                  square
                  stack-label
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="edit.order_type"
                  :options="warehouse_opt"
                  outlined
                  dense
                  options-dense
                  label="Jenis Pemesanan"
                  option-value="warehouse_id"
                  option-label="warehouse_name"
                  emit-value
                  map-options
                  use-input
                  square
                  stack-label
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-table
        square
        dense
        class="grid-tables"
        :rows="detail"
        :columns="coldetail"
        no-data-label="data kosong"
        no-results-label="data yang kamu cari tidak ditemukan"
        row-key="line_no"
        separator="cell"
        selection="single"
        v-model:selected="selected_detail"
        v-model:pagination="pagination_detail"
        virtual-scroll
        hide-selected-banner
        hide-pagination
        auto-width
        hide-no-data
      >
        <template v-slot:bottom-row>
          <q-tr align="left">
            <q-td colspan="100%">
              <q-btn
                label="Tambah"
                dense
                no-caps
                flat
                icon="add"
                class="text-primary"
                @click="addrow"
              />
            </q-td>
          </q-tr>
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="bg-teal-8 text-white"
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
              <div v-if="is_posted === true">
                <div class="grid-data">
                  <div v-if="col.name === 'qty_draft'">
                    {{ $formatnumber(props.row.qty_draft, 2) }}
                  </div>
                  <div v-else-if="col.name === 'qty_order'">
                    <vue-numeric
                      v-model="props.row.qty_order"
                      class="q-field__input right-input"
                      separator="."
                      @input="calculate(props.row.line_no, false)"
                    />
                  </div>
                  <div v-else-if="col.name === 'price'">
                    {{ $formatnumber(props.row.price, 0) }}
                  </div>
                  <div v-else-if="col.name === 'prc_discount1'">
                    {{ $formatnumber(props.row.prc_discount1, 2) }}
                  </div>
                  <div v-else-if="col.name === 'prc_discount2'">
                    {{ $formatnumber(props.row.prc_discount2, 2) }}
                  </div>
                  <div v-else-if="col.name === 'prc_tax'">
                    {{ $formatnumber(props.row.prc_tax, 2) }}
                  </div>
                  <div v-else-if="col.name === 'total'">
                    {{ $formatnumber(props.row.total) }}
                  </div>
                  <div v-else>
                    {{ col.value }}
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="grid-data">
                  <div v-if="col.name === 'line_no'">
                    {{ col.value }}
                    <q-icon
                      name="delete"
                      color="red"
                      size="sm"
                      @click="removeRow(props.row.line_no)"
                    />
                  </div>
                  <div v-else-if="col.name === 'item_code'">
                    <input
                      v-model="props.row.item_code"
                      type="text"
                      style="width: 80px"
                      class="input"
                      v-on:keyup.enter="
                        getItemByCode(props.row.item_code, props.row.line_no)
                      "
                    />
                    <q-icon
                      name="search"
                      color="blue"
                      size="sm"
                      @click="openitem(props.row.line_no)"
                    />
                  </div>
                  <div v-else-if="col.name === 'line_type'">
                    <select
                      v-model="props.row.line_type"
                      class="q-field__input normal-input full-width"
                      style="width: 100px"
                    >
                      <option>Follow</option>
                      <option>Kill</option>
                    </select>
                  </div>
                  <div v-else-if="col.name === 'qty_draft'">
                    <vue-numeric
                      v-model="props.row.qty_draft"
                      class="q-field__input right-input"
                      separator="."
                      @input="calculate(props.row.line_no, true)"
                    />
                  </div>
                  <div v-else-if="col.name === 'qty_order'">
                    <span style="color: red">{{
                      $formatnumber(props.row.qty_order, 2)
                    }}</span>
                  </div>
                  <div v-else-if="col.name === 'price'">
                    <vue-numeric
                      v-model="props.row.price"
                      class="q-field__input right-input"
                      separator="."
                      @input="calculate(props.row.line_no, true)"
                    />
                  </div>
                  <div v-else-if="col.name === 'prc_discount1'">
                    <vue-numeric
                      v-model="props.row.prc_discount1"
                      class="q-field__input right-input"
                      separator="."
                      :v-bind:precision="2"
                      @input="calculate(props.row.line_no, true)"
                    />
                  </div>
                  <div v-else-if="col.name === 'prc_discount2'">
                    <vue-numeric
                      v-model="props.row.prc_discount2"
                      class="q-field__input right-input"
                      separator="."
                      :v-bind:precision="2"
                      @input="calculate(props.row.line_no, true)"
                    />
                  </div>
                  <div v-else-if="col.name === 'prc_tax'">
                    <vue-numeric
                      v-model="props.row.prc_tax"
                      class="q-field__input right-input"
                      separator="."
                      :v-bind:precision="2"
                      @input="calculate(props.row.line_no, true)"
                    />
                  </div>
                  <div v-else-if="col.name === 'total'">
                    {{ $formatnumber(props.row.total) }}
                  </div>
                  <div v-else>
                    {{ col.value }}
                  </div>
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-card-section class="q-pa-sm">
        <q-input
          v-model="edit.purchase_instruction"
          type="textarea"
          label="Instruksi pengiriman"
          outlined
          input-style="max-height:100px"
          square
          stack-label
        />
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
          class="btn-toolbar q-mx-sm"
          :icon="btn.icon"
          :label="btn.caption"
          @click="runMethod(btn.onclick)"
        >
          <q-tooltip content-class="tooltips-app">
            {{ btn.tooltips }}
          </q-tooltip>
        </q-btn>
        <q-btn
          v-show="stateform"
          flat
          icon="save"
          :label="lblSave"
          class="btn-toolbar q-mx-sm"
          no-caps
          dense
          @click="save_data()"
          :loading="loading"
        >
          <template v-slot:loading>
            <q-spinner class="on-left" />
            Proses
          </template>
        </q-btn>
        <q-btn
          v-show="stateform"
          flat
          icon="undo"
          label="Batal"
          class="btn-toolbar q-mx-sm"
          no-caps
          dense
          @click="stateform = false"
        />
      </q-toolbar>
    </q-page-sticky>

    <q-dialog
      v-model="dlgPurchaseOrder"
      persistent
    >
      <q-card
        v-show="!stateform && Filtered"
        square
        class="icard q-mb-sm"
      >
        <q-bar
          class="entry-caption"
          style="font-size: 10px"
        >
          <span><strong>Filter</strong></span>
          <q-space />
          <q-btn
            dense
            flat
            icon="ti-close"
            color="white"
            size="xs"
            @click="Filtered = !Filtered"
          />
        </q-bar>
        <q-card-section class="q-pa-sm">
          <div class="row items-center q-gutter-sm">
            <q-input
              v-model="date1"
              type="date"
              dense
              outlined
              square
              label="Tanggal"
            />
            <q-input
              v-model="date2"
              type="date"
              dense
              outlined
              square
              label="Tanggal"
            />
            <q-btn
              glossy
              rounded
              label="Perbaharui"
              icon="refresh"
              color="green-10"
              no-caps
              @click="loaddata()"
            />
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
                class="cursor-pointer"
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
          :class="
            Filtered
              ? 'grid-tables fix-table-with-parameter'
              : 'grid-tables fix-table'
          "
          virtual-scroll
          dense
        >
          <template v-slot:loading>
            <q-spinner-ios
              showing
              color="primary"
            />
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
              :class="
                props.row.is_cancel === '1'
                  ? 'q-pa-xs text-grey'
                  : props.row.is_posted === '1'
                  ? 'q-pa-xs text-green-10'
                  : props.row.is_cancel === '1'
                  ? 'q-pa-xs text-red-10 text-strike'
                  : 'q-pa-xs'
              "
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
                  <div v-else-if="col.name === 'status'">
                    <span>{{
                      props.row.is_cancel === '1'
                        ? 'Dibatalkan'
                        : props.row.is_posted === '1'
                        ? 'Disetujui'
                        : 'Draft'
                    }}</span>
                  </div>
                  <div v-else-if="col.name === 'ref_date'">
                    {{ $INDDate(props.row.ref_date) }}
                  </div>
                  <div v-else-if="col.name === 'validate_date'">
                    {{ $INDDate(props.row.validate_date) }}
                  </div>
                  <div v-else-if="col.name === 'total'">
                    {{ $formatnumber(props.row.total) }}
                  </div>
                  <div v-else-if="col.name === 'approved_total'">
                    {{ $formatnumber(props.row.approved_total) }}
                  </div>
                  <div v-else-if="col.name === 'posted_date'">
                    {{ $INDDateTime(props.row.posted_date) }}
                  </div>
                  <div v-else-if="col.name === 'doc_name'">
                    <q-icon
                      name="fas fa-cloud-upload-alt"
                      size="xs"
                      color="blue"
                      class="q-mr-sm"
                      @click="upload_event(props.row.transid)"
                    /><span>{{ props.row.doc_name }}</span>
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
      v-model="dlgRequest"
      persistent
    >
      <q-card
        square
        style="width: 800px; max-width: 95vw"
      >
        <q-bar class="entry-caption"
          >Permintaan Pembelian
          <q-space />
          <q-btn
            icon="close"
            size="sm"
            dense
            flat
            rounded
            v-close-popup
          />
        </q-bar>
        <q-table
          square
          :rows="requests"
          :columns="colrequest"
          no-data-label="data kosong"
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="transid"
          separator="cell"
          selection="single"
          v-model:selected="selected_requests"
          v-model:pagination="pagination_requests"
          binary-state-sort
          class="grid-tables fix-table-dialog"
          virtual-scroll
          dense
        >
          <template v-slot:loading>
            <q-spinner-ios
              showing
              color="primary"
            />
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
                class="bg-blue-grey-10 text-white"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              @click="props.selected = !props.selected"
              :class="
                props.row.is_cancel === '1'
                  ? 'q-pa-xs text-grey'
                  : props.row.is_posted === '1'
                  ? 'q-pa-xs text-green-10'
                  : props.row.is_cancel === '1'
                  ? 'q-pa-xs text-red-10 text-strike'
                  : 'q-pa-xs'
              "
            >
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                <div class="grid-data">
                  <div v-if="col.name === 'ref_date'">
                    {{ $INDDate(props.row.ref_date) }}
                  </div>
                  <div v-else-if="col.name === 'posted_date'">
                    {{ $INDDateTime(props.row.posted_date) }}
                  </div>
                  <div v-else>
                    {{ col.value }}
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-card-section
          class="q-pa-xs dialog-action"
          align="right"
        >
          <q-btn
            label="Pilih"
            color="positive"
            icon="check"
            flat
            class="q-mr-sm"
            @click="select_request()"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="dlgRequestDtl"
      persistent
    >
      <q-card
        square
        style="width: 800px; max-width: 95vw"
      >
        <q-bar class="entry-caption"
          >Detail Permintaan Pembelian
          <q-space />
          <q-btn
            icon="close"
            size="sm"
            dense
            flat
            rounded
            v-close-popup
          />
        </q-bar>
        <q-table
          square
          :rows="requestsDtl"
          :columns="colrequestDtl"
          no-data-label="data kosong"
          no-results-label="data yang kamu cari tidak ditemukan"
          row-key="line_no"
          separator="cell"
          selection="multiple"
          v-model:selected="selected_requestsDtl"
          v-model:pagination="pagination_requestsDtl"
          binary-state-sort
          class="grid-tables fix-table-dialog"
          virtual-scroll
          dense
        >
          <template v-slot:loading>
            <q-spinner-ios
              showing
              color="primary"
            />
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
                class="bg-blue-grey-10 text-white"
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
                  <div v-if="col.name === 'ref_date'">
                    {{ $INDDate(props.row.ref_date) }}
                  </div>
                  <div v-else-if="col.name === 'posted_date'">
                    {{ $INDDateTime(props.row.posted_date) }}
                  </div>
                  <div v-else-if="col.name === 'qty_request'">
                    {{ $formatnumber(props.row.qty_request) }}
                  </div>
                  <div v-else-if="col.name === 'line_supply'">
                    {{ $formatnumber(props.row.line_supply) }}
                  </div>
                  <div v-else>
                    {{ col.value }}
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-card-section
          class="q-pa-xs dialog-action"
          align="right"
        >
          <q-btn
            label="Pilih"
            color="positive"
            icon="check"
            flat
            class="q-mr-sm"
            @click="select_requestdtl()"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <items
      v-if="dlgItem"
      :show="dlgItem"
      :state="open"
      @CloseItems="getItem"
    />
    <supplier
      v-if="dlgSupplier"
      :show="dlgSupplier"
      @CloseData="getSupplier"
    />
  </q-page>
</template>

<script>
import { ymd } from 'boot/engine'
import items from 'components/master/Items.vue'
import supplier from 'components/master/Supplier.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar, QSpinnerIos } from 'quasar'
import state from 'src/store/utility/home/state'

export default defineComponent({
  name: 'PurchaseOrder',
  components: { items, supplier },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const dlgPurchaseOrder = ref(false)
    const loading = ref(false)
    const date1 = ref(null)
    const date2 = ref(null)
    const stateform = ref(false)
    const edit = ref({})
    const patient = ref({})
    const title = ref('Tambah Data')
    const filter = ref('')
    const refopt = ref(['Purchase Request', 'General PO'])
    const dlgItem = ref(false)
    const operation = ref('')

    const pagination = ref({
      sortBy: 'transid',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})

    const coldetail = ref([
      {
        name: 'line_no',
        align: 'Left',
        sytle: 'width: 60px',
        headerStyle: 'width: 60px',
        label: '#',
        field: 'line_no'
      },
      {
        name: 'item_code',
        align: 'left',
        sytle: 'width: 100px',
        headerStyle: 'width: 100px',
        label: 'Kode',
        field: 'item_code'
      },
      {
        name: 'part_number',
        align: 'left',
        sytle: 'width: 170px',
        headerStyle: 'width: 170px',
        label: 'Part Number',
        field: 'part_number'
      },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Keterangan',
        sytle: 'width: 250px',
        field: 'descriptions'
      },
      {
        name: 'line_type',
        align: 'left',
        label: 'Tipe',
        field: 'line_type',
        style: 'width:60px'
      },
      {
        name: 'qty_draft',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Jml.Draft',
        field: 'qty_draft'
      },
      {
        name: 'qty_order',
        align: 'right',
        sytle: 'width: 30px',
        headerStyle: 'width: 30px',
        label: 'Jml.Order',
        field: 'qty_order'
      },
      {
        name: 'mou_purchase',
        align: 'left',
        label: 'Unit Beli',
        field: 'mou_purchase'
      },
      {
        name: 'convertion',
        align: 'center',
        label: 'Isi/Unit Beli',
        field: 'convertion'
      },
      {
        name: 'mou_warehouse',
        align: 'left',
        label: 'Unit Simpan',
        field: 'mou_warehouse'
      },
      {
        name: 'price',
        align: 'right',
        label: 'Harga/Unit Beli',
        field: 'price'
      },
      {
        name: 'prc_discount1',
        align: 'right',
        label: 'Diskon (%)',
        field: 'prc_discount1'
      },
      { name: 'prc_tax', align: 'right', label: 'PPN (%)', field: 'prc_tax' },
      { name: 'total', align: 'right', label: 'Total', field: 'total' },
      {
        name: 'qty_request',
        align: 'right',
        label: 'Permintaan',
        field: 'qty_request'
      },
      {
        name: 'current_stock',
        align: 'right',
        label: 'Stock',
        field: 'current_stock'
      },
      {
        name: 'source_line',
        align: 'left',
        label: 'Jenis',
        field: 'source_line'
      }
    ])
    const detail = ref([])
    const selected_detail = ref([])
    const pagination_detail = ref({
      sortBy: 'line_no',
      descending: false,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 50
    })
    const current_row = ref(-1)
    const Filtered = ref(false)
    const postate = ref(false)
    const dlgSupplier = ref(false)
    const posted = ref(false)
    const deleted = ref(false)
    const is_posted = ref(false)
    const is_cancel = ref(false)
    const lblSave = ref('Simpan')
    const warehouse_opt = ref([])
    const dlgRequest = ref(false)
    const colrequest = ref([
      {
        name: 'doc_number',
        align: 'Left',
        label: 'No.Permintaan',
        field: 'doc_number'
      },
      { name: 'ref_date', align: 'left', label: 'Tanggal', field: 'ref_date' },
      {
        name: 'warehouse_id',
        align: 'left',
        label: 'Gudang',
        field: 'warehouse_id'
      },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Keterangan',
        field: 'descriptions'
      },
      {
        name: 'priority',
        align: 'left',
        label: 'Prioritas',
        field: 'priority'
      },
      {
        name: 'posted_date',
        align: 'left',
        label: 'Waktu Posting',
        field: 'posted_date'
      },
      {
        name: 'user_posted',
        align: 'left',
        label: 'User Posting',
        field: 'user_posted'
      }
    ])
    const requests = ref([])
    const selected_requests = ref([])
    const pagination_requests = ref({
      sortBy: 'transid',
      descending: true,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    })
    const dlgRequestDtl = ref(false)
    const colrequestDtl = ref([
      { name: 'item_code', align: 'Left', label: 'Kode', field: 'item_code' },
      {
        name: 'part_number',
        align: 'left',
        label: 'Part Numner',
        field: 'part_number'
      },
      {
        name: 'descriptions',
        align: 'left',
        label: 'Nama Item',
        field: 'descriptions'
      },
      {
        name: 'qty_request',
        align: 'right',
        label: 'Permintaan',
        field: 'qty_request'
      },
      {
        name: 'line_supply',
        align: 'right',
        label: 'Sudah PO',
        field: 'line_supply'
      },
      {
        name: 'mou_purchase',
        align: 'left',
        label: 'Satuan Beli',
        field: 'mou_purchase'
      },
      {
        name: 'current_stock',
        align: 'left',
        label: 'Stock Gudang',
        field: 'current_stock'
      },
      {
        name: 'partner_name',
        align: 'left',
        label: 'Supplier terakhir',
        field: 'partner_name'
      }
    ])
    const requestsDtl = ref([])
    const selected_requestsDtl = ref([])
    const pagination_requestsDtl = ref({
      sortBy: 'line_no',
      descending: true,
      page: 1,
      rowsPerPage: 0,
      rowsNumber: 0
    })

    function runMethod(method, transid = -1) {
      this[method](transid)
    }
    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function refresh_po() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    async function onRequest(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      $q.loading.show({ delay: 100 })
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          date1: date1.value,
          date2: date2.value,
          url: api_url.value.retrieve,
          isopen: Filtered.value ? '1' : '0',
          all: postate.value === 'ALL' ? '1' : '0'
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
        $q.loading.hide()
      }
    }

    async function add_event() {
      let skrng = new Date()
      stateform.value = true
      operation.value = 'inserted'
      lblSave.value = 'Simpan'
      edit.value = {
        transid: -1,
        site_code: '',
        ref_date: ymd(skrng),
        expired_date: ymd(skrng),
        delivery_date: null,
        doc_number: '(NEW)',
        location_id: '',
        ref_document: 'General PO',
        project_title: '-',
        partner_id: '',
        partner_name: '',
        doc_purchase_request: '-',
        purchase_request_id: -1,
        purchase_instruction: '-',
        total: 0,
        term_id: null,
        purchase_type: null,
        order_type: null
      }
      detail.value = []
    }

    async function edit_event(uuidrec = -1) {
      if (selected.value.length > 0 || !(uuidrec === '')) {
        operation.value = 'updated'
        if (transid === -1) {
          let item = selected.value[0]
          uuidrec = item.uuid_rec
        }

        let props = {}
        props.url = api_url.value.edit
        props.uuidrec = uuidrec
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          stateform.value = true
          lblSave.value = 'Simpan'
          edit.value = respon.header
          if (respon.detail === null) {
            detail.value = []
          } else {
            detail.value = respon.detail
          }
        }
      }
    }

    async function posting_event(transid = -1, showrespon = true) {
      if (selected.value.length > 0 || !(transid === -1)) {
        posted.value = false
        deleted.value = false
        operation.value = 'updated'
        $q.loading.show({ delay: 100 })
        try {
          if (transid === -1) {
            let item = selected.value[0]
            transid = item.transid
          }
          let props = {}
          props.url = api_url.value.edit
          props.transid = transid
          let respon = await $store.dispatch('master/GET_DATA', props, true)
          if (!(typeof respon === 'undefined')) {
            stateform.value = true
            edit.value = respon.header
            if (respon.detail === null) {
              detail.value = []
            } else {
              detail.value = respon.detail
            }
            is_posted.value = true
            lblSave.value = 'Posting'
            posted.value = respon.is_posted
            deleted.value = respon.is_cancel
            if (showrespon) {
              if (posted.value || deleted.value) {
                $q.dialog({
                  title: 'Peringatan',
                  message: respon.message,
                  persistent: true
                })
              }
            }
          }
        } finally {
          $q.loading.hide()
        }
      }
    }

    async function delete_event(transid = -1) {
      if (selected.value.length > 0 || transid !== -1) {
        operation.value = 'deleted'
        if (transid === -1) {
          let item = selected.value[0].value
          transid = item.transid
        }
        $q.dialog({
          title: 'Konfirmasi',
          message: 'Apakah data ini  akan dibatalkan ?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          let props = {}
          props.url = api_url.value.delete
          props.transid = transid
          $store.dispatch('master/DELETE_DATA', props).then((respon) => {
            if (!(typeof respon === 'undefined')) {
              let msg = respon.data
              if (respon.success) {
                $q.notify({
                  color: 'green-10',
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
          })
        })
      }
    }

    function save_data() {
      let total = 0
      detail.value.forEach((el) => {
        total = total + el.total
      })
      if (total <= 0) {
        $q.dialog({
          title: 'Peringatan',
          message: 'Nilai PO tidak boleh NOL',
          persistent: true
        })
        return
      }
      $q.dialog({
        title: 'Konfirmasi',
        message:
          lblSave.value === 'Simpan'
            ? 'Apakah order pembelian ini akan disimpan ?'
            : 'Apakah order pembelian ini akan diposting/approved ?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          let where = {}
          let app = {}
          where.transid = edit.value.transid
          app.operation = operation.value
          app.header = edit.value
          app.detail = detail.value
          app.where = where
          if (lblSave.value === 'Simpan') {
            app.url = api_url.value.save
          } else {
            app.url = api_url.value.posting
          }
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
          loading.value = false
        }
      })
    }

    async function print_event(transid = -1) {
      if (selected.value.length > 0 || !(transid === -1)) {
        if (transid === -1) {
          let item = selected.value[0]
          transid = item.transid
        }
        $q.loading.show({ delay: 200 })
        try {
          let props = {}
          props.url = api_url.value.print
          props.transid = transid
          await $store.dispatch('master/GET_DOWNLOAD', props)
        } finally {
          $q.loading.hide()
        }
      }
    }

    async function addrow() {
      if (edit.value.doc_purchase_request === '-') {
        let data = {}
        data = {
          transid: -1,
          line_no: detail.value.length + 1,
          item_code: '',
          descriptions: '',
          mou_purchase: '',
          mou_warehouse: '',
          convertion: 0,
          qty_draft: 0,
          price: 0,
          prc_discount1: 0,
          amount_discount1: 0,
          prc_discount2: 0,
          amount_discount2: 0,
          prc_tax: 0,
          amount_tax: 0,
          total: 0,
          line_type: 'Follow',
          source_line: 'FreeLine',
          line_state: 'O',
          qty_request: 0,
          current_stock: 0,
          purchase_request_id: -1,
          purchase_line_no: -1
        }
        detail.value.push(data)
        openitem(data.line_no)
      } else {
        selected_requestsDtl.value = []
        dlgRequestDtl.value = true
        let props = {}
        props.url = 'inventory/purchase-order/dtlrequest'
        props.doc_number = edit.value.doc_purchase_request
        props.all = '0'
        requestsDtl.value = await $store.dispatch('master/GET_DATA', props)
      }
    }

    function removeRow(lineno) {
      let i = -1
      for (i = 0; i < detail.value.length; i++) {
        if (detail.value[i].line_no === lineno) {
          detail.value.splice(i, 1)
        }
      }
      let totalpo = 0
      for (i = 0; i < detail.value.length; i++) {
        detail.value[i].line_no = i + 1
        totalpo = totalpo + detail.value[i].total
      }
      selected_detail.value = []
      edit.value.total = totalpo
    }

    function openitem(lineno) {
      dlgItem.value = true
      current_row.value = lineno
    }

    function getItem(closed, data) {
      dlgItem.value = closed
      if (!(typeof data.item_code === 'undefined')) {
        let i = 0
        for (i = 0; i < detail.value.length; i++) {
          if (detail.value[i].line_no === current_row.value) {
            detail.value[i].item_code = data.item_code
            detail.value[i].descriptions = data.descriptions
            detail.value[i].mou_purchase = data.mou_purchase
            detail.value[i].mou_warehouse = data.mou_warehouse
            detail.value[i].current_stock = 0
            detail.value[i].convertion = data.convertion
            detail.value[i].part_number = data.part_number
            detail.value[i].price = data.purchase_price
            detail.value[i].prc_discount1 = data.purchase_discount
            detail.value[i].prc_tax = data.purchase_tax
          }
        }
      }
    }
    function getItemByCode(item_code, line_no = -1) {
      let props = {}
      props.url = 'master/inventory/items/getitem'
      props.item_code = item_code
      props.progress = true
      $store.dispatch('master/GET_DATA', props).then((respon) => {
        let item = respon
        if (item) {
          let i = 0
          for (i = 0; i < detail.value.length; i++) {
            if (detail.value[i].line_no === line_no) {
              detail.value[i].item_code = item.item_code
              detail.value[i].descriptions = item.descriptions
              detail.value[i].mou_purchase = item.mou_purchase
              detail.value[i].mou_warehouse = item.mou_warehouse
              detail.value[i].current_stock = 0
              detail.value[i].convertion = item.convertion
              detail.value[i].part_number = item.part_number
              detail.value[i].price = item.purchase_price
              detail.value[i].prc_discount1 = item.purchase_discount
              detail.value[i].prc_tax = item.purchase_tax
            }
          }
        } else {
          $q.notify({
            color: 'orange-10',
            textcolor: 'white',
            message: 'Item inventory tidak ditemukan:',
            position: 'top',
            timeout: 1000
          })
        }
      })
    }

    function calculate(lineno, isdraft = false) {
      let idx = lineno - 1
      if (isdraft === true) {
        if (detail.value[idx].source_line === 'ReqLine') {
          if (detail.value[idx].qty_draft > detail.value[idx].qty_request) {
            $q.dialog({
              title: 'Peringatan',
              message: 'Jumlah Order tidak boleh besar dari permintaan',
              persistent: true
            })
            return
          }
        }
      }
      let qty = 0
      if (isdraft) {
        qty = detail.value[idx].qty_draft
      } else {
        qty = detail.value[idx].qty_order
      }
      let price = detail.value[idx].price
      let disc1 = detail.value[idx].prc_discount1
      let disc2 = detail.value[idx].prc_discount2
      let tax = detail.value[idx].prc_tax
      let total = qty * price
      disc1 = total * (disc1 / 100)
      disc2 = (total - disc1) * (disc2 / 100)
      tax = (total - (disc1 + disc2)) * (tax / 100)
      detail.value[idx].amount_discount1 = disc1
      detail.value[idx].amount_discount2 = disc2
      detail.value[idx].amount_tax = tax
      total = total - (disc1 + disc2) + tax
      detail.value[idx].total = total
      let totalpo = 0
      detail.value.forEach((el) => {
        totalpo = totalpo + el.total
      })
      edit.value.total = totalpo
    }

    async function changeref() {}

    async function unposting_event(transid = -1) {
      if (selected.value.length > 0 || transid !== -1) {
        operation.value = 'deleted'
        if (transid === -1) {
          let item = this.selected.value[0]
          transid = item.transid
        }
        $q.dialog({
          title: 'Konfirmasi',
          message:
            'Apakah data ini akan dilakukan pembatalan posting/approve ?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          let props = {}
          props.url = this.api_url.unposting
          props.transid = transid
          $store.dispatch('master/DELETE_DATA', props).then((respon) => {
            if (!(typeof respon === 'undefined')) {
              let msg = respon.data
              if (respon.success) {
                $q.notify({
                  color: 'negative',
                  textcolor: 'white',
                  message: msg,
                  position: 'top',
                  timeout: 200
                })
                loaddata()
              } else {
                this.$q.dialog({
                  title: 'Peringatan',
                  message: msg,
                  persistent: true
                })
              }
            }
          })
        })
      }
    }
    function changeitem_mou(itemcode, mou) {
      let props = {}
      props.url = 'master/mou/itemmou'
      props.item_code = itemcode
      props.mou = mou
      $store.dispatch('master/GET_DATA', props).then((respon) => {
        let info = respon
        if (typeof info !== 'undefined') {
          let i = 0
          for (i = 0; i < detail.value.length; i++) {
            if (detail.value[i].item_code === itemcode) {
              detail.value[i].price = info.purchase_price
              detail.value[i].prc_discount1 = info.purchase_discount
              detail.value[i].prc_tax = info.vat
              detail.value[i].current_stock = 0
              detail.value[i].convertion = info.convertion
              calculate(detail.value[i].line_no, true)
            }
          }
        }
      })
    }

    function getSupplier(closed, data) {
      dlgSupplier.value = closed
      if (typeof data.sysid !== 'undefined') {
        console.info('entered')
        edit.value.partner_id = data.sysid
        edit.value.supplier_name =
          data.supplier_code + ' - ' + data.supplier_name
      }
    }
    function open_request() {
      let props = {}
      props.url = 'inventory/purchase-request/open'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        requests.value = response
      })
      dlgRequest.value = true
    }
    function select_request() {
      if (selected_requests.value.length > 0) {
        let item = selected_requests.value[0]
        edit.value.purchase_request_id = item.transid
        edit.value.doc_purchase_request = item.doc_number
        dlgRequest.value = false
      }
    }
    function select_requestdtl() {
      if (selected_requestsDtl.value.length > 0) {
        let founded = false
        selected_requestsDtl.value.forEach((el) => {
          founded = false
          detail.value.forEach((dtl) => {
            if (dtl.item_code === el.item_code) {
              founded = true
            }
          })

          if (!founded) {
            let data = {}
            data = {
              transid: -1,
              line_no: detail.value.length + 1,
              item_code: el.item_code,
              descriptions: el.descriptions,
              mou_purchase: el.mou_purchase,
              mou_warehouse: el.mou_inventory,
              convertion: el.convertion,
              qty_draft: el.qty_request - el.line_supply,
              price: el.purchase_price,
              prc_discount1: 0,
              amount_discount1: 0,
              prc_discount2: 0,
              amount_discount2: 0,
              prc_tax: 0,
              amount_tax: 0,
              total: (el.qty_request - el.line_supply) * el.purchase_price,
              line_type: 'Follow',
              source_line: 'ReqLine',
              line_state: 'O',
              qty_request: el.qty_request - el.line_supply,
              current_stock: 0,
              purchase_request_id: el.transid,
              purchase_line_no: el.line_no
            }
            detail.value.push(data)
          }
        })
        dlgRequestDtl.value = false
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
      date1.value = ymd(skrng)
      date2.value = ymd(skrng)

      let props = {}
      props.url = 'master/inventory/warehouse/list'
      props.type = 'RECEIVE'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        warehouse_opt.value = response
      })
    })

    return {
      dlgPurchaseOrder,
      loading,
      stateform,
      data,
      patient,
      edit,
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
      refopt,
      date1,
      date2,
      pagination_detail,
      detail,
      selected_detail,
      current_row,
      print_event,
      Filtered,
      postate,
      coldetail,
      dlgItem,
      getItem,
      dlgSupplier,
      removeRow,
      refresh_po,
      operation,
      addrow,
      calculate,
      changeref,
      openitem,
      posting_event,
      posted,
      deleted,
      is_posted,
      is_cancel,
      lblSave,
      unposting_event,
      warehouse_opt,
      getSupplier,
      getItemByCode,
      open_request,
      dlgRequest,
      colrequest,
      requests,
      selected_requests,
      pagination_requests,
      select_request,
      dlgRequestDtl,
      colrequestDtl,
      requestsDtl,
      selected_requestsDtl,
      pagination_requestsDtl,
      select_requestdtl
    }
  }
})
</script>
