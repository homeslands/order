import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workflow } from './workflow.entity';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateWorkflowRequestDto,
  UpdateWorkflowRequestDto,
  WorkflowResponseDto,
} from './workflow.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Branch } from 'src/branch/branch.entity';
import { WorkflowException } from './workflow.exception';
import { WorkflowValidation } from './workflow.validation';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectMapper() private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   *
   * @param {CreateWorkflowRequestDto} requestData The data to add workflow for branch
   * @returns {Promise<WorkflowResponseDto>}
   * @throws {BranchException} If branch not found
   * @throws {WorkflowException} If branch have a workflow, can not add
   * @throws {WorkflowException} If workflow does exist
   */
  async addNewWorkflow(
    requestData: CreateWorkflowRequestDto,
  ): Promise<WorkflowResponseDto> {
    const context = `${WorkflowService.name}.${this.addNewWorkflow.name}`;
    const branch = await this.branchRepository.findOneBy({
      slug: requestData.branch,
    });
    if (!branch) {
      this.logger.warn(`Branch ${requestData.branch} is not found`, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    const workflowByBranch = await this.workflowRepository.findOne({
      where: {
        branch: {
          slug: requestData.branch,
        },
      },
    });
    if (workflowByBranch) {
      this.logger.warn(
        `Branch ${requestData.branch} have a workflow, can not add`,
        context,
      );
      throw new WorkflowException(WorkflowValidation.BRANCH_HAVE_A_WORKFLOW);
    }

    const workflow = await this.workflowRepository.findOneBy({
      workflowId: requestData.workflowId,
    });
    if (workflow) {
      this.logger.warn(
        `Workflow ${requestData.workflowId} already exists`,
        context,
      );
      throw new WorkflowException(WorkflowValidation.WORKFLOW_DOES_EXIST);
    }

    const workflowData = this.mapper.map(
      requestData,
      CreateWorkflowRequestDto,
      Workflow,
    );
    Object.assign(workflowData, { branch });
    const newWorkflow = this.workflowRepository.create(workflowData);
    const createdWorkflow = await this.workflowRepository.save(newWorkflow);
    const workflowDto = this.mapper.map(
      createdWorkflow,
      Workflow,
      WorkflowResponseDto,
    );
    return workflowDto;
  }

  /**
   *
   * @param {string} branchSlug The slug of branch
   * @returns {Promise<WorkflowResponseDto>}
   */
  async getAllWorkflowByBranch(
    branchSlug: string,
  ): Promise<WorkflowResponseDto[]> {
    const workflows = await this.workflowRepository.find({
      where: {
        branch: {
          slug: branchSlug,
        },
      },
    });

    const workflowsDto = this.mapper.mapArray(
      workflows,
      Workflow,
      WorkflowResponseDto,
    );
    return workflowsDto;
  }

  /**
   *
   * @param {string} slug The slug of workflow
   * @param {UpdateWorkflowRequestDto} request The data to update workflow
   * @returns {Promise<WorkflowResponseDto>}
   */
  async updateWorkflow(
    slug: string,
    requestData: UpdateWorkflowRequestDto,
  ): Promise<WorkflowResponseDto> {
    const context = `${WorkflowService.name}.${this.updateWorkflow.name}`;

    const workflow = await this.workflowRepository.findOneBy({ slug });
    if (!workflow) {
      this.logger.warn(WorkflowValidation.WORKFLOW_NOT_FOUND.message, context);
      throw new WorkflowException(WorkflowValidation.WORKFLOW_NOT_FOUND);
    }
    Object.assign(workflow, { workflowId: requestData.workflowId });
    const updatedWorkflow = await this.workflowRepository.save(workflow);
    const workflowDto = this.mapper.map(
      updatedWorkflow,
      Workflow,
      WorkflowResponseDto,
    );
    return workflowDto;
  }
}
