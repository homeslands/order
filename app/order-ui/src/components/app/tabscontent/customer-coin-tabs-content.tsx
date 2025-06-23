import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Coins, ArrowUp, ArrowDown, Clock, Tag } from 'lucide-react'

import { Skeleton } from '@/components/ui'
import { useIsMobile } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils'

interface CoinTransaction {
  id: string
  amount: number
  description: string
  date: string
  transactionType: 'add' | 'subtract'
  code: string
}

export function CustomerCoinTabsContent() {
  const { t } = useTranslation(['profile'])
  const { t:tGiftCard } = useTranslation(['giftCard'])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [balance, setBalance] = useState(0)
  const isMobile = useIsMobile()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLDivElement | null>(null)


  const fetchCoinTransactions = useCallback(async (page: number, isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Tạo thêm dữ liệu mẫu dựa vào page
      const mockData: CoinTransaction[] = [];
      
      // Tạo dữ liệu mẫu cho mỗi page
      for (let i = 0; i < pageSize; i++) {
        const index = (page - 1) * pageSize + i;
        
        if (index % 2 === 0) {
          mockData.push({
            id: `HD${index.toString().padStart(4, '0')}`,
            amount: 500 + index * 100,
            description: `Thanh toán hóa đơn #${index}`,
            date: `${Math.floor(Math.random() * 28) + 1}/06/2025`,
            transactionType: 'subtract',
            code: `HD${index.toString().padStart(4, '0')}`
          });
        } else {
          mockData.push({
            id: `GC${index.toString().padStart(4, '0')}`,
            amount: 1000 + index * 50,
            description: `Quà đổi coin (thẻ quà tặng) #${index}`,
            date: `${Math.floor(Math.random() * 28) + 1}/06/2025`,
            transactionType: 'add',
            code: `GC${index.toString().padStart(4, '0')}`
          });
        }
      }
      
      const hasMoreData = page < 5;
      
      if (isInitial) {
        setTransactions(mockData);
      } else {
        setTransactions(prev => [...prev, ...mockData]);
      }
      
      setHasMore(hasMoreData);
      
      if (isInitial) {
        const calculatedBalance = 1234789;
        setBalance(calculatedBalance);
      }
    } catch (error) {
      console.error('Failed to fetch coin transactions:', error);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [pageSize]);
  
  // Xử lý cuộn để tải thêm dữ liệu
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);
  
  // Thiết lập observer cho infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !isLoading) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );
    
    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, isLoading, handleLoadMore]);
  
  // Tải dữ liệu ban đầu
  useEffect(() => {
    fetchCoinTransactions(1, true);
  }, [fetchCoinTransactions]);
  
  // Tải thêm dữ liệu khi currentPage thay đổi
  useEffect(() => {
    if (currentPage > 1) {
      fetchCoinTransactions(currentPage);
    }
  }, [currentPage, fetchCoinTransactions]);
  
  const CoinTransactionCard = ({ transaction }: { transaction: CoinTransaction }) => {
    const isAdd = transaction.transactionType === 'add';
    const amountClass = isAdd ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
    const bgClass = isAdd ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10';
    const borderClass = isAdd ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500';
    
    return (
      <div className={`p-3 mb-3 rounded-md shadow-sm ${bgClass} ${borderClass}`}>
        <div className="flex justify-between items-center mb-2">
          <div className={`${amountClass} text-lg font-bold flex items-center`}>
            <span className={`mr-1 p-1 rounded-full ${isAdd ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isAdd ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </span>
            {isAdd ? '+ ' : '- '}
            {formatCurrency(transaction.amount, '')} {tGiftCard('giftCard.coin')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Clock size={12} className="mr-1" />
            {transaction.date}
          </div>
        </div>
        
        <div className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
          {transaction.description}
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Tag size={12} className="mr-1" />
          <span className="mr-2">Mã GD:</span>
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {transaction.code}
          </span>
        </div>
      </div>
    );
  }
  
  // Loading Skeleton for Transaction Card
  const TransactionCardSkeleton = () => (
    <div className="p-3 mb-3 rounded-md border-l-4 border-gray-200 bg-gray-50 dark:bg-gray-800/10 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-36" />
    </div>
  )
  return (
    <div>       
      <Card className="shadow-md border-none overflow-hidden">
        <CardHeader className={`${isMobile ? 'py-2 px-3' : 'py-4 px-6'} bg-gray-50 dark:bg-gray-800/50`}>          
          <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-2`}>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 p-1 rounded-full">
              <Tag size={isMobile ? 16 : 18} />
            </span>
            {t('profile.coinTransactions')}
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          {isLoading ? (
            // Loading skeleton
            Array(5).fill(0).map((_, index) => (
              <TransactionCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : transactions.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <Coins className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">{t('profile.noTransactions')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('profile.transactionsWillAppearHere')}
              </p>
            </div>
          ) : (
            // Transaction cards
            <div className="space-y-1">
              {transactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  ref={index === transactions.length - 5 ? lastElementRef : null}
                >
                  <CoinTransactionCard transaction={transaction} />
                </div>
              ))}
              
              {/* Loading more indicator */}
              {loadingMore && (
                <div className="py-2">
                  <TransactionCardSkeleton />
                </div>
              )}
              
              {/* End of list message */}
              {!hasMore && transactions.length > 0 && (
                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.noMoreTransactions')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
