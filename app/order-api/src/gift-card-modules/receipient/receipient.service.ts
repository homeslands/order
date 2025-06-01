import { Injectable } from '@nestjs/common';
import { CreateReceipientDto } from './dto/create-receipient.dto';
import { UpdateReceipientDto } from './dto/update-receipient.dto';

@Injectable()
export class ReceipientService {
  create(createReceipientDto: CreateReceipientDto) {
    return 'This action adds a new receipient';
  }

  findAll() {
    return `This action returns all receipient`;
  }

  findOne(id: number) {
    return `This action returns a #${id} receipient`;
  }

  update(id: number, updateReceipientDto: UpdateReceipientDto) {
    return `This action updates a #${id} receipient`;
  }

  remove(id: number) {
    return `This action removes a #${id} receipient`;
  }
}
