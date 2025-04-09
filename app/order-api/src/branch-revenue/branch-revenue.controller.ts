import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  ValidationPipe,
  Res,
  Post,
  Body,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BranchRevenueService } from './branch-revenue.service';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  AggregateBranchRevenueResponseDto,
  GetBranchRevenueQueryDto,
  RefreshSpecificRangeBranchRevenueQueryDto,
  ExportBranchRevenueQueryDto,
  ExportHandOverTicketRequestDto,
} from './branch-revenue.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { Response } from 'express';

@Controller('revenue/branch')
@ApiTags('Branch Revenue')
@ApiBearerAuth()
export class BranchRevenueController {
  constructor(private readonly branchRevenueService: BranchRevenueService) {}

  @Get('export')
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @ApiOperation({ summary: 'Export branch revenue to Excel' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The branch revenue has been exported successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportToExcel(
    @Query(new ValidationPipe({ transform: true }))
    query: ExportBranchRevenueQueryDto,
    @Res() res: Response,
  ) {
    const fileResponse =
      await this.branchRevenueService.exportBranchRevenueToExcel(query);

    res.set({
      'Content-Type': fileResponse.mimetype,
      'Content-Disposition': `attachment; filename="${fileResponse.name}.${fileResponse.extension}"`,
      'Content-Length': fileResponse.size,
    });

    res.send(fileResponse.data);
  }

  @Post('export-pdf')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @ApiOperation({ summary: 'Export invoice' })
  @HttpCode(HttpStatus.OK)
  async exportInvoice(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ExportHandOverTicketRequestDto,
  ): Promise<StreamableFile> {
    const result =
      await this.branchRevenueService.exportHandOverTicket(requestData);
    return new StreamableFile(result, {
      type: 'application/pdf',
      length: result.length,
      disposition: `attachment; filename="hand-over-ticket-${new Date().toISOString()}.pdf"`,
    });
  }

  @Get(':branch')
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @ApiOperation({ summary: 'Get all branch revenues' })
  @ApiResponseWithType({
    type: AggregateBranchRevenueResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'The branch revenues retrieved successfully',
  })
  async findAll(
    @Param('branch') branch: string,
    @Query(new ValidationPipe({ transform: true }))
    query: GetBranchRevenueQueryDto,
  ) {
    const result = await this.branchRevenueService.findAll(branch, query);
    return {
      message: 'The branch revenues have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AggregateBranchRevenueResponseDto[]>;
  }

  @Patch('latest')
  @HttpCode(HttpStatus.OK)
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update latest branch revenue successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Update latest branch revenue' })
  @ApiResponse({
    status: 200,
    description: 'Update latest branch revenue successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateLatestBranchRevenue() {
    await this.branchRevenueService.updateLatestBranchRevenueInCurrentDate();
    return {
      message: 'Update latest branch revenue successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: 'Update latest branch revenue successfully',
    } as AppResponseDto<string>;
  }

  @Patch('date')
  @HttpCode(HttpStatus.OK)
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update latest branch revenue for a range time successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Update latest branch revenue for a range time' })
  @ApiResponse({
    status: 200,
    description: 'Update latest branch revenue for a range time successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async refreshBranchRevenueForSpecificDay(
    @Query(new ValidationPipe({ transform: true }))
    query: RefreshSpecificRangeBranchRevenueQueryDto,
  ) {
    await this.branchRevenueService.refreshBranchRevenueForSpecificDay(query);
    return {
      message: 'Update latest branch revenue for a range time successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: 'Update latest branch revenue for a range time successfully',
    } as AppResponseDto<string>;
  }
}
