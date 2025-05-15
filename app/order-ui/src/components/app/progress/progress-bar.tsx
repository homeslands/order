import { DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

import { OrderStatus } from '@/types';

interface ProgressBarProps {
  step?: OrderStatus;
}

export default function ProgressBar({ step }: ProgressBarProps) {
  const { t } = useTranslation('progress');

  // Định nghĩa thứ tự các bước
  const steps = [
    { label: t('progress.pending'), value: OrderStatus.PENDING },
    { label: t('progress.paid'), value: OrderStatus.PAID },
    { label: t('progress.shipping'), value: OrderStatus.SHIPPING },
    { label: t('progress.completed'), value: OrderStatus.COMPLETED },
  ];

  // Xác định bước hiện tại dựa trên thứ tự
  const currentStepIndex = steps.findIndex((item) => item.value === step);

  return (
    <ol className="flex items-center justify-center w-full py-6 space-x-2 text-sm font-medium text-center text-gray-500 bg-white rounded-lg dark:text-gray-400 sm:text-base dark:bg-transparent sm:space-x-4 rtl:space-x-reverse">
      {steps.map((item, index) => (
        <li
          key={index}
          className={`flex items-center ${index <= currentStepIndex ? 'text-primary dark:text-primary' : ''
            }`}
        >
          <span
            className={`flex items-center justify-center w-5 h-5 text-xs border rounded-full me-2 shrink-0 ${index <= currentStepIndex
              ? 'border-primary dark:border-primary'
              : 'border-gray-500 dark:border-gray-400'
              }`}
          >
            {index + 1}
          </span>
          <span className="hidden sm:text-sm sm:inline-flex sm:ms-1">{item.label}</span>
          {index < steps.length - 1 && (
            <DoubleArrowRightIcon className="w-4 h-4 ms-2 sm:ms-4 rtl:rotate-180" />
          )}
        </li>
      ))}
    </ol>
  );
}
