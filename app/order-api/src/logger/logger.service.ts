import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from './logger.entity';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { GetLoggerRequestDto, LoggerResponseDto } from './logger.dto';
import { AppPaginatedResponseDto } from 'src/app/app.dto';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Logger)
    private readonly loggerRepository: Repository<Logger>,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async getAllLogs(query: GetLoggerRequestDto) {
    const [logs, total] = await this.loggerRepository.findAndCount({
      where: { level: query.level },
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.size,
      take: query.size,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / query.size);
    // Determine hasNext and hasPrevious
    const hasNext = query.page < totalPages;
    const hasPrevious = query.page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: this.mapper.mapArray(logs, Logger, LoggerResponseDto),
      total,
      page: query.page,
      pageSize: query.size,
      totalPages,
    } as AppPaginatedResponseDto<LoggerResponseDto>;
  }
}
