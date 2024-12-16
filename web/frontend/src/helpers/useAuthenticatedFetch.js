import { authenticatedFetch } from '@shopify/app-bridge/utilities'
import { Redirect } from '@shopify/app-bridge/actions'
import { initAppBridge } from '../plugins/appBridge'

export function useAuthenticatedFetch() {
  const appBridge = initAppBridge()
  const app = appBridge
  const fetchFunction = authenticatedFetch(app)
  return async (uri, options) => {
    const response = await fetchFunction(uri, options)
    checkHeadersForReauthorization(response.headers, app)
    return response
  }
}

function checkHeadersForReauthorization(headers, app) {
  if (headers.get('X-Shopify-API-Request-Failure-Reauthorize') === '1') {
    const authUrlHeader =
      headers.get('X-Shopify-API-Request-Failure-Reauthorize-Url') || `/api/auth`
    const redirect = Redirect.create(app)
    redirect.dispatch(
      Redirect.Action.REMOTE,
      authUrlHeader.startsWith('/')
        ? `https://${window.location.host}${authUrlHeader}`
        : authUrlHeader
    )
  }
}

export function useServerApiFetch() {
  // 替换成你的后端服务器域名
  const API_BASE_URL = 'http://localhost:3000'
  const appBridge = initAppBridge()
  const app = appBridge
 
  return async (uri, options) => {
    
     // 确保 headers 存在
     options.headers = {
      ...(options.headers || {}),
      Authorization: "", // 替换为实际的 Authorization jwt
      token: "", // 替换为实际的 token
    };
    const fullUrl = uri.startsWith('http') ? uri : `${API_BASE_URL}${uri}` // 如果 URI 是完整路径则不加域名
    const response = await fetch(fullUrl, options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response
  }
}
