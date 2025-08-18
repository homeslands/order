import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Facebook } from 'lucide-react';

import GoogleMap from './google-map';
import { Logo } from '@/assets/images'
import { FooterSection, ROUTE } from '@/constants'
import { phone, mail, fanpageUrl, registrationPhone } from '@/constants'

export function ClientFooter() {
  const { t } = useTranslation('sidebar')
  const navigator = useNavigate()

  const getCopyright = () => {
    const currentYear = new Date().getFullYear()
    const startYear = FooterSection.START_YEAR
    if (currentYear === startYear) {
      return `© ${currentYear} ${FooterSection.BUSINESS_NAME}. All rights reserved`
    }
    return `© ${startYear}-${currentYear} ${FooterSection.BUSINESS_NAME}. All rights reserved`
  }

  return (
    <footer className="text-sm text-muted-foreground bg-white dark:bg-black mb-[64px] md:mb-0">
      {/* <div className="w-full h-1.5 bg-primary"></div> */}
      <div className="container w-full py-6 space-y-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          {/* Cột 1: Điều hướng */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-lg text-primary">{t('footer.introduction')}</span>
            <span className="cursor-pointer hover:underline" onClick={() => navigator(ROUTE.HOME)}>
              {t('footer.home')}
            </span>
            <span className="cursor-pointer hover:underline" onClick={() => navigator(ROUTE.ABOUT)}>
              {t('footer.aboutMe')}
            </span>
          </div>

          {/* Cột 2: Điều hướng */}
          <div className="flex flex-col gap-2 ">
            <span className="font-bold text-lg text-primary">{t('footer.terms')}</span>
            <span className="cursor-pointer hover:underline" onClick={() => navigator(ROUTE.POLICY)}>
              {t('footer.policy')}
            </span>
            <span className="cursor-pointer hover:underline" onClick={() => navigator(ROUTE.SECURITY)}>
              {t('footer.securityTerm')}
            </span>
            <span className="cursor-pointer hover:underline" onClick={() => navigator(ROUTE.ORDER_INSTRUCTIONS)}>
              {t('footer.orderInstructions')}
            </span>
            <span className="cursor-pointer hover:underline" onClick={() => navigator(ROUTE.PAYMENT_INSTRUCTIONS)}>
              {t('footer.paymentInstructions')}
            </span>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-lg text-primary">{t('footer.contact')}</span>
            <div className="flex items-center font-bold">
              <Phone className='size-5'/>
              <span className="ps-4">{t('footer.phoneNumber')}:</span>
              <a href={`tel:${phone}`} className="ps-2 hover:underline">
                {phone}
              </a>
            </div>

            <div className="flex items-center font-bold">
              <Mail className='size-5'/>
              <span className="ps-4">{t('footer.email')}:</span>
              <a
                href={`mailto:${mail}`}
                className="ps-2 cursor-pointer hover:underline"
              >
                {mail}
              </a>
            </div>

            <div className="flex gap-4">
              <Facebook className='size-5'/>
              <span
                className="cursor-pointer hover:underline"
                onClick={() => window.open(fanpageUrl, '_blank')}
              >
                <b>{t('footer.fanpage')}</b>
              </span>
            </div>

            <div className="flex gap-4">
              <span>
                {t('footer.addressAt')}
              </span>
            </div>
          </div>

          {/* Cột 4: Google Map */}
          <div className="flex flex-col lg:items-end lg:justify-end">
            <div className="relative w-5/6 h-40 overflow-hidden rounded-sm">
              <GoogleMap />
              <img
                src={Logo}
                alt="logo"
                className="absolute top-0 left-0 w-auto h-5 m-2"
              />
            </div>
          </div>
        </div>
        <div className='h-0.5 bg-muted-foreground/30'></div>
        <div className='text-xs'>
          <p>
            {FooterSection.BUSINESS_NAME}
          </p>
          <p>
            {`${t('footer.taxCode')}: ${FooterSection.TAX_CODE} ${t('footer.issuingAuthority')}  ${t('footer.issuedOn')} ${FooterSection.ISSUED_ON}, ${t('footer.representative')}: ${t('footer.representativeName')}`}
          </p>
          <p>
            {`${t('footer.address')}: ${t('footer.addressAt')}`}
            &nbsp;&nbsp;&nbsp;&nbsp;
            {`${t('footer.phone')}: ${registrationPhone}`}
          </p>
          <p>
            {getCopyright()}
          </p>
        </div>
      </div>
    </footer>

  )
}
