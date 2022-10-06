<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="main-panel">
        <q-btn flat dense round icon="menu" aria-label="Menu" color="white" @click="drawer = !drawer" />
        <q-toolbar-title>
          <span style="color: white; font-size: 0.9em">
            <a href="https://localhost:8080" style="color: white; text-decoration: none">{{ profile.company_name }}
            </a>
          </span>
        </q-toolbar-title>

        <div class="q-gutter-sm">
          <q-btn dense flat icon="email" color="white" class="q-mr-xs">
            <q-tooltip content-class="bg-indigo"> Email </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="add_task" color="white" class="q-mr-xs">
            <q-tooltip content-class="bg-indigo"> Tugas/Task </q-tooltip>
          </q-btn>
          <q-btn dense glossy rounded color="red-10" icon="ti-power-off" class="q-mr-xs">
            <q-tooltip content-class="bg-indigo"> Profil & Sign-out </q-tooltip>
            <q-menu max-width="500px" transition-show="rotate" transition-hide="rotate" square>
              <q-card square bordered>
                <div class="
                    row
                    items-center
                    flex flex-center
                    bg-red-8
                    q-px-xl q-py-sm
                  ">
                  <q-avatar size="120px" class="bg-white">
                    <q-img :src="userprofile.photo" spinner-color="white" :ratio="1" />
                  </q-avatar>
                </div>
                <div class="
                    row
                    items-center
                    flex flex-center
                    no-wrap
                    q-pa-sm
                    bg-red-10
                    text-white
                  ">
                  <div style="font-size: 12px">{{ userprofile.full_name }}</div>
                </div>
                <div class="row items-center justify-between no-wrap q-pa-sm">
                  <q-btn no-caps dense color="grey-8" label="Absensi" flat />
                  <q-btn no-caps dense color="grey-8" label="Tugas" flat />
                  <q-btn no-caps dense color="grey-8" label="Notulen" flat />
                </div>
                <div class="
                    row
                    items-center
                    justify-center
                    no-wrap
                    q-pa-sm
                    bg-teal-1
                  ">
                  <q-btn rounded no-caps color="teal-10" label="Profile" flat icon="person" size="sm"
                    @click="showProfile()" />
                  <q-btn rounded no-caps color="teal-10" label="Password" flat icon="fas fa-key" size="sm"
                    @click="ShowPassword()" />
                  <q-space />
                  <q-btn rounded no-caps color="red-10" label="logout" flat size="sm" icon="ti-power-off"
                    @click="logout()" />
                </div>
              </q-card>
            </q-menu>
          </q-btn>
          <q-btn dense flat square color="white" icon="settings" class="q-mr-xs" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" :mini="miniState" mini-to-overlay @click.capture="drawerClick"
      @mouseover="miniState = false" :width="300" :breakpoint="400" class="background-drawer text-white">
      <q-scroll-area :thumb-style="thumbStyle" :bar-style="barStyle" style="
          height: calc(100% - 85px);
          margin-top: 85px;
          border-right: 1px solid #ddd;
        ">
        <q-list dense  class="text-white" transition="scale">
          <q-expansion-item 
            v-for="(items, index) in detail(-1, 0)" :key="index"
            dense-toggle 
            :icon="items.icons" 
            :label="items.title" 
            header-class="bg-teal-9 text-white"
            :content-inset-level="0.2" 
            class="shadow-5 overflow-hidden q-mb-sm"
            style="border-radius: 20px;border-style: solid;border-width: 0.1px;border-color:teal"
          >
            <q-list padding>
              <div v-for="(itmdtl, idxdtl) in detail(items.sort_number, 1)" :key="idxdtl">
                <div v-if="itmdtl.title === 'separator'">
                  <q-separator color="white" />
                </div>
                <div v-else-if="(itmdtl.is_parent === false)">
                  <q-item clickable v-ripple :active="link === itmdtl.sysid" @click="openlink(itmdtl.url_link, itmdtl.sysid)"
                    active-class="my-menu-link" header-class="text-white">
                    <q-item-section avatar>
                      <q-icon :name="itmdtl.icons" size="xs" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ itmdtl.title }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div v-else>
                  <q-list class="rounded-borders">
                    <q-expansion-item dense-toggle expand-separator :icon="itmdtl.icons" :label="itmdtl.title"
                      header-class="text-green">
                      <q-list>
                        <div v-for="(itmsub, idxsub) in detail(itmdtl.sort_number, 2)" :key="idxsub">
                          <div v-if="itmsub.title === 'separator'">
                            <q-separator spaced inset />
                          </div>
                          <div v-else-if="itmsub.is_parent===true">
                            <q-expansion-item dense-toggle expand-separator :icon="itmsub.icons" :label="itmsub.title" header-class="text-red-10"
                              :header-inset-level="0.4" :content-inset-level="0.6"
                              class="shadow-5 overflow-hidden q-mb-sm"
                              style="border-radius: 5px">
                              <q-list padding>
                                <q-item v-for="(itmsub2, idxsub2) in detail(itmsub.sort_number, 3)" :key="idxsub2" 
                                  clickable v-ripple :active="link === itmsub2.sysid" @click="openlink(itmsub2.url_link, itmsub2.sysid)"
                                  active-class="my-menu-link" header-class="text-white">
                                  <q-item-section avatar>
                                    <q-icon :name="itmsub2.icons" size="xs" />
                                  </q-item-section>
                                  <q-item-section>
                                    <q-item-label>{{ itmsub2.title }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </q-list>
                            </q-expansion-item>  
                          </div>  
                          <div v-else>
                            <q-item clickable v-ripple :active="link === itmsub.sysid"
                              @click="openlink(itmsub.url_link, itmsub.sysid)" active-class="my-menu-link">
                              <q-item-section avatar>
                                <q-icon rounded :name="itmsub.icons" size="xs" />
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>{{ itmsub.title }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </div>
                        </div>  
                      </q-list>
                    </q-expansion-item>
                  </q-list>
                </div>
              </div>
            </q-list>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
      <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 80px">
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="60px" class="q-mb-xs">
            <q-img :src="userprofile.photo" />
          </q-avatar>
        </div>
      </q-img>
      <div class="q-mini-drawer-hide absolute" style="top: 90px; right: -17px">
        <q-btn dense round unelevated color="primary" icon="chevron_left" @click="miniState = true" />
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog v-model="dlgUser" persistent>
      <q-card class="icard" flat style="min-width:500px">
        <q-bar class="entry-caption">
          Profil User
          <q-space />
          <q-btn icon="close" size="xs" color="red-5" glossy dense rounded v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-sm">
          <div class="row items-start q-col-gutter-sm q-mb-sm">
            <div class="col-6 ">
              <q-input v-model="user.user_id" label="User ID" stack-label dense square outlined disable />
            </div>
            <div class="col-6">
              <q-input v-model="user.user_name" label="Nama User" stack-label dense square outlined />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm">
            <div class="col-6 ">
              <q-input v-model="user.email" label="Email" stack-label dense square outlined />
            </div>
            <div class="col-6">
              <q-input v-model="user.phone" label="Telepon" stack-label dense square outlined />
            </div>
          </div>
          <div class="row items-start justify-middle q-col-gutter-sm q-mt-xs">
            <div class="col-xs-12 col-sm-6 col-md-6">
              <q-card>
                <q-img :src="user.photo" spinner-color="white" :ratio="1" style="max-width:200px">
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white">
                      Tidak ada foto
                    </div>
                  </template>
                </q-img>
              </q-card>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <q-card>
                <q-img :src="user.sign" spinner-color="white" :ratio="1" style="max-width:200px">
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white">
                      Tidak ada foto
                    </div>
                  </template>
                </q-img>
              </q-card>
            </div>
          </div>
          <div class="row items-center justify-middle q-col-gutter-sm q-mb-xs">
            <div class="col-xs-12 col-sm-6 col-md-6">
              <q-file v-model="foto" color="purple-12" label="Foto Karyawan" dense borderless accept=".jpg, image/*"
                stack-label square>
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
                <template v-slot:append>
                  <q-icon name="cloud_upload" color="teal-8" size="sm" class="q-ml-sm" @click="upload_foto()" />
                </template>
              </q-file>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <q-file v-model="sign" color="purple-12" label="Tanda Tangan" dense borderless accept=".jpg, image/*"
                stack-label square>
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
                <template v-slot:append>
                  <q-icon name="cloud_upload" color="teal-8" size="sm" class="q-ml-sm" @click="upload_sign()" />
                </template>
              </q-file>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pa-xs entry-caption" align="right">
          <q-btn label="Update" icon="save" no-caps flat @click="save_profile()" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Change Password-->
    <q-dialog v-model="pwdevent" persistent transition-show="flip-down" transition-hide="flip-up">
      <q-card class="icard" style="width: 500px" square>
        <q-bar class="dialog-caption">
          <div style="color: white; font-size: 0.7em">Ubah Password</div>
          <q-space />
          <q-btn v-close-popup dense icon="close" color="red-10" size="xs" rounded glossy>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-sm q-gutter-xs">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-xs-12 col-sm-6">
              <q-input v-model="user.user_id" dense outlined readonly square type="text" label="User ID" />
            </div>
            <div class="col-xs-9 col-sm-6">
              <q-input v-model="user.user_name" outlined dense readonly square type="text" label="Nama User" />
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-12">
              <q-input v-model="oldpwd" outlined dense square :type="isPwdOld ? 'password' : 'text'"
                hint="Password dengan toggle" label="Password (Baru)" stack-label>
                <template v-slot:append>
                  <q-icon :class="isPwdOld ? 'fas fa-eye-slash' : 'fas fa-eye'" @click="isPwdOld = !isPwdOld" size="xs"
                    color="green-10" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-12">
              <q-input v-model="pwd1" outlined dense square :type="isPwd1 ? 'password' : 'text'"
                hint="Password dengan toggle" label="Password (Baru)" stack-label>
                <template v-slot:append>
                  <q-icon :class="isPwd1 ? 'fas fa-eye-slash' : 'fas fa-eye'" @click="isPwd1 = !isPwd1" size="xs"
                    color="green-10" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row items-start q-col-gutter-sm q-mt-xs">
            <div class="col-12">
              <q-input v-model="pwd2" outlined dense square :type="isPwd2 ? 'password' : 'text'"
                hint="Password dengan toggle" label="Konfirmasi Password" stack-label>
                <template v-slot:append>
                  <q-icon :class="isPwd2 ? 'fas fa-eye-slash' : 'fas fa-eye'" @click="isPwd2 = !isPwd2" size="xs"
                    color="green-10" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="dialog-action q-pa-sm" align="right">
          <q-btn icon="save" label="Ubah Password" class="q-mr-sm" no-caps flat @click="save_pwd()">
            <template v-slot:loading>
              <q-spinner class="on-left" />
              Proses
            </template>
          </q-btn>
          <q-btn icon="cancel" label="Batal" no-caps flat @click="pwdevent = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { useQuasar, AppFullscreen } from "quasar";
import { defineComponent, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
export default defineComponent({
  name: "Home",
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();

    const drawer = ref(false);
    const miniState = ref(true);
    const fullscreen = ref(false);
    const txtPassword = ref("password");
    const isPwd = ref(true);
    const dlgLock = ref(false);
    const link = ref(-1);
    const items = ref([]);
    const profile=ref({});
    const userprofile = ref({});
    const dlgUser=ref(false);
    const user=ref({});
    const foto =ref('')
    const sign = ref('')
    const pwdevent=ref(false);
    const oldpwd = ref('');
    const pwd1=ref('');
    const pwd2= ref('');
    const isPwdOld = ref(true);
    const isPwd1 = ref(true);
    const isPwd2 = ref(true);

    const baricons = computed(() => {
      return $store.state.home.baricons;
    });

    const islocked = computed(() => {
      return $store.state.home.islocked;
    });

    const photoprofile = computed(() => {
      if (userprofile.value.photo === "") {
        return "/logo/logo.png";
      } else {
        return userprofile.value.photo;
      }
    });

    function drawerClick(e) {
      if (miniState.value === true) {
        miniState.value = false;
        e.stopPropagation();
      }
    }

    async function refreshpage() {
      if ($q.localStorage.getItem("fullscreen")) {
        AppFullscreen.request();
        fullscreen.value = true;
      } else {
        fullscreen.value = false;
      }

      $q.loading.show({ delay: 1000 });
      try {
        let props = {};
        props = {};
        props.url = "profile";
        $store.dispatch("home/GET_DATA", props).then((respon) => {
          profile.value = respon;
        });

        props = {};
        props.url = "userprofile";
        props.jwt = JWTToken();
        $store.dispatch("home/GET_DATA", props).then((respon) => {
          userprofile.value = respon;
        });

        props = {};
        props.url = "home/item";
        props.jwt = JWTToken();
        let objitems = await $store.dispatch("home/GET_DATA", props);
        let header = [];
        let notfound = false;
        objitems.forEach((element) => {
          if (element.is_parent === true) {
            header.push(element);
          }
        });
        header.forEach((element) => {
          notfound = true;
          objitems.forEach((el) => {
            if (element.sort_number === el.parent_sysid) {
              notfound = false;
            }
          });
          if (notfound) {
            let index = -1;
            objitems.forEach((el) => {
              index = index + 1;
              if (el.sysid === element.sysid) {
                objitems.splice(index, 1);
              }
            });
          }
        });
        items.value = objitems;
      } finally {
        $q.loading.hide();
      }
    }

    function JWTToken() {
      let jwt = "";
      try {
        jwt = $q.sessionStorage.getItem("auth-jwt");
        if (jwt.indexOf("|") > 0) {
          jwt = jwt.substr(jwt.indexOf("|") + 1, jwt.length);
        }
      } catch (error) {
        jwt = "N/A";
      }
      return jwt;
    }

    function logout() {
      let props = {};
      props.url = "logout";
      let config = new this.$Config();
      props.x_jwt = config.JWTToken();
      $store.dispatch("home/POST_DATA", props);
      $q.sessionStorage.clear();
      $router.push("/auth");
    }

    function openlink(urllink, id) {
      drawer.value = false;
      miniState.value = true;
      link.value = id;
      $router.push({ path: urllink, query: {} });
    }

    function detail(id, level) {
      let menu = [];
      items.value.forEach((el) => {
        if (level === 0 && el.object_level === 0) {
          menu.push(el);
        } else {
          if (el.parent_sysid === id) {
            menu.push(el);
          }
        }
      });
      return menu;
    }

    async function showProfile(){
      dlgUser.value=true
      $q.loading.show({ delay: 100 });
      try {
        let props = {};
        props.url = 'user/users/profile';
        let respon = await $store.dispatch("master/GET_DATA", props);
        if (!(typeof respon === "undefined")) {
          user.value = respon;
        }
        foto.value = null;
        sign.value = null;
      } finally {
        $q.loading.hide();
      }
    }
    async function save_profile(){
      try {
        let where = {};
        let app = {};
        where.sysid = user.value.sysid;
        app.data = user.value;
        app.where = where;
        app.url = 'user/users/profile';
        let respon = await $store.dispatch("master/POST_DATA", app);
        if (!(typeof respon === "undefined")) {
            let msg = respon.data.message;
            dlgUser.value = false;
            $q.notify({
              color: "positive",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
          } else {
            $q.notify({
              color: "red-10",
              textcolor: "white",
              message: msg,
              position: "top",
              timeout: 2000,
            });
          }
        } finally {}
    }

    async function upload_foto () {
      let app = {};
      app.sysid = user.value.sysid;
      app.file = foto.value;
      app.url = "user/users/photo";
      $q.loading.show({ delay: 200 });
      try {
        let respon = await $store.dispatch("master/UPLOAD_DATA", app);
        if (!(typeof respon === "undefined")) {
          if (respon.success) {
            user.value.photo = respon.data.path_file;
          } else {
            let msg = respon.data;
            $q.dialog({
              title: "Peringatan",
              message: msg,
              persistent: true,
            });
          }
        } else {
          $q.dialog({
            title: "Peringatan",
            message: "Upload Gagal",
            persistent: true,
          });
        }
      } finally {
        $q.loading.hide();
      }
    }

    async function upload_sign () {
      let app = {};
      app.sysid = user.value.sysid;
      app.file = sign.value;
      app.url = "user/users/sign";
      $q.loading.show({ delay: 200 });
      try {
        let respon = await $store.dispatch("master/UPLOAD_DATA", app);
        if (!(typeof respon === "undefined")) {
          if (respon.success) {
            user.value.sign = respon.data.path_file;
          } else {
            let msg = respon.data;
            $q.dialog({
              title: "Peringatan",
              message: msg,
              persistent: true,
            });
          }
        } else {
          $q.dialog({
            title: "Peringatan",
            message: "Upload Gagal",
            persistent: true,
          });
        }
      } finally {
        $q.loading.hide();
      }
    }
    async function ShowPassword(){
        $q.loading.show();
        try {
          let props = {};
          oldpwd.value=''
          pwd1.value = ''
          pwd2.value = ''
          props.url = 'user/users/profile';
          let respon = await $store.dispatch("master/GET_DATA", props);
          if (!(typeof respon === "undefined")) {
            pwdevent.value = true;
            user.value = respon;
          }
        } finally {
          $q.loading.hide();
        }
    }

    function save_pwd () {
      let props = {};
      props.pwdold = oldpwd.value;
      props.pwd1 = pwd1.value;
      props.pwd2 = pwd2.value;
      props.url = 'user/users/changepassword';
      $q.loading.show({ delay: 100 });
      $store
        .dispatch("master/POST_DATA", props)
        .then((respon) => {
          if (!(typeof respon === "undefined")) {
            let msg = respon.data;
            if (respon.success) {
              pwdevent.value = false;
              $q.notify({
                color: "positive",
                textcolor: "white",
                message: msg,
                position: "center",
                timeout: 200,
              });
            } else {
              $q.loading.hide();
              $q.notify({
                color: "positive",
                textcolor: "white",
                message: msg,
                position: "center",
                timeout: 200,
              });
            }
          }
        })
        .finally(function () {
          $q.loading.hide();
        });
    }

    onMounted(() => {
      refreshpage();
      txtPassword.value = "password";
      isPwd.value = true;
      dlgLock.value = islocked.value;
    });

    return {
      profile,
      foto,
      sign,
      oldpwd,
      pwd1,
      pwd2,
      pwdevent,
      isPwdOld,
      isPwd1,
      isPwd2,
      ShowPassword,
      upload_sign,
      upload_foto,
      save_profile,
      user,
      showProfile,
      dlgUser,
      drawer,
      miniState,
      drawerClick,
      refreshpage,
      JWTToken,
      logout,
      baricons,
      items,
      userprofile,
      islocked,
      txtPassword,
      isPwd,
      dlgLock,
      link,
      openlink,
      detail,
      save_pwd,
      photoprofile,
      thumbStyle: {
        right: "4px",
        borderRadius: "5px",
        backgroundColor: "white",
        width: "7px",
        opacity: 0.75,
      },

      barStyle: {
        right: "2px",
        borderRadius: "9px",
        backgroundColor: "#027be3",
        width: "9px",
        opacity: 0.7,
      },
    };
  },
});
</script>
<style lang="sass">
.my-menu-link
  color: white
  background: #F2C037
</style>
