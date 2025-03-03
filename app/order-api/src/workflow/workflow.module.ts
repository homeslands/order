import { Module } from '@nestjs/common';
import { Workflow } from './workflow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowProfile } from './workflow.mapper';
import { Branch } from 'src/branch/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, Branch])],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowProfile],
})
export class WorkflowModule {}
