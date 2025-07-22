import { ICartItem, IOrderItem } from '@/types'
import i18next from 'i18next'

export interface IOrderItemChange {
  type: 'added' | 'removed' | 'quantity_changed' | 'unchanged'
  item: IOrderItem
  originalQuantity?: number
  newQuantity?: number
  slug?: string
}

export interface IOrderComparison {
  itemChanges: IOrderItemChange[]
  voucherChanged: boolean
  tableChanged: boolean
  ownerChanged: boolean
  noteChanged: boolean
  hasChanges: boolean
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
          slug: newItem.slug || newItem.id,
        })
      }

      // Các items cũ vẫn unchanged
      for (let i = 0; i < originalCount; i++) {
        const originalItem = originalTypeItems[i]
        const newItem = newTypeItems[i]
        itemChanges.push({
          type: 'unchanged',
          item: newItem,
          originalQuantity: originalItem.quantity,
          newQuantity: newItem.quantity,
          slug: originalItem.slug || originalItem.id,
        })
      }
    } else if (originalCount > newCount) {
      // Có items bị xóa
      // const removedCount = originalCount - newCount
      // Thêm các items bị xóa
      for (let i = newCount; i < originalCount; i++) {
        const originalItem = originalTypeItems[i] || originalTypeItems[0]
        itemChanges.push({
          type: 'removed',
          item: originalItem,
          originalQuantity: originalItem.quantity,
          slug: originalItem.slug || originalItem.id,
        })
      }

      // Các items còn lại vẫn unchanged
      for (let i = 0; i < newCount; i++) {
        const originalItem = originalTypeItems[i]
        const newItem = newTypeItems[i]
        itemChanges.push({
          type: 'unchanged',
          item: newItem,
          originalQuantity: originalItem.quantity,
          newQuantity: newItem.quantity,
          slug: originalItem.slug || originalItem.id,
        })
      }
    } else {
      // Số lượng items không đổi, kiểm tra quantity changes
      for (let i = 0; i < originalCount; i++) {
        const originalItem = originalTypeItems[i] || originalTypeItems[0]
        const newItem = newTypeItems[i] || newTypeItems[0]

        if (originalItem.quantity !== newItem.quantity) {
          itemChanges.push({
            type: 'quantity_changed',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
            slug: originalItem.slug || originalItem.id,
          })
        } else {
          itemChanges.push({
            type: 'unchanged',
            item: newItem,
            originalQuantity: originalItem.quantity,
            newQuantity: newItem.quantity,
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
  const noteChanged =
    (originalOrder.description || '') !== (newOrder.description || '')

  const hasChanges =
    itemChanges.some((change) => change.type !== 'unchanged') ||
    voucherChanged ||
    tableChanged ||
    ownerChanged ||
    noteChanged

  return {
    itemChanges,
    voucherChanged,
    tableChanged,
    ownerChanged,
    noteChanged,
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

  if (comparison.voucherChanged) {
    changes.push(
      `${i18next.t('order.voucherChanged', { ns: 'menu' })} ${i18next.t('order.items', { ns: 'menu' })}`,
    )
  }

  if (comparison.tableChanged) {
    changes.push(
      `${i18next.t('order.tableChanged', { ns: 'menu' })} ${i18next.t('order.items', { ns: 'menu' })}`,
    )
  }

  if (comparison.ownerChanged) {
    changes.push(
      `${i18next.t('order.ownerChanged', { ns: 'menu' })} ${i18next.t('order.items', { ns: 'menu' })}`,
    )
  }

  if (comparison.noteChanged) {
    changes.push(
      `${i18next.t('order.noteChanged', { ns: 'menu' })} ${i18next.t('order.items', { ns: 'menu' })}`,
    )
  }

  return changes.length > 0
    ? changes.join(', ')
    : i18next.t('order.noChanges', { ns: 'menu' })
}
