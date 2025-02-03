import { Moon, Sun, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme } from '@/components/app/theme-provider'
import { USFlag, VIFlag } from '@/assets/images'

export default function SettingsDropdown() {
  const { t, i18n } = useTranslation('setting')
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Settings className="h-[1.1rem] w-[1.1rem]" />
          <span className="sr-only">Open settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-2 mt-1 w-56">
        <DropdownMenuLabel>{t('setting.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 p-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('setting.language')}
          </span>
          <Select
            value={i18n.language}
            onValueChange={(value) => i18n.changeLanguage(value)}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue
                className="text-sm"
                placeholder={t('setting.selectLanguage')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <img
                  src={USFlag}
                  className="mr-2 inline-block w-4"
                  alt="English"
                />
                <span className="text-xs">English</span>
              </SelectItem>
              <SelectItem value="vi">
                <img
                  src={VIFlag}
                  className="mr-2 inline-block w-4"
                  alt="Tiếng Việt"
                />
                <span className="text-xs">Tiếng Việt</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 p-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t('setting.theme')}
          </span>
          <Select
            value={theme}
            onValueChange={(value: 'light' | 'dark' | 'system') =>
              setTheme(value)
            }
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder={t('setting.selectTheme')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <Sun className="mr-2 inline-block h-4 w-4" />
                <span className="text-xs">{t('setting.light')}</span>
              </SelectItem>
              <SelectItem value="dark">
                <Moon className="mr-2 inline-block h-4 w-4" />
                <span className="text-xs">{t('setting.dark')}</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
