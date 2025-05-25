// import { useState, useEffect } from 'react';
// import moment from 'moment';
// import { X } from 'lucide-react';

// import { PopupLogo } from '@/assets/images';
// import { useVouchers } from '@/hooks';

// export function AdPopup() {
//     const [isVisible, setIsVisible] = useState(false);
//     const { data: vouchers } = useVouchers({
//         isActive: true
//     });

//     const voucherList = vouchers?.result || [];

//     // Filter and sort vouchers to get the best one
//     const getBestVoucher = () => {
//         const currentDate = new Date();

//         const validVouchers = voucherList
//             .filter(voucher =>
//                 voucher.isActive &&
//                 moment(voucher.startDate).format('DD/MM/YYYY') <= currentDate.toLocaleString() &&
//                 moment(voucher.endDate).format('DD/MM/YYYY') >= currentDate.toLocaleString() &&
//                 voucher.remainingUsage > 0
//             )
//             .sort((a, b) => {
//                 // Sort by endDate
//                 const endDateDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();

//                 if (endDateDiff !== 0) return endDateDiff;

//                 // If endDate is the same, sort by minOrderValue
//                 if (a.minOrderValue !== b.minOrderValue) {
//                     return a.minOrderValue - b.minOrderValue;
//                 }

//                 // If minOrderValue is the same, sort by value
//                 return b.value - a.value;
//             });

//         return validVouchers.length > 0 ? validVouchers[0] : null;
//     };

//     const bestVoucher = getBestVoucher();

//     useEffect(() => {
//         if (bestVoucher) {
//             // Show popup after 2 seconds
//             const timer = setTimeout(() => {
//                 setIsVisible(true);
//             }, 2000);

//             return () => clearTimeout(timer);
//         }
//     }, [bestVoucher]);

//     if (!isVisible || !bestVoucher) return null;

//     return (
//         <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50">
//             <div className="relative w-[90%] max-w-md rounded-lg bg-transparent">
//                 <button
//                     onClick={() => setIsVisible(false)}
//                     className="absolute top-2 right-2 z-10 p-2 text-white rounded-full backdrop-blur-sm bg-white/20 hover:bg-white/40"
//                 >
//                     <X size={24} />
//                 </button>

//                 {/* PNG Image container */}
//                 <div className="flex relative flex-col justify-center w-full">
//                     <img
//                         src={PopupLogo}
//                         alt="Promotion"
//                         className="w-full h-auto"
//                         style={{
//                             filter: 'drop-shadow(0 0 100px rgba(0,0,0,0.1))'
//                         }}
//                     />
//                     <div className="flex flex-col justify-center items-center space-y-2">
//                         <span className="px-6 py-3 text-lg font-medium text-white bg-gradient-to-r rounded-full transition-all from-primary to-primary/80">
//                             {bestVoucher.title}
//                         </span>
//                         <span className="text-sm text-white">
//                             {bestVoucher.description || `Giảm ${bestVoucher.value}% đơn từ ${bestVoucher.minOrderValue.toLocaleString()}₫`}
//                         </span>
//                         <span className="text-xs text-gray-300">
//                             Hạn sử dụng: {moment(bestVoucher.endDate).format('DD/MM/YYYY')}
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
