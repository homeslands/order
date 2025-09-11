import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { LoyaltyPointTypeSelect } from '@/components/app/select'
import { LoyaltyPointHistoryType } from '@/constants'
import { DateAndTimePicker } from '@/components/app/picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

export default function LoyaltyPointHistoryAction() {
  const { t } = useTranslation('common')
  const [searchParams, setSearchParams] = useSearchParams()
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [quickRange, setQuickRange] = useState<string>('all')
  const type = searchParams.get('type') || 'all'

  // Helpers to format ranges
  const startOfYear = useMemo(() => moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'), [])

  // Initialize defaults if not present in URL: fromDate=start of year, toDate=now
  useEffect(() => {
    const from = searchParams.get('fromDate')
    const to = searchParams.get('toDate')

    if (!from || !to) {
      const defaultFrom = startOfYear
      const defaultTo = moment().format('YYYY-MM-DD HH:mm:ss')

      setSearchParams((prev) => {
        prev.set('fromDate', defaultFrom)
        prev.set('toDate', defaultTo)
        prev.set('page', '1')
        return prev
      })
      setStartDate(defaultFrom)
      setEndDate(defaultTo)
      setQuickRange('all')
    } else {
      setStartDate(from)
      setEndDate(to)
      // Determine quick range based on current dates
      const now = moment()
      const start = moment(from)
      const end = moment(to)

      if (start.isSame(now, 'day') && end.isSame(now, 'day')) {
        setQuickRange('today')
      } else if (start.isSame(now.subtract(1, 'day'), 'day') && end.isSame(now.subtract(1, 'day'), 'day')) {
        setQuickRange('yesterday')
      } else if (start.isSame(now.startOf('week'), 'day') && end.isSame(now, 'day')) {
        setQuickRange('this_week')
      } else if (start.isSame(now.startOf('month'), 'day') && end.isSame(now, 'day')) {
        setQuickRange('this_month')
      } else {
        setQuickRange('all')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyRange = (from: string, to: string) => {
    setStartDate(from)
    setEndDate(to)
    setSearchParams((prev) => {
      prev.set('fromDate', from)
      prev.set('toDate', to)
      prev.set('page', '1')
      return prev
    })
  }

  const handleChange = (value: string | undefined) => {
    setSearchParams((prev) => {
      if (value && value !== 'all' && Object.values(LoyaltyPointHistoryType).includes(value as LoyaltyPointHistoryType)) {
        prev.set('type', value)
        prev.set('page', '1')
      } else {
        prev.delete('type')
        prev.set('page', '1')
      }
      return prev
    })
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 items-center min-w-max py-2">
        <div className="min-w-[200px] flex-shrink-0">
          <DateAndTimePicker
            date={startDate}
            onSelect={(date) => {
              setStartDate(date)
              setSearchParams((prev) => {
                if (date) {
                  prev.set('fromDate', date)
                } else {
                  prev.delete('fromDate')
                }
                prev.delete('type')
                prev.set('page', '1')
                return prev
              })
            }}
            validateDate={(date) => date <= new Date()}
            disableFutureDate
            showTime={true}
          />
        </div>
        <div className="min-w-[200px] flex-shrink-0">
          <DateAndTimePicker
            date={endDate}
            onSelect={(date) => {
              setEndDate(date)
              setSearchParams((prev) => {
                if (date) {
                  prev.set('toDate', date)
                } else {
                  prev.delete('toDate')
                }
                prev.delete('type')
                prev.set('page', '1')
                return prev
              })
            }}
            validateDate={(date) => date <= new Date()}
            disableFutureDate
            showTime={true}
          />
        </div>
        <div className="min-w-[140px] flex-shrink-0">
          <Select
            value={quickRange}
            onValueChange={(val) => {
              setQuickRange(val)
              switch (val) {
                case 'today':
                  setSearchParams(prev => { prev.delete('type'); return prev })
                  applyRange(
                    moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                    moment().format('YYYY-MM-DD HH:mm:ss')
                  )
                  break
                case 'yesterday':
                  setSearchParams(prev => { prev.delete('type'); return prev })
                  applyRange(
                    moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                    moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
                  )
                  break
                case 'this_week':
                  setSearchParams(prev => { prev.delete('type'); return prev })
                  applyRange(
                    moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
                    moment().format('YYYY-MM-DD HH:mm:ss')
                  )
                  break
                case 'this_month':
                  setSearchParams(prev => { prev.delete('type'); return prev })
                  applyRange(
                    moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
                    moment().format('YYYY-MM-DD HH:mm:ss')
                  )
                  break
                default:
                  // 'all' or any fallback -> whole year
                  setQuickRange('all')
                  setSearchParams(prev => { prev.delete('type'); return prev })
                  applyRange(
                    moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'),
                    moment().format('YYYY-MM-DD HH:mm:ss')
                  )
                  break
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('dataTable.quickRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dataTable.all')}</SelectItem>
              <SelectItem value="today">{t('dataTable.today')}</SelectItem>
              <SelectItem value="yesterday">{t('dataTable.yesterday')}</SelectItem>
              <SelectItem value="this_week">{t('dataTable.thisWeek')}</SelectItem>
              <SelectItem value="this_month">{t('dataTable.thisMonth')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[200px] flex-shrink-0">
          <LoyaltyPointTypeSelect value={type} onChange={handleChange} />
        </div>
      </div>
    </div>
  )
}
