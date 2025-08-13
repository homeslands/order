export const MAPPER_MODULE_PROVIDER = 'automapper:nestjs:default';
export enum QueueRegisterKey {
  MAIL = 'mail',
  NOTIFICATION = 'notification',
  JOB = 'job',
  PRINTER = 'printer',
  DISTRIBUTE_LOCK_JOB = 'distribute-lock-job',
}

export enum DistributeLockJobKey {
  BRANCH_REVENUE_REFRESH_EVERY_DAY_AT_1AM = 'branch-revenue-refresh-every-day-at-1am',
  GENERATE_MENU_EVERY_DAY_AT_1AM = 'generate-menu-every-day-at-1am',
}
