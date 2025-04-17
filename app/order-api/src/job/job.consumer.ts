import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job as BullJob } from 'bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { JobService } from './job.service';
import { JobStatus, JobType } from './job.constants';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Job } from './job.entity';

@Processor(QueueRegisterKey.JOB)
@Injectable()
export class JobConsumer extends WorkerHost {
  constructor(
    private readonly jobService: JobService,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {
    super();
  }

  async process(jobData: BullJob<{ id: string }>): Promise<any> {
    const context = `${JobConsumer.name}.${this.process.name}`;
    const job: Job = await this.jobRepository.findOne({
      where: {
        id: jobData.data?.id ?? IsNull(),
      },
    });
    if (!job) {
      this.logger.error(
        `Job not found ${JSON.stringify(jobData)}`,
        null,
        context,
      );
      return;
    }
    try {
      Object.assign(job, { status: JobStatus.PROCESSING });
      await this.jobRepository.save(job);
      switch (jobData.name) {
        case JobType.UPDATE_STATUS_ORDER_AFTER_PAID:
          const result =
            await this.jobService.updateOrderStatusAfterPaymentPaid(job);
          return result;
      }
    } catch (error) {
      this.logger.error(`Error processing job`, error, context);
      Object.assign(job, { status: JobStatus.FAILED });
      await this.jobRepository.save(job);
    }
  }
}
