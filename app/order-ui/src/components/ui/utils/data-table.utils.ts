import moment from 'moment'

export enum PeriodTimeEnum {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  WEEK = 'inWeek',
  MONTH = 'inMonth',
  YEAR = 'inYear',
}

export function timeChange(periodOfTime: string, today: Date) {
  let startDate = ''
  let endDate = ''
  switch (periodOfTime) {
    case PeriodTimeEnum.TODAY: {
      startDate = moment(today).format('YYYY-MM-DD')
      endDate = moment(today).format('YYYY-MM-DD')
      break
    }
    case PeriodTimeEnum.YESTERDAY: {
      startDate = moment(today).subtract(1, 'day').format('YYYY-MM-DD')
      endDate = moment(today).subtract(1, 'day').format('YYYY-MM-DD')
      break
    }
    case PeriodTimeEnum.WEEK: {
      // Tính tuần từ thứ 2 đến chủ nhật
      const currentDay = moment(today)
      let startOfWeek, endOfWeek

      if (currentDay.day() === 0) {
        // Nếu hôm nay là chủ nhật, tuần hiện tại là từ thứ 2 trước đó đến hôm nay
        startOfWeek = currentDay.clone().subtract(6, 'days') // Lùi 6 ngày để về thứ 2
        endOfWeek = currentDay.clone() // Hôm nay (chủ nhật)
      } else {
        // Các ngày khác, tính từ thứ 2 tuần này đến chủ nhật tuần này
        startOfWeek = currentDay.clone().startOf('week').add(1, 'day') // Thứ 2 tuần này
        endOfWeek = currentDay.clone().endOf('week') // Chủ nhật tuần này
      }

      startDate = startOfWeek.format('YYYY-MM-DD')
      endDate = endOfWeek.format('YYYY-MM-DD')
      break
    }
    case PeriodTimeEnum.MONTH: {
      const startOfMonth = moment(today).clone().startOf('month')
      const endOfMonth = moment(today).clone().endOf('month')
      startDate = startOfMonth.format('YYYY-MM-DD')
      endDate = endOfMonth.format('YYYY-MM-DD')
      break
    }
    case PeriodTimeEnum.YEAR: {
      const startOfYear = moment(today).clone().startOf('year')
      const endOfYear = moment(today).clone().endOf('year')
      startDate = startOfYear.format('YYYY-MM-DD')
      endDate = endOfYear.format('YYYY-MM-DD')
      break
    }
  }
  return { startDate, endDate }
}
