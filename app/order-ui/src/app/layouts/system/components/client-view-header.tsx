import { Logo } from '@/assets/images'

export function ClientViewHeader() {
  return (
    <header
      className={`container sticky top-0 z-30 w-full shadow-md backdrop-blur-lg text-muted-foreground`}
    >
      <div className="flex justify-between items-center pr-3 h-14">
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl font-bold">
            {<img src={Logo} alt="logo" className="h-8 w-fit" />}
          </h1>
        </div>
      </div>
    </header>
  )
}
