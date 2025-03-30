import { useEffect } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Badge,
} from '@/components/ui'
import { ROUTE } from '@/constants'
import { useNotification, useUpdateNotificationStatus } from '@/hooks'
import { INotification } from '@/types'
import { useOrderTrackingStore, useSelectedOrderStore } from '@/stores'

export default function SystemNotificationPopover() {
  const navigate = useNavigate()
  const { t } = useTranslation(['notification'])
  const { data: notifications, refetch } = useNotification({})
  const { mutate: updateStatus } = useUpdateNotificationStatus()
  const {
    setOrderSlug,
  } = useSelectedOrderStore()
  const { clearSelectedItems } = useOrderTrackingStore()

  // polling notifications
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  const notificationList = notifications?.result || []
  const unreadCount = notificationList.filter(n => n.isRead === false).length

  const calculateNotificationTime = (notification: INotification) => {
    const createdAt = moment(notification.createdAt)
    return createdAt.fromNow()
  }

  const handleNotificationClick = (notification: INotification) => {
    if (notification.isRead === false) {
      updateStatus(notification.slug)
    }
    if (notification.type === 'order') {
      clearSelectedItems()
      setOrderSlug(notification.slug)
      navigate(`${ROUTE.STAFF_ORDER_MANAGEMENT}?slug=${notification.metadata.order}`)
    }
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/10 hover:text-primary"
        >
          <Bell className="h-[1.1rem] w-[1.1rem]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="flex absolute -top-1 -right-1 justify-center items-center p-0 w-5 h-5 text-xs rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}

        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 px-0 py-0 border-primary text-center text-xs lg:min-w-[30%]">
        {notificationList.length > 0 ? (
          <div>
            <div className="flex justify-between items-center px-4 py-3 border-b border-muted-foreground/30">
              <h3 className="w-full text-sm font-semibold text-muted-foreground">
                {t('notification.notificationList')}
              </h3>
            </div>

            <div className="flex overflow-y-auto flex-col h-[16rem]">
              {notificationList.map((notification) => (
                <div
                  key={notification.slug}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative flex gap-3 items-center p-3 border-b transition-all border-muted-foreground/30 hover:bg-primary/10 cursor-pointer 
                 ${notification.isRead === false ? 'bg-primary/10' : ''}`}
                >
                  {/* Icon Bell với dấu chấm nếu chưa đọc */}
                  <div className="flex relative justify-center items-center w-9 h-9 rounded-full bg-primary/20">
                    <Bell className="w-4 h-4 text-primary" />
                    {notification.isRead === false && (
                      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Nội dung thông báo */}
                  <div className="flex-1 min-w-0 text-sm text-left">
                    <p className='font-bold text-muted-foreground'>
                      {t(`notification.${notification.type}`)}
                    </p>
                    <p className="overflow-hidden w-full text-xs truncate whitespace-nowrap text-muted-foreground/70">
                      {t(`notification.${notification.message}`)}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[0.5rem] text-muted-foreground/70">
                        {calculateNotificationTime(notification)}
                      </span>
                      <span className="text-[0.5rem] text-primary">
                        {notification.isRead ? t('notification.read') : t('notification.unread')}
                      </span>
                    </div>
                  </div>
                </div>

              ))}
            </div>

            {/* <div className='py-4 w-full text-sm font-semibold transition-colors bg-muted-foreground/10 hover:bg-muted-foreground/20'>
              <NavLink to={ROUTE.STAFF_NOTIFICATION} className="block">
                {t('notification.seeAll')}
              </NavLink>
            </div> */}
          </div>
        ) : (
          <div className="py-8 text-sm text-center text-muted-foreground">
            {t('notification.noNotification')}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
