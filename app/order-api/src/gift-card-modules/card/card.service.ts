import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { FindAllCardDto } from './dto/find-all-card.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CardResponseDto } from './dto/card-response.dto';
import { FileService } from 'src/file/file.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { CardValidation } from './card.validation';
import { CardException } from './card.exception';
import { AppPaginatedResponseDto } from 'src/app/app.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly fileService: FileService,
    private readonly transactionService: TransactionManagerService,
  ) { }

  async create(
    createCardDto: CreateCardDto,
    file: Express.Multer.File,
  ): Promise<CardResponseDto> {
    const context = `${CardService.name}.${this.create.name}`;
    this.logger.log(`Creating card: ${JSON.stringify(createCardDto)}`, context);

    const image = file ? await this.fileService.uploadFile(file) : null;
    const card = this.mapper.map(createCardDto, CreateCardDto, Card);
    if (image) card.image = image.name;

    return await this.transactionService.execute(
      async (manager) => {
        const savedCard = await manager.save(card);
        return this.mapper.map(savedCard, Card, CardResponseDto);
      },
      (result) => {
        this.logger.log(`Card created: ${result.title}`, context);
        return result;
      },
      async (error) => {
        if (image) await this.fileService.removeFile(image.name);
        this.logger.error(
          `Error creating card: ${error.message}`,
          error.stack,
          context,
        );
        throw new CardException(
          CardValidation.ERROR_WHEN_CREATE_CARD,
          error.message,
        );
      },
    );
  }

  async findAll(
    query: FindAllCardDto,
  ): Promise<AppPaginatedResponseDto<CardResponseDto>> {
    const { page, size, isActive, sort } = query;
    const where: FindOptionsWhere<Card> = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [cards, total] = await this.cardRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      where,
      order:
        sort.length > 0
          ? sort.reduce((acc, sort) => {
            const [field, direction] = sort.split(',');
            acc[field] = direction?.toUpperCase() as 'ASC' | 'DESC';
            return acc;
          }, {} as FindOptionsOrder<Card>)
          : { createdAt: 'DESC' },
    });
    const cardsResponse = this.mapper.mapArray(cards, Card, CardResponseDto);
    // Calculate total pages
    const totalPages = Math.ceil(total / query.size);
    // Determine hasNext and hasPrevious
    const hasNext = query.page < totalPages;
    const hasPrevious = query.page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: cardsResponse,
      total,
      page: query.page,
      pageSize: query.size,
      totalPages,
    } as AppPaginatedResponseDto<CardResponseDto>;
  }

  async findOne(slug: string): Promise<CardResponseDto> {
    const context = `${CardService.name}.${this.findOne.name}`;
    const card = await this.cardRepository.findOne({ where: { slug } });
    if (!card) {
      this.logger.debug(`Card not found: ${slug}`, context);
      throw new CardException(CardValidation.CARD_NOT_FOUND);
    }
    return this.mapper.map(card, Card, CardResponseDto);
  }

  async update(
    slug: string,
    file: Express.Multer.File,
    updateCardDto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    const context = `${CardService.name}.${this.update.name}`;
    this.logger.log(`Updating card: ${JSON.stringify(updateCardDto)}`, context);

    const card = await this.cardRepository.findOne({ where: { slug } });
    if (!card) {
      this.logger.debug(`Card not found: ${slug}`, context);
      throw new CardException(CardValidation.CARD_NOT_FOUND);
    }

    if (card.version !== updateCardDto.version) {
      throw new CardException(HttpStatus.CONFLICT);
    }

    const image = file ? await this.fileService.uploadFile(file) : null;
    if (card.image && image) {
      await this.fileService.removeFile(card.image);
    }
    if (image) card.image = image.name;
    card.title = updateCardDto.title;
    card.description = updateCardDto.description;
    card.points = updateCardDto.points;
    card.price = updateCardDto.price;
    card.isActive = updateCardDto.isActive;

    return await this.transactionService.execute<CardResponseDto>(
      async (manager) => {
        const savedCard = await manager.save(card);
        return this.mapper.map(savedCard, Card, CardResponseDto);
      },
      (result) => {
        this.logger.log(`Card updated: ${result.title}`, context);
        return result;
      },
      (error) => {
        this.logger.error(
          `Error updating card: ${error.message}`,
          error.stack,
          context,
        );
        throw new CardException(
          CardValidation.ERROR_WHEN_UPDATE_CARD,
          error.message,
        );
      },
    );
  }

  async remove(slug: string): Promise<CardResponseDto> {
    const context = `${CardService.name}.${this.remove.name}`;
    this.logger.log(`Removing card: ${slug}`, context);

    const card = await this.cardRepository.findOne({ where: { slug } });
    if (!card) {
      this.logger.debug(`Card not found: ${slug}`, context);
      throw new CardException(CardValidation.CARD_NOT_FOUND);
    }

    return await this.transactionService.execute<CardResponseDto>(
      async (manager) => {
        await manager.softRemove(card);
        return this.mapper.map(card, Card, CardResponseDto);
      },
      (result) => {
        this.logger.log(`Card removed: ${result.title}`, context);
        return result;
      },
      (error) => {
        this.logger.error(
          `Error removing card: ${error.message}`,
          error.stack,
          context,
        );
        throw new CardException(
          CardValidation.ERROR_WHEN_REMOVE_CARD,
          error.message,
        );
      },
    );
  }
}
