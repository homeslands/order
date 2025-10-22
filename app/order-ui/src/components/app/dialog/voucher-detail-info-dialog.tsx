import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Calendar, Tag, Package, CreditCard, Clock, Users } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Badge,
} from '@/components/ui'

import { useSpecificVoucher, useUserGroups } from '@/hooks'
import { formatCurrency } from '@/utils'

interface VoucherDetailInfoDialogProps {
  voucherSlug: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

export default function VoucherDetailInfoDialog({
  voucherSlug,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true
}: VoucherDetailInfoDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const { t } = useTranslation(['voucher'])

  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalIsOpen

  const { data: voucher } = useSpecificVoucher({ slug: voucherSlug })
  const { data: userGroups } = useUserGroups({ voucher: voucherSlug, isAppliedVoucher: true }, !!isOpen)

  const voucherData = useMemo(() => voucher?.result, [voucher])
  const userGroupsData = useMemo(() => userGroups?.result.items, [userGroups])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed_value':
        return t('voucher.fixedValue')
      case 'percent_order':
        return t('voucher.percentOrder')
      case 'same_price':
        return t('voucher.samePrice')
      default:
        return type
    }
  }

  const getApplicabilityRuleLabel = (rule: string) => {
    switch (rule) {
      case 'at_least_one_required':
        return t('voucher.atLeastOneRequired')
      case 'all_required':
        return t('voucher.allRequired')
      default:
        return rule
    }
  }

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash':
        return t('voucher.paymentMethod.cash')
      case 'bank-transfer':
        return t('voucher.paymentMethod.bankTransfer')
      case 'point':
        return t('voucher.paymentMethod.point')
      case 'credit-card':
        return t('voucher.paymentMethod.creditCard')
      default:
        return method
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <DialogTrigger className="flex justify-start w-full" asChild>
          <Button
            variant="ghost"
            className="flex gap-1 justify-start px-2 w-full"
            onClick={() => setIsOpen(true)}
          >
            <Info className="icon" />
            {t('voucher.detailInfo')}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-[90vw] rounded-md sm:max-w-[60vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center text-lg">
            <Info className="w-5 h-5" />
            {t('voucher.detailInfo')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-150px)] pr-4">
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {t('voucher.basicInfo')}
              </h3>
              <div className="p-4 bg-muted-foreground/10 rounded-lg space-y-3">
                <div>
                  <p className="text-lg font-bold text-foreground">{voucherData?.title}</p>
                  {voucherData?.description && (
                    <p className="text-sm text-muted-foreground mt-1">{voucherData.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('voucher.code')}</p>
                    <p className="font-mono font-semibold text-sm">{voucherData?.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('voucher.type')}</p>
                    <Badge variant="secondary" className="mt-1">
                      {getVoucherTypeLabel(voucherData?.type || '')}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('voucher.value')}</p>
                    <p className="text-sm font-bold text-primary">
                      {voucherData?.type === 'percent_order'
                        ? `${voucherData?.value}%`
                        : formatCurrency(voucherData?.value || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('voucher.minOrderValue')}</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(voucherData?.minOrderValue || 0)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">{t('voucher.applicabilityRule')}</p>
                  <p className="text-sm">{getApplicabilityRuleLabel(voucherData?.applicabilityRule || '')}</p>
                </div>
              </div>
            </div>

            {/* Thông tin sử dụng */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('voucher.usageInfo')}
              </h3>
              <div className="p-4 bg-muted-foreground/10 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('voucher.maxUsage')}</p>
                    <p className="text-sm font-semibold">{voucherData?.maxUsage} {t('voucher.usage')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('voucher.remainingUsage')}</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {voucherData?.remainingUsage} {t('voucher.usage')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">{t('voucher.numberOfUsagePerUser')}</p>
                  <p className="text-sm font-semibold">{voucherData?.numberOfUsagePerUser} {t('voucher.usage')}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">{t('voucher.activeStatus')}:</p>
                    <Badge variant={voucherData?.isActive ? 'default' : 'destructive'}>
                      {voucherData?.isActive ? t('voucher.active') : t('voucher.inactive')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">{t('voucher.privateType')}:</p>
                    <span>{voucherData?.isPrivate ? t('voucher.yes') : t('voucher.no')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <p className="text-muted-foreground">{t('voucher.verificationIdentityType')}:</p>
                  <span>{voucherData?.isVerificationIdentity ? t('voucher.yes') : t('voucher.no')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <p className="text-muted-foreground">{t('voucher.isUserGroup')}:</p>
                  <span>{voucherData?.isUserGroup ? t('voucher.yes') : t('voucher.no')}</span>
                </div>
              </div>
            </div>

            {/* Thời gian */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('voucher.time')}
              </h3>
              <div className="p-4 bg-muted-foreground/10 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">{t('voucher.startDate')}</p>
                  <p className="text-sm font-semibold">{formatDate(voucherData?.startDate || '')}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">{t('voucher.endDate')}</p>
                  <p className="text-sm font-semibold">{formatDate(voucherData?.endDate || '')}</p>
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            {voucherData?.voucherPaymentMethods && voucherData.voucherPaymentMethods.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t('voucher.paymentMethods')}
                </h3>
                <div className="p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {voucherData.voucherPaymentMethods.map((pm) => (
                      <Badge key={pm.slug}>
                        {formatPaymentMethod(pm.paymentMethod)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sản phẩm áp dụng */}
            {voucherData?.voucherProducts && voucherData.voucherProducts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {t('voucher.applicableProducts')} ({voucherData.voucherProducts.length})
                </h3>
                <div className="p-4 rounded-lg">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {voucherData.voucherProducts.map((vp) => (
                      <div
                        key={vp.slug}
                        className="flex items-center gap-3 p-2 bg-background rounded border"
                      >
                        <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{vp.product.name}</p>
                        </div>
                        {vp.product.variants && vp.product.variants[0] && (
                          <Badge variant="secondary" className="flex-shrink-0">
                            {formatCurrency(vp.product.variants[0].price)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {userGroupsData && userGroupsData?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('voucher.userGroups')} ({userGroupsData?.length})
                </h3>
                <div className="p-4 rounded-lg">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {userGroupsData.map((ug) => (
                      <div key={ug.slug} className="flex items-center gap-3 p-2 bg-background rounded border">
                        <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ug.name}</p>
                        </div>
                      </div>))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
