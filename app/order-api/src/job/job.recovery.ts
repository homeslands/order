import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Job } from './job.entity';
import { QueueRegisterKey } from 'src/app/app.constants';
import { JobStatus } from './job.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class JobRecoveryService implements OnModuleInit {
  constructor(
    @InjectQueue(QueueRegisterKey.JOB)
    private readonly jobQueue: Queue,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    const context = `${JobRecoveryService.name}.${this.onModuleInit.name}`;
    this.logger.log('Starting job recovery service', context);
    const pendingJobs = await this.jobRepository.find({
      where: {
        status: In([JobStatus.PENDING, JobStatus.PROCESSING]),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    for (const job of pendingJobs) {
      await this.jobQueue.add(job.type, { id: job.id });
      this.logger.log(`Re-queued job ${job.id} of type ${job.type}`, context);
    }
    this.logger.log(
      `${pendingJobs.length} jobs recovery service completed`,
      context,
    );
  }
}
