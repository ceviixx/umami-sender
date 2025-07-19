import { toast } from 'react-hot-toast'

export const showSuccess = (message: string) => {
  toast.remove() // Entferne zuerst alle offenen Toasts
  toast.success(message)
}

export const showError = (message: string) => {
  toast.remove()
  toast.error(message)
}

export const showInfo = (message: string) => {
  toast.remove()
  toast(message)
}
