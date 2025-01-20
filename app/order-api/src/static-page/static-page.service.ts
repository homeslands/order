import { Inject, Injectable, Logger } from "@nestjs/common";
import { CreateStaticPageDto, StaticPageResponseDto, UpdateStaticPageDto } from "./static-page.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { StaticPage } from "./static-page.entity";
import { Repository } from "typeorm";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { InjectMapper } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { StaticPageValidation } from "./static-page.validation";
import { StaticPageException } from "./static-page.exception";
import { stat } from "fs";

@Injectable()
export class StaticPageService {
  constructor(
    @InjectRepository(StaticPage)
    private readonly staticPageRepository: Repository<StaticPage>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper
  ) {}

  async create(
    createStaticPageDto: CreateStaticPageDto
  ): Promise<StaticPageResponseDto> {
    const context = `${StaticPageService.name}.${this.create.name}`;
    const existingStaticPage = await this.staticPageRepository.findOne({
      where: {
        key: createStaticPageDto.key,
      }
    });
    if(existingStaticPage) {
      this.logger.warn(
        StaticPageValidation.STATIC_PAGE_KEY_ALREADY_EXIST.message,
        context
      );
      throw new StaticPageException(StaticPageValidation.STATIC_PAGE_KEY_ALREADY_EXIST);
    }

    const staticPage = this.mapper.map(
      createStaticPageDto,
      CreateStaticPageDto,
      StaticPage
    );
    const createdStaticPage = await this.staticPageRepository.save(staticPage);
    const staticPageDto = this.mapper.map(
      createdStaticPage,
      StaticPage,
      StaticPageResponseDto
    );
    return staticPageDto;
  }

  async getByKey(key: string): Promise<StaticPageResponseDto> {
    const context = `${StaticPageService.name}.${this.getByKey.name}`;
    const staticPage = await this.staticPageRepository.findOne({
      where: {
        key,
      }
    });
    if(!staticPage) {
      this.logger.warn(
        StaticPageValidation.STATIC_PAGE_NOT_FOUND.message,
        context
      );
      throw new StaticPageException(StaticPageValidation.STATIC_PAGE_NOT_FOUND);
    }
    const staticPageDto = this.mapper.map(
      staticPage,
      StaticPage,
      StaticPageResponseDto
    );
    return staticPageDto;
  }

  async getAll(): Promise<StaticPageResponseDto[]> {
    const context = `${StaticPageService.name}.${this.getByKey.name}`;
    const staticPage = await this.staticPageRepository.find();
    if(!staticPage) {
      this.logger.warn(
        StaticPageValidation.STATIC_PAGE_NOT_FOUND.message,
        context
      );
      throw new StaticPageException(StaticPageValidation.STATIC_PAGE_NOT_FOUND);
    }
    const staticPageDto = this.mapper.mapArray(
      staticPage,
      StaticPage,
      StaticPageResponseDto
    );
    return staticPageDto;
  }

  async update(
    slug: string,
    updateStaticPageDto: UpdateStaticPageDto
  ): Promise<StaticPageResponseDto> {
    const context = `${StaticPageService.name}.${this.update.name}`;
    const staticPage = await this.staticPageRepository.findOne({
      where: {
        slug,
      }
    });
    if(!staticPage) {
      this.logger.warn(
        StaticPageValidation.STATIC_PAGE_NOT_FOUND.message,
        context
      );
      throw new StaticPageException(StaticPageValidation.STATIC_PAGE_NOT_FOUND);
    }
    
    await this.validateUpdatedKey(staticPage, updateStaticPageDto);

    const updatedStaticPage = this.mapper.map(
      updateStaticPageDto,
      UpdateStaticPageDto,
      StaticPage
    );

    Object.assign(staticPage, updatedStaticPage);
    const savedStaticPage = await this.staticPageRepository.save(staticPage);
    const staticPageDto = this.mapper.map(
      savedStaticPage,
      StaticPage,
      StaticPageResponseDto
    );
    return staticPageDto;
  }

   async validateUpdatedKey(
    staticPage: StaticPage,
    updateStaticPageDto: UpdateStaticPageDto
  ): Promise<void> {
    if(staticPage.key !== updateStaticPageDto.key) {
      const existingStaticPage = this.staticPageRepository.findOne({
        where: {
          key: updateStaticPageDto.key
        }
      });
      if(existingStaticPage) {
        throw new StaticPageException(StaticPageValidation.STATIC_PAGE_KEY_ALREADY_EXIST);
      }
    }
  }

  async remove(slug: string): Promise<StaticPageResponseDto> {
    const context = `${StaticPageService.name}.${this.remove.name}`;
    const staticPage = await this.staticPageRepository.findOne({
      where: {
        slug,
      }
    });
    if(!staticPage) {
      this.logger.warn(
        StaticPageValidation.STATIC_PAGE_NOT_FOUND.message,
        context
      );
      throw new StaticPageException(StaticPageValidation.STATIC_PAGE_NOT_FOUND);
    }
    const deletedStaticPage = await this.staticPageRepository.remove(staticPage);
    return this.mapper.map(
      deletedStaticPage,
      StaticPage,
      StaticPageResponseDto
    )
  }
}