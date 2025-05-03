import { useMemo } from 'react'
import { ChevronRight, House, Sparkles } from 'lucide-react'
import { useLocation, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { jwtDecode } from "jwt-decode";

import { useSidebar } from '@/components/ui'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  IconWrapper,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui'
import { useAuthStore, useUserStore } from '@/stores'
import { sidebarRoutes } from '@/router/routes'
import { IToken } from '@/types'
import { Logo } from '@/assets/images'
import { cn } from '@/lib'
import { NotificationMessageCode, ROUTE } from '@/constants'
import { useNotification, usePagination } from '@/hooks';

export function AppSidebar() {
  const { t } = useTranslation('sidebar')
  const location = useLocation()
  const { userInfo } = useUserStore()
  const { state, toggleSidebar } = useSidebar()
  const authStore = useAuthStore.getState()
  const { token } = authStore
  const decoded: IToken = jwtDecode(token || '');
  const { pagination } = usePagination()
  const {
    data: notificationsData
  } = useNotification({
    receiver: userInfo?.slug,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  })

  const notificationList = notificationsData?.pages.flatMap(page => page.result.items) || []

  // count unread order needs processed notification
  const orderNeedsProcessed = notificationList.filter(notification => notification.message === NotificationMessageCode.ORDER_NEEDS_PROCESSED && !notification.isRead).length
  const orderNeedsDelivered = notificationList.filter(notification => notification.message === NotificationMessageCode.ORDER_NEEDS_DELIVERED && !notification.isRead).length
  // const orderNeedsCancelled = notificationList.filter(notification => notification.message === NotificationMessageCode.ORDER_NEEDS_CANCELLED && !notification.isRead).length

  // Update notification counts in routes
  const updatedRoutes = useMemo(() => {
    return sidebarRoutes.map(route => {
      let notificationCount = undefined;

      if (route.path === ROUTE.STAFF_ORDER_MANAGEMENT) {
        notificationCount = orderNeedsDelivered;
      } else if (route.path === ROUTE.STAFF_CHEF_ORDER || route.path === ROUTE.STAFF_ORDER_HISTORY) {
        notificationCount = orderNeedsProcessed;
      }

      return {
        ...route,
        notificationCount,
        title: t(route.title),
        children: route.children?.map(child => ({
          ...child,
          title: t(child.title),
        }))
      };
    });
  }, [orderNeedsDelivered, orderNeedsProcessed, t]);

  const isActive = (path: string) => {
    // If the path is exactly the same, return true
    if (location.pathname === path) return true;

    // For nested routes, check if the current path starts with the menu path
    // and the next character is either '/' or the end of the string
    return location.pathname.startsWith(path) &&
      (location.pathname[path.length] === '/' || location.pathname.length === path.length);
  }

  // const translatedSidebarRoute = (sidebarRoutes: ISidebarRoute) => ({
  //   ...sidebarRoutes,
  //   title: t(`${sidebarRoutes.title}`),
  //   children: sidebarRoutes.children?.map((child) => ({
  //     ...child,
  //     title: t(`${child.title}`),
  //   })),
  // })

  // Translate all sidebar routes
  // const translatedRoutes = sidebarRoutes.map(translatedSidebarRoute)

  // Filter routes by permission
  const filteredRoutes = useMemo(() => {
    if (!decoded.scope) return []
    const scope = typeof decoded.scope === "string" ? JSON.parse(decoded.scope) : decoded.scope;
    const permissions = scope.permissions || [];

    return updatedRoutes.filter((route) => {
      // Check if route has permission and user has that permission
      return route?.permission && permissions.includes(route.permission)
    })
  }, [updatedRoutes, decoded])

  return (
    <Sidebar
      variant="inset"
      className={`z-50 border-r shadow-2xl shadow-gray-300 dark:shadow-none`}
      collapsible="icon"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-full">
            <NavLink
              to={ROUTE.OVERVIEW}
              className="flex justify-center items-center p-2"
            >
              {state === 'collapsed' ? (
                <div className="transition-colors duration-200 hover:text-primary">
                  <House size={20} />
                </div>
              ) : (
                <img src={Logo} alt="logo" className="h-6" />
              )}
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-x-auto no-scrollbar scroll-smooth">
        <SidebarGroup>
          <SidebarMenu>
            {filteredRoutes.map((item) => (
              <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      'hover:bg-primary hover:text-white',
                      isActive(item.path) ? 'bg-primary text-white' : '',
                    )}
                  >
                    <NavLink
                      to={item.path}
                      onClick={(e) => {
                        if (state === 'collapsed') {
                          e.preventDefault()
                          toggleSidebar()
                        } else {
                          // Collapse sidebar after navigation on mobile
                          if (window.innerWidth < 768) {
                            toggleSidebar()
                          }
                        }
                      }}
                    >
                      {item.icon && (
                        <IconWrapper
                          Icon={item.icon}
                          className={
                            isActive(item.path) ? 'bg-primary text-white' : ''
                          }
                        />
                      )}
                      <span className="text-xs font-thin xl:text-sm">{item.title}</span>
                      {/* </div> */}
                      {item?.notificationCount && item.notificationCount > 0 ? (
                        <span
                          className={`px-2 py-1 ml-2 text-xs rounded-full ${isActive(item.path) ? 'bg-white text-primary' : 'bg-primary text-white'
                            } ${item.notificationCount > 99 ? 'px-3' : ''}`}
                        >
                          {item.notificationCount > 9 ? '9+' : item.notificationCount}
                        </span>
                      ) : null}

                    </NavLink>
                  </SidebarMenuButton>
                  {item.children?.length ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={
                                  isActive(subItem.path) ? 'text-primary' : ''
                                }
                              >
                                <NavLink
                                  to={subItem.path}
                                  className="flex flex-col gap-4"
                                >
                                  <span className="text-xs">{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild></DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
