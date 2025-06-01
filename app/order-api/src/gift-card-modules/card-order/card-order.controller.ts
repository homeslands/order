import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { CardOrderService } from './card-order.service';
import { CreateCardOrderDto } from './dto/create-card-order.dto';
import { UpdateCardOrderDto } from './dto/update-card-order.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('card-order')
@ApiTags('Card Order Resource')
@ApiBearerAuth()
export class CardOrderController {
  constructor(private readonly cardOrderService: CardOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card order' })
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createCardOrderDto: CreateCardOrderDto,
  ) {
    return this.cardOrderService.create(createCardOrderDto);
  }

  @Get()
  findAll() {
    return this.cardOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardOrderService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCardOrderDto: UpdateCardOrderDto,
  ) {
    return this.cardOrderService.update(+id, updateCardOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardOrderService.remove(+id);
  }
}
