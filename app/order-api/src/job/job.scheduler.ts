import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { QueueRegisterKey } from 'src/app/app.constants';

@Injectable()
export class JobScheduler {
  constructor(
    @InjectQueue(QueueRegisterKey.JOB)
    private jobQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}
  // @Cron('* * * *') // per hour
  // async clearRedisCache() {
  //   const context = `${JobScheduler.name}.${this.clearRedisCache.name}`;
  //   this.logger.log('Clearing Redis cache', context);
  //   // await this.jobQueue.clean(20 * 1000, 10, 'completed');
  // }
}
