import { Slider } from '@/components/ui'

export function PriceRangeSlider() {
  return <Slider defaultValue={[0, 30]} max={100} step={1} />
}
