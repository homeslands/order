import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Facebook } from 'lucide-react';

import GoogleMap from './google-map';
import { Logo } from '@/assets/images'
import { FooterSection, ROUTE } from '@/constants'
import { phone, mail, fanpageUrl } from '@/constants'

export function ClientFooter() {
  const { t } = useTranslation('sidebar')
  const navigator = useNavigate()

  return (
    <footer className={`text-white bg-primary mb-[64px] md:mb-0`}>
      <div className={`container pt-6 pb-6 w-full md:pb-2`}>
        <div className='flex flex-col w-full lg:flex-row-reverse'>
          <div className='flex flex-col items-start w-full sm:flex-row'>
            <div className="flex flex-col items-start justify-center w-full gap-4">
              <div className="flex items-center">
                <Phone />
                <span className="hidden cursor-pointer ps-4 md:block">
                  {t('footer.contact')}:
                </span>
                <a href={`tel:${phone}`} className="font-bold ps-4 md:ps-1 hover:underline">
                  {phone}
                </a>
              </div>
              <div className="flex items-center">
                <span className="hidden cursor-pointer ps-4 md:block">
                  {t('footer.contentResponsible')}:
                </span>
                <span className="font-bold ps-4 md:ps-1 hover:underline">
                  {FooterSection.CONTENT_RESPONSIBLE}
                </span>
              </div>
              <div className='flex gap-4'>
                <Mail />
                <span className='cursor-pointer hover:underline' onClick={() => window.location.href = `mailto:${mail}`}>
                  <b>{mail}</b>
                </span>
              </div>
              <div className='flex gap-4'>
                <Facebook />
                <span className='cursor-pointer hover:underline' onClick={() => window.open(fanpageUrl, '_blank')}>
                  <b>{t('footer.fanpage')}</b>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center w-full gap-4 mt-4 sm:mt-0" >
              <div className="relative w-full">
                <div className={`w-full h-48 rounded-sm`}>
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
          <div className='flex items-start w-full gap-4 mt-4 md:w-full lg:mt-0'>
            <div className="flex flex-col items-start justify-center w-1/2 gap-2">
              <span className="font-bold">
                {t('footer.introduction')}
              </span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.HOME)}> {t('footer.home')}</span>

              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.ABOUT)}> {t('footer.aboutMe')}</span>
            </div>
            <div className="flex flex-col items-start justify-center w-1/2 gap-2">
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.ORDER_INSTRUCTIONS)}> {t('footer.orderInstructions')}</span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.PAYMENT_INSTRUCTIONS)}> {t('footer.paymentInstructions')}</span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.POLICY)}>{t('footer.policy')}</span>
              <span className="text-sm cursor-pointer hover:underline" onClick={() => navigator(ROUTE.SECURITY)}>{t('footer.securityTerm')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
