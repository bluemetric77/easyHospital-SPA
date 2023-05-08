export function updatetoken(state, value) {
  state.jwt = value
}

export function updateuserid(state, value) {
  state.userid = value
}

export function updateusername(state, value) {
  state.username = value
}
export function updatepool(state, value) {
  state.pool_code = value
}

export function UpdateIcons(state, aicons) {
  state.baricons = aicons
}
export function UpdateProfiles(state, aconfig) {
  state.profile = aconfig
}

export function UpdateItems(state, itemlist) {
  state.baritems = itemlist
}

export function Updatesecurity(state, data) {
  state.security = data
}

export function UPDATE_LOCK_PAGE(state, data) {
  state.islocked = data
}
