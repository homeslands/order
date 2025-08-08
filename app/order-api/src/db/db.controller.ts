import {
  Controller,
  Post,
  HttpStatus,
  StreamableFile,
  Get,
  Res,
} from '@nestjs/common';
import { DbService } from './db.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppResponseDto } from 'src/app/app.dto';
import { RoleEnum } from 'src/role/role.enum';
import { HasRoles } from 'src/role/roles.decorator';
import { Response } from 'express';

@Controller('db')
@ApiTags('Database')
@ApiBearerAuth()
export class DbController {
  constructor(private readonly dbService: DbService) {}

  @Post()
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  async backup(): Promise<AppResponseDto<string>> {
    const result = await this.dbService.backup();
    return {
      message: `Sql ${result} file uploaded successfully`,
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<string>;
  }

  @Get('download')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  async downloadBackup(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    res.setTimeout(15 * 60 * 1000);
    const result = await this.dbService.downloadBackup();
    return new StreamableFile(result.data, {
      type: result.mimetype,
      length: result.size,
      disposition: `attachment; filename="${result.name}.${result.extension}"`,
    });
  }
}
