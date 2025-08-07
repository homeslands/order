// import { ColumnDef } from '@tanstack/react-table'
// import { MoreHorizontal } from 'lucide-react'
// import { useTranslation } from 'react-i18next'
// import moment from 'moment'

// import {
//   Button,
//   DataTableColumnHeader,
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuTrigger
// } from '@/components/ui'
// import { IProduct } from '@/types'
// import { UpdateProductDialog, DeleteProductDialog } from '@/components/app/dialog'

// export const useProductDetailColumns = (): ColumnDef<IProduct> => {
//   const { t } = useTranslation(['product'])
//   const { t: tCommon } = useTranslation(['common'])
//   return [
//     {
//       accessorKey: 'image',
//       header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.image')} />
//     },
//     {
//       accessorKey: 'slug',
//       header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.slug')} />
//     },
//     {
//       accessorKey: 'name',
//       header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.name')} />
//     },
//     {
//       accessorKey: 'createdAt',
//       header: ({ column }) => (
//         <DataTableColumnHeader column={column} title={t('product.createdAt')} />
//       ),
//       cell: ({ row }) => {
//         const createdAt = row.getValue('createdAt')
//         return createdAt ? moment(new Date(createdAt as string)).format('HH:mm DD/MM/YYYY') : ''
//       }
//     },
//     {
//       accessorKey: 'catalog.name',
//       header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.catalog')} />
//     },
//     {
//       accessorKey: 'description',
//       header: ({ column }) => (
//         <DataTableColumnHeader column={column} title={t('product.description')} />
//       )
//     },
//     {
//       id: 'actions',
//       header: tCommon('common.action'),
//       cell: ({ row }) => {
//         const product = row.original
//         return (
//           <div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="w-8 h-8 p-0">
//                   <span className="sr-only">{tCommon('common.action')}</span>
//                   <MoreHorizontal className="w-4 h-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuLabel>{tCommon('common.action')}</DropdownMenuLabel>
//                 <UpdateProductDialog product={product} />
//                 <DeleteProductDialog product={product} />
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         )
//       }
//     }
//   ]
// }
