import { useEffect, useRef, useCallback } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { Bell, Sparkles, Package, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Badge,
} from '@/components/ui'
import { Role, ROUTE } from '@/constants'
import { useNotification, usePagination, useUpdateNotificationStatus } from '@/hooks'
import { INotification } from '@/types'
import { useOrderTrackingStore, useSelectedOrderStore, useUserStore } from '@/stores'

export default function SystemNotificationPopover() {
  const navigate = useNavigate()
  const { t } = useTranslation(['notification'])
  const { userInfo } = useUserStore()
  const { pagination } = usePagination()
  const {
    data: notificationsData,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useNotification({
    receiver: userInfo?.slug,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  })
  const { mutate: updateStatus } = useUpdateNotificationStatus()
  const {
    setOrderSlug,
  } = useSelectedOrderStore()
  const { clearSelectedItems } = useOrderTrackingStore()
  const observer = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // polling notifications
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  const lastNotificationRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    })
    if (node) observer.current.observe(node)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  const notificationList = notificationsData?.pages.flatMap(page => page.result.items) || []
  const unreadCount = notificationList.filter(n => n.isRead === false).length

  const calculateNotificationTime = (notification: INotification) => {
    const now = moment()
    const createdAt = moment(notification.createdAt)
    const diffMinutes = now.diff(createdAt, 'minutes')
    const diffHours = now.diff(createdAt, 'hours')
    const diffDays = now.diff(createdAt, 'days')
    const diffWeeks = now.diff(createdAt, 'weeks')
    const diffMonths = now.diff(createdAt, 'months')
    const diffYears = now.diff(createdAt, 'years')

    if (diffMinutes < 1) {
      return t('notification.time.justNow')
    } else if (diffHours < 1) {
      return t('notification.time.minutesAgo', { minutes: diffMinutes })
    } else if (diffDays < 1) {
      return t('notification.time.hoursAgo', { hours: diffHours })
    } else if (diffWeeks < 1) {
      return t('notification.time.daysAgo', { days: diffDays })
    } else if (diffMonths < 1) {
      return t('notification.time.weeksAgo', { weeks: diffWeeks })
    } else if (diffYears < 1) {
      return t('notification.time.monthsAgo', { months: diffMonths })
    } else {
      return t('notification.time.yearsAgo', { years: diffYears })
    }
  }

  const handleNotificationClick = (notification: INotification) => {
    if (notification.isRead === false) {
      updateStatus(notification.slug)
    }
    if (notification.type === 'order') {
      clearSelectedItems()
      setOrderSlug(notification.slug)
      if (userInfo?.role.name === Role.STAFF) {
        navigate(`${ROUTE.STAFF_ORDER_MANAGEMENT}?slug=${notification.metadata.order}`)
      } else if (userInfo?.role.name === Role.CHEF) {
        navigate(`${ROUTE.STAFF_CHEF_ORDER}?slug=${notification.metadata.order}`)
      }
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
              className="flex absolute -top-1 -right-1 justify-center items-center p-0 w-5 h-5 text-xs rounded-full animate-pulse"
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
              {notificationList.map((notification, index) => (
                <div
                  key={notification.slug}
                  ref={index === notificationList.length - 1 ? lastNotificationRef : undefined}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative flex gap-3 items-center p-3 border-b transition-all border-muted-foreground/30 hover:bg-primary/10 cursor-pointer 
                 ${notification.isRead === false ? 'bg-primary/5' : ''}`}
                >
                  {/* Icon Bell với dấu chấm nếu chưa đọc */}
                  <div className={`flex relative justify-center items-center w-9 h-9 rounded-full ${notification.isRead
                    ? 'bg-muted-foreground/15'
                    : notification.message === 'order-needs-processed'
                      ? 'bg-primary/20'
                      : 'bg-blue-100'
                    }`}>
                    {notification.message === 'order-needs-processed' ? (
                      <Package className={`w-4 h-4 ${notification.isRead ? 'text-muted-foreground/70' : 'text-orange-500'}`} />
                    ) : notification.message === 'order-needs-delivered' ? (
                      <Truck className={`w-4 h-4 ${notification.isRead ? 'text-muted-foreground/70' : 'text-blue-500'}`} />
                    ) : (
                      <Bell className={`w-4 h-4 ${notification.isRead ? 'text-muted-foreground/70' : 'text-primary'}`} />
                    )}
                    {notification.isRead === false && (
                      <>
                        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 animate-pulse text-primary" />
                      </>
                    )}
                  </div>

                  {/* Nội dung thông báo */}
                  <div className="flex-1 min-w-0 text-sm text-left">
                    <div className="flex gap-2 items-center">
                      <p className='font-bold text-muted-foreground'>
                        {t(`notification.${notification.type}`)}
                      </p>
                      {notification.isRead === false && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary text-[0.5rem] px-1 py-0">
                          {t('notification.new')}
                        </Badge>
                      )}
                    </div>
                    <p className="overflow-hidden w-full text-xs truncate whitespace-nowrap text-muted-foreground/70">
                      {t(`notification.${notification.message}`)}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[0.5rem] text-muted-foreground/70">
                        {calculateNotificationTime(notification)}
                      </span>
                      <span className={`text-[0.5rem] ${notification.isRead ? 'text-muted-foreground/70' : 'text-primary font-medium'}`}>
                        {notification.isRead ? t('notification.read') : t('notification.unread')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={loadMoreRef} className="py-2 text-center">
                {isFetchingNextPage ? (
                  <span className="text-xs text-muted-foreground">{t('notification.loadingMore')}</span>
                ) : hasNextPage ? (
                  <span className="text-xs text-muted-foreground">{t('notification.loadMore')}</span>
                ) : null}
              </div>
            </div>
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
