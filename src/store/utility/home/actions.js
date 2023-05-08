import { getapi, postapi } from 'boot/engine'

export async function GET_DATA(context, props) {
  let url = props.url
  delete props.url
  try {
    let result = await getapi(url, props)
    if (!(typeof result === 'undefined')) {
      return result.data
    }
  } catch (error) {
    return undefined
  }
}

export async function POST_DATA(context, props) {
  let url = props.url
  delete props.url
  try {
    let result = await postapi(url, props, true)
    return result
  } catch (error) {
    return undefined
  }
}

export async function GET_PAGEPROPERTY(context, id) {
  let json = {}
  json.id = id
  let result = await getapi('home/columndef', json)
  if (!(typeof result === 'undefined')) {
    let ret = {}
    let columns = JSON.parse(result.data.column_def)
    let col = []
    columns.forEach((el) => {
      el.headerClasses = 'bg-blue-grey-14 text-white'
      col.push(el)
    })
    ret.columns = col
    ret.title = result.data.title_page
    ret.url = JSON.parse(result.data.api_link)
    ret.btn = JSON.parse(result.data.security)
    const objects = JSON.parse(result.data.security)
    const access = result.data.access
    ret.access = []
    ret.btn = []
    objects.forEach((el) => {
      el.is_allowed = access[el.action]
      ret.btn.push(el)
    })
    return ret
  }
}
