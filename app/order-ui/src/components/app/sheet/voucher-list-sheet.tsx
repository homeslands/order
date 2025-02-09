import { useState } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { ChevronRight, CircleHelp, Ticket, TicketPercent } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Label,
} from '@/components/ui'
import { useVouchers } from '@/hooks'
import { formatCurrency } from '@/utils'

export default function VoucherListSheet() {
  const { t } = useTranslation(['voucher'])
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data: voucherList } = useVouchers()

  const voucherListData = voucherList?.result

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' className='w-full px-0 hover:bg-primary/5'>
          <div className='flex items-center justify-between w-full gap-1 p-2 mt-2 rounded-md cursor-pointer hover:bg-primary/10'>
            <div className='flex items-center gap-1'>
              <TicketPercent className='icon text-primary' />
              <span className='text-xs text-muted-foreground'>
                Sử dụng mã giảm giá
              </span>
            </div>
            <div>
              <ChevronRight className='icon text-muted-foreground' />
            </div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.list')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4 p-4 bg-muted-foreground/10">
            {/* Voucher search */}
            <div className="flex flex-col flex-1">
              <div className='grid items-center grid-cols-5 gap-2'>
                <div className="relative col-span-4 p-1">
                  <TicketPercent className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2" />
                  <Input
                    placeholder={t('voucher.enterVoucher')}
                    className="pl-10" // Đẩy nội dung sang phải để tránh icon
                  />
                </div>
                <Button className='col-span-1'>
                  {t('voucher.apply')}
                </Button>
              </div>
            </div>
            {/* Voucher list */}
            <div>
              <div className='flex items-center justify-between py-4'>
                <Label className='text-md text-muted-foreground'>
                  {t('voucher.list')}
                </Label>
                <span className='text-xs text-muted-foreground'>
                  {t('voucher.maxApply')}: 1
                </span>
              </div>
              <div className='grid grid-cols-1 gap-4'>
                {voucherListData?.map((voucher) => (
                  <div className='grid grid-cols-7 gap-2 p-2 bg-white rounded-md h-36'>
                    <div className='flex items-center justify-center w-full col-span-2 rounded-md bg-muted-foreground/10'>
                      <Ticket size={56} className='text-muted-foreground' />
                      {/* <img src={HomelandLogo} alt="chua-thoa-dieu-kien" className="rounded-md" /> */}
                    </div>
                    <div className='flex flex-col justify-between w-full col-span-3'>
                      <div className='flex flex-col gap-1'>
                        <span className='text-sm text-muted-foreground'>
                          {voucher.title}
                        </span>
                        <span className='text-xs text-muted-foreground/60'>Cho đơn hàng từ {formatCurrency(voucher.minOrderValue)}</span>
                        <span className='px-2 py-1 mt-2 text-sm font-bold border rounded-md w-fit text-muted-foreground'>
                          {voucher.code}
                        </span>
                      </div>
                      <span className='text-xs text-muted-foreground'>HSD: {moment(voucher.endDate).format('DD/MM/YYYY')}</span>
                    </div>
                    <div className='flex flex-col items-end justify-between col-span-2'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" className='h-8 p-2 text-muted-foreground'>
                              <CircleHelp />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="w-[18rem] p-4 bg-white rounded-md shadow-md text-muted-foreground">
                            <div className="flex flex-col justify-between gap-4">
                              <div className="grid grid-cols-5">
                                <span className="col-span-2 text-muted-foreground/70">Mã</span>
                                <span className="col-span-3">{voucher.code}</span>
                              </div>
                              <div className="grid grid-cols-5">
                                <span className="col-span-2 text-muted-foreground/70">Hạn sử dụng</span>
                                <span className="col-span-3">{moment(voucher.endDate).format('DD/MM/YYYY')}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className='text-muted-foreground/70'>Điều kiện</span>
                                <ul className="col-span-3 pl-4 list-disc">
                                  <li>Áp dụng cho đơn hàng từ {formatCurrency(voucher.minOrderValue)}</li>
                                </ul>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button>
                        {t('voucher.use')}
                      </Button>
                      {/* <img src={VoucherNotValid} alt="chua-thoa-dieu-kien" className="w-1/2" /> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
