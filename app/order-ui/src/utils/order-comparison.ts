import { ICartItem, IOrderItem } from '@/types'
import i18next from 'i18next'

export interface IOrderItemChange {
  type:
    | 'added'
    | 'removed'
    | 'quantity_changed'
    | 'orderItemNoteChanged'
    | 'unchanged'
  item: IOrderItem
  originalQuantity?: number
  newQuantity?: number
  note?: string
  slug?: string
}

export interface IOrderComparison {
  itemChanges: IOrderItemChange[]
  voucherChanged: boolean
  tableChanged: boolean
  ownerChanged: boolean
  noteChanged: boolean
  pickupTimeChanged: boolean
  hasChanges: boolean
}

export function compareOrdersForStaff(
  originalOrder: ICartItem | null,
  newOrder: ICartItem | null,
): IOrderComparison {
  if (!originalOrder || !newOrder) {
    return {
      itemChanges: [],
      voucherChanged: false,
      tableChanged: false,
      ownerChanged: false,
      noteChanged: false,
      pickupTimeChanged: false,
      // orderItemNoteChanged: false,
      hasChanges: false,
    }
  }

  const itemChanges: IOrderItemChange[] = []
  const originalItems = originalOrder.orderItems || []
  const newItems = newOrder.orderItems || []

  // Helper function to get product type identifier
  const getProductTypeKey = (item: IOrderItem) => {
    const productSlug = item.productSlug
    return `${productSlug}-${item.variant?.slug || ''}-${item.size || ''}`
  }

  // Đếm số lượng items theo từng product type
  const countItemsByType = (items: IOrderItem[]) => {
    const counts: { [key: string]: { count: number; items: IOrderItem[] } } = {}
    items.forEach((item) => {
      const typeKey = getProductTypeKey(item)
      if (!counts[typeKey]) {
        counts[typeKey] = { count: 0, items: [] }
      }
      counts[typeKey].count++
      counts[typeKey].items.push(item)
    })
    return counts
  }

  const originalCounts = countItemsByType(originalItems)
  const newCounts = countItemsByType(newItems)

  // So sánh số lượng items cho mỗi product type
  const allProductTypes = new Set([
    ...Object.keys(originalCounts),
    ...Object.keys(newCounts),
  ])

  allProductTypes.forEach((productType) => {
    const originalCount = originalCounts[productType]?.count || 0
    const newCount = newCounts[productType]?.count || 0

    const originalTypeItems = originalCounts[productType]?.items || []
    const newTypeItems = newCounts[productType]?.items || []

    if (originalCount < newCount) {
      // Có items được thêm vào
      const addedCount = newCount - originalCount
      // Thêm các items mới được thêm
      for (let i = 0; i < addedCount; i++) {
        const newItem = newTypeItems[originalCount + i] || newTypeItems[0]
        itemChanges.push({
          type: 'added',
          item: newItem,
          newQuantity: newItem.quantity,
          note: newItem.note || '',
          slug: newItem.productSlug || newItem.id,
        })
      }

      // Các items cũ - kiểm tra quantity và note changes
      for (let i = 0; i < originalCount; i++) {
        const originalItem = originalTypeItems[i]
        const newItem = newTypeItems[i]

        // Kiểm tra note changes
        const originalNote = originalItem.note || ''
        const newNote = newItem.note || ''
        const noteChanged = originalNote !== newNote
        const quantityChanged = originalItem.quantity !== newItem.quantity

        if (quantityChanged && noteChanged) {
          // Cả quantity và note đều thay đổi - ưu tiên quantity_changed
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else if (quantityChanged) {
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else if (noteChanged) {
          itemChanges.push({
            type: 'orderItemNoteChanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else {
          itemChanges.push({
            type: 'unchanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        }
      }
    } else if (originalCount > newCount) {
      // Có items bị xóa
      // Thêm các items bị xóa
      for (let i = newCount; i < originalCount; i++) {
        const originalItem = originalTypeItems[i] || originalTypeItems[0]
        itemChanges.push({
          type: 'removed',
          item: originalItem,
          originalQuantity: originalItem.quantity,
          note: originalItem.note || '',
          slug: originalItem.productSlug || originalItem.id,
        })
      }

      // Các items còn lại - kiểm tra quantity và note changes
      for (let i = 0; i < newCount; i++) {
        const originalItem = originalTypeItems[i]
        const newItem = newTypeItems[i]

        // Kiểm tra note changes
        const originalNote = originalItem.note || ''
        const newNote = newItem.note || ''
        const noteChanged = originalNote !== newNote
        const quantityChanged = originalItem.quantity !== newItem.quantity

        if (quantityChanged && noteChanged) {
          // Cả quantity và note đều thay đổi - ưu tiên quantity_changed
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else if (quantityChanged) {
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else if (noteChanged) {
          itemChanges.push({
            type: 'orderItemNoteChanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else {
          itemChanges.push({
            type: 'unchanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        }
      }
    } else {
      // Số lượng items không đổi, kiểm tra quantity và note changes
      for (let i = 0; i < originalCount; i++) {
        const originalItem = originalTypeItems[i] || originalTypeItems[0]
        const newItem = newTypeItems[i] || newTypeItems[0]

        const originalNote = originalItem.note || ''
        const newNote = newItem.note || ''
        const noteChanged = originalNote !== newNote
        const quantityChanged = originalItem.quantity !== newItem.quantity

        if (quantityChanged && noteChanged) {
          // Cả quantity và note đều thay đổi - ưu tiên quantity_changed
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else if (quantityChanged) {
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else if (noteChanged) {
          itemChanges.push({
            type: 'orderItemNoteChanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        } else {
          itemChanges.push({
            type: 'unchanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.productSlug || originalItem.id,
          })
        }
      }
    }
  })

  // So sánh các thông tin khác
  const voucherChanged = originalOrder.voucher?.slug !== newOrder.voucher?.slug
  const tableChanged = originalOrder.table !== newOrder.table
  const ownerChanged = originalOrder.owner !== newOrder.owner

  // CHỈ kiểm tra thay đổi ghi chú tổng thể của đơn hàng (order.description)
  const noteChanged =
    (originalOrder.description || '') !== (newOrder.description || '')

  // Kiểm tra thay đổi ghi chú của từng món ăn (xử lý riêng)
  const orderItemNoteChanged = itemChanges.some(
    (change) => change.type === 'orderItemNoteChanged',
  )

  // Kiểm tra thay đổi thời gian nhận hàng
  const pickupTimeChanged =
    originalOrder.timeLeftTakeOut !== newOrder.timeLeftTakeOut

  const hasChanges =
    itemChanges.some((change) => change.type !== 'unchanged') ||
    voucherChanged ||
    tableChanged ||
    ownerChanged ||
    noteChanged ||
    orderItemNoteChanged ||
    pickupTimeChanged

  return {
    itemChanges,
    voucherChanged,
    tableChanged,
    ownerChanged,
    noteChanged,
    pickupTimeChanged,
    // orderItemNoteChanged,
    hasChanges,
  }
}

export function compareOrders(
  originalOrder: ICartItem | null,
  newOrder: ICartItem | null,
): IOrderComparison {
  if (!originalOrder || !newOrder) {
    return {
      itemChanges: [],
      voucherChanged: false,
      tableChanged: false,
      ownerChanged: false,
      noteChanged: false,
      pickupTimeChanged: false,
      // orderItemNoteChanged: false,
      hasChanges: false,
    }
  }

  const itemChanges: IOrderItemChange[] = []
  const originalItems = originalOrder.orderItems || []
  const newItems = newOrder.orderItems || []

  // Helper function to get product type identifier
  const getProductTypeKey = (item: IOrderItem) => {
    const productSlug = item.productSlug || item.slug
    return `${productSlug}-${item.variant?.slug || ''}-${item.size || ''}`
  }

  // Đếm số lượng items theo từng product type
  const countItemsByType = (items: IOrderItem[]) => {
    const counts: { [key: string]: { count: number; items: IOrderItem[] } } = {}
    items.forEach((item) => {
      const typeKey = getProductTypeKey(item)
      if (!counts[typeKey]) {
        counts[typeKey] = { count: 0, items: [] }
      }
      counts[typeKey].count++
      counts[typeKey].items.push(item)
    })
    return counts
  }

  const originalCounts = countItemsByType(originalItems)
  const newCounts = countItemsByType(newItems)

  // So sánh số lượng items cho mỗi product type
  const allProductTypes = new Set([
    ...Object.keys(originalCounts),
    ...Object.keys(newCounts),
  ])

  allProductTypes.forEach((productType) => {
    const originalCount = originalCounts[productType]?.count || 0
    const newCount = newCounts[productType]?.count || 0

    const originalTypeItems = originalCounts[productType]?.items || []
    const newTypeItems = newCounts[productType]?.items || []

    if (originalCount < newCount) {
      // Có items được thêm vào
      const addedCount = newCount - originalCount
      // Thêm các items mới được thêm
      for (let i = 0; i < addedCount; i++) {
        const newItem = newTypeItems[originalCount + i] || newTypeItems[0]
        itemChanges.push({
          type: 'added',
          item: newItem,
          newQuantity: newItem.quantity,
          note: newItem.note || '',
          slug: newItem.slug || newItem.id,
        })
      }

      // Các items cũ - kiểm tra quantity và note changes
      for (let i = 0; i < originalCount; i++) {
        const originalItem = originalTypeItems[i]
        const newItem = newTypeItems[i]

        // Kiểm tra note changes
        const originalNote = originalItem.note || ''
        const newNote = newItem.note || ''
        const noteChanged = originalNote !== newNote
        const quantityChanged = originalItem.quantity !== newItem.quantity

        if (quantityChanged && noteChanged) {
          // Cả quantity và note đều thay đổi - ưu tiên quantity_changed
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else if (quantityChanged) {
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else if (noteChanged) {
          itemChanges.push({
            type: 'orderItemNoteChanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else {
          itemChanges.push({
            type: 'unchanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        }
      }
    } else if (originalCount > newCount) {
      // Có items bị xóa
      // Thêm các items bị xóa
      for (let i = newCount; i < originalCount; i++) {
        const originalItem = originalTypeItems[i] || originalTypeItems[0]
        itemChanges.push({
          type: 'removed',
          item: originalItem,
          originalQuantity: originalItem.quantity,
          note: originalItem.note || '',
          slug: originalItem.slug || originalItem.id,
        })
      }

      // Các items còn lại - kiểm tra quantity và note changes
      for (let i = 0; i < newCount; i++) {
        const originalItem = originalTypeItems[i]
        const newItem = newTypeItems[i]

        // Kiểm tra note changes
        const originalNote = originalItem.note || ''
        const newNote = newItem.note || ''
        const noteChanged = originalNote !== newNote
        const quantityChanged = originalItem.quantity !== newItem.quantity

        if (quantityChanged && noteChanged) {
          // Cả quantity và note đều thay đổi - ưu tiên quantity_changed
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else if (quantityChanged) {
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else if (noteChanged) {
          itemChanges.push({
            type: 'orderItemNoteChanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else {
          itemChanges.push({
            type: 'unchanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        }
      }
    } else {
      // Số lượng items không đổi, kiểm tra quantity và note changes
      for (let i = 0; i < originalCount; i++) {
        const originalItem = originalTypeItems[i] || originalTypeItems[0]
        const newItem = newTypeItems[i] || newTypeItems[0]

        const originalNote = originalItem.note || ''
        const newNote = newItem.note || ''
        const noteChanged = originalNote !== newNote
        const quantityChanged = originalItem.quantity !== newItem.quantity

        if (quantityChanged && noteChanged) {
          // Cả quantity và note đều thay đổi - ưu tiên quantity_changed
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else if (quantityChanged) {
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else if (noteChanged) {
          itemChanges.push({
            type: 'orderItemNoteChanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        } else {
          itemChanges.push({
            type: 'unchanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            note: newNote,
            slug: originalItem.slug || originalItem.id,
          })
        }
      }
    }
  })

  // So sánh các thông tin khác
  const voucherChanged = originalOrder.voucher?.slug !== newOrder.voucher?.slug
  const tableChanged = originalOrder.table !== newOrder.table
  const ownerChanged = originalOrder.owner !== newOrder.owner

  // CHỈ kiểm tra thay đổi ghi chú tổng thể của đơn hàng (order.description)
  const noteChanged =
    (originalOrder.description || '') !== (newOrder.description || '')

  // Kiểm tra thay đổi ghi chú của từng món ăn (xử lý riêng)
  const orderItemNoteChanged = itemChanges.some(
    (change) => change.type === 'orderItemNoteChanged',
  )

  // Kiểm tra thay đổi thời gian nhận hàng
  const pickupTimeChanged =
    originalOrder.timeLeftTakeOut !== newOrder.timeLeftTakeOut

  const hasChanges =
    itemChanges.some((change) => change.type !== 'unchanged') ||
    voucherChanged ||
    tableChanged ||
    ownerChanged ||
    noteChanged ||
    orderItemNoteChanged ||
    pickupTimeChanged

  return {
    itemChanges,
    voucherChanged,
    tableChanged,
    ownerChanged,
    noteChanged,
    pickupTimeChanged,
    // orderItemNoteChanged,
    hasChanges,
  }
}

export function getChangesSummary(comparison: IOrderComparison): string {
  const changes: string[] = []

  const addedItems = comparison.itemChanges.filter((c) => c.type === 'added')
  const removedItems = comparison.itemChanges.filter(
    (c) => c.type === 'removed',
  )
  const quantityChangedItems = comparison.itemChanges.filter(
    (c) => c.type === 'quantity_changed',
  )
  const noteChangedItems = comparison.itemChanges.filter(
    (c) => c.type === 'orderItemNoteChanged',
  )

  if (addedItems.length > 0) {
    changes.push(
      `${i18next.t('order.added', { ns: 'menu' })} ${addedItems.length} ${i18next.t('order.items', { ns: 'menu' })}`,
    )
  }

  if (removedItems.length > 0) {
    changes.push(
      `${i18next.t('order.removed', { ns: 'menu' })} ${removedItems.length} ${i18next.t('order.items', { ns: 'menu' })}`,
    )
  }

  if (quantityChangedItems.length > 0) {
    changes.push(
      `${i18next.t('order.quantityChanged', { ns: 'menu' })} ${quantityChangedItems.length} ${i18next.t('order.items', { ns: 'menu' })}`,
    )
  }

  if (noteChangedItems.length > 0) {
    changes.push(
      `${i18next.t('order.itemNoteChanged', { ns: 'menu' })} ${noteChangedItems.length} ${i18next.t('order.items', { ns: 'menu' })}`,
    )
  }

  if (comparison.voucherChanged) {
    changes.push(`${i18next.t('order.voucherChanged', { ns: 'menu' })}`)
  }

  if (comparison.tableChanged) {
    changes.push(`${i18next.t('order.tableChanged', { ns: 'menu' })}`)
  }

  if (comparison.ownerChanged) {
    changes.push(`${i18next.t('order.ownerChanged', { ns: 'menu' })}`)
  }

  if (comparison.noteChanged) {
    changes.push(`${i18next.t('order.noteChanged', { ns: 'menu' })}`)
  }

  if (comparison.pickupTimeChanged) {
    changes.push(`${i18next.t('order.pickupTimeChanged', { ns: 'menu' })}`)
  }

  return changes.length > 0
    ? changes.join(', ')
    : i18next.t('order.noChanges', { ns: 'menu' })
}
