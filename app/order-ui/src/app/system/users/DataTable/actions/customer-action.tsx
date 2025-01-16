import { CreateEmployeeDialog } from '@/components/app/dialog'

export default function CustomerAction() {
  return (
    <div className="flex gap-2">
      {/* <div className="relative">
        <SearchIcon className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
        <Input
          placeholder={t('order.enterPhoneNumber')}
          value={inputValue}
          className="h-10 pl-8"
          type="tel"
          onChange={(e) => setInputValue(e.target.value)}
        />
        {isLoading && (
          <div className="absolute -translate-y-1/2 right-2 top-1/2">
            <div className="w-4 h-4 border-2 rounded-full animate-spin border-primary border-t-transparent"></div>
          </div>
        )}
      </div> */}
      <CreateEmployeeDialog />
    </div>
  )
}
