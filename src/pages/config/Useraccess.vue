<template>
  <q-page class="page-app">
    <q-card square class="icard">
      <q-bar class="entry-caption">
        Setup hak akses
      </q-bar>
      <q-card-section class="q-pa-sm">
        <div class="row items-start q-mb-sm">
          <div class="col-xs-12 col-sm-3">
            <q-input v-model="user_name" dense outlined square type="text" label="User ID" />
          </div>
        </div>
        <div class="row items-start q-mb-sm">
          <div class="col-xs-12 col-sm-3">
            <q-input v-model="full_name" outlined dense square type="text" label="Nama User" />
          </div>
        </div>
        <div class="row items-start q-mb-sm">
          <div class="col-xs-12 col-sm-3">
            <q-select v-model="user_level" label="Level akses" outlined dense square options-dense
              :options="levellist" emit-value map-options disable />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-bar class="entry-caption">Akses User</q-bar>
      <q-card-section class="q-pa-sm">
        <q-list v-for="(items, index) in detail(-1, 0)" :key="index" dense>
          <q-expansion-item dense-toggle :icon="items.icon" :label="items.title">
            <div v-if="items.sort_number != '10000'">
              <q-list padding dense>
                <div v-for="(itmdtl, idxdtl) in detail(items.sort_number, 1)" :key="idxdtl">
                  <div v-if="itmdtl.is_header === 0">
                    <q-item :active="link === itmdtl.id" active-class="my-menu-link" @click="link = itmdtl.id">
                      <q-item-section avatar>
                        <q-icon :name="itmdtl.image" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="q-mb-sm">
                          <div class="text-bold q-mb-sm">{{ itmdtl.title }}</div>
                          <div v-if="
                            !(typeof selection[index] === 'undefined')
                          " class="row items-start q-col-gutter-sm">
                            <div v-for="(action, idx) in security(
                              itmdtl.security
                            )" :key="idx" class="col-xs-4 col-sm-3 col-md-3">
                              <q-checkbox v-model="
                                selection[index].main[idxdtl].security
                              " :val="action.action" :label="action.caption" dense />
                            </div>
                          </div>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>

                  <div v-else>
                    <q-expansion-item dense-toggle expand-separator :icon="itmdtl.icon" :label="itmdtl.title"
                      header-class="text-purple">
                      <q-list v-for="(itmsub, idxsub) in detail(
                        itmdtl.sort_number,
                        2
                      )" :key="idxsub">
                        <q-item :active="link === itmsub.id" active-class="my-menu-link" @click="link = itmdtl.id">
                          <q-item-section avatar>
                            <q-icon :name="itmsub.image" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="q-mb-sm">
                              <div class="text-bold q-mb-sm">{{ itmsub.title }}</div>
                              <div v-if="
                                !(typeof selection[index] === 'undefined')
                              " class="row items-start q-pa-sm">
                                <div v-for="(action, idxsecurity) in security(
                                  itmsub.security
                                )" :key="idxsecurity" class="col-xs-4 col-sm-3 col-md-3">
                                  <q-checkbox v-model="
                                    selection[index].main[idxdtl].detail[
                                      idxsub
                                    ].security
                                  " :val="action.action" :label="action.caption" dense />
                                </div>
                              </div>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-expansion-item>
                  </div>
                </div>
              </q-list>
            </div>
            <div v-else>
              <q-tabs v-model="tab" class="bg-teal-8 text-white" active-color="negative" indicator-color="positive"
                align="justify" narrow-indicator no-caps>
                <q-tab name="cashier" label="Kasir" />
                <q-tab name="finance" label="Keuangan" />
              </q-tabs>
              <q-separator />
              <q-tab-panels v-model="tab" animated swipeable infinite dense transition-prev="scale"
                transition-next="scale" class="text-white text-left" no-caps>
                <q-tab-panel v-for="(groupreport, idxreport) in groups" :key="idxreport" :name="groupreport.title">
                  <div class="row items-start q-mt-sm q-col-gutter-xs justify-left">
                    <div v-for="(col, idx) in column" :key="idx" class="col-xs-12 col-sm-6 col-md-3">
                      <div v-for="(item, _index) in detailreport(
                        groupreport.sort_number,
                        idx + 1
                      )" :key="_index" class="row items-start justify-left q-mb-sm">
                        <div v-if="item.is_header === 1">
                          <span class="text-uppercase q-my-md text-grey-10"><strong>{{ item.title }}</strong></span>
                        </div>
                        <div v-else>
                          <q-checkbox v-model="item.is_selected" class="text-blue" :val="item.title" :label="item.title"
                            color="positive" true-value="1" false-value="0" dense />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </q-expansion-item>
        </q-list>
      </q-card-section>
    </q-card>
    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top">
      <q-toolbar class="main-toolbar">
        <q-btn icon="save" flat no-caps label="Simpan" class="q-pa-xs q-ma-xs" @click="save_data()">
          <template v-slot:loading>
            <q-spinner class="on-left" />
            simpan data...
          </template>
        </q-btn>
        <q-btn label="Batal" icon="undo" flat no-caps rounded :to="{ name: 'user', force: true }" />
      </q-toolbar>
    </q-page-sticky>

  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "Useraccess",
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();
    const $route = useRoute();

    const loading = ref(false);
    const save_loading = ref(false);
    const username = ref("");
    const object_item = ref([]);
    const itemmenu = ref([]);
    const menu = ref(1);
    const selection = ref([]);
    const main = ref([]);
    const user_name = ref("N/A");
    const full_name = ref("");
    const user_level=ref("");
    const email = ref("");
    const phone = ref("");
    const security_group = ref("");
    const edit = ref({});
    const reports = ref([]);
    const link=ref("");
    const tab = ref("operational");
    const column = ref([1, 2, 3]);
    const groups = ref([
      { sort_number: 2000, title: "operational" },
      { sort_number: 3000, title: "workshop" },
      { sort_number: 4000, title: "inventory" },
      { sort_number: 5000, title: "purchasing" },
      { sort_number: 6000, title: "finance" },
      { sort_number: 7000, title: "accounting" },
      { sort_number: 8000, title: "payroll" },
    ]);
    const levellist=ref(['ADMIN','SUPERVISOR','USER']);

    const uuid = computed(() => {
      return $route.query.uuid;
    });

    function update_useraccess(objaccess, objectid) {
      let security = [];
      objaccess.forEach((el) => {
        if (el.object_id === objectid) {
          security = JSON.parse(el.security);
        }
      });
      return security;
    }
    function detail(id, level) {
      let menu = [];
      object_item.value.forEach((el) => {
        if (level === 0 && el.level === 0) {
          menu.push(el);
        } else {
          if (el.group_id === id && (el.level = level)) {
            menu.push(el);
          }
        }
      });
      return menu;
    }

    function security(data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }

    function save_data() {
      console.info("tested")
      let json = {};
      json.sysid = sysid.value;
      json.access = selection.value;
      json.report = reports.value;
      json.url = "user/usersaccess";
      $q.loading.show();
      $store
        .dispatch("master/POST_DATA", json, true)
        .then((respon) => {
          if (!(typeof respon === "undefined")) {
            let msg = respon.data;
            if (respon.success) {
              $q.notify({
                color: "positive",
                textcolor: "white",
                message: msg,
                position: "top",
                timeout: 2000,
                icon: "tag_faces",
              });
              $router.push({ path: '/access/user', query: {} });
            } else {
              $q.notify({
                color: "red-10",
                textcolor: "white",
                message: msg,
                position: "top",
                timeout: 2000,
                icon: "tag_faces",
              });
            }
          }
        })
        .finally(() => {
          $q.loading.hide();
        });
    }

    async function access_objects () {
      let objaccess = [];
      if (user_name.value !=="") {
        let json = {};
        json.uuid = uuid.value;
        objaccess = await $store.dispatch("master/GET_OBJECTACCESS", json);
        selection.value = [];
        let index = -1;
        let obj = {};
        let local_main = detail(-1, 0);
        local_main.forEach((el) => {
          index = index + 1;
          obj = {};
          obj.object_id = el.id;
          obj.header = el.is_header;
          obj.main = [];
          selection.value.push(obj);
          let idxid = -1;
          let submain = detail(el.sort_number, 1);
          submain.forEach((dtl) => {
            idxid = idxid + 1;
            if (dtl.is_header === 0) {
              let obj = {};
              obj.object_id = dtl.id;
              obj.header = dtl.is_header;
              obj.security = update_useraccess(objaccess, dtl.id);
              selection.value[index].main.push(obj);
            } else {
              obj = {};
              obj.object_id = dtl.id;
              obj.header = dtl.is_header;
              obj.detail = [];
              selection.value[index].main.push(obj);
              let subdetail = detail(dtl.sort_number, 2);
              subdetail.forEach((sub) => {
                obj = {};
                obj.object_id = sub.id;
                obj.header = sub.is_header;
                obj.security = update_useraccess(objaccess, sub.id);
                selection.value[index].main[idxid].detail.push(obj);
              });
            }
          });
        });
        let props = {};
        props.url = "user/reports";
        props.uuid = uuid.value;
        reports.value = await $store.dispatch("home/GET_DATA", props);
      }
    }

    function detailreport(group, idx) {
      let report = [];
      reports.value.forEach((el) => {
        if (el.group_id === group && el.colidx === idx) {
          report.push(el);
        }
      });
      return report;
    }

    onMounted(async () => {
      $q.loading.show();
      let objaccess = [];
      try {
        object_item.value = await $store.dispatch("master/GET_OBJECTSITEM");
        itemmenu.value = await $store.dispatch("master/GET_OBJECTSITEMACCESS");
        let props = {};
        props.url = "user/users/get";
        props.uuid = uuid.value;
        let user = await $store.dispatch("master/GET_DATA", props);
        if (!(typeof user === "undefined")) {
          user_name.value = user.user_name;
          full_name.value = user.full_name;
          user_level.value = user.user_level;
        }
        access_objects();
      } finally {
        $q.loading.hide();
      }
      selection.value = [];
      let index = -1;
      let obj = {};
      let main = detail(-1, 0);
      main.forEach((el) => {
        index = index + 1;
        obj = {};
        obj.object_id = el.id;
        obj.header = el.is_header;
        obj.main = [];
        selection.value.push(obj);
        let idxid = -1;
        let submain = detail(el.sort_number, 1);
        submain.forEach((dtl) => {
          idxid = idxid + 1;
          if (dtl.is_header === 0) {
            let obj = {};
            obj.object_id = dtl.id;
            obj.header = dtl.is_header;
            obj.security = update_useraccess(objaccess, dtl.id);
            selection.value[index].main.push(obj);
          } else {
            obj = {};
            obj.object_id = dtl.id;
            obj.header = dtl.is_header;
            obj.detail = [];
            selection.value[index].main.push(obj);
            let subdetail = detail(dtl.sort_number, 2);
            subdetail.forEach((sub) => {
              obj = {};
              obj.object_id = sub.id;
              obj.header = sub.is_header;
              obj.security = update_useraccess(objaccess, sub.id);
              selection.value[index].main[idxid].detail.push(obj);
            });
          }
        });
      });
    });

    return {
      uuid,
      loading,
      save_loading,
      username,
      object_item,
      itemmenu,
      menu,
      selection,
      main,
      user_name,
      full_name,
      user_level,
      email,
      phone,
      security_group,
      link,
      edit,
      reports,
      tab,
      column,
      groups,
      update_useraccess,
      detailreport,
      detail,
      security,
      access_objects,
      save_data,
      levellist
    };
  },
});
</script>
<style lang="sass">
.my-menu-link
  color: white
  background: #F2C037
</style>
