import { Injectable } from '@nestjs/common';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { UpdateGiftCardDto } from './dto/update-gift-card.dto';

@Injectable()
export class GiftCardService {
  create(createGiftCardDto: CreateGiftCardDto) {
    return 'This action adds a new giftCard';
  }

  findAll() {
    return `This action returns all giftCard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} giftCard`;
  }

  update(id: number, updateGiftCardDto: UpdateGiftCardDto) {
    return `This action updates a #${id} giftCard`;
  }

  remove(id: number) {
    return `This action removes a #${id} giftCard`;
  }
}
