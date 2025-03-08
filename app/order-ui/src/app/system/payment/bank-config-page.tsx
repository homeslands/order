import { useTranslation } from 'react-i18next'

import { ScrollArea } from '@/components/ui'
import { useGetBankConnector } from '@/hooks'
import {
  CreateBankConnectorDialog,
  UpdateBankConnectorDialog,
} from '@/components/app/dialog'
import BankCard from './bank-card'
import { PasswordInput } from '@/components/ui/password-input'
import { Helmet } from 'react-helmet'

export default function BankConfigPage() {
  const { t } = useTranslation('bank')
  const { t: tHelmet } = useTranslation('helmet')
  const { data: bankConfig } = useGetBankConnector()

  const bankConfigData = bankConfig?.result
  return (
    <div className="flex flex-row h-full gap-2">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.bankConfig.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.bankConfig.title')} />
      </Helmet>
      {/* Menu Section - Scrollable */}
      <ScrollArea className="flex-1">
        <div className={`transition-all duration-300 ease-in-out`}>
          <div className="sticky top-0 z-10 flex flex-col items-center gap-2">
            <div className="flex justify-end w-full gap-2">
              {!bankConfigData && <CreateBankConnectorDialog />}
              <UpdateBankConnectorDialog bankConnector={bankConfigData} />
            </div>
            <div className="flex flex-col items-center justify-center gap-4 mt-6 lg:flex-row">
              <div className="items-center justify-center w-full xl:col-span-2">
                <BankCard bankCardData={bankConfigData} />
              </div>
              {bankConfigData && (
                <div className="grid items-center justify-between w-full grid-cols-1 p-4 border rounded-sm xl:col-span-3">
                  <div className="flex flex-col justify-between h-full col-span-1 gap-2 px-4">
                    <div className="grid grid-cols-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('bank.xProviderId')}
                      </h3>
                      <PasswordInput
                        readOnly
                        value={bankConfigData.xProviderId}
                      />
                    </div>
                    <div className="grid grid-cols-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('bank.xOwnerNumber')}
                      </h3>
                      <PasswordInput
                        readOnly
                        value={bankConfigData.xOwnerNumber}
                      />
                    </div>
                    <div className="grid grid-cols-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('bank.xOwnerType')}
                      </h3>
                      <PasswordInput
                        readOnly
                        value={bankConfigData.xOwnerType}
                      />
                    </div>
                    <div className="grid grid-cols-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('bank.beneficiaryName')}
                      </h3>
                      <PasswordInput
                        readOnly
                        value={bankConfigData.beneficiaryName}
                      />
                    </div>
                    <div className="grid grid-cols-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('bank.virtualAccountPrefix')}
                      </h3>
                      <PasswordInput
                        readOnly
                        value={bankConfigData.virtualAccountPrefix}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
