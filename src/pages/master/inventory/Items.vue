<template>
  <q-page class="page-app">
    <q-card
      square
      class="icard"
    >
      <q-bar class="entry-caption">
        <strong>{{ pagetitle }}</strong>
        <q-space />
        <q-input
          dark
          v-model="filter"
          flat
          dense
          debounce="500"
          placeholder="Pencarian"
          input-class="q__field_filter-search"
        >
          <template v-slot:append>
            <q-icon
              v-if="filter === ''"
              name="search"
              size="xs"
              color="white"
            />
            <q-icon
              v-else
              name="clear"
              class="cursor-pointer"
              size="xs"
              @click="filter = ''"
              color="white"
            />
          </template>
        </q-input>
      </q-bar>
      <q-table
        dense
        square
        :rows="data"
        :columns="columns"
        no-data-label="data kosong"
        no-results-label="data yang cari tidak ditemukan"
        row-key="sysid"
        :filter="filter"
        separator="cell"
        selection="single"
        v-model:selected="selected"
        v-model:pagination="pagination"
        binary-state-sort
        @request="onRequest"
        :loading="loading"
        virtual-scroll
        table-class="fit-table-ui"
      >
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
                    @click="runMethod(btn.onclick, props.row.uuid_rec)"
                  >
                    <q-tooltip content-class="tooltips-app">
                      {{ btn.tooltips }}
                    </q-tooltip>
                  </q-icon>
                </div>
                <div v-else-if="col.name === 'item_code'">
                  <q-btn
                    :label="props.row.item_code"
                    no-caps
                    dense
                    flat
                    @click="edit_event(props.row.uuid_rec)"
                    class="btn-link"
                  />
                </div>
                <div v-else-if="col.name === 'het_price' || col.name === 'hna'">
                  {{ $formatnumber(col.value) }}
                </div>
                <div
                  v-else-if="
                    col.name === 'on_hand' || col.name === 'on_hand_unit'
                  "
                >
                  {{ $formatnumber(col.value, 2, ',', '0', true) }}
                </div>

                <div v-else-if="col.name === 'mou_alternative'">
                  <q-btn
                    label="Alternatif"
                    no-caps
                    dense
                    flat
                    @click="open_mou(props.row.uuid_rec)"
                    class="btn-link"
                  />
                </div>
                <div v-else-if="col.name === 'is_active'">
                  <q-toggle
                    v-model="props.row.is_active"
                    true-value="1"
                    false-value="0"
                    dense
                    disable
                  />
                </div>
                <div v-else-if="col.name === 'create_date'">
                  {{ $INDDateTime(props.row.create_date) }}
                </div>
                <div v-else-if="col.name === 'update_date'">
                  {{ $INDDateTime(props.row.update_date) }}
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

    <!-- Dialog UI Interface-->
    <q-dialog
      v-model="dataevent"
      persistent
      full-width
    >
      <q-card
        class="icard"
        square
      >
        <q-bar class="entry-caption">
          {{ title }}
          <q-space />
          <q-btn
            v-close-popup
            dense
            flat
            rounded
            icon="close"
            size="sm"
          >
            <q-tooltip>Tutup</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section
          style="height: 79vh"
          class="q-pa-sm scroll"
        >
          <div class="row items-start q-col-gutter-sm">
            <div class="col-xs-12 col-sm-6">
              <div class="row items-start q-col-gutter-sm q-mb-sm">
                <div class="col-xs-6 col-sm-3">
                  <q-input
                    v-model="edit.item_code"
                    label="Kode Item"
                    dense
                    square
                    outlined
                    stack-label
                  />
                </div>
                <div class="col-xs-6 col-sm-3">
                  <q-input
                    v-model="edit.item_code_old"
                    label="Kode Item Lama"
                    dense
                    square
                    outlined
                    stack-label
                    disable
                  />
                </div>
              </div>
              <div class="row items-start q-col-gutter-sm q-mb-sm">
                <div class="col-xs-12 col-sm-6">
                  <q-input
                    v-model="edit.item_name1"
                    label="Nama Item"
                    dense
                    square
                    outlined
                    stack-label
                  />
                </div>
                <div class="col-xs-12 col-sm-6">
                  <q-input
                    v-model="edit.item_name2"
                    label="Nama Item (alternatif)"
                    dense
                    square
                    outlined
                    stack-label
                  />
                </div>
              </div>
              <div class="row items-start q-mb-sm">
                <div class="col-12">
                  <q-card square>
                    <q-bar
                      class="entry-caption"
                      dense
                      >Parameter Item Inventory</q-bar
                    >
                    <q-card-section class="q-pa-sm">
                      <div class="row items-start q-mb-sm">
                        <div class="col-xs-12 col-sm-6">
                          <q-select
                            v-model="edit.mou_inventory"
                            label="Satuan simpan"
                            dense
                            square
                            outlined
                            stack-label
                            :options="mou"
                            option-label="mou_name"
                            option-value="mou_name"
                            emit-value
                            map-options
                            options-dense
                          />
                        </div>
                      </div>
                      <div class="row items-start q-col-gutter-sm q-mb-sm">
                        <div class="col-6">
                          <q-input
                            v-model="edit.group_name"
                            label="Grup item"
                            dense
                            square
                            outlined
                            stack-label
                            readonly
                          >
                            <template v-slot:append>
                              <q-icon
                                name="search"
                                size="sm"
                                color="green-10"
                                @click="open_itemgroup()"
                              />
                            </template>
                          </q-input>
                        </div>
                        <div class="col-6">
                          <q-input
                            v-model="edit.subgroup_name"
                            label="Subgrup item"
                            dense
                            square
                            outlined
                            stack-label
                            readonly
                          >
                            <template v-slot:append>
                              <q-icon
                                name="search"
                                size="sm"
                                color="green-10"
                              />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div class="row items-start q-mb-sm">
                        <div class="col-12">
                          <q-input
                            v-model="edit.manufactur"
                            label="Manufaktur/Pabrik"
                            dense
                            square
                            outlined
                            stack-label
                            readonly
                          >
                            <template v-slot:append>
                              <q-icon
                                name="search"
                                size="sm"
                                color="green-10"
                                @click="open_manufactur()"
                              />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div class="row items-start q-mb-sm">
                        <div class="col-12">
                          <q-input
                            v-model="edit.supplier"
                            label="Supplier"
                            dense
                            square
                            outlined
                            stack-label
                            readonly
                          >
                            <template v-slot:append>
                              <q-icon
                                name="search"
                                size="sm"
                                color="green-10"
                                @click="open_supplier()"
                              />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div class="row items-center q-mb-sm">
                        <div class="col-6">
                          <q-checkbox
                            v-model="edit.is_price_rounded"
                            true-value="1"
                            false-value="0"
                            label="harga jual dibulatkan"
                            dense
                          />
                        </div>
                        <div class="col-6">
                          <q-field
                            square
                            outlined
                            stack-label
                            dense
                            :model-value="edit.price_rounded"
                            label="Pembulatan ke-?"
                          >
                            <template v-slot:control>
                              <vue-numeric
                                v-model="edit.price_rounded"
                                class="q-field__input text-right"
                                separator="."
                                :precision="0"
                                disable
                              />
                            </template>
                          </q-field>
                        </div>
                      </div>
                      <div class="row items-center q-col-gutter-sm q-mb-sm">
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_sales"
                            true-value="1"
                            false-value="0"
                            label="Jual"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_purchase"
                            true-value="1"
                            false-value="0"
                            label="Beli"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_production"
                            true-value="1"
                            false-value="0"
                            label="Produksi"
                            dense
                          />
                        </div>
                      </div>
                      <div class="row items-center q-col-gutter-sm q-mb-sm">
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_material"
                            true-value="1"
                            false-value="0"
                            label="Bahan Baku"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_consignment"
                            true-value="1"
                            false-value="0"
                            label="Item Konsinyasi"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_formularium"
                            true-value="1"
                            false-value="0"
                            label="Item Formularium"
                            dense
                          />
                        </div>
                      </div>
                      <div class="row items-center q-col-gutter-sm q-mb-sm">
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_employee"
                            true-value="1"
                            false-value="0"
                            label="Obat Karyawan"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_inhealth"
                            true-value="1"
                            false-value="0"
                            label="Obat Inhealth"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_bpjs"
                            true-value="1"
                            false-value="0"
                            label="Obat BPJS"
                            dense
                          />
                        </div>
                      </div>
                      <div class="row items-center q-col-gutter-sm q-mb-sm">
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_national"
                            true-value="1"
                            false-value="0"
                            label="Formularium Nasional"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_expired_control"
                            true-value="1"
                            false-value="0"
                            label="Kontrol Kadaluarsa"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_active"
                            true-value="1"
                            false-value="0"
                            label="Item Aktif (terpakai)"
                            dense
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div class="row items-start q-mb-sm">
                <div class="col-12">
                  <q-card square>
                    <q-bar class="entry-caption"> Informasi inventory </q-bar>
                    <q-card-section class="q-pa-sm">
                      <div class="row items-start q-col-gutter-sm q-mb-sm">
                        <div class="col-4">
                          <q-field
                            square
                            outlined
                            stack-label
                            dense
                            :model-value="edit.het_price"
                            label="Harga Eceran Tertinggi (HET)"
                          >
                            <template v-slot:control>
                              <vue-numeric
                                v-model="edit.het_price"
                                class="q-field__input text-right"
                                separator="."
                                :precision="0"
                                disable
                              />
                            </template>
                          </q-field>
                        </div>
                        <div class="col-4">
                          <q-field
                            square
                            outlined
                            stack-label
                            dense
                            :model-value="edit.hna"
                            label="Harga Netto Apotik (HNA)"
                            disable
                          >
                            <template v-slot:control>
                              <vue-numeric
                                v-model="edit.hna"
                                class="q-field__input text-right"
                                separator="."
                                :precision="2"
                                disable
                              />
                            </template>
                          </q-field>
                        </div>
                        <div class="col-4">
                          <q-field
                            square
                            outlined
                            stack-label
                            dense
                            :model-value="edit.cogs"
                            label="HPP (Average)"
                            disable
                          >
                            <template v-slot:control>
                              <vue-numeric
                                v-model="edit.cogs"
                                class="q-field__input text-right"
                                separator="."
                                :precision="2"
                                disable
                              />
                            </template>
                          </q-field>
                        </div>
                      </div>
                      <div class="row items-start q-col-gutter-sm q-mb-sm">
                        <div class="col-4">
                          <q-field
                            square
                            outlined
                            stack-label
                            dense
                            :model-value="edit.on_hand"
                            label="Stok(Gudang Utama)"
                            disable
                          >
                            <template v-slot:control>
                              <vue-numeric
                                v-model="edit.on_hand"
                                class="q-field__input text-right"
                                separator="."
                                :precision="2"
                                disable
                              />
                            </template>
                          </q-field>
                        </div>
                        <div class="col-4">
                          <q-field
                            square
                            outlined
                            stack-label
                            dense
                            :model-value="edit.on_hand_unit"
                            label="Stok (Unit/Bagian)"
                            disable
                          >
                            <template v-slot:control>
                              <vue-numeric
                                v-model="edit.on_hand_unit"
                                class="q-field__input text-right"
                                separator="."
                                :precision="2"
                                disable
                              />
                            </template>
                          </q-field>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
            <div class="col-xs-12 col-sm-6">
              <div class="row items-start q-mb-sm">
                <div class="col-12">
                  <q-card square>
                    <q-bar class="entry-caption">Foto Item</q-bar>
                    <q-card-section class="q-pa-sm">
                      <div class="row items-start q-col-gutter-sm">
                        <div class="col-4">
                          <q-card square>
                            <q-img
                              :src="edit.url_image"
                              spinner-color="white"
                              :ratio="1"
                            >
                              <template v-slot:error>
                                <div
                                  class="absolute-full flex flex-center bg-negative text-white"
                                >
                                  Tidak ada foto
                                </div>
                              </template>
                            </q-img>
                          </q-card>
                        </div>
                        <div class="col-8">
                          <q-file
                            v-model="file"
                            color="purple-12"
                            label="Foto Item"
                            dense
                            outlined
                            accept=".jpg, image/*"
                            stack-label
                            square
                          >
                            <template v-slot:prepend>
                              <q-icon
                                name="attach_file"
                                color="green-10"
                              />
                            </template>
                          </q-file>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div class="row items-start">
                <div class="col-12">
                  <q-card square>
                    <q-bar class="entry-caption">Informasi Obat</q-bar>
                    <q-card-section class="q-pa-sm">
                      <div class="row items-center q-col-gutter-sm q-mb-sm">
                        <div class="col-8">
                          <q-input
                            v-model="edit.generic_name"
                            square
                            outlined
                            stack-label
                            label="Nama Generik"
                            dense
                          />
                        </div>
                        <div class="col-4">
                          <q-checkbox
                            v-model="edit.is_generic"
                            true-value="1"
                            false-value="0"
                            label="Obat Generik"
                            dense
                          />
                        </div>
                      </div>
                      <div class="row items-start q-col-gutter-sm q-mb-sm">
                        <div class="col-3">
                          <q-input
                            v-model="edit.rate"
                            square
                            outlined
                            stack-label
                            label="Kadar"
                            dense
                          />
                        </div>
                        <div class="col-5">
                          <q-select
                            v-model="edit.units"
                            label="Satuan simpan"
                            dense
                            square
                            outlined
                            stack-label
                            :options="mou"
                            option-label="mou_name"
                            option-value="mou_name"
                            emit-value
                            map-options
                            options-dense
                          />
                        </div>
                      </div>
                      <div class="row items-start q-col-gutter-sm q-mb-sm">
                        <div class="col-8">
                          <q-input
                            v-model="edit.forms"
                            label="Bentuk/Sediaan"
                            dense
                            square
                            outlined
                            stack-label
                            readonly
                          >
                            <template v-slot:append>
                              <q-icon
                                name="search"
                                size="sm"
                                color="green-10"
                              />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div class="row items-start q-mb-sm">
                        <div class="col-12">
                          <q-input
                            v-model="edit.medical_uses"
                            square
                            outlined
                            stack-label
                            label="Fungsi obat"
                            dense
                          />
                        </div>
                      </div>
                      <div class="row items-start q-mb-sm">
                        <div class="col-12">
                          <q-input
                            v-model="edit.special_instruction"
                            square
                            outlined
                            stack-label
                            label="Instruksi khusus"
                            dense
                          />
                        </div>
                      </div>
                      <div class="row items-start q-mb-sm">
                        <div class="col-12">
                          <q-input
                            v-model="edit.storage_instruction"
                            square
                            outlined
                            stack-label
                            label="Petunjuk Penyimpanan"
                            dense
                            autogrow
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section
          class="dialog-action q-pa-sm"
          align="right"
        >
          <q-btn
            class="q-mr-sm"
            icon="save"
            label="Simpan"
            flat
            no-caps
            @click="save_data()"
          >
            <template v-slot:loading>
              <q-spinner class="on-left" />
              Proses
            </template>
          </q-btn>
          <q-btn
            icon="undo"
            label="Batal"
            no-caps
            flat
            v-close-popup
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="dlgmou"
      persistent
    >
      <q-card
        square
        class="icard"
        style="width: 800px; max-width: 80vw"
      >
        <q-bar class="entry-caption"
          >Alternatif Satuan Barang
          <q-space />
          <q-btn
            dense
            rounded
            icon="close"
            v-close-popup
            flat
          />
        </q-bar>
        <q-toolbar class="main-toolbar">
          <q-btn
            v-show="info_mode === false"
            no-caps
            flat
            class="btn-toolbar q-mr-sm"
            icon="add"
            label="Tambah"
            @click="add_mou(-1)"
          />
          <q-btn
            v-show="info_mode === false"
            no-caps
            flat
            class="btn-toolbar q-mr-sm"
            icon="edit"
            label="Ubah"
            @click="edit_mou(-1)"
          />
          <q-btn
            v-show="info_mode === false"
            no-caps
            flat
            class="btn-toolbar"
            icon="delete"
            label="Hapus"
            @click="delete_mou(-1)"
          />
          <q-btn
            v-show="info_mode === true"
            no-caps
            flat
            class="btn-toolbar"
            icon="save"
            label="Simpan"
            @click="save_mou()"
          />
          <q-btn
            v-show="info_mode === true"
            no-caps
            flat
            class="btn-toolbar"
            icon="undo"
            label="Batal"
            @click="info_mode = false"
          />
        </q-toolbar>
        <q-table
          v-show="info_mode === false"
          dense
          square
          :rows="infos"
          :columns="columns_info"
          no-data-label="data kosong"
          no-results-label="data yang cari tidak ditemukan"
          row-key="sysid"
          separator="cell"
          selection="single"
          v-model:selected="selected_info"
          v-model:pagination="pagination_info"
          binary-state-sort
          @request="onRequestMOU"
          :loading="loading_info"
          virtual-scroll
          table-class="fit-table-ui-dialog-with-parameter"
        >
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
                <div class="grid-data">
                  <div v-if="col.name === 'mou_unit'">
                    <q-btn
                      :label="props.row.mou_unit"
                      no-caps
                      dense
                      flat
                      @click="edit_mou(props.row.sysid)"
                      class="btn-link"
                    />
                  </div>
                  <div v-else-if="col.name === 'is_active'">
                    <q-toggle
                      v-model="props.row.is_active"
                      true-value="1"
                      false-value="0"
                      dense
                      disable
                    />
                  </div>
                  <div v-else-if="col.name === 'convertion'">
                    {{
                      $formatnumber(props.row.convertion, 3, ',', '0', false)
                    }}
                  </div>
                  <div v-else-if="col.name === 'create_date'">
                    {{ $INDDateTime2(props.row.create_date) }}
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
        <q-card-section
          class="q-pa-sm"
          v-show="info_mode === true"
        >
          <div class="row items-start q-pa-xs q-mb-sm">
            <div class="col-xs-12 col-sm-4">
              <q-select
                v-model="edit_info.mou_unit"
                label="Satuan alternatif"
                dense
                square
                outlined
                stack-label
                :options="mou"
                option-label="mou_name"
                option-value="mou_name"
                emit-value
                map-options
                options-dense
              />
            </div>
          </div>
          <div class="row items-start q-pa-xs q-mb-sm">
            <div class="col-xs-12 col-sm-4">
              <q-field
                square
                outlined
                stack-label
                dense
                :model-value="edit_info.convertion"
                label="Konversi"
              >
                <template v-slot:control>
                  <vue-numeric
                    v-model="edit_info.convertion"
                    class="q-field__input text-right"
                    separator="."
                    :precision="3"
                  />
                </template>
              </q-field>
            </div>
          </div>
          <div class="row items-start q-pa-xs q-mb-sm">
            <div class="col-xs-12 col-sm-4">
              <q-input
                v-model="edit_info.mou_inventory"
                dense
                square
                outlined
                label="Satuan Simpan"
                disable
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <manufactur
      v-if="dlgManufactur"
      :show="dlgManufactur"
      @CloseData="getManufactur"
    />
    <supplier
      v-if="dlgSupplier"
      :show="dlgSupplier"
      @CloseData="getSupplier"
    />
    <itemgroup
      v-if="dlgItemGroup"
      :show="dlgItemGroup"
      groupname="MEDICAL"
      @CloseData="getItemGroup"
    />
  </q-page>
</template>

<script>
import manufactur from 'components/master/Manufactur.vue'
import supplier from 'components/master/Supplier.vue'
import itemgroup from 'components/master/ItemGroups.vue'
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { Config } from 'boot/engine'

export default defineComponent({
  name: 'Inventory',
  components: { manufactur, supplier, itemgroup },
  setup() {
    const $q = useQuasar()
    const $store = useStore()
    const $router = useRouter()

    const edit = ref({})
    const dataevent = ref(false)
    const title = ref('Tambah Data')
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'item_name1',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
    const dlgmou = ref(false)
    const data = ref([])
    const selected = ref([])
    const columns = ref([])

    const pagetitle = ref('')
    const api_url = ref({})
    const btns = ref([])
    const access = ref({})
    const mou = ref([])
    const dlgManufactur = ref(false)
    const dlgSupplier = ref(false)
    const dlgItemGroup = ref(false)
    const file = ref(null)
    const info_mode = ref(false)
    const infos = ref([])
    const edit_info = ref({})
    const pagination_info = ref({
      sortBy: 'sysid',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50
    })
    const selected_info = ref([])
    const columns_info = ref([])
    const loading_info = ref(false)
    const item_sysid = ref(-1)

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
          group_name: 'MEDICAL',
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

    async function add_event() {
      dataevent.value = true
      title.value = 'Tambah Data'
      edit.value = {
        sysid: -1,
        item_code: '',
        item_name1: '',
        item_name2: '',
        mou_inventory: '',
        item_group_sysid: -1,
        group_name: '',
        item_subgroup_sysid: -1,
        subgroup_name: '',
        manufactur_sysid: -1,
        manufactur: '',
        prefered_vendor_sysid: -1,
        supplier: '',
        is_price_rounded: '0',
        price_rounded: 0,
        is_sales: '1',
        is_purchase: '1',
        is_production: '0',
        is_material: '0',
        is_consignment: '0',
        is_formularium: '0',
        is_employee: '0',
        is_inhealth: '0',
        is_national: '0',
        is_bpjs: '0',
        is_expired_control: '0',
        is_generic: '0',
        trademark: '',
        generic_name: '',
        rate: null,
        units: '',
        forms: '',
        medical_uses: '',
        special_instruction: '',
        storage_instruction: '',
        inventory_group: 'MEDICAL',
        url_image: '',
        is_active: '1'
      }
      file.value = null
    }

    async function edit_event(primary = '') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          primary = selected.value[0].uuid_rec
        }
        let props = {}
        props.url = api_url.value.edit
        props.uuidrec = primary
        props.group_name = 'MEDICAL'
        props.progress = true
        let respon = await $store.dispatch('master/GET_DATA', props)
        if (!(typeof respon === 'undefined')) {
          title.value = 'Ubah Data'
          dataevent.value = true
          edit.value = respon

          let config = new Config()
          let image_url =
            (await config.UrlPublic()) + '/' + edit.value.image_path
          edit.value.url_image = image_url
          file.value = null
        }
      }
    }

    async function delete_event(primary = '') {
      if (selected.value.length > 0 || !(primary === '')) {
        if (primary === '') {
          primary = selected.value[0].uuid_rec
        }
        data.value.forEach((el) => {
          if (primary === el.uuid_rec) {
            edit.value = el
          }
        })
        $q.dialog({
          title: 'Konfirmasi',
          message:
            'Apakah data ini akan di hapus .' +
            edit.value.item_code +
            ' - ' +
            edit.value.item_name1 +
            ' ?',
          cancel: true,
          persistent: false
        }).onOk(() => {
          let json = {}
          json.uuidrec = primary
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

    async function save_data() {
      let app = {}
      app.data = edit.value
      app.operation = edit.value.sysid === -1 ? 'inserted' : 'updated'
      app.file = file.value
      app.is_upload = true
      app.url = api_url.value.save
      app.progress = true
      let respon = await $store.dispatch('master/POST_DATA', app)
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
    }

    async function loaddata() {
      selected.value = []
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    }

    function runMethod(method, primary = '') {
      this[method](primary)
    }

    function open_manufactur() {
      dlgManufactur.value = true
    }

    function getManufactur(dlg, data) {
      dlgManufactur.value = dlg
      if (!(typeof data === 'undefined')) {
        edit.value.manufactur_sysid = data.sysid
        edit.value.manufactur = data.manufactur_name
      }
    }

    function open_supplier() {
      dlgSupplier.value = true
    }

    function getSupplier(dlg, data) {
      dlgSupplier.value = dlg
      if (!(typeof data === 'undefined')) {
        edit.value.prefered_vendor_sysid = data.sysid
        edit.value.supplier = data.supplier_name
      }
    }

    async function onRequestMOU(props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } =
        props.pagination
      let filter = props.filter

      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      loading_info.value = true
      try {
        let props = {
          page: page,
          limit: fetchCount,
          filter: filter,
          sortBy: sortBy,
          descending: descending,
          uuidrec: edit.value.uuid_rec,
          url: 'master/inventory/inventory-item/mou'
        }
        let respon = await $store.dispatch('master/GET_DATA', props)
        infos.value = respon.data
        pagination_info.value = {
          rowsNumber: respon.total,
          page: respon.current_page,
          rowsPerPage: respon.per_page,
          sortBy: sortBy,
          descending: descending
        }
      } catch (error) {
      } finally {
        loading_info.value = false
      }
    }
    function open_itemgroup() {
      dlgItemGroup.value = true
    }

    function getItemGroup(dlg, data) {
      dlgItemGroup.value = dlg
      if (!(typeof data === 'undefined')) {
        edit.value.item_group_sysid = data.sysid
        edit.value.group_name = data.group_name
      }
    }
    function open_mou(uuidrec) {
      data.value.forEach((el) => {
        if (el.uuid_rec === uuidrec) {
          edit.value = el
        }
      })
      dlgmou.value = true
      info_mode.value = false
      columns_info.value = [
        {
          name: 'mou_unit',
          align: 'left',
          sytle: 'min-width: 60px',
          headerStyle: 'min-width: 60px',
          label: 'Unit (Alternartif)',
          field: 'mou_unit'
        },
        {
          name: 'convertion',
          align: 'right',
          sytle: 'min-width: 60px',
          headerStyle: 'min-width: 60px',
          label: 'Konversi',
          field: 'convertion'
        },
        {
          name: 'mou_inventory',
          align: 'left',
          sytle: 'min-width: 60px',
          headerStyle: 'min-width: 60px',
          label: 'Unit Simpan',
          field: 'mou_inventory'
        },
        {
          name: 'is_active',
          align: 'left',
          label: 'Aktif',
          field: 'is_active'
        },
        {
          name: 'create_by',
          align: 'left',
          label: 'Dibuat oleh',
          field: 'create_by'
        },
        {
          name: 'create_date',
          align: 'left',
          label: 'Tgl. Dibuat',
          field: 'create_date'
        },
        {
          name: 'update_by',
          align: 'left',
          label: 'Diubah oleh',
          field: 'update_by'
        },
        {
          name: 'update_date',
          align: 'left',
          label: 'Tgl. Diubah',
          field: 'update_date'
        }
      ]
      onRequestMOU({
        pagination: pagination_info.value,
        filter: ''
      })
    }

    function add_mou(sysid = -1) {
      edit_info.value = {
        sysid: -1,
        item_sysid: edit.value.sysid,
        mou_unit: '',
        convertion: 1,
        mou_inventory: edit.value.mou_inventory
      }
      info_mode.value = true
    }
    function edit_mou(sysid = -1) {
      if (sysid === -1) {
        sysid = selected_info.value[0].sysid
      }
      infos.value.forEach((el) => {
        if (el.sysid === sysid) {
          edit_info.value = el
          info_mode.value = true
        }
      })
    }
    function delete_mou(sysid = -1) {
      if (sysid === -1) {
        sysid = selected_info.value[0].sysid
      }
      edit_info.value = null
      infos.value.forEach((el) => {
        if (el.sysid === sysid) {
          edit_info.value = el
        }
      })
      if (info_mode.value !== null) {
        $q.dialog({
          title: 'Konfirmasi',
          message: 'Apakah konversi satuan ini akan dihapus ?',
          cancel: true,
          persistent: true
        }).onOk(async () => {
          try {
            let app = {}
            app.sysid = edit_info.value.sysid
            app.url = 'master/inventory/inventory-item/mou'
            app.progress = true
            let respon = await $store.dispatch('master/DELETE_DATA', app)
            if (!(typeof respon === 'undefined')) {
              let msg = respon.data
              if (respon.success) {
                onRequestMOU({ pagination: pagination_info.value, filter: '' })
              } else {
                $q.notify({
                  color: 'red-10',
                  textcolor: 'white',
                  message: msg,
                  position: 'top',
                  timeout: 3000
                })
              }
            }
          } finally {
            loading.value = false
          }
        })
      }
    }

    async function save_mou() {
      let app = {}
      app.data = edit_info.value
      app.url = 'master/inventory/inventory-item/mou'
      app.progress = true
      let respon = await $store.dispatch('master/POST_DATA', app)
      if (!(typeof respon === 'undefined')) {
        let msg = respon.data
        if (respon.success) {
          info_mode.value = false
          onRequestMOU({ pagination: pagination_info.value, filter: '' })
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
      props.url = 'master/inventory/mou/list'
      $store.dispatch('master/GET_DATA', props).then((response) => {
        mou.value = response
      })
      loaddata()
    })

    return {
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
      loading,
      mou,
      runMethod,
      onRequest,
      add_event,
      edit_event,
      delete_event,
      loaddata,
      save_data,
      dlgManufactur,
      open_manufactur,
      getManufactur,
      dlgSupplier,
      open_supplier,
      getSupplier,
      dlgItemGroup,
      open_itemgroup,
      getItemGroup,
      file,
      open_mou,
      dlgmou,
      pagination_info,
      columns_info,
      selected_info,
      infos,
      edit_info,
      loading_info,
      info_mode,
      add_mou,
      edit_mou,
      delete_mou,
      save_mou,
      item_sysid,
      onRequestMOU
    }
  }
})
</script>
