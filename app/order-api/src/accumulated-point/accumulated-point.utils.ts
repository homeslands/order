/**
 * Calculate accumulated points based on order total
 * @param orderTotal Order total after discount
 * @param percentage Percentage of points (e.g. 5 for 5%)
 * @returns Points earned (rounded down)
 */
export function calculateAccumulatedPoints(
  orderTotal: number,
  percentage: number,
): number {
  return Math.floor((orderTotal * percentage) / 100);
}

/**
 * Check if user is default customer
 * @param phoneNumber Phone number of user
 * @returns true if user is default customer
 */
export function isDefaultCustomer(phoneNumber: string): boolean {
  return phoneNumber === 'default-customer';
}

/**
 * Validate points usage
 * @param pointsToUse Points to use
 * @param availablePoints Available points
 * @param orderTotal Order total
 * @returns Object containing validation result
 */
export function validatePointsUsage(
  pointsToUse: number,
  availablePoints: number,
  orderTotal: number,
): {
  isValid: boolean;
  error?: string;
} {
  if (pointsToUse <= 0) {
    return {
      isValid: false,
      error: 'Points to use must be greater than 0',
    };
  }

  if (pointsToUse > availablePoints) {
    return {
      isValid: false,
      error: 'Points not enough',
    };
  }

  if (pointsToUse > orderTotal) {
    return {
      isValid: false,
      error: 'Points exceed order total',
    };
  }

  return { isValid: true };
}
