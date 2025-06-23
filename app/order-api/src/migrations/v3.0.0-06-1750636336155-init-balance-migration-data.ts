import { getRandomString } from 'src/helper';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class InitBalanceMigrationData1750636336155
  implements MigrationInterface
{
  balanceTableName = 'balance_tbl';
  userTableName = 'user_tbl';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const users: { id_column: string }[] = await queryRunner.query(`
            SELECT id_column FROM ${this.userTableName}
            WHERE id_column NOT IN (SELECT user_column FROM ${this.balanceTableName})
        `);

    for (const user of users) {
      const id = uuidv4();
      const slug = getRandomString();

      await queryRunner.query(
        `
                INSERT INTO ${this.balanceTableName} (id_column, slug_column, points_column, user_column)
                VALUES (?, ?, ?, ?)
            `,
        [id, slug, 0.0, user.id_column],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM ${this.balanceTableName}
            WHERE user_column IN (
            SELECT id_column FROM ${this.userTableName})
        `);
  }
}
