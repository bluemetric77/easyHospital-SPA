<template>
  <q-page class="flex flex-center">
    <img
      :alt="profile.name"
      :src="profile.logo"
      style="max-height: 300px; max-width: 300px"
    />
  </q-page>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const $store = useStore()

    const profile = computed(() => {
      return $store.state.home.profile
    })
    return { profile }
  }
})
</script>
