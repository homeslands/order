import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getAllMenus,
  getSpecificMenu,
  getSpecificMenuItem,
  createMenu,
  updateMenu,
  deleteMenu,
  addMenuItem,
  addMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Menu API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllMenus', () => {
    const queryParams = {
      page: 1,
      pageSize: 10,
      order: 'DESC' as const,
      branch: 'test-branch',
    }

    it('should fetch all menus with correct parameters', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'menu-1',
              date: '2024-01-01',
              branchSlug: 'test-branch',
              dayIndex: 1,
              isTemplate: false,
              menuItems: [],
            },
          ],
          meta: {
            page: 1,
            total: 1,
            totalPages: 1,
          },
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllMenus(queryParams)
      expect(http.get).toHaveBeenCalledWith('/menu', { params: queryParams })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getAllMenus(queryParams)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getSpecificMenu', () => {
    const query = {
      slug: 'menu-1',
      catalog: 'test-catalog',
    }

    it('should fetch specific menu with correct parameters', async () => {
      const mockResponse = {
        data: {
          slug: 'menu-1',
          date: '2024-01-01',
          menuItems: [],
          dayIndex: 1,
          isTemplate: false,
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getSpecificMenu(query)
      expect(http.get).toHaveBeenCalledWith('/menu/specific', { params: query })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getSpecificMenu(query)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getSpecificMenuItem', () => {
    const slug = 'menu-item-1'
    it('should fetch specific menu item with correct parameters', async () => {
      const mockResponse = {
        data: {
          slug: 'menu-item-1',
          promotion: 'test-promotion',
          product: 'test-product',
          defaultStock: 10,
          currentStock: 10,
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)
      const result = await getSpecificMenuItem(slug)
      expect(http.get).toHaveBeenCalledWith(`/menu-item/${slug}`)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getSpecificMenuItem(slug)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('createMenu', () => {
    const menuData = {
      date: '2024-01-01',
      branchSlug: 'test-branch',
      isTemplate: false,
    }

    it('should create menu with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'new-menu',
          ...menuData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createMenu(menuData)
      expect(http.post).toHaveBeenCalledWith('/menu', menuData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(createMenu(menuData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('updateMenu', () => {
    const menuData = {
      slug: 'menu-1',
      date: '2024-01-02',
      branchSlug: 'test-branch',
    }

    it('should update menu with correct data', async () => {
      const mockResponse = {
        data: {
          ...menuData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateMenu(menuData)
      expect(http.patch).toHaveBeenCalledWith('/menu/menu-1', menuData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.patch as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(updateMenu(menuData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('deleteMenu', () => {
    it('should delete menu with correct slug', async () => {
      const mockResponse = {
        data: {
          slug: 'menu-1',
          status: 'deleted',
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteMenu('menu-1')
      expect(http.delete).toHaveBeenCalledWith('/menu/menu-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(deleteMenu('menu-1')).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('addMenuItem', () => {
    const itemData = {
      menuSlug: 'menu-1',
      productSlug: 'product-1',
      defaultStock: 10,
    }

    it('should add menu item with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'menu-item-1',
          ...itemData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await addMenuItem(itemData)
      expect(http.post).toHaveBeenCalledWith('/menu-item', itemData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(addMenuItem(itemData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('addMenuItems', () => {
    const itemsData = [
      {
        menuSlug: 'menu-1',
        productSlug: 'product-1',
        defaultStock: 10,
      },
    ]

    it('should add multiple menu items with correct data', async () => {
      const mockResponse = {
        data: {
          items: itemsData.map((item, index) => ({
            slug: `menu-item-${index + 1}`,
            ...item,
          })),
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await addMenuItems(itemsData)
      expect(http.post).toHaveBeenCalledWith('/menu-item/bulk', itemsData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(addMenuItems(itemsData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('updateMenuItem', () => {
    const itemData = {
      slug: 'menu-item-1',
      menuSlug: 'menu-1',
      productSlug: 'product-1',
      defaultStock: 15,
    }

    it('should update menu item with correct data', async () => {
      const mockResponse = {
        data: {
          ...itemData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateMenuItem(itemData)
      expect(http.patch).toHaveBeenCalledWith(
        '/menu-item/menu-item-1',
        itemData,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.patch as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(updateMenuItem(itemData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('deleteMenuItem', () => {
    it('should delete menu item with correct slug', async () => {
      const mockResponse = {
        data: {
          slug: 'menu-item-1',
          status: 'deleted',
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteMenuItem('menu-item-1')
      expect(http.delete).toHaveBeenCalledWith('/menu-item/menu-item-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(deleteMenuItem('menu-item-1')).rejects.toEqual(SERVER_ERROR)
    })
  })
})
