import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import moment from 'moment'
import {
  ICartItem,
  IOrder,
  IOrderItem,
  IOrderToUpdate,
  IUserInfo,
  IVoucher,
  ITable,
  OrderStatus,
  OrderTypeEnum,
  IOrderDetail,
  IOrderPayment,
} from '@/types'
import { PaymentMethod } from '@/constants'
import { useUserStore } from './user.store'

// Order Flow Steps
export enum OrderFlowStep {
  ORDERING = 'ordering',
  PAYMENT = 'payment',
  UPDATING = 'updating',
}

// Ordering Phase Data (tương tự cart store)
export interface IOrderingData {
  id: string
  slug: string
  orderItems: IOrderItem[]
  owner: string
  ownerFullName: string
  ownerPhoneNumber: string
  ownerRole?: string
  type: OrderTypeEnum
  table?: string
  tableName?: string
  voucher: IVoucher | null
  description?: string
  approvalBy: string
  paymentMethod?: string
  payment?: IOrderPayment
}

// Payment Phase Data (tương tự payment store)
export interface IPaymentData {
  orderSlug: string
  paymentMethod: PaymentMethod
  qrCode: string
  paymentSlug: string
  orderData?: IOrder
  paymentAmount?: number
  isQrValid: boolean
}

// Updating Phase Data (tương tự update-order store)
export interface IUpdatingData {
  originalOrder: IOrder
  updateDraft: IOrderToUpdate
  hasChanges: boolean
}

// Main Order Flow State
export interface IOrderFlowStore {
  // Current flow state
  currentStep: OrderFlowStep
  isHydrated: boolean
  lastModified: number

  // Flow data cho từng bước
  orderingData: IOrderingData | null
  paymentData: IPaymentData | null
  updatingData: IUpdatingData | null

  // Actions for flow management
  setCurrentStep: (step: OrderFlowStep) => void

  // Ordering phase actions (tương tự cart store)
  initializeOrdering: () => void
  setOrderingData: (data: IOrderingData) => void
  addOrderingItem: (item: IOrderItem) => void
  addOrderingProductVariant: (id: string) => void
  updateOrderingItemQuantity: (itemId: string, quantity: number) => void
  removeOrderingItem: (itemId: string) => void
  addOrderingNote: (itemId: string, note: string) => void
  updateOrderingCustomer: (customer: IUserInfo) => void
  removeOrderingCustomer: () => void
  setOrderingTable: (table: ITable) => void
  removeOrderingTable: () => void
  setOrderingVoucher: (voucher: IVoucher | null) => void
  removeOrderingVoucher: () => void
  setOrderingType: (type: OrderTypeEnum) => void
  setOrderingDescription: (description: string) => void
  setOrderingApprovalBy: (approvalBy: string) => void
  clearOrderingData: () => void

  // Payment phase actions (tương tự payment store)
  initializePayment: (orderSlug: string, paymentMethod: PaymentMethod) => void
  setPaymentData: (data: Partial<IPaymentData>) => void
  updatePaymentMethod: (method: PaymentMethod) => void
  updateQrCode: (qrCode: string) => void
  setOrderFromAPI: (order: IOrder) => void
  setPaymentSlug: (slug: string) => void
  clearPaymentData: () => void

  // Updating phase actions (tương tự update-order store)
  initializeUpdating: (originalOrder: IOrder) => void
  setUpdateDraft: (draft: IOrderToUpdate) => void
  updateDraftItem: (itemId: string, changes: Partial<IOrderItem>) => void
  updateDraftItemQuantity: (itemId: string, quantity: number) => void
  addDraftItem: (item: IOrderItem) => void
  removeDraftItem: (itemId: string) => void
  addDraftNote: (itemId: string, note: string) => void
  updateDraftCustomer: (customer: IUserInfo) => void
  removeDraftCustomer: () => void
  setDraftTable: (table: ITable) => void
  removeDraftTable: () => void
  setDraftVoucher: (voucher: IVoucher | null) => void
  removeDraftVoucher: () => void
  setDraftType: (type: OrderTypeEnum) => void
  setDraftDescription: (description: string) => void
  setDraftApprovalBy: (approvalBy: string) => void
  setDraftPaymentMethod: (method: string) => void
  resetDraftToOriginal: () => void
  clearUpdatingData: () => void

  // Flow transition actions
  transitionToPayment: (orderSlug: string) => void
  transitionToUpdating: (originalOrder: IOrder) => void
  transitionBackToOrdering: () => void

  // Utility actions
  clearAllData: () => void
  getActiveData: () => IOrderingData | IPaymentData | IUpdatingData | null

  // Compatibility methods for existing code
  getCartItems: () => IOrderingData | null
  getOrderItems: () => IUpdatingData | null
  clearCart: () => void
  clearStore: () => void
  addCartItem: (item: ICartItem) => void
  updateCartItemQuantity: (id: string, quantity: number) => void
  addNote: (id: string, note: string) => void
  addCustomerInfo: (owner: IUserInfo) => void
  removeCustomerInfo: () => void
  addTable: (table: ITable) => void
  removeTable: () => void
  addVoucher: (voucher: IVoucher) => void
  removeVoucher: () => void
  addApprovalBy: (approvalBy: string) => void
  addOrderType: (orderType: OrderTypeEnum) => void
  addOrderNote: (note: string) => void
  setPaymentMethod: (method: PaymentMethod | string) => void
  setQrCode: (qrCode: string) => void
  setOrderSlug: (slug: string) => void
  removeCartItem: (itemId: string) => void
}

const generateOrderId = () => {
  return `order_${moment().valueOf()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateOrderItemId = () => {
  return `item_${moment().valueOf()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to convert IOrderDetail to IOrderItem
const convertOrderDetailToOrderItem = (
  orderDetail: IOrderDetail,
): IOrderItem => {
  return {
    id: orderDetail.id || generateOrderItemId(),
    slug: orderDetail.slug,
    image: orderDetail.variant.product.image,
    name: orderDetail.variant.product.name,
    quantity: orderDetail.quantity,
    size: orderDetail.variant.size.name,
    allVariants: orderDetail.variant.product.variants,
    variant: orderDetail.variant,
    originalPrice: orderDetail.variant.price,
    promotion: orderDetail.promotion || null,
    promotionValue: orderDetail.promotion?.value || 0,
    productSlug: orderDetail.variant.product.slug,
    description: orderDetail.variant.product.description,
    isLimit: orderDetail.variant.product.isLimit,
    note: orderDetail.note || '',
  }
}

// Helper function to convert ICartItem to IOrderItem[]
const convertCartItemToOrderItems = (cartItem: ICartItem): IOrderItem[] => {
  return cartItem.orderItems.map((item) => ({
    ...item,
    id: item.id || generateOrderItemId(),
  }))
}

export const useOrderFlowStore = create<IOrderFlowStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: OrderFlowStep.ORDERING,
      isHydrated: false,
      lastModified: moment().valueOf(),
      orderingData: null,
      paymentData: null,
      updatingData: null,

      // Flow management
      setCurrentStep: (step: OrderFlowStep) => {
        set({
          currentStep: step,
          lastModified: moment().valueOf(),
        })
      },

      // ===================
      // ORDERING PHASE
      // ===================
      initializeOrdering: () => {
        const timestamp = moment().valueOf()
        const newOrderingData: IOrderingData = {
          id: generateOrderId(),
          slug: generateOrderId(),
          orderItems: [],
          owner: useUserStore.getState().getUserInfo()?.slug || '',
          ownerFullName:
            `${useUserStore.getState().getUserInfo()?.firstName || ''} ${useUserStore.getState().getUserInfo()?.lastName || ''}`.trim() ||
            '',
          ownerPhoneNumber:
            useUserStore.getState().getUserInfo()?.phonenumber || '',
          ownerRole: useUserStore.getState().getUserInfo()?.role?.name || '',
          type: OrderTypeEnum.AT_TABLE,
          table: '',
          tableName: '',
          voucher: null,
          description: '',
          approvalBy: '',
        }
        set({
          currentStep: OrderFlowStep.ORDERING,
          orderingData: newOrderingData,
          paymentData: null,
          updatingData: null,
          lastModified: timestamp,
        })
      },

      setOrderingData: (data: IOrderingData) => {
        set({
          orderingData: data,
          lastModified: moment().valueOf(),
        })
      },

      addOrderingItem: (item: IOrderItem) => {
        const { orderingData } = get()
        if (!orderingData) {
          const newOrderingData: IOrderingData = {
            id: generateOrderId(),
            slug: generateOrderId(),
            orderItems: [
              {
                ...item,
                id: generateOrderItemId(),
                note: item.note || '',
              },
            ],
            owner: '',
            ownerFullName: '',
            ownerPhoneNumber: '',
            type: OrderTypeEnum.AT_TABLE,
            table: '',
            tableName: '',
            voucher: null,
            description: '',
            approvalBy: '',
          }
          set({
            currentStep: OrderFlowStep.ORDERING,
            orderingData: newOrderingData,
            paymentData: null,
            updatingData: null,
            lastModified: moment().valueOf(),
          })
          return
        }

        // ✅ Theo logic cũ: không merge, chỉ thêm item mới vào array
        const updatedItems = [
          ...orderingData.orderItems,
          {
            ...item,
            id: generateOrderItemId(),
            note: item.note || '',
          },
        ]

        set({
          currentStep: OrderFlowStep.ORDERING,
          orderingData: {
            ...orderingData,
            orderItems: updatedItems,
          },
          paymentData: null,
          updatingData: null,
          lastModified: moment().valueOf(),
        })
      },

      addOrderingProductVariant: (id: string) => {
        const { orderingData } = get()
        if (!orderingData) return

        const updatedItems = orderingData.orderItems.map((item) =>
          item.id === id ? { ...item, variant: item.variant || [] } : item,
        )

        set({
          orderingData: {
            ...orderingData,
            orderItems: updatedItems,
          },
          lastModified: moment().valueOf(),
        })
      },

      updateOrderingItemQuantity: (itemId: string, quantity: number) => {
        const { orderingData } = get()
        if (!orderingData) return

        const updatedItems = orderingData.orderItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        )

        set({
          orderingData: {
            ...orderingData,
            orderItems: updatedItems,
          },
          lastModified: moment().valueOf(),
        })
      },

      removeOrderingItem: (itemId: string) => {
        const { orderingData } = get()
        if (!orderingData) return

        const updatedItems = orderingData.orderItems.filter(
          (item) => item.id !== itemId,
        )

        set({
          orderingData: {
            ...orderingData,
            orderItems: updatedItems,
          },
          lastModified: moment().valueOf(),
        })
      },

      addOrderingNote: (itemId: string, note: string) => {
        const { orderingData } = get()
        if (!orderingData) return

        const updatedItems = orderingData.orderItems.map((item) =>
          item.id === itemId ? { ...item, note } : item,
        )

        set({
          orderingData: {
            ...orderingData,
            orderItems: updatedItems,
          },
          lastModified: moment().valueOf(),
        })
      },

      updateOrderingCustomer: (customer: IUserInfo) => {
        const { orderingData } = get()
        if (!orderingData) return

        const fullName =
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim()

        set({
          orderingData: {
            ...orderingData,
            owner: customer.slug,
            ownerFullName: fullName,
            ownerPhoneNumber: customer.phonenumber,
            ownerRole: customer.role.name,
            approvalBy: customer.slug,
          },
          lastModified: moment().valueOf(),
        })
      },

      removeOrderingCustomer: () => {
        const { orderingData } = get()
        if (!orderingData) return

        // Check if current voucher requires verification
        const requiresVerification =
          orderingData.voucher?.isVerificationIdentity === true

        set({
          orderingData: {
            ...orderingData,
            owner: '',
            ownerFullName: '',
            ownerPhoneNumber: '',
            ownerRole: '',
            // Remove voucher if it requires verification
            voucher: requiresVerification ? null : orderingData.voucher,
          },
          lastModified: moment().valueOf(),
        })
      },

      setOrderingTable: (table: ITable) => {
        const { orderingData } = get()
        if (!orderingData) return

        set({
          orderingData: {
            ...orderingData,
            table: table.slug,
            tableName: table.name,
            type: OrderTypeEnum.AT_TABLE,
          },
          lastModified: moment().valueOf(),
        })
      },

      removeOrderingTable: () => {
        const { orderingData } = get()
        if (!orderingData) return

        set({
          orderingData: {
            ...orderingData,
            table: '',
            tableName: '',
          },
          lastModified: moment().valueOf(),
        })
      },

      setOrderingVoucher: (voucher: IVoucher | null) => {
        const { orderingData } = get()
        if (!orderingData) return

        set({
          orderingData: {
            ...orderingData,
            voucher,
          },
          lastModified: moment().valueOf(),
        })
      },

      removeOrderingVoucher: () => {
        const { orderingData } = get()
        if (!orderingData) return

        set({
          orderingData: {
            ...orderingData,
            voucher: null,
          },
          lastModified: moment().valueOf(),
        })
      },

      setOrderingType: (type: OrderTypeEnum) => {
        const { orderingData } = get()

        // Nếu orderingData là null, khởi tạo nó trước
        if (!orderingData) {
          get().initializeOrdering()
          // Lấy lại orderingData sau khi khởi tạo
          const { orderingData: newOrderingData } = get()
          if (!newOrderingData) {
            return
          }

          const updatedData = {
            ...newOrderingData,
            type,
            // Nếu type là take-out, remove table
            ...(type === OrderTypeEnum.TAKE_OUT && {
              table: '',
              tableName: '',
            }),
          }

          set({
            orderingData: updatedData,
            lastModified: moment().valueOf(),
          })
        } else {
          const updatedData = {
            ...orderingData,
            type,
            // Nếu type là take-out, remove table
            ...(type === OrderTypeEnum.TAKE_OUT && {
              table: '',
              tableName: '',
            }),
          }

          set({
            orderingData: updatedData,
            lastModified: moment().valueOf(),
          })
        }
      },

      setOrderingDescription: (description: string) => {
        const { orderingData } = get()
        if (!orderingData) return

        set({
          orderingData: {
            ...orderingData,
            description,
          },
          lastModified: moment().valueOf(),
        })
      },

      setOrderingApprovalBy: (approvalBy: string) => {
        const { orderingData } = get()
        if (!orderingData) return

        set({
          orderingData: {
            ...orderingData,
            approvalBy,
          },
          lastModified: moment().valueOf(),
        })
      },

      clearOrderingData: () => {
        set({
          orderingData: null,
          lastModified: moment().valueOf(),
        })
      },

      // ===================
      // PAYMENT PHASE
      // ===================
      initializePayment: (orderSlug: string, paymentMethod?: PaymentMethod) => {
        const newPaymentData: IPaymentData = {
          orderSlug,
          paymentMethod: paymentMethod || PaymentMethod.BANK_TRANSFER,
          qrCode: '',
          paymentSlug: '',
          isQrValid: false,
        }

        set({
          currentStep: OrderFlowStep.PAYMENT,
          paymentData: newPaymentData,
          orderingData: null,
          lastModified: moment().valueOf(),
        })
      },

      setPaymentData: (data: Partial<IPaymentData>) => {
        const { paymentData } = get()
        if (!paymentData) return

        set({
          paymentData: {
            ...paymentData,
            ...data,
          },
          lastModified: moment().valueOf(),
        })
      },

      updatePaymentMethod: (method: PaymentMethod) => {
        const { paymentData } = get()
        if (!paymentData) return

        set({
          paymentData: {
            ...paymentData,
            paymentMethod: method,
          },
          lastModified: moment().valueOf(),
        })
      },

      updateQrCode: (qrCode: string) => {
        const { paymentData } = get()
        if (!paymentData) return

        // Validate QR code against order data
        const isQrValid =
          paymentData.orderData?.payment?.amount != null &&
          paymentData.orderData.subtotal != null &&
          paymentData.orderData.payment.amount ===
            paymentData.orderData.subtotal &&
          qrCode.trim() !== ''

        set({
          paymentData: {
            ...paymentData,
            qrCode,
            isQrValid,
          },
          lastModified: moment().valueOf(),
        })
      },

      setOrderFromAPI: (order: IOrder) => {
        const { paymentData } = get()
        if (!paymentData) return

        set({
          paymentData: {
            ...paymentData,
            // Only update paymentMethod if API provides one, otherwise keep existing
            paymentMethod:
              (order.payment?.paymentMethod as PaymentMethod) ||
              paymentData.paymentMethod,
            orderData: order,
            paymentAmount: order.payment?.amount || 0,
            paymentSlug: order.payment?.slug || '',
          },
          lastModified: moment().valueOf(),
        })
      },

      setPaymentSlug: (slug: string) => {
        const { paymentData } = get()
        if (!paymentData) return

        set({
          paymentData: {
            ...paymentData,
            paymentSlug: slug,
          },
          lastModified: moment().valueOf(),
        })
      },

      clearPaymentData: () => {
        set({
          paymentData: null,
          lastModified: moment().valueOf(),
        })
      },

      // ===================
      // UPDATING PHASE
      // ===================
      initializeUpdating: (originalOrder: IOrder) => {
        // Tạo ID cho các order items và cập nhật originalOrder
        const orderItemsWithIds = originalOrder.orderItems.map((item) => ({
          ...item,
          id: item.slug || generateOrderItemId(), // Giữ ID cũ nếu có, tạo mới nếu không
        }))

        const updatedOriginalOrder: IOrder = {
          ...originalOrder,
          orderItems: orderItemsWithIds,
        }

        // Create initial draft from original order với cùng IDs
        const updateDraft: IOrderToUpdate = {
          id: generateOrderId(), // Draft có ID riêng
          slug: updatedOriginalOrder.slug,
          productSlug:
            updatedOriginalOrder.orderItems[0]?.variant.product.slug || '',
          status: updatedOriginalOrder.status || OrderStatus.PENDING,
          owner: updatedOriginalOrder.owner?.slug || '',
          ownerFullName:
            updatedOriginalOrder.owner?.firstName +
              ' ' +
              updatedOriginalOrder.owner?.lastName || '',
          ownerPhoneNumber: updatedOriginalOrder.owner?.phonenumber || '',
          ownerRole: updatedOriginalOrder.owner?.role.name || '',
          paymentMethod: updatedOriginalOrder.payment?.paymentMethod || '',
          type: updatedOriginalOrder.type,
          table: updatedOriginalOrder.table?.slug || '',
          tableName: updatedOriginalOrder.table?.name || '',
          orderItems: orderItemsWithIds.map((item) => ({
            ...convertOrderDetailToOrderItem(item),
            id: item.id, // Sử dụng cùng ID
          })),
          voucher: updatedOriginalOrder.voucher,
          description: updatedOriginalOrder.description || '',
          approvalBy: updatedOriginalOrder.approvalBy?.slug || '',
        }

        const newUpdatingData: IUpdatingData = {
          originalOrder: updatedOriginalOrder,
          updateDraft,
          hasChanges: false,
        }

        set({
          currentStep: OrderFlowStep.UPDATING,
          updatingData: newUpdatingData,
          paymentData: null,
          lastModified: moment().valueOf(),
        })
      },

      setUpdateDraft: (draft: IOrderToUpdate) => {
        const { updatingData } = get()
        if (!updatingData) return

        // Check if there are changes compared to original
        const hasChanges =
          JSON.stringify(draft) !== JSON.stringify(updatingData.updateDraft)

        set({
          updatingData: {
            ...updatingData,
            updateDraft: draft,
            hasChanges,
          },
          lastModified: moment().valueOf(),
        })
      },

      updateDraftItem: (itemId: string, changes: Partial<IOrderItem>) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedItems = updatingData.updateDraft.orderItems.map((item) =>
          item.id === itemId ? { ...item, ...changes } : item,
        )

        const updatedDraft = {
          ...updatingData.updateDraft,
          orderItems: updatedItems,
        }

        const hasChanges =
          JSON.stringify(updatedDraft) !==
          JSON.stringify(updatingData.updateDraft)

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges,
          },
          lastModified: moment().valueOf(),
        })
      },

      updateDraftItemQuantity: (itemId: string, quantity: number) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedItems = updatingData.updateDraft.orderItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        )

        const updatedDraft = {
          ...updatingData.updateDraft,
          orderItems: updatedItems,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      addDraftItem: (item: IOrderItem) => {
        const { updatingData } = get()
        if (!updatingData) return

        const newItem = {
          ...item,
          id: generateOrderItemId(),
        }

        const updatedDraft = {
          ...updatingData.updateDraft,
          orderItems: [...updatingData.updateDraft.orderItems, newItem],
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      removeDraftItem: (itemId: string) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedItems = updatingData.updateDraft.orderItems.filter(
          (item) => item.id !== itemId,
        )
        const updatedDraft = {
          ...updatingData.updateDraft,
          orderItems: updatedItems,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      addDraftNote: (itemId: string, note: string) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedItems = updatingData.updateDraft.orderItems.map((item) =>
          item.id === itemId ? { ...item, note } : item,
        )

        const updatedDraft = {
          ...updatingData.updateDraft,
          orderItems: updatedItems,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      updateDraftCustomer: (customer: IUserInfo) => {
        const { updatingData } = get()
        if (!updatingData) return

        const fullName =
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim()

        const updatedDraft = {
          ...updatingData.updateDraft,
          owner: customer.slug,
          ownerFullName: fullName,
          ownerPhoneNumber: customer.phonenumber,
          ownerRole: customer.role.name,
          approvalBy: customer.slug,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      removeDraftCustomer: () => {
        const { updatingData } = get()
        if (!updatingData) return

        const requiresVerification =
          updatingData.updateDraft.voucher?.isVerificationIdentity === true

        const updatedDraft = {
          ...updatingData.updateDraft,
          owner: '',
          ownerFullName: '',
          ownerPhoneNumber: '',
          ownerRole: '',
          voucher: requiresVerification
            ? null
            : updatingData.updateDraft.voucher,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      setDraftTable: (table: ITable) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedDraft = {
          ...updatingData.updateDraft,
          table: table.slug,
          tableName: table.name,
          type: OrderTypeEnum.AT_TABLE,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      removeDraftTable: () => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedDraft = {
          ...updatingData.updateDraft,
          table: '',
          tableName: '',
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      setDraftVoucher: (voucher: IVoucher | null) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedDraft = {
          ...updatingData.updateDraft,
          voucher,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      removeDraftVoucher: () => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedDraft = {
          ...updatingData.updateDraft,
          voucher: null,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      setDraftType: (type: OrderTypeEnum) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedDraft = {
          ...updatingData.updateDraft,
          type,
          // Nếu type là take-out, remove table
          ...(type === OrderTypeEnum.TAKE_OUT && {
            table: '',
            tableName: '',
          }),
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      setDraftDescription: (description: string) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedDraft = {
          ...updatingData.updateDraft,
          description,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      setDraftApprovalBy: (approvalBy: string) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedDraft = {
          ...updatingData.updateDraft,
          approvalBy,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      setDraftPaymentMethod: (method: string) => {
        const { updatingData } = get()
        if (!updatingData) return

        const updatedDraft = {
          ...updatingData.updateDraft,
          paymentMethod: method,
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: updatedDraft,
            hasChanges: true,
          },
          lastModified: moment().valueOf(),
        })
      },

      resetDraftToOriginal: () => {
        const { updatingData } = get()
        if (!updatingData) return

        const resetDraft: IOrderToUpdate = {
          id: generateOrderId(),
          slug: updatingData.originalOrder.slug,
          productSlug:
            updatingData.originalOrder.orderItems[0].variant.product.slug || '',
          status: updatingData.originalOrder.status || OrderStatus.PENDING,
          owner: updatingData.originalOrder.owner?.slug || '',
          ownerFullName: updatingData.originalOrder.owner?.firstName || '',
          ownerPhoneNumber: updatingData.originalOrder.owner?.phonenumber || '',
          paymentMethod:
            updatingData.originalOrder.payment?.paymentMethod || '',
          type: updatingData.originalOrder.type,
          table: updatingData.originalOrder.table?.slug || '',
          tableName: updatingData.originalOrder.table?.name || '',
          orderItems: updatingData.originalOrder.orderItems.map(
            convertOrderDetailToOrderItem,
          ),
          voucher: updatingData.originalOrder.voucher,
          description: updatingData.originalOrder.description || '',
          approvalBy: updatingData.originalOrder.approvalBy?.slug || '',
        }

        set({
          updatingData: {
            ...updatingData,
            updateDraft: resetDraft,
            hasChanges: false,
          },
          lastModified: moment().valueOf(),
        })
      },

      clearUpdatingData: () => {
        set({
          updatingData: null,
          lastModified: moment().valueOf(),
        })
      },

      // ===================
      // FLOW TRANSITIONS
      // ===================
      transitionToPayment: (orderSlug: string) => {
        get().clearOrderingData()
        get().initializePayment(orderSlug, PaymentMethod.BANK_TRANSFER)
      },

      transitionToUpdating: (originalOrder: IOrder) => {
        get().clearPaymentData()
        get().initializeUpdating(originalOrder)
      },

      transitionBackToOrdering: () => {
        get().clearPaymentData()
        get().clearUpdatingData()
        get().initializeOrdering()
      },

      // ===================
      // UTILITIES
      // ===================
      clearAllData: () => {
        set({
          currentStep: OrderFlowStep.ORDERING,
          orderingData: null,
          paymentData: null,
          updatingData: null,
          lastModified: moment().valueOf(),
        })
      },

      getActiveData: () => {
        const { currentStep, orderingData, paymentData, updatingData } = get()

        switch (currentStep) {
          case OrderFlowStep.ORDERING:
            return orderingData
          case OrderFlowStep.PAYMENT:
            return paymentData
          case OrderFlowStep.UPDATING:
            return updatingData
          default:
            return null
        }
      },

      // ===================
      // COMPATIBILITY METHODS
      // ===================
      getCartItems: () => {
        const { currentStep, orderingData } = get()
        return currentStep === OrderFlowStep.ORDERING ? orderingData : null
      },

      getOrderItems: () => {
        const { currentStep, updatingData } = get()
        return currentStep === OrderFlowStep.UPDATING ? updatingData : null
      },

      clearCart: () => {
        get().clearOrderingData()
      },

      clearStore: () => {
        get().clearAllData()
      },

      addCartItem: (item: ICartItem) => {
        const { orderingData } = get()

        if (!orderingData) {
          get().initializeOrdering()
        }

        const orderItems = convertCartItemToOrderItems(item)
        orderItems.forEach((orderItem) => {
          get().addOrderingItem(orderItem)
        })

        // Update other cart info
        if (item.owner) {
          const { orderingData: updatedOrderingData } = get()
          if (updatedOrderingData) {
            set({
              orderingData: {
                ...updatedOrderingData,
                owner: item.owner,
                ownerFullName: item.ownerFullName || '',
                ownerPhoneNumber: item.ownerPhoneNumber || '',
                ownerRole: item.ownerRole || '',
                type: item.type as OrderTypeEnum,
                table: item.table || '',
                tableName: item.tableName || '',
                voucher: item.voucher || null,
                description: item.description || '',
                approvalBy: item.approvalBy || '',
                paymentMethod: item.paymentMethod || '',
                payment: item.payment,
              },
              lastModified: moment().valueOf(),
            })
          }
        }
      },

      updateCartItemQuantity: (id: string, quantity: number) => {
        get().updateOrderingItemQuantity(id, quantity)
      },

      addNote: (id: string, note: string) => {
        get().addOrderingNote(id, note)
      },

      addCustomerInfo: (owner: IUserInfo) => {
        get().updateOrderingCustomer(owner)
      },

      removeCustomerInfo: () => {
        get().removeOrderingCustomer()
      },

      addTable: (table: ITable) => {
        get().setOrderingTable(table)
      },

      removeTable: () => {
        get().removeOrderingTable()
      },

      addVoucher: (voucher: IVoucher) => {
        get().setOrderingVoucher(voucher)
      },

      removeVoucher: () => {
        get().removeOrderingVoucher()
      },

      addApprovalBy: (approvalBy: string) => {
        get().setOrderingApprovalBy(approvalBy)
      },

      addOrderType: (orderType: OrderTypeEnum) => {
        get().setOrderingType(orderType)
      },

      addOrderNote: (note: string) => {
        get().setOrderingDescription(note)
      },

      setPaymentMethod: (method: PaymentMethod | string) => {
        const { currentStep, orderingData, paymentData } = get()

        if (currentStep === OrderFlowStep.ORDERING && orderingData) {
          set({
            orderingData: {
              ...orderingData,
              paymentMethod: method as string,
            },
            lastModified: moment().valueOf(),
          })
        } else if (currentStep === OrderFlowStep.PAYMENT && paymentData) {
          get().updatePaymentMethod(method as PaymentMethod)
        }
      },

      setQrCode: (qrCode: string) => {
        get().updateQrCode(qrCode)
      },

      setOrderSlug: (slug: string) => {
        const { currentStep, orderingData, paymentData } = get()

        if (currentStep === OrderFlowStep.ORDERING && orderingData) {
          set({
            orderingData: {
              ...orderingData,
              payment: {
                ...orderingData.payment,
                orderSlug: slug,
              } as IOrderPayment,
            },
            lastModified: moment().valueOf(),
          })
        } else if (currentStep === OrderFlowStep.PAYMENT && paymentData) {
          set({
            paymentData: {
              ...paymentData,
              orderSlug: slug,
            },
            lastModified: moment().valueOf(),
          })
        }
      },

      removeCartItem: (itemId: string) => {
        get().removeOrderingItem(itemId)
      },
    }),
    {
      name: 'order-flow-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        orderingData: state.orderingData,
        paymentData: state.paymentData,
        updatingData: state.updatingData,
        lastModified: state.lastModified,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // ✅ Sử dụng queueMicrotask như cart store
          queueMicrotask(() => {
            useOrderFlowStore.setState({ isHydrated: true })
          })
        }
      },
    },
  ),
)
