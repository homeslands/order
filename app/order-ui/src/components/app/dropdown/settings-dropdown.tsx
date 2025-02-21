import { Moon, Sun, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
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
      <DropdownMenuContent className="w-56 mt-1 mr-2">
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
            <SelectTrigger className="w-full h-8">
              <SelectValue
                className="text-sm"
                placeholder={t('setting.selectLanguage')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <img
                  src={USFlag}
                  className="inline-block w-4 mr-2"
                  alt="English"
                />
                <span className="text-xs">English</span>
              </SelectItem>
              <SelectItem value="vi">
                <img
                  src={VIFlag}
                  className="inline-block w-4 mr-2"
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
            onValueChange={(value: 'light' | 'dark') =>
              setTheme(value)
            }
          >
            <SelectTrigger className="w-full h-8">
              <SelectValue placeholder={t('setting.selectTheme')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <Sun className="inline-block w-4 h-4 mr-2" />
                <span className="text-xs">{t('setting.light')}</span>
              </SelectItem>
              <SelectItem value="dark">
                <Moon className="inline-block w-4 h-4 mr-2" />
                <span className="text-xs">{t('setting.dark')}</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
