import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { pageauth } from 'src/boot/engine'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({ store }/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    if (to.matched.some(item => item.meta.auth)) {
      let jwt = store.state.home.jwt
      pageauth(to.path).then((respons) => {
        console.info(JSON.stringify(respons))
        if ((respons.is_login) && (respons.is_allowed)) {
          next()
        } else if (respons.is_login) {
          next('/auth')
        } else {
          next('not-allowed')
        }
      })
        .catch(function () {
          next('/auth')
        })
    } else next()
    // Now you need to add your authentication logic here, like calling an API endpoint
  })


  return Router
})
