import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReceipientService } from './receipient.service';
import { CreateReceipientDto } from './dto/create-receipient.dto';
import { UpdateReceipientDto } from './dto/update-receipient.dto';

@Controller('receipient')
export class ReceipientController {
  constructor(private readonly receipientService: ReceipientService) {}

  @Post()
  create(@Body() createReceipientDto: CreateReceipientDto) {
    return this.receipientService.create(createReceipientDto);
  }

  @Get()
  findAll() {
    return this.receipientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receipientService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReceipientDto: UpdateReceipientDto,
  ) {
    return this.receipientService.update(+id, updateReceipientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receipientService.remove(+id);
  }
}
