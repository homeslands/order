export const CANCEL_CARD_ORDER_JOB = 'CANCEL_CARD_ORDER_JOB';

export const createCancelCardOrderJobName = (id: string) =>
  `${CANCEL_CARD_ORDER_JOB}_${id}`;
