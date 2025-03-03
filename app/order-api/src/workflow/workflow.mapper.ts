import { createMap, extend, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Workflow } from './workflow.entity';
import { CreateWorkflowRequestDto, WorkflowResponseDto } from './workflow.dto';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class WorkflowProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateWorkflowRequestDto, Workflow);

      createMap(
        mapper,
        Workflow,
        WorkflowResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
