import { ChevronRight, House, Sparkles } from 'lucide-react'
import { useLocation, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSidebar } from '@/components/ui'
import { useMemo } from 'react'

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
import { useUserStore } from '@/stores'
import { sidebarRoutes } from '@/router/routes'
import { ISidebarRoute } from '@/types'
import { HomelandLogo } from '@/assets/images'
import { cn } from '@/lib'
import { ROUTE } from '@/constants'

export function AppSidebar() {
  const { t } = useTranslation('sidebar')
  const { userInfo } = useUserStore()
  const location = useLocation()
  const { state, toggleSidebar } = useSidebar()
  const isActive = (path: string) => location.pathname === path

  const translatedSidebarRoute = (sidebarRoutes: ISidebarRoute) => ({
    ...sidebarRoutes,
    title: t(`${sidebarRoutes.title}`),
    children: sidebarRoutes.children?.map((child) => ({
      ...child,
      title: t(`${child.title}`),
    })),
  })

  // Translate all sidebar routes
  const translatedRoutes = sidebarRoutes.map(translatedSidebarRoute)

  // Lọc routes theo role của user
  const filteredRoutes = useMemo(() => {
    if (!userInfo?.role?.name) return []

    return translatedRoutes.filter((route) => {
      // Kiểm tra role cho phép
      return !route.roles || route.roles.includes(userInfo.role.name)
    })
  }, [translatedRoutes, userInfo?.role?.name])

  return (
    <Sidebar
      variant="inset"
      className={`z-50 border-r bg-white shadow-2xl shadow-gray-300 dark:bg-transparent dark:shadow-none`}
      collapsible="icon"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-full">
            <NavLink
              to={ROUTE.OVERVIEW}
              className="flex items-center justify-center p-2"
            >
              {state === 'collapsed' ? (
                <div className="transition-colors duration-200 hover:text-primary">
                  <House size={20} />
                </div>
              ) : (
                <img src={HomelandLogo} alt="logo" className="h-6" />
              )}
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
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
                      <span className="font-thin">{item.title}</span>
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
                                  <span>{subItem.title}</span>
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
