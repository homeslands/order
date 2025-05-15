export function formatCurrency(value: number, currency = 'VND') {
  const safeValue = value < 0 ? 0 : value
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(safeValue)
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
