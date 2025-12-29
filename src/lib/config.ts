const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
const apiBaseUrl = backendBaseUrl.replace(/\/api\/v1$/, '') + '/api/v1'

export const config = {
  apiBaseUrl,
  backendBaseUrl: backendBaseUrl.replace(/\/api\/v1$/, ''),
  appName: import.meta.env.VITE_APP_NAME || 'AI Study Buddy',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

export const getAvatarUrl = (
  avatarPath: string | null | undefined,
  cacheKey?: string | Date
): string | null => {
  if (!avatarPath) return null
  if (avatarPath.startsWith('http')) return avatarPath
  
  const baseUrl = `${config.backendBaseUrl}${avatarPath}`
  
  // Add cache-busting parameter
  if (cacheKey) {
    const key = typeof cacheKey === 'string' 
      ? cacheKey 
      : cacheKey.getTime().toString()
    return `${baseUrl}?v=${key}`
  }
  
  return baseUrl
}
