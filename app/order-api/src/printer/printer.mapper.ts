import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Printer } from './entity/printer.entity';
import {
  CreatePrinterRequestDto,
  PrinterJobResponseDto,
  PrinterResponseDto,
  UpdatePrinterRequestDto,
} from './printer.dto';
import { PrinterJob } from './entity/printer-job.entity';

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
      createMap(mapper, PrinterJob, PrinterJobResponseDto);
    };
  }
}
