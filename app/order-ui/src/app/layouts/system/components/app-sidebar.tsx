import { ChevronRight, House, Sparkles } from 'lucide-react'
import { useLocation, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { jwtDecode } from "jwt-decode";
import { useSidebar } from '@/components/ui'
import { useMemo } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

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
import { useAuthStore } from '@/stores'
import { sidebarRoutes } from '@/router/routes'
import { ISidebarRoute, IToken } from '@/types'
import { Logo } from '@/assets/images'
import { cn } from '@/lib'
import { ROUTE } from '@/constants'

export function AppSidebar() {
  const { t } = useTranslation('sidebar')
  const location = useLocation()
  const { state, toggleSidebar } = useSidebar()
  const isMobile = useIsMobile()
  const authStore = useAuthStore.getState()
  const { token } = authStore
  const decoded: IToken = jwtDecode(token || '');
  const isActive = (path: string) => {
    // If the path is exactly the same, return true
    if (location.pathname === path) return true;

    // For nested routes, check if the current path starts with the menu path
    // and the next character is either '/' or the end of the string
    return location.pathname.startsWith(path) &&
      (location.pathname[path.length] === '/' || location.pathname.length === path.length);
  }

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

  // Filter routes by permission
  const filteredRoutes = useMemo(() => {
    if (!decoded.scope) return []
    const scope = typeof decoded.scope === "string" ? JSON.parse(decoded.scope) : decoded.scope;
    const permissions = scope.permissions || [];

    return translatedRoutes.filter((route) => {
      // Check if route has permission and user has that permission
      return route?.permission && permissions.includes(route.permission)
    })
  }, [translatedRoutes, decoded])

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
                      onClick={() => {
                        if (isMobile) {
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
                                  onClick={() => {
                                    if (isMobile) {
                                      toggleSidebar()
                                    }
                                  }}
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
