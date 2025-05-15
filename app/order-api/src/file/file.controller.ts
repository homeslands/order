import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../auth/decorator/public.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppResponseDto } from 'src/app/app.dto';
import { SkipThrottle } from '@nestjs/throttler';

@ApiBearerAuth()
@Controller('file')
@ApiTags('File')
export class FileController {
  constructor(private fileService: FileService) {}

  @SkipThrottle()
  @Get(':filename')
  @Public()
  @ApiOperation({ summary: 'Get file by filename' })
  async getFile(@Param('filename') filename: string): Promise<StreamableFile> {
    const result = await this.fileService.getFile(filename);
    return new StreamableFile(result.data, {
      type: result.mimetype,
      length: result.size,
      disposition: `attachment; filename="${result.name}.${result.extension}"`,
    });
  }

  @Public()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.fileService.uploadFile(file);
    return {
      message: `File ${result.name} uploaded successfully`,
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
