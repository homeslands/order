import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionManagerService {
  constructor(private readonly dataSource: DataSource) {}

  async execute<T>(
    onSave: (manager: QueryRunner['manager']) => Promise<T>,
    onSuccess?: (result: T) => any,
    onFailure?: (error: any) => void,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const results = await onSave(queryRunner.manager);
      await queryRunner.commitTransaction();
      onSuccess(results);
      return results;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      onFailure(error);
    } finally {
      await queryRunner.release();
    }
  }
}
