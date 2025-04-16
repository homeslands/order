import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { CreateJobRequestDto } from './job.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { Repository } from 'typeorm';
@Injectable()
export class JobProducer {
  constructor(
    @InjectQueue(QueueRegisterKey.JOB)
    private jobQueue: Queue,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async createJob(data: CreateJobRequestDto) {
    const job = this.jobRepository.create(data);
    await this.jobRepository.save(job);
    this.jobQueue.add(data.type, job.id);
  }
}
