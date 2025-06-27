export interface IBalanceResponse {
  slug: string
  points: number
  user: {
    slug: string
    phonenumber: string
    firstName: string
    lastName: string
    dob: string
    email: string
    address: string
    branch: {
      slug: string
      name: string
      address: string
    }
    role: {
      slug: string
      name: string
      description: string
    }
    isVerifiedEmail: boolean
    isVerifiedPhonenumber: boolean
  }
}

export interface IBalanceTransactionResponse {
  id: string
  amount: number
  description: string
  date: string
  transactionType: 'add' | 'subtract'
  code: string
}
