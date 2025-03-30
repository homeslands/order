import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

import GoogleMap from './google-map';
import { Logo } from '@/assets/images'
import { ROUTE } from '@/constants'
import { Mail, Phone } from 'lucide-react';

export function ClientFooter() {
  const { t } = useTranslation('sidebar')
  const navigator = useNavigate()
  const mail: string = "trend.coffee.tea@gmail.com"
  return (
    <footer className={`text-white bg-primary mb-[64px] md:mb-0`}>
      <div className={`container pt-6 pb-6 md:pb-2 w-full`}>
        <div className='flex flex-col lg:flex-row-reverse w-full'>
          <div className='flex flex-col sm:flex-row w-full items-start'>
            <div className="flex flex-col items-start justify-center gap-4 w-full">
              <div className='flex'> <Phone /> <span className='ps-4 cursor-pointer hidden md:block'>{t('footer.contact')}: </span><b className='ps-4 md:ps-1'> 0888022200</b></div>
              <div className='flex gap-4'>
                <Mail />
                <span className='cursor-pointer hover:underline' onClick={() => window.location.href = `mailto:${mail}`}>
                  <b>{mail}</b>
                </span>
              </div>

            </div>
            <div className="flex flex-col items-start justify-center gap-4 w-full mt-4 sm:mt-0" >
              <div className="relative w-full">
                <div className={`rounded-sm w-full h-48`}>
                  <GoogleMap />
                </div>
                <img
                  src={Logo}
                  alt="logo"
                  className="absolute top-0 left-0 w-auto h-5 m-2" // Đặt Logo ở góc trên trái với margin
                />
              </div>
            </div>
          </div>
          <div className='flex gap-4 items-start w-full md:w-full mt-4 lg:mt-0'>
            <div className="flex flex-col items-start justify-center gap-2 w-1/2">
              <span className="font-bold">
                {t('footer.introduction')}
              </span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.HOME)}> {t('footer.home')}</span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.CLIENT_MENU)}> {t('footer.menu')}</span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.ABOUT)}> {t('footer.aboutMe')}</span>
            </div>
            <div className="flex flex-col items-start justify-center gap-2 w-1/2">
              <span className="font-bold">{t('footer.policy')}</span>
              <span className="text-sm cursor-pointer" onClick={() => navigator(ROUTE.POLICY)}>{t('footer.securityTerm')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
