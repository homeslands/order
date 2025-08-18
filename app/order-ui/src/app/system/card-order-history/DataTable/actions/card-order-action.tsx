import CardOrderStatusSelect from '@/components/app/select/card-order-status-select'
import { memo } from 'react'

const CardOrderAction = memo(({ status, onSelectChange }: {
  status?: string;
  onSelectChange: (v: string) => void;
}) => {
  return (
    <div className="flex gap-2">
      <CardOrderStatusSelect value={status} onChange={onSelectChange} />
    </div>
  )
});

export default CardOrderAction;