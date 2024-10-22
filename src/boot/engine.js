import { boot } from 'quasar/wrappers'
import VueNumeric from '@handcrafted-market/vue3-numeric'
import { api } from 'boot/axios'
import { Loading, QSpinnerGears, QSpinnerPie, QSpinnerBall } from 'quasar'
import home from '../store/utility/home'
import { SessionStorage } from 'quasar'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
class Config {
  Environment() {
    let setting = {}
    setting = {
      BaseUrl: 'http://localhost',
      Port: 8000,
      API: 'api',
      vendor: 'vendor',
      APIKey: '4c7a804cb484aa4a81734023634644a7643cf8ff',
      APIPassword: 'e059de7fcce4ceb254f9048478abd6ec613e17e4',
      UserToken: 'gep',
      timeout: 30000
    }
    return setting
  }
  async UrlLink() {
    var baseUrl = window.location.origin
    let response = await api({
      url: baseUrl + '/api.json',
      method: 'get',
      timeout: 5000,
      withCredentials: false
    })
    let Url = baseUrl
    if (!(typeof response === 'undefined')) {
      Url = response.data.api_url + '/api'
    }
    return Url
  }

  async UrlPublic() {
    var baseUrl = window.location.origin
    let response = await api({
      url: baseUrl + '/api.json',
      method: 'get',
      timeout: 5000,
      withCredentials: false
    })
    let Url = baseUrl
    if (!(typeof response === 'undefined')) {
      Url = response.data.api_url
    }
    return Url
  }

  async BaseAPI() {
    var baseUrl = window.location.origin
    let response = await api({
      url: baseUrl + '/api.json',
      method: 'get',
      timeout: 5000,
      withCredentials: false
    })
    let Url = baseUrl
    if (!(typeof response === 'undefined')) {
      Url = response.data.api_url + '/api'
    }
    return Url
  }
  async BaseURL() {
    let url = await this.Environment().BaseURL
    return url
  }
  BasePort() {
    return this.Environment().PortAPI
  }
  AccessToken() {
    let accesstoken = ''
    try {
      accesstoken = SessionStorage.getItem('auth-jwt')
      if (accesstoken.indexOf('|') > 0) {
        accesstoken = accesstoken.substr(
          accesstoken.indexOf('|') + 1,
          accesstoken.length
        )
      }
    } catch (error) {
      accesstoken = 'N/A'
    }
    return accesstoken
  }
  JWTToken() {
    // home.jwt
    let jwt = ''
    try {
      jwt = sessionStorage.getItem('auth-jwt')
      if (jwt.indexOf('|') > 0) {
        jwt = jwt.substr(jwt.indexOf('|') + 1, jwt.length)
      }
    } catch (error) {
      jwt = 'N/A'
    }
    return jwt
  }
  PoolCode() {
    let pool = ''
    try {
      pool = sessionStorage.getItem('pool')
      if (pool.indexOf('|') > 0) {
        pool = pool.substr(pool.indexOf('|') + 1, pool.length)
      }
    } catch (error) {
      pool = '-'
    }
    return pool
  }
}

function pushdata(apiname, apimethod, apidata) {
  if (apidata === '') {
    return (
      '{"metadata":{"api":"' +
      apiname +
      '","method":"' +
      apimethod +
      '"},"data":{}}'
    )
  } else {
    return (
      '{"metadata":{"api":"' +
      apiname +
      '","method":"' +
      apimethod +
      '"},"data":{' +
      apidata +
      '}}'
    )
  }
}

function RefineDate(IndDate) {
  if (!(IndDate === null)) {
    let flag = IndDate.substr(5, 1)
    if (flag === '-' || flag === '/') {
      let tahun = IndDate.substr(6, 4)
      let bulan = IndDate.substr(3, 2)
      let tanggal = IndDate.substr(0, 2)
      return tahun + '-' + bulan + '-' + tanggal
    } else {
      return IndDate
    }
  } else {
    return IndDate
  }
}

function IndonesiaDateTime(IndDate) {
  if (!(IndDate === null) && typeof IndDate !== 'undefined') {
    let flag = IndDate.substr(4, 1)
    if (flag === '-' || flag === '/') {
      let tahun = IndDate.substr(0, 4)
      let bulan = IndDate.substr(5, 2)
      let tanggal = IndDate.substr(8, 2)
      return tanggal + '-' + bulan + '-' + tahun + ' ' + IndDate.substr(11, 8)
    } else {
      return IndDate
    }
  } else {
    return IndDate
  }
}

function IndonesiaDateTime2(IndDate) {
  if (!(IndDate === null) && typeof IndDate !== 'undefined') {
    let flag = IndDate.substr(4, 1)
    if (flag === '-' || flag === '/') {
      let tahun = IndDate.substr(0, 4)
      let bulan = IndDate.substr(5, 2)
      let tanggal = IndDate.substr(8, 2)
      return tanggal + '-' + bulan + '-' + tahun + ' ' + IndDate.substr(11, 5)
    } else {
      return IndDate
    }
  } else {
    return IndDate
  }
}

function IndonesiaDate(IndDate) {
  if (!(IndDate === null) && typeof IndDate !== 'undefined') {
    let flag = IndDate.substr(4, 1)
    if (flag === '-' || flag === '/') {
      let tahun = IndDate.substr(0, 4)
      let bulan = IndDate.substr(5, 2)
      let tanggal = IndDate.substr(8, 2)
      return tanggal + '-' + bulan + '-' + tahun
    } else {
      return IndDate
    }
  } else {
  }
}

function RefineTime(IndDate) {
  if (!(IndDate === null)) {
    let flag = IndDate.substr(2, 1)
    if (flag === ':') {
      let hour = Number(IndDate.substr(0, 2))
      let minute = Number(IndDate.substr(3, 2))
      return new Date(1899, 12, 31, hour, minute, 0)
    } else {
      let flag1 = IndDate.substr(2, 1)
      let flag2 = IndDate.substr(5, 1)
      if (flag1 === '-' || flag1 === '/' || flag2 === '-' || flag2 === '/') {
        let hour = Number(IndDate.substr(11, 2))
        let minute = Number(IndDate.substr(14, 2))
        return new Date(1899, 12, 31, hour, minute, 0)
      } else {
        return IndDate
      }
    }
  } else {
    return IndDate
  }
}

function RefineNumber(AValue) {
  let number = AValue
  if (!(AValue === null) && typeof AValue !== 'undefined') {
    let n = number.indexOf('.')
    while (n >= 0) {
      number = number.replace('.', '')
      n = number.indexOf('.')
    }
    let y = number.indexOf(',')
    while (y >= 0) {
      number = number.replace(',', '.')
      y = number.indexOf(',')
    }
  }
  return number
}

function fNull(Value, OtherValue = '') {
  if (Value === null) {
    return OtherValue
  } else {
    return Value
  }
}

async function downloadapi(apiname, apidata = null) {
  let config = new Config()
  let urlapi = (await config.UrlLink()) + '/' + apiname
  let timeoutlink = config.Environment().timeout
  let jwt = config.JWTToken()
  Loading.show({ spinner: QSpinnerGears })
  if (apidata === null) {
    apidata = []
  }
  api({
    url: urlapi,
    method: 'get',
    timeout: timeoutlink,
    params: apidata,
    withCredentials: true,
    responseType: 'blob',
    headers: {
      'x-jwt': jwt
    }
  })
    .then(async (response) => {
      // 'application/pdf'
      var blob = new Blob([response.data], { type: response.data.type })
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob)
        return 0 // for IE
      } else {
        let fileURL = URL.createObjectURL(blob)
        window
          .open(
            fileURL,
            '_blank',
            'fullscreen=yes',
            'width=' + screen.availWidth + ',height=' + screen.availHeight
          )
          .focus()
      }
    })
    .finally(Loading.hide())
}
async function downloadexcel(apiname, apidata = null) {
  let config = new Config()
  let urlapi = (await config.UrlLink()) + '/' + apiname
  let timeoutlink = config.Environment().timeout
  let jwt = config.JWTToken()
  Loading.show({ spinner: QSpinnerGears })
  api({
    url: urlapi,
    method: 'get',
    timeout: timeoutlink,
    params: apidata,
    responseType: 'blob',
    withCredentials: false,
    headers: {
      'x-jwt': jwt,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    }
  })
    .then(async (response) => {
      let filename = response.headers['content-disposition']
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      filename = filename.replace('attachment;', '').trim()
      filename = filename.replace('filename=', '').trim()
      if (filename.substr(0, 1) === '"') {
        filename = filename.substr(1, filename.length)
      }
      if (filename.substr(filename.length - 1, 1) === '"') {
        filename = filename.substr(0, filename.length - 1)
      }
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
    })
    .finally(Loading.hide())
}

async function uploadapi(apiname, file = null, apidata = null) {
  let config = new Config()
  let urlapi = (await config.UrlLink()) + '/' + apiname
  let timeoutlink = config.Environment().timeout
  let jwt = config.JWTToken()

  Loading.show({ spinner: QSpinnerGears })

  var formdata = new FormData()
  formdata.append('file', file)
  var fields = Object.keys(apidata)
  let count = 0
  for (count = 0; count < fields.length; count++) {
    formdata.append(fields[count], apidata[fields[count]])
  }
  try {
    let respon = await api({
      url: urlapi,
      method: 'post',
      timeout: timeoutlink,
      data: formdata,
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-jwt': jwt
      }
    })
    if (!(typeof respon.data.new_jwt === 'undefined')) {
      let newjwt = respon.data.new_jwt
      this.$q.sessionStorage.set('auth-jwt', newjwt)
    }
    if (!(typeof respon.data.contents === 'undefined')) {
      return respon.data.contents
    } else {
      return undefined
    }
  } catch (error) {
    return undefined
  }
}

async function getapi(
  apiname,
  apidata = null,
  geterror = false,
  progress = false
) {
  let config = new Config()
  let urlapi = (await config.UrlLink()) + '/' + apiname
  let timeoutlink = config.Environment().timeout
  let jwt = config.JWTToken()
  if (progress) {
    Loading.show({
      spinner: QSpinnerBall,
      spinnerColor: 'red-10',
      spinnerSize: 75,
      messageColor: 'blue-10'
    })
  }
  try {
    let respon = await api({
      url: urlapi,
      method: 'get',
      timeout: timeoutlink,
      params: apidata,
      withCredentials: false,
      headers: {
        'x-jwt': jwt
      }
    })
    Loading.hide()
    if (!(typeof respon.data.new_jwt === 'undefined')) {
      let newjwt = respon.data.new_jwt
      this.$q.sessionStorage.set('auth-jwt', newjwt)
    }
    if (!(typeof respon.data === 'undefined')) {
      if (!geterror) {
        if (respon.data.header.status === 'OK') {
          return respon.data.contents
        } else {
          return undefined
        }
      } else {
        return respon.data.contents
      }
    } else return undefined
  } catch (error) {
    Loading.hide()
    return undefined
  }
}

async function postapi(
  apiname,
  apidata = null,
  progress = false,
  is_upload = false,
  file = null
) {
  let config = new Config()
  let urlapi = (await config.UrlLink()) + '/' + apiname
  let timeoutlink = config.Environment().timeout
  let jwt = config.JWTToken()
  if (progress) {
    Loading.show({
      spinner: QSpinnerPie,
      spinnerColor: 'teal-10',
      spinnerSize: 100,
      messageColor: 'blue-10'
    })
  }
  if (is_upload) {
    var formdata = new FormData()
    formdata.append('file', file)
    formdata.append('json', JSON.stringify(apidata))
  }
  try {
    let respon = await api({
      url: urlapi,
      method: 'post',
      timeout: timeoutlink,
      data: is_upload ? formdata : apidata,
      withCredentials: false,
      headers: {
        'x-jwt': jwt
      }
    })
    Loading.hide()
    if (!(typeof respon.data.new_jwt === 'undefined')) {
      let newjwt = respon.data.new_jwt
      this.$q.sessionStorage.set('auth-jwt', newjwt)
    }
    if (!(typeof respon.data.contents === 'undefined')) {
      return respon.data.contents
    } else {
      return undefined
    }
  } catch (error) {
    Loading.hide()
    return undefined
  }
}

async function deleteapi(apiname, apidata = null, progress = false) {
  let config = new Config()
  let urlapi = (await config.UrlLink()) + '/' + apiname
  let timeoutlink = config.Environment().timeout
  let jwt = config.JWTToken()
  if (progress) {
    Loading.show({
      spinner: QSpinnerPie,
      spinnerColor: 'teal-10',
      spinnerSize: 140,
      messageColor: 'blue-10'
    })
  }
  try {
    let respon = await api({
      url: urlapi,
      method: 'delete',
      timeout: timeoutlink,
      data: apidata,
      withCredentials: true,
      headers: {
        'x-jwt': jwt
      }
    })
    Loading.hide()
    if (!(typeof respon.data.new_jwt === 'undefined')) {
      let newjwt = respon.data.new_jwt
      this.$q.sessionStorage.set('auth-jwt', newjwt)
    }
    if (!(typeof respon.data === 'undefined')) {
      return respon.data.contents
    } else return undefined
  } catch (error) {
    Loading.hide()
    return undefined
  }
}

async function pageauth(url) {
  let config = new Config()
  let timeoutlink = config.Environment().timeout
  let jwt = config.JWTToken()
  let urlapi = (await config.UrlLink()) + '/access/page-verification'
  Loading.show({ spinner: QSpinnerGears, message: 'Sedang cek akses data' })
  try {
    let respon = await api({
      url: urlapi,
      method: 'get',
      timeout: timeoutlink,
      withCredentials: true,
      params: {
        objects: url
      },
      headers: {
        'x-jwt': jwt
      }
    })
    var result = {
      is_login: false,
      is_allowed: false
    }
    if (!(typeof respon === 'undefined')) {
      if (respon.data.header.status === 'OK') {
        home.mutations.UPDATE_LOCK_PAGE(
          home.state,
          respon.data.contents.data.is_locked
        )
        if (!(typeof respon.data.contents.data.new_jwt === 'undefined')) {
          let newjwt = respon.data.contents.data.new_jwt
          SessionStorage.set('auth-jwt', newjwt)
        }
        Loading.hide()
        var result = {
          is_login: respon.data.contents.data.is_login,
          is_allowed: respon.data.contents.data.is_allowed
        }
        return result
      } else {
        Loading.hide()
        return result
      }
    } else {
      Loading.hide()
      return result
    }
  } catch (error) {
    Loading.hide()
    return false
  }
}

function formatNumber(
  value,
  decimal = 0,
  comma = ',',
  leadingzero = '',
  fixdecimal = false
) {
  if (value === null) {
    value = '0'
  }
  if (typeof value === 'undefined') {
    value = '0'
  }
  if (typeof value === 'string') {
    value = parseFloat(value)
  }
  if (value === 0 && !(leadingzero === '')) {
    return leadingzero
  } else {
    let hasil = '0'
    let thousand = '.'
    if (comma === '.') {
      thousand = ','
    }
    if (!isNaN(value)) {
      value = value.toFixed(decimal)
      value = value.toString()

      let n = value.indexOf('.', 0)
      let desimal = ''
      let fraction = 0
      let nominal = value

      if (n > 0) {
        desimal = value.substr(n + 1, 4)
        nominal = value.substr(0, n)
      }

      if (!(desimal === '')) {
        if (desimal.substr(1, 1) === '.') {
          desimal = desimal.substr(2, desimal.length)
        }
        fraction = parseInt(desimal)
        if (isNaN(fraction)) {
          fraction = 0
        }
      } else {
        fraction = 0
      }

      desimal = fraction.toString()
      desimal = desimal.substr(0, desimal)

      if (fixdecimal) {
        desimal = desimal.padEnd(decimal, '0')
      }
      let length = nominal.length
      let x = 0
      if (length > 3) {
        for (x = length; x > 0; x = x - 3) {
          if (x > 3) {
            nominal =
              nominal.substr(0, x - 3) +
              thousand +
              nominal.substr(x - 3, length + 1)
          }
        }
      }
      if (nominal === '') {
        nominal = '0'
      }
      hasil = nominal
      if (decimal > 0 && desimal !== '') {
        hasil = nominal + comma + desimal
      } else {
        hasil = nominal
      }
      if (hasil.substr(0, 1) === '-') {
        hasil = hasil.substr(1, hasil.length)
        if (hasil.substr(0, 1) === '.') {
          hasil = hasil.substr(1, hasil.length)
        }
        hasil = '(' + hasil + ')'
      }
    } else {
      hasil = '0'
    }
    return hasil
  }
}
function getMonthName(pdate) {
  let monthname = ''
  let month = pdate.getMonth()
  if (month === 0) {
    monthname = 'Januari'
  } else if (month === 1) {
    monthname = 'Februari'
  } else if (month === 2) {
    monthname = 'Maret'
  } else if (month === 3) {
    monthname = 'April'
  } else if (month === 4) {
    monthname = 'Mei'
  } else if (month === 5) {
    monthname = 'Juni'
  } else if (month === 6) {
    monthname = 'Juli'
  } else if (month === 7) {
    monthname = 'Agustus'
  } else if (month === 8) {
    monthname = 'September'
  } else if (month === 9) {
    monthname = 'Oktober'
  } else if (month === 10) {
    monthname = 'November'
  } else if (month === 11) {
    monthname = 'Desember'
  }

  return monthname
}

function ymd(date = null) {
  if (date === null) {
    return null
  } else {
    var day = date.getDate().toString()
    var month = (date.getMonth() + 1).toString()
    return (
      date.getFullYear() +
      '-' +
      (month.length !== 2 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) +
      '-' +
      (day.length !== 2 ? '0' + date.getDate() : date.getDate())
    )
  }
}

export default boot(({ app }) => {
  // something to do
  app.use(VueNumeric)
  app.component('vue-numeric', VueNumeric)
  app.config.globalProperties.$Config = Config
  app.config.globalProperties.$pushdata = pushdata
  app.config.globalProperties.$getapi = getapi
  app.config.globalProperties.$postapi = postapi
  app.config.globalProperties.$downloadapi = downloadapi
  app.config.globalProperties.$downloadexcel = downloadexcel
  app.config.globalProperties.$uploadapi = uploadapi
  app.config.globalProperties.$deleteapi = deleteapi
  app.config.globalProperties.$localdate = RefineDate
  app.config.globalProperties.$localtime = RefineTime
  app.config.globalProperties.$localnumber = RefineNumber
  app.config.globalProperties.$isNull = fNull
  app.config.globalProperties.$Pageuath = pageauth
  app.config.globalProperties.$formatnumber = formatNumber
  app.config.globalProperties.$INDDate = IndonesiaDate
  app.config.globalProperties.$INDDateTime = IndonesiaDateTime
  app.config.globalProperties.$INDDateTime2 = IndonesiaDateTime2
  app.config.globalProperties.$Month = getMonthName
  app.config.globalProperties.$ymd = ymd
})

export {
  Config,
  getapi,
  postapi,
  pageauth,
  downloadapi,
  downloadexcel,
  uploadapi,
  deleteapi,
  RefineDate,
  RefineTime,
  RefineNumber,
  fNull,
  formatNumber,
  IndonesiaDate,
  IndonesiaDateTime,
  IndonesiaDateTime2,
  getMonthName,
  ymd
}
