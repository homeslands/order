import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { AuthorityGroupService } from './authority-group.service';
import { AppResponseDto } from 'src/app/app.dto';
import {
  AuthorityGroupResponseDto,
  UpdateAuthorityGroupDto,
} from './authority-group.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';

@ApiTags('Authority Group')
@Controller('authority-group')
@ApiBearerAuth()
export class AuthorityGroupController {
  constructor(private readonly authorityGroupService: AuthorityGroupService) {}

  @Get()
  @ApiOperation({ summary: 'Get all authority groups' })
  @ApiResponseWithType({
    type: AuthorityGroupResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'The authority groups retrieved successfully',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<AppResponseDto<AuthorityGroupResponseDto[]>> {
    const result = await this.authorityGroupService.findAll();
    return {
      message: 'The authority groups retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityGroupResponseDto[]>;
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update an authority group' })
  @ApiResponseWithType({
    type: AuthorityGroupResponseDto,
    status: HttpStatus.OK,
    description: 'The authority group updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateAuthorityGroupDto: UpdateAuthorityGroupDto,
  ): Promise<AppResponseDto<AuthorityGroupResponseDto>> {
    const result = await this.authorityGroupService.update(
      slug,
      updateAuthorityGroupDto,
    );
    return {
      message: 'The authority group updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityGroupResponseDto>;
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete an authority group' })
  @ApiResponseWithType({
    type: AuthorityGroupResponseDto,
    status: HttpStatus.OK,
    description: 'The authority group deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<AuthorityGroupResponseDto>> {
    const result = await this.authorityGroupService.delete(slug);
    return {
      message: 'The authority group deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityGroupResponseDto>;
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an authority group by slug' })
  @ApiResponseWithType({
    type: AuthorityGroupResponseDto,
    status: HttpStatus.OK,
    description: 'The authority group retrieved successfully',
  })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<AuthorityGroupResponseDto>> {
    const result = await this.authorityGroupService.findOne(slug);
    return {
      message: 'The authority group retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityGroupResponseDto>;
  }
}
