import { Inject, Injectable, Logger } from '@nestjs/common';
import { InvoiceItem } from './invoice-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DiscountType } from 'src/order/order.constants';

@Injectable()
export class InvoiceItemService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}
  create() {
    return 'This action adds a new invoiceItem';
  }

  findAll() {
    return `This action returns all invoiceItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invoiceItem`;
  }

  update(id: number) {
    return `This action updates a #${id} invoiceItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoiceItem`;
  }

  async updateDiscountTypeForExistedInvoiceItem() {
    const context = `${InvoiceItemService.name}.${this.updateDiscountTypeForExistedInvoiceItem.name}`;
    const batchSize = 500;
    let offset = 0;
    let totalUpdated = 0;

    while (true) {
      const batch = await this.invoiceItemRepository.find({
        where: { discountType: DiscountType.NONE },
        take: batchSize,
        skip: offset,
        order: { id: 'ASC' },
      });

      if (batch.length === 0) break;

      const updatedBatch: InvoiceItem[] = [];
      for (const item of batch) {
        if (item.promotionId) {
          item.discountType = DiscountType.PROMOTION;
          updatedBatch.push(item);
        }
      }

      await this.transactionManagerService.execute<void>(
        async (manager) => {
          await manager.save(updatedBatch);
        },
        () => {
          this.logger.log(
            `Processed batch from offset ${offset}, updated ${updatedBatch.length} items.`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error updating batch at offset ${offset}: ${error.message}`,
            context,
          );
        },
      );

      totalUpdated += updatedBatch.length;
      offset += batchSize;
    }
    this.logger.log(
      `Finished updating total ${totalUpdated} invoice items.`,
      context,
    );
  }
}
