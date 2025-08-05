import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { FindAllCardDto } from './dto/find-all-card.dto';
import { CustomFileInterceptor } from 'src/file/custom-interceptor';
import { CardResponseDto } from './dto/card-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';

@Controller('card')
@ApiBearerAuth()
@ApiTags('Card Resource')
export class CardController {
  constructor(private readonly cardService: CardService) { }

  @UseInterceptors(
    new CustomFileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new card' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new card was created successfully',
    type: CardResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        price: {
          type: 'number',
        },
        points: {
          type: 'number',
        },
        isActive: {
          type: 'boolean',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createCardDto: CreateCardDto,
  ) {
    const result = await this.cardService.create(createCardDto, file);
    return {
      message: 'The new card was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardResponseDto>;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all cards' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All cards have been retrieved successfully',
    type: CardResponseDto,
    isArray: true,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: FindAllCardDto,
  ) {
    const result = await this.cardService.findAll(query);
    return {
      message: 'The cards were fetched successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<CardResponseDto>>;
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a card by slug' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The card was fetched successfully',
    type: CardResponseDto,
  })
  async findOne(@Param('slug') slug: string) {
    const result = await this.cardService.findOne(slug);
    return {
      message: 'The card was fetched successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a card by slug' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The card was updated successfully',
    type: CardResponseDto,
  })
  @UseInterceptors(
    new CustomFileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        price: {
          type: 'number',
        },
        points: {
          type: 'number',
        },
        version: {
          type: 'number',
        },
        isActive: {
          type: 'boolean',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async update(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateCardDto: UpdateCardDto,
  ) {
    const result = await this.cardService.update(slug, file, updateCardDto);
    return {
      message: 'The card was updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a card by slug' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The card was deleted successfully',
    type: CardResponseDto,
  })
  async remove(@Param('slug') slug: string) {
    const result = await this.cardService.remove(slug);
    return {
      message: 'The card was deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardResponseDto>;
  }
}
