import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  RunWorkflowRequestDto,
  WorkflowExecutionResponseDto,
  WorkflowResponseDto,
  QRLocationResponseDto,
  CreateQRLocationRequestDto,
  UpdateQRLocationRequestDto,
  GetWorkflowExecutionResponseDto,
  CreateWorkflowRequestDto,
  RobotResponseDto,
} from './robot-connector.dto';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { AxiosError } from 'axios';
import { RobotConnectorException } from './robot-connector.exception';
import { RobotConnectorValidation } from './robot-connector.validation';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';

@Injectable()
export class RobotConnectorClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getRobotApiUrl() {
    return await this.systemConfigService.get(SystemConfigKey.ROBOT_API_URL);
  }

  /* RAYBOTS */
  async getRobotById(id: string): Promise<RobotResponseDto> {
    const context = `${RobotConnectorClient.name}.${this.getRobotById.name}`;
    const requestUrl = `${await this.getRobotApiUrl()}/raybots/${id}`;
    const { data } = await firstValueFrom(
      this.httpService.get<RobotResponseDto>(requestUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Get robot ${id} data from ROBOT API failed: ${error.message}`,
            error.stack,
            context,
          );
          throw new RobotConnectorException(
            RobotConnectorValidation.GET_ROBOT_DATA_FAILED,
          );
        }),
      ),
    );
    return data;
  }

  /* WORK FLOWS */
  async createWorkflow(
    requestData: CreateWorkflowRequestDto,
  ): Promise<WorkflowResponseDto> {
    const requestUrl = `${await this.getRobotApiUrl()}/workflows`;
    const { data } = await firstValueFrom(
      this.httpService
        .post<WorkflowResponseDto>(requestUrl, requestData, {})
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Create Workflow from ROBOT API failed: ${error.message}`,
              error.stack,
            );
            throw error;
          }),
        ),
    );
    return data;
  }

  async getAllWorkflows(): Promise<WorkflowResponseDto[]> {
    const context = `${RobotConnectorClient.name}.${this.getAllWorkflows.name}`;
    const requestUrl = `${await this.getRobotApiUrl()}/workflows`;
    const { data } = await firstValueFrom(
      this.httpService.get<WorkflowResponseDto[]>(requestUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Get all Workflows from ROBOT API failed: ${error.message}`,
            error.stack,
            context,
          );
          throw new BadRequestException(
            'Get all Workflows from ROBOT API failed',
          );
        }),
      ),
    );
    return data;
  }

  async runWorkflow(
    workflowId: string,
    requestData: RunWorkflowRequestDto,
  ): Promise<WorkflowExecutionResponseDto> {
    const context = `${RobotConnectorClient.name}.${this.runWorkflow.name}`;
    const requestUrl = `${await this.getRobotApiUrl()}/workflows/${workflowId}/run`;
    const { data } = await firstValueFrom(
      this.httpService
        .post<WorkflowExecutionResponseDto>(requestUrl, requestData)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `${RobotConnectorValidation.RUN_WORKFLOW_FROM_ROBOT_API_FAILED} ${workflowId}: ${error.message}`,
              error.stack,
              context,
            );
            throw new RobotConnectorException(
              RobotConnectorValidation.RUN_WORKFLOW_FROM_ROBOT_API_FAILED,
            );
          }),
        ),
    );
    return data;
  }

  /* WORKFLOW EXECUTIONS */
  async retrieveWorkflowExecution(
    workflowExecutionId: string,
  ): Promise<GetWorkflowExecutionResponseDto> {
    const context = `${RobotConnectorClient.name}.${this.retrieveWorkflowExecution.name}`;
    const requestUrl = `${await this.getRobotApiUrl()}/workflow-executions/${workflowExecutionId}`;
    const { data } = await firstValueFrom(
      this.httpService.get<GetWorkflowExecutionResponseDto>(requestUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Get Workflow Execution from ROBOT API failed: ${error.message}`,
            error.stack,
            context,
          );
          throw new BadRequestException(
            `Get Workflow Execution failed ${error.message}`,
          );
        }),
      ),
    );
    return data;
  }

  async retrieveAllWorkflowExecutions(): Promise<
    GetWorkflowExecutionResponseDto[]
  > {
    const requestUrl = `${await this.getRobotApiUrl()}/workflow-executions`;
    const { data } = await firstValueFrom(
      this.httpService.get<GetWorkflowExecutionResponseDto[]>(requestUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Get all Workflow Executions from ROBOT API failed: ${error.message}`,
            error.stack,
          );
          throw error;
        }),
      ),
    );
    return data;
  }

  /** QR LOCATIONS */
  async retrieveAllQRLocations(): Promise<QRLocationResponseDto[]> {
    const context = `${RobotConnectorClient.name}.${this.retrieveAllQRLocations.name}`;
    const requestUrl = `${await this.getRobotApiUrl()}/qr-locations`;
    const { data } = await firstValueFrom(
      this.httpService.get<QRLocationResponseDto[]>(requestUrl).pipe(
        retry(3),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Get all QR locations from ROBOT API failed: ${error.message}`,
            error.stack,
            context,
          );
          throw new BadRequestException(error.message);
        }),
      ),
    );
    return data;
  }

  async createQRLocation(
    requestData: CreateQRLocationRequestDto,
  ): Promise<QRLocationResponseDto> {
    const requestUrl = `${await this.getRobotApiUrl()}/qr-locations`;
    const { data } = await firstValueFrom(
      this.httpService
        .post<QRLocationResponseDto>(requestUrl, requestData)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Create QR location from ROBOT API failed: ${error.message}`,
              error.stack,
            );
            throw error;
          }),
        ),
    );
    return data;
  }

  async getQRLocationById(id: string): Promise<QRLocationResponseDto> {
    const context = `${RobotConnectorClient.name}.${this.getQRLocationById.name}`;
    const requestUrl = `${await this.getRobotApiUrl()}/qr-locations/${id}`;
    const { data } = await firstValueFrom(
      this.httpService.get<QRLocationResponseDto>(requestUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Get QR location by ID from ROBOT API failed: ${error.message}`,
            error.stack,
            context,
          );
          throw new RobotConnectorException(
            RobotConnectorValidation.GET_LOCATION_FROM_ROBOT_API_FAILED,
          );
        }),
      ),
    );
    return data;
  }

  async updateQRLocation(
    id: string,
    requestData: UpdateQRLocationRequestDto,
  ): Promise<QRLocationResponseDto> {
    const context = `${RobotConnectorClient.name}.${this.updateQRLocation.name}`;
    const requestUrl = `${await this.getRobotApiUrl()}/qr-locations/${id}`;

    const { data } = await firstValueFrom(
      this.httpService.put<QRLocationResponseDto>(requestUrl, requestData).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Update QR location by ID from ROBOT API failed: ${error.message}`,
            error.stack,
            context,
          );
          throw new BadRequestException(
            `Update QR location failed ${error.message}`,
          );
        }),
      ),
    );
    return data;
  }

  async deleteQRLocation(id: string): Promise<number> {
    const requestUrl = `${await this.getRobotApiUrl()}/qr-locations/${id}`;
    const response = await firstValueFrom(
      this.httpService.delete<number>(requestUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Delete QR location by ID from ROBOT API failed: ${error.message}`,
            error.stack,
          );
          throw error;
        }),
      ),
    );
    return response.status;
  }
}
