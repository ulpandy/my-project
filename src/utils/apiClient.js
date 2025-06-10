import axios from 'axios'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 📌 Интерсептор: добавление токена
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 📌 Интерсептор: обработка ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Например: выкинуть пользователя или показать уведомление
      console.warn('Unauthorized — redirecting to login')
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
