import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AuthorityGroupService } from './authority-group.service';
import { AppResponseDto } from 'src/app/app.dto';
import { AuthorityGroupResponseDto } from './authority-group.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { Public } from 'src/auth/public.decorator';

@ApiTags('Authority Group')
@Controller('authority-group')
@ApiBearerAuth()
export class AuthorityGroupController {
  constructor(private readonly authorityGroupService: AuthorityGroupService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all authority groups' })
  @ApiResponseWithType({
    type: AuthorityGroupResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'The authority groups retrieved successfully',
  })
  async findAll(): Promise<AppResponseDto<AuthorityGroupResponseDto[]>> {
    const result = await this.authorityGroupService.findAll();
    return {
      message: 'The authority groups retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AuthorityGroupResponseDto[]>;
  }
}
