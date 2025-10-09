import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointTransaction } from './entities/point-transaction.entity';
import {
  Between,
  FindOptionsWhere,
  IsNull,
  MoreThan,
  Repository,
} from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PointTransactionResponseDto } from './dto/point-transaction-response.dto';
import { createSortOptions } from 'src/shared/utils/obj.util';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { PointTransactionException } from './point-transaction.exception';
import { PointTransactionValidation } from './point-transaction.validation';
import { FindAllPointTransactionDto } from './dto/find-all-point-transaction.dto';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';
import {
  PointTransactionObjectTypeEnum,
  PointTransactionTypeEnum,
} from './entities/point-transaction.enum';
import { Order } from 'src/order/order.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { User } from 'src/user/user.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { fileToBase64DataUri } from 'src/shared/utils/file.util';
import {
  ExportAllPointTransactionDto,
  ExportAllSystemPointTransactionDto,
} from './dto/export-all-point-transaction.dto';
import { AuthException } from 'src/auth/auth.exception';
import { AuthValidation } from 'src/auth/auth.validation';
import { CardOrder } from '../card-order/entities/card-order.entity';
import { SharedPointTransactionService } from 'src/shared/services/shared-point-transaction.service';
import _ from 'lodash';
import { SharedExportFileService } from 'src/shared/services/shared-export-file.service';
import { ExcelConfig } from 'src/shared/interfaces/commons/excel-config.interface';
import { ExcelUtil } from 'src/shared/utils/excel.util';
import moment from 'moment';
import { ExportFilename } from 'src/shared/constants/export-filename.constant';
import { CurrencyUtil } from 'src/shared/utils/currency.util';

@Injectable()
export class PointTransactionService {
  constructor(
    @InjectRepository(PointTransaction)
    private ptRepository: Repository<PointTransaction>,
    @InjectRepository(CardOrder)
    private coRepository: Repository<CardOrder>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(GiftCard)
    private gcRepository: Repository<GiftCard>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly pdfService: PdfService,
    private readonly sharedPtService: SharedPointTransactionService,
    private readonly sharedExportFileService: SharedExportFileService,
  ) { }

  async exportAllSystem(query: ExportAllSystemPointTransactionDto) {
    const context = `${PointTransactionService.name}.${this.export.name}`;
    this.logger.log(
      `Export all point transaction req: ${JSON.stringify(query)}`,
      context,
    );

    const whereOpts: FindOptionsWhere<PointTransaction> = {};

    if (query.type) {
      whereOpts.type = query.type;
    }

    if (query.fromDate && !query.toDate) {
      whereOpts.createdAt = MoreThan(query.fromDate);
    }

    if (query.fromDate && query.toDate) {
      whereOpts.createdAt = Between(query.fromDate, query.toDate);
    }

    const pts = await this.ptRepository.find({
      where: whereOpts,
      relations: ['user'],
      order: {
        createdAt: 'ASC',
      },
    });

    const filename = ExportFilename.EXPORT_ALL_SYSTEM_POINT_TRANSACTION;
    const excelConfig = this.buildExcelConfig();
    const data = this.builData(pts);

    return await this.sharedExportFileService.exportExcel(
      filename,
      excelConfig,
      data,
    );
  }

  private buildExcelConfig() {
    const excelConfig = new ExcelConfig();
    const headers = [
      { header: 'STT', key: 'index', width: ExcelUtil.WIDTH_COL_STT },
      {
        header: 'Khách hàng',
        key: 'customerName',
        width: ExcelUtil.WIDTH_COL_MEDIUM,
      },
      {
        header: 'Số diện thoại',
        key: 'phonenumber',
        width: ExcelUtil.WIDTH_COL_MEDIUM,
      },
      {
        header: 'Loại giao dịch',
        key: 'type',
        width: ExcelUtil.WIDTH_COL_CODE,
      },
      { header: 'Số xu', key: 'points', width: ExcelUtil.WIDTH_COL_SHORT },
      { header: 'Mô tả', key: 'desc', width: ExcelUtil.WIDTH_COL_LONG },
      {
        header: 'Ngày sử dụng',
        key: 'createdAt',
        width: ExcelUtil.WIDTH_COL_SHORT,
      },
    ];
    excelConfig.headers = headers;
    return excelConfig;
  }

  private builData(data: any[]) {
    const exportData = data.map((item, index) => ({
      ...item,
      index: index + 1,
      customerName: `${item?.user?.firstName} ${item?.user?.lastName}`,
      phonenumber: item?.user?.phonenumber,
      type:
        item?.type === PointTransactionTypeEnum.IN
          ? 'Giao dịch vào'
          : 'Giao dịch ra',
      points: CurrencyUtil.formatCurrency(item?.points),
      createdAt: item.createdAt
        ? moment(item.createdAt).format('HH:mm:ss DD/MM/YYYY')
        : null,
    }));
    return exportData;
  }

  async exportAll(query: ExportAllPointTransactionDto) {
    const context = `${PointTransactionService.name}.${this.export.name}`;
    this.logger.log(
      `Export all point transaction req: ${JSON.stringify(query)}`,
      context,
    );

    const user = await this.userRepository.findOne({
      where: {
        slug: query.userSlug,
      },
    });
    if (!user) throw new AuthException(AuthValidation.USER_NOT_FOUND);

    const { userSlug } = query;

    const whereOpts: FindOptionsWhere<PointTransaction> = {};

    if (userSlug) {
      whereOpts.user = {
        slug: userSlug,
      };
    }

    if (query.type) {
      whereOpts.type = query.type;
    }

    if (query.fromDate && !query.toDate) {
      whereOpts.createdAt = MoreThan(query.fromDate);
    }

    if (query.fromDate && query.toDate) {
      whereOpts.createdAt = Between(query.fromDate, query.toDate);
    }

    const pts = await this.ptRepository.find({
      where: whereOpts,
      relations: ['user'],
      order: {
        createdAt: 'ASC',
      },
    });

    const totalIn = pts
      .filter((item) => item.type === PointTransactionTypeEnum.IN)
      .reduce((prev, cur) => prev + cur.points, 0);
    const totalOut = pts
      .filter((item) => item.type === PointTransactionTypeEnum.OUT)
      .reduce((prev, cur) => prev + cur.points, 0);
    let totalPoints = 0;

    if (!_.isEmpty(pts)) {
      const lastItem = pts.at(pts.length - 1);
      if (lastItem.type === PointTransactionTypeEnum.IN)
        totalPoints = +lastItem.balance + lastItem.points;
      else totalPoints = +lastItem.balance - lastItem.points;
    }

    const logoUri = fileToBase64DataUri('public/images/logo.png', 'image/png');
    const exportAt = new Date();

    return await this.pdfService.generatePdf(
      'point-transactions',
      {
        logoUri,
        pts,
        exportAt,
        user,
        query,
        totalIn,
        totalOut,
        totalPoints,
      },
      {
        format: 'A4',
      },
    );
  }

  async export(slug: string) {
    const context = `${PointTransactionService.name}.${this.export.name}`;
    this.logger.log(`Export point transaction req: ${slug}`, context);

    const pt = await this.ptRepository.findOne({
      where: {
        slug,
      },
      relations: ['user'],
    });
    if (!pt)
      throw new PointTransactionException(
        PointTransactionValidation.POINT_TRANSACTION_NOT_FOUND,
      );

    const ref: Order | GiftCard | CardOrder = await this.getObjectRef({
      objectType: pt.objectType,
      objectSlug: pt.objectSlug,
    });

    const logoUri = fileToBase64DataUri('public/images/logo.png', 'image/png');

    return await this.pdfService.generatePdf(
      'point-transaction',
      {
        logoUri,
        ref,
        ...pt,
      },
      {
        width: '80mm',
      },
    );
  }

  async getObjectRef(payload: { objectType: string; objectSlug: string }) {
    let objectRef: Order | GiftCard | CardOrder = null;

    switch (payload.objectType) {
      case PointTransactionObjectTypeEnum.ORDER:
        objectRef = await this.orderRepository.findOne({
          where: { slug: payload.objectSlug },
        });
        break;
      case PointTransactionObjectTypeEnum.GIFT_CARD:
        objectRef = await this.gcRepository.findOne({
          where: { slug: payload.objectSlug },
          relations: ['cardOrder'],
        });
        break;
      case PointTransactionObjectTypeEnum.CARD_ORDER:
        objectRef = await this.coRepository.findOne({
          where: { slug: payload.objectSlug },
          relations: ['payment'],
        });
        break;
      default:
        throw new PointTransactionException(
          PointTransactionValidation.OBJECT_TYPE_NOT_FOUND,
        );
    }
    return objectRef;
  }

  async create(req: CreatePointTransactionDto) {
    const pt = await this.sharedPtService.create(req);
    return this.mapper.map(pt, PointTransaction, PointTransactionResponseDto);
    // const context = `${PointTransaction.name}.${this.create.name}`;
    // this.logger.log(
    //   `Create point transaction req; ${JSON.stringify(req)}`,
    //   context,
    // );

    // const payload = this.mapper.map(
    //   req,
    //   CreatePointTransactionDto,
    //   PointTransaction,
    // );

    // if (
    //   payload.type === PointTransactionTypeEnum.IN &&
    //   payload.objectType === PointTransactionObjectTypeEnum.ORDER
    // ) {
    //   throw new PointTransactionException(
    //     PointTransactionValidation.INVALID_IN_ORDER_TRANSACTION,
    //   );
    // }

    // if (
    //   payload.type === PointTransactionTypeEnum.OUT &&
    //   payload.objectType === PointTransactionObjectTypeEnum.GIFT_CARD
    // ) {
    //   throw new PointTransactionException(
    //     PointTransactionValidation.INVALID_OUT_ORDER_TRANSACTION,
    //   );
    // }

    // if (
    //   payload.type === PointTransactionTypeEnum.OUT &&
    //   payload.objectType === PointTransactionObjectTypeEnum.CARD_ORDER
    // ) {
    //   throw new PointTransactionException(
    //     PointTransactionValidation.INVALID_OUT_CARD_ORDER_TRANSACTION,
    //   );
    // }

    // let objectRef: Order | GiftCard | CardOrder = null;

    // switch (payload.objectType) {
    //   case PointTransactionObjectTypeEnum.ORDER:
    //     objectRef = await this.orderRepository.findOne({
    //       where: { slug: payload.objectSlug },
    //     });
    //     break;
    //   case PointTransactionObjectTypeEnum.GIFT_CARD:
    //     objectRef = await this.gcRepository.findOne({
    //       where: { slug: payload.objectSlug },
    //     });
    //     break;
    //   case PointTransactionObjectTypeEnum.CARD_ORDER:
    //     objectRef = await this.coRepository.findOne({
    //       where: { slug: payload.objectSlug },
    //     });
    //     break;
    //   default:
    //     throw new PointTransactionException(
    //       PointTransactionValidation.OBJECT_TYPE_NOT_FOUND,
    //     );
    // }

    // if (!objectRef)
    //   throw new PointTransactionException(
    //     PointTransactionValidation.OBJECT_TYPE_NOT_FOUND,
    //   );

    // const user = await this.userRepository.findOne({
    //   where: {
    //     slug: payload.userSlug,
    //   },
    // });

    // if (!user)
    //   throw new PointTransactionException(
    //     PointTransactionValidation.USER_NOT_FOUND,
    //   );

    // Object.assign(payload, {
    //   objectId: objectRef.id,
    //   userId: user.id,
    //   user: user,
    // } as Partial<PointTransaction>);

    // const pt = await this.transactionService.execute<PointTransaction>(
    //   async (manager) => {
    //     return manager.save(payload);
    //   },
    //   (res) =>
    //     this.logger.log(
    //       `Point transaction created: ${JSON.stringify(res)}`,
    //       context,
    //     ),
    //   (err) => {
    //     this.logger.error(
    //       `Error when creating point transaction: ${err.message}`,
    //       err.stack,
    //       context,
    //     );
    //     throw new PointTransactionException(
    //       PointTransactionValidation.ERROR_WHEN_CREATE_POINT_TRANSACTION,
    //     );
    //   },
    // );
    // return this.mapper.map(pt, PointTransaction, PointTransactionResponseDto);
  }

  async findAll(req: FindAllPointTransactionDto) {
    const context = `${PointTransactionService.name}.${this.findAll.name}`;
    this.logger.log(
      `Find all point transaction: ${JSON.stringify(req)}`,
      context,
    );

    const { page, size, sort, userSlug } = req;

    const whereOpts: FindOptionsWhere<PointTransaction> = {};

    if (userSlug) {
      whereOpts.user = {
        slug: userSlug,
      };
    }

    if (req.type) {
      whereOpts.type = req.type;
    }

    if (req.fromDate && !req.toDate) {
      whereOpts.createdAt = MoreThan(req.fromDate);
    }

    if (req.fromDate && req.toDate) {
      whereOpts.createdAt = Between(req.fromDate, req.toDate);
    }

    const sortOpts = createSortOptions<PointTransaction>(sort);

    const [pts, total] = await this.ptRepository.findAndCount({
      where: whereOpts,
      order: sortOpts,
      take: size,
      skip: (page - 1) * size,
      relations: ['user'],
    });
    const cardsResponse = this.mapper.mapArray(
      pts,
      PointTransaction,
      PointTransactionResponseDto,
    );
    // Calculate total pages
    const totalPages = Math.ceil(total / size);
    // Determine hasNext and hasPrevious
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: cardsResponse,
      total,
      page: page,
      pageSize: size,
      totalPages,
    } as AppPaginatedResponseDto<PointTransactionResponseDto>;
  }

  async findOne(slug: string) {
    const context = `${PointTransactionService.name}.${this.findOne.name}`;
    this.logger.log(`Find point transaction: ${JSON.stringify(slug)}`, context);

    const pt = await this.ptRepository.findOne({
      where: {
        slug: slug ?? IsNull(),
      },
      relations: ['user'],
    });
    if (!pt)
      throw new PointTransactionException(
        PointTransactionValidation.POINT_TRANSACTION_NOT_FOUND,
      );
    return this.mapper.map(pt, PointTransaction, PointTransactionResponseDto);
  }
}
