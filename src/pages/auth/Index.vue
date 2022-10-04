<template>
  <q-page class="flex flex-center bg">
    <q-card style="width:350px">
      <q-bar class="entry-caption">
        <q-icon name="vpn_key" size="sm"/>
      </q-bar>
      <div class="flex flex-center q-my-sm">
        <img
          :alt="profile.company_name"
          :src="profile.company_logo"
          spinner-color="white"
          style="height: 100px; max-width: 200px"
        />
      </div>
      <div class="q-pa-xs q-gutter-sm">
        <q-input
          v-model="txtuser"
          label="Username"
          bg-color="white"
          square
          outlined
          dense
          type="text"
        />
        <q-input
          v-model="txtpwd"
          square
          label="Password"
          outlined
          dense
          :type="isPwd ? 'password' : 'text'"
          hint="Password dengan toggle"
        >
          <template v-slot:append>
            <q-icon
              class="fas fa-eye-slash"
              @click="isPwd = !isPwd"
              color="green-10"
              size="xs"
            />
          </template>
        </q-input>
      </div>

      <q-separator />
      <q-card-section class="dialog-action-login q-pa-sm">
        <q-btn
          class="glossy full-width"
          rounded
          label="Login"
          no-caps
          @click="check_login()"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar, QSpinnerBars } from "quasar";

export default defineComponent({
  name: "Userlogin",
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const $router = useRouter();

    const txtuser = ref("");
    const txtpwd = ref("");
    const isPwd = ref(true);
    const cwidth = computed(() => {
      var size = "350";
      if ($q.screen.xs) {
        size = "250";
      } else if ($q.screen.sm) {
        size = "300";
      } else {
        size = "300";
      }
      return size;
    });

    const profile = computed(() => {
      return $store.state.home.profile;
    });

    async function check_login() {
      let json = {};
      json.url = "login";
      json.user_id = txtuser.value;
      json.password = txtpwd.value;
      $q.loading.show({ spinner: QSpinnerBars, delay: 1000 });
      $store
        .dispatch("home/POST_DATA", json)
        .then((respon) => {
          if (!(typeof respon === "undefined")) {
            let msg = "";
            if (respon.success) {
              $q.sessionStorage.set("auth-jwt", respon.data.token);
              $router.push("/");
            } else {
              msg = respon.data;
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
        .finally((final) => {
          $q.loading.hide();
        });
    }

    async function refreshpage() {
      try {
        let props = {};
        props.url = "profile";
        let respon = await $store.dispatch("home/GET_DATA", props);
        respon.company_logo = "http://localhost:8000/"+respon.company_logo;
        $store.commit("home/UpdateProfiles", respon);
      } finally {
      }
    }

    onMounted(async () => {
      await refreshpage();
      if ($q.localStorage.getItem("fullscreen")) {
        $q.fullscreen.request();
      } else {
        $q.fullscreen.exit();
      }
    });

    return {
      txtuser,
      txtpwd,
      isPwd,
      cwidth,
      profile,
      check_login,
      refreshpage,
    };
  },
});
</script>
