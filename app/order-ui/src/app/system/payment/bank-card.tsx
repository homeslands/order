import { CreditCard, Shield } from 'lucide-react'

import { IBankConnector } from '@/types'

interface BankCardProps {
  bankCardData?: IBankConnector
}

export default function BankCard({ bankCardData }: BankCardProps) {
  return (
    <div className="relative h-[14rem] p-6 text-white w-96 rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br rounded-2xl opacity-30 pointer-events-none from-white/20 to-black/20" />

      {/* Bank Information */}
      <div className="flex relative z-10 justify-between items-center mb-6">
        {/* Bank Logo */}
        <div className="flex gap-2 items-center">
          <CreditCard className="w-10 h-10" />
          <span className="text-lg font-bold tracking-wide uppercase">
            {bankCardData?.xService || 'My Bank'}
          </span>
        </div>
        {/* Card Type */}
        <Shield className="w-8 h-8" />
      </div>

      {/* Card Number */}
      <div className="flex z-10 items-center mb-6 font-mono text-2xl tracking-widest">
        <span>{bankCardData?.virtualAccountPrefix}</span>
      </div>

      {/* Card Holder and Expiry */}
      <div className="flex relative z-10 justify-between text-sm">
        <div>
          <span className="block uppercase">Card Holder</span>
          <span className="font-semibold">
            {bankCardData?.beneficiaryName || 'Card Holder'}
          </span>
        </div>
        <div className="text-right">
          <span className="block uppercase">Card number</span>
          <span className="font-semibold">
            {bankCardData?.xOwnerNumber || 'MM/YY'}
          </span>
        </div>
      </div>

      {/* Bottom Decorations */}
      <div className="absolute bottom-4 left-4 z-0 w-12 h-12 bg-gradient-to-r rounded-full opacity-40 blur-3xl from-white/40 to-black/40"></div>
      <div className="absolute right-6 bottom-6 z-0 w-20 h-8 bg-gradient-to-r rounded-full opacity-30 blur-3xl from-white/20 to-black/20"></div>
    </div>
  )
}
