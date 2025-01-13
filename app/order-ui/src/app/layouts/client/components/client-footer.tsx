import { Logo, Store1 } from '@/assets/images'
import { ROUTE } from '@/constants'
import { FacebookIcon, YoutubeIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function ClientFooter() {
  return (
    <footer className="bg-primary text-white">
      <div className="container py-6">
        <div className="grid grid-cols-2 items-start gap-5 lg:grid-cols-4">
          <div className="flex w-fit flex-col items-start justify-center gap-2">
            <span className="font-bold">Truy cập nhanh</span>
            <NavLink
              to={ROUTE.HOME}
              className="cursor-pointer text-xs hover:underline"
            >
              Trang chủ
            </NavLink>
            <NavLink
              to={ROUTE.CLIENT_MENU}
              className="cursor-pointer text-xs hover:underline"
            >
              Thực đơn
            </NavLink>
          </div>
          <div className="flex w-fit flex-col items-start justify-center gap-2">
            <span className="font-bold">Giới thiệu</span>
            <span className="text-sm">Về chúng tôi</span>
            <span className="text-sm">Sản phẩm</span>
            <span className="text-sm">Khuyến mãi</span>
            <span className="text-sm">Cửa hàng</span>
            <span className="text-sm">Tuyển dụng</span>
          </div>
          <div className="flex w-fit flex-col items-start justify-center gap-2">
            <span className="font-bold">Điều khoản</span>
            <span className="text-sm">Điều khoản sử dụng</span>
            <span className="text-sm">Chính sách bảo mật</span>
          </div>
          <div className="relative col-span-1 flex flex-col items-start justify-center gap-4">
            <div className="relative">
              <img
                src={Store1}
                alt="store"
                className="h-40 w-full rounded-sm"
              />
              <img
                src={Logo}
                alt="logo"
                className="absolute left-0 top-0 m-2 h-5 w-auto" // Đặt Logo ở góc trên trái với margin
              />
            </div>
            <div className="flex gap-2">
              <NavLink
                to={`https://www.facebook.com/thangquyet0501/`}
                className="flex items-center justify-center rounded-md px-2 text-xs transition-all duration-200 hover:scale-105 hover:bg-primary/20 hover:text-primary sm:text-sm"
              >
                <FacebookIcon />
              </NavLink>
              <NavLink
                to={`https://www.youtube.com/@KhoaiLangThang`}
                className="flex items-center justify-center rounded-md px-2 text-xs transition-all duration-200 hover:scale-105 hover:bg-primary/20 hover:text-primary sm:text-sm"
              >
                <YoutubeIcon />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
