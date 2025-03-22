import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  CreateWorkflowRequestDto,
  UpdateWorkflowRequestDto,
  WorkflowResponseDto,
} from './workflow.dto';
import { AppResponseDto } from 'src/app/app.dto';

@Controller('workflows')
@ApiBearerAuth()
@ApiTags('Workflow')
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create a new workflow successfully',
    type: WorkflowResponseDto,
  })
  @ApiOperation({ summary: 'Create new workflow' })
  @ApiResponse({ status: 200, description: 'Create new workflow successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createVariant(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateWorkflowRequestDto,
  ) {
    const result = await this.workflowService.addNewWorkflow(requestData);
    return {
      message: 'The workflow have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<WorkflowResponseDto>;
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get all workflows successfully',
    type: WorkflowResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all workflows' })
  @ApiResponse({ status: 200, description: 'Get all workflows successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({
    name: 'branch',
    required: false,
    description: 'Filter workflows by branch',
    type: String,
  })
  async getAllWorkflows(@Query('branch') branch: string) {
    const result = await this.workflowService.getAllWorkflowByBranch(branch);
    return {
      message: 'Workflows have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<WorkflowResponseDto[]>;
  }

  @Patch(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Workflow have been update successfully',
    type: WorkflowResponseDto,
  })
  @ApiOperation({ summary: 'Update workflow' })
  @ApiResponse({ status: 200, description: 'Update workflow successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the workflow to be updated',
    required: true,
    example: '',
  })
  async updateWorkflow(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateWorkflowDto: UpdateWorkflowRequestDto,
  ) {
    const result = await this.workflowService.updateWorkflow(
      slug,
      updateWorkflowDto,
    );
    return {
      message: 'The workflow have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<WorkflowResponseDto>;
  }
}
