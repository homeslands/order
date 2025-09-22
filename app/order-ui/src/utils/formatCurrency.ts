import * as curr from 'currency.js'

export function formatCurrency(value: number, currency = 'đ') {
  const safeValue = value < 0 ? 0 : value
  return `${curr.default(safeValue, { separator: ',', symbol: '', precision: 0 }).format()} ${currency}`
}

export const formatCurrencyWithSymbol = (value: number, withSymbol = true) => {
  const formatted = new Intl.NumberFormat('vi-VN').format(value)
  return withSymbol ? `${formatted} ₫` : formatted
}

export function formatShortCurrency(value: number, currency = 'VND') {
  const safeValue = value < 0 ? 0 : value
  if (safeValue >= 1000) {
    return `${(safeValue / 1000).toFixed(1).replace(/\.0$/, '')}`
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeValue)
}

export function formatPoints(value: number) {
  const safeValue = value < 0 ? 0 : value
  return new Intl.NumberFormat('vi-VN').format(safeValue)
}
