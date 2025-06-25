import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePointTransactionMigration1750679470362
  implements MigrationInterface
{
  name = 'CreatePointTransactionMigration1750679470362';
  table = 'point_transaction_tbl';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('point_transaction_tbl');

    if (!tableExists)
      await queryRunner.query(
        `CREATE TABLE \`point_transaction_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`type_column\` varchar(255) NOT NULL, \`desc_column\` varchar(255) NULL, \`object_id_column\` varchar(255) NOT NULL, \`object_type_column\` varchar(255) NOT NULL, \`object_slug_column\` varchar(255) NOT NULL, \`points_column\` int NOT NULL, \`user_id_column\` varchar(255) NOT NULL, \`user_slug_column\` varchar(255) NOT NULL, \`user_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_ea94e9e0de39421a3c87370f05\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
      );

    await queryRunner.query(
      `ALTER TABLE \`point_transaction_tbl\` ADD CONSTRAINT \`FK_0ee63f370646014dfdfd46a6435\` FOREIGN KEY (\`user_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`point_transaction_tbl\` DROP FOREIGN KEY \`FK_0ee63f370646014dfdfd46a6435\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ea94e9e0de39421a3c87370f05\` ON \`point_transaction_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`point_transaction_tbl\``);
  }
}
