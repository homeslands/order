import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { UpdateGiftCardDto } from './dto/update-gift-card.dto';

@Controller('gift-card')
export class GiftCardController {
  constructor(private readonly giftCardService: GiftCardService) {}

  @Post()
  create(@Body() createGiftCardDto: CreateGiftCardDto) {
    return this.giftCardService.create(createGiftCardDto);
  }

  @Get()
  findAll() {
    return this.giftCardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.giftCardService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGiftCardDto: UpdateGiftCardDto,
  ) {
    return this.giftCardService.update(+id, updateGiftCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.giftCardService.remove(+id);
  }
}
