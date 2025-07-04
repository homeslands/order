import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Printer } from './printer.entity';
import {
  CreatePrinterRequestDto,
  PrinterResponseDto,
  UpdatePrinterRequestDto,
} from './printer.dto';

@Injectable()
export class PrinterProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, Printer, PrinterResponseDto);
      createMap(mapper, CreatePrinterRequestDto, Printer);
      createMap(mapper, UpdatePrinterRequestDto, Printer);
    };
  }
}
