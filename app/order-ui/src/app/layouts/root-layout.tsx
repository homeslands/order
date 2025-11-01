import { Outlet } from 'react-router-dom'
import { NotificationProvider } from '@/components/app/notification-provider'

/**
 * Root Layout - Wrapper cho tất cả routes
 * Chứa NotificationProvider để dùng chung cho toàn app
 */
export default function RootLayout() {
  return (
    <>
      <NotificationProvider />
      <Outlet />
    </>
  )
}

