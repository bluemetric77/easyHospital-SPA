import {
  getapi,
  postapi,
  deleteapi,
  uploadapi,
  downloadexcel,
  downloadapi
} from 'boot/engine'

export async function GET_DATA(context, props) {
  let url = props.url
  let geterror = false
  let progress = false
  if (!(typeof props.geterror === 'undefined')) {
    geterror = props.geterror
    delete props.geterror
  }
  delete props.url
  try {
    let result = await getapi(url, props, geterror, progress)
    if (!(typeof result === 'undefined')) {
      if (!geterror) {
        return result.data
      } else {
        return result
      }
    }
  } catch (error) {}
}

export async function DELETE_DATA(context, props) {
  let url = props.url
  let progress = true
  delete props.url
  if (!(typeof props.progress === 'undefined')) {
    progress = props.progress
    delete props.progress
  }
  try {
    let respon = await deleteapi(url, props, progress)
    return respon
  } catch (error) {
    return undefined
  }
}

export async function POST_DATA(context, props) {
  let url = props.url
  let progress = true
  let is_upload = false
  let file = null
  delete props.url
  if (!(typeof props.progress === 'undefined')) {
    progress = props.progress
    delete props.progress
  }
  if (!(typeof props.is_upload === 'undefined')) {
    is_upload = props.is_upload
    delete props.is_upload
  }
  if (!(typeof props.file === 'undefined')) {
    file = props.file
    delete props.file
  }
  try {
    let respon = await postapi(url, props, progress, is_upload, file)
    return respon
  } catch (error) {
    return undefined
  }
}

export async function UPLOAD_DATA(context, props) {
  let url = props.url
  let file = props.file
  delete props.url
  delete props.file
  try {
    let respon = await uploadapi(url, file, props, true)
    return respon
  } catch (error) {
    return undefined
  }
}

export async function GET_DOWNLOAD(context, props) {
  let url = props.url
  delete props.url
  await downloadapi(url, props)
}

export async function GET_DOWNLOADEXCEL(context, props) {
  let url = props.url
  delete props.url
  await downloadexcel(url, props)
}

export async function POST_LOGIN(context, props) {
  try {
    let result = await postapi('login', props)
    if (!(typeof result === 'undefined')) {
      return result
    }
  } catch (error) {
    alert(error)
    return undefined
  }
}

export async function GET_OBJECTSITEM(context) {
  try {
    let result = await getapi('user/item', '')
    if (!(typeof result === 'undefined')) {
      return result.data
    }
  } catch (error) {}
}

export async function GET_OBJECTSITEMACCESS(context) {
  try {
    let result = await getapi('user/itemaccess', '')
    if (!(typeof result === 'undefined')) {
      return result.data
    }
  } catch (error) {}
}

export async function GET_OBJECTACCESS(context, props) {
  try {
    let result = await getapi('user/usersaccess', props)
    if (!(typeof result === 'undefined')) {
      return result.data
    }
  } catch (error) {}
}
