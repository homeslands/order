import { ILoyaltyPointHistory } from '@/types'

export const calculateTotalPoints = (
  loyaltyPointHistory: ILoyaltyPointHistory[],
) => {
  if (!loyaltyPointHistory || loyaltyPointHistory.length === 0) {
    return {
      totalEarned: 0,
      totalSpent: 0,
      currentPoints: 0,
    }
  }

  let totalEarned = 0
  let totalSpent = 0

  for (const item of loyaltyPointHistory) {
    if (item.type === 'add' || item.type === 'refund') {
      totalEarned += item.points
    } else if (item.type === 'use' || item.type === 'reserve') {
      totalSpent += item.points
    }
  }

  // Tìm bản ghi mới nhất dựa trên createdAt
  const latest = loyaltyPointHistory.reduce((latest, curr) => {
    return new Date(curr.createdAt) > new Date(latest.createdAt) ? curr : latest
  }, loyaltyPointHistory[0])

  return {
    totalEarned,
    totalSpent,
    currentPoints: latest.lastPoints,
  }
}
