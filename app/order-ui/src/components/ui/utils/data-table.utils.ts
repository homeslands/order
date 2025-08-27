import moment from "moment";

export enum PeriodTimeEnum {
    TODAY = 'today',
    YESTERDAY = "yesterday",
    WEEK = "inWeek",
    MONTH = "inMonth",
    YEAR = "inYear",
}

export function timeChange(periodOfTime: string, today: Date) {
    let startDate = ''
    let endDate = ''
    switch (periodOfTime) {
        case PeriodTimeEnum.TODAY: {
            startDate = (moment(today).format('YYYY-MM-DD'))
            endDate = (moment(today).format('YYYY-MM-DD'))
            break;
        }
        case PeriodTimeEnum.YESTERDAY: {
            startDate = (moment(today).subtract(1, 'day').format('YYYY-MM-DD'))
            endDate = (moment(today).subtract(1, 'day').format('YYYY-MM-DD'))
            break;
        }
        case PeriodTimeEnum.WEEK: {
            const startOfWeek = moment(today).clone().startOf('week').add(1, 'day');
            const endOfWeek = moment(today).clone().endOf('week');
            startDate = (startOfWeek.format('YYYY-MM-DD'));
            endDate = (endOfWeek.format('YYYY-MM-DD'));
            break;
        }
        case PeriodTimeEnum.MONTH: {
            const startOfMonth = moment(today).clone().startOf('month');
            const endOfMonth = moment(today).clone().endOf('month');
            startDate = (startOfMonth.format('YYYY-MM-DD'));
            endDate = (endOfMonth.format('YYYY-MM-DD'));
            break;
        }
        case PeriodTimeEnum.YEAR: {
            const startOfYear = moment(today).clone().startOf('year');
            const endOfYear = moment(today).clone().endOf('year');
            startDate = (startOfYear.format('YYYY-MM-DD'));
            endDate = (endOfYear.format('YYYY-MM-DD'));
            break;
        }
    }
    return { startDate, endDate }
}