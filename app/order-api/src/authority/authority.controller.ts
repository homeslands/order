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
import { AuthorityService } from './authority.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppResponseDto } from 'src/app/app.dto';
import { AuthorityResponseDto, UpdateAuthorityDto } from './authority.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';

@Controller('authority')
@ApiTags('Authority')
@ApiBearerAuth()
export class AuthorityController {
  constructor(private readonly authorityService: AuthorityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all authorities' })
  @ApiResponseWithType({
    type: AuthorityResponseDto,
    status: HttpStatus.OK,
    description: 'The authorities retrieved successfully',
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<AppResponseDto<AuthorityResponseDto[]>> {
    const result = await this.authorityService.findAll();
    return {
      message: 'The authorities retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityResponseDto[]>;
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an authority by slug' })
  @ApiResponseWithType({
    type: AuthorityResponseDto,
    status: HttpStatus.OK,
    description: 'The authority retrieved successfully',
  })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<AuthorityResponseDto>> {
    const result = await this.authorityService.findOne(slug);
    return {
      message: 'The authority retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityResponseDto>;
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update an authority' })
  @ApiResponseWithType({
    type: AuthorityResponseDto,
    status: HttpStatus.OK,
    description: 'The authority updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateAuthorityDto: UpdateAuthorityDto,
  ): Promise<AppResponseDto<AuthorityResponseDto>> {
    const result = await this.authorityService.update(slug, updateAuthorityDto);
    return {
      message: 'The authority updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityResponseDto>;
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete an authority' })
  @ApiResponseWithType({
    type: AuthorityResponseDto,
    status: HttpStatus.OK,
    description: 'The authority deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<AuthorityResponseDto>> {
    const result = await this.authorityService.delete(slug);
    return {
      message: 'The authority deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityResponseDto>;
  }
}
