export const MAPPER_MODULE_PROVIDER = 'automapper:nestjs:default';
export enum QueueRegisterKey {
  MAIL = 'mail',
  NOTIFICATION = 'notification',
  JOB = 'job',
  PRINTER = 'printer',
  DISTRIBUTE_LOCK_JOB = 'distribute-lock-job',
}

export enum DistributeLockJobKey {
  REFRESH_BRANCH_REVENUE = 'refresh-branch-revenue',
  GENERATE_MENU_EVERY_DAY_AT_1AM = 'generate-menu-every-day-at-1am',
  REFRESH_PRODUCT_ANALYSIS = 'refresh-product-analysis',
}
