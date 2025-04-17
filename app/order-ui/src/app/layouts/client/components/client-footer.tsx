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
      <div className={`container pt-6 pb-6 w-full md:pb-2`}>
        <div className='flex flex-col w-full lg:flex-row-reverse'>
          <div className='flex flex-col items-start w-full sm:flex-row'>
            <div className="flex flex-col gap-4 justify-center items-start w-full">
              <div className='flex'> <Phone /> <span className='hidden cursor-pointer ps-4 md:block'>{t('footer.contact')}: </span><b className='ps-4 md:ps-1'> 0888022200</b></div>
              <div className='flex gap-4'>
                <Mail />
                <span className='cursor-pointer hover:underline' onClick={() => window.location.href = `mailto:${mail}`}>
                  <b>{mail}</b>
                </span>
              </div>

            </div>
            <div className="flex flex-col gap-4 justify-center items-start mt-4 w-full sm:mt-0" >
              <div className="relative w-full">
                <div className={`w-full h-48 rounded-sm`}>
                  <GoogleMap />
                </div>
                <img
                  src={Logo}
                  alt="logo"
                  className="absolute top-0 left-0 m-2 w-auto h-5" // Đặt Logo ở góc trên trái với margin
                />
              </div>
            </div>
          </div>
          <div className='flex gap-4 items-start mt-4 w-full md:w-full lg:mt-0'>
            <div className="flex flex-col gap-2 justify-center items-start w-1/2">
              <span className="font-bold">
                {t('footer.introduction')}
              </span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.HOME)}> {t('footer.home')}</span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.CLIENT_MENU)}> {t('footer.menu')}</span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.ABOUT)}> {t('footer.aboutMe')}</span>
            </div>
            <div className="flex flex-col gap-2 justify-center items-start w-1/2">
              <span className="font-bold">{t('footer.policy')}</span>
              <span className="text-sm cursor-pointer" onClick={() => navigator(ROUTE.POLICY)}>{t('footer.securityTerm')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
