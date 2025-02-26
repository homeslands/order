import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBranchMenuMenuitem1731551431663
  implements MigrationInterface
{
  name = 'CreateBranchMenuMenuitem1731551431663';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`branch_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`address_column\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_fdbd66162fdc2accee313b75bb\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`menu_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`day_column\` varchar(255) NOT NULL, \`branch_id_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_6ceb8ad1d1418f6af556803f6f\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`menu_item_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`default_stock_column\` int NOT NULL, \`current_stock_column\` int NOT NULL, \`menu_id_column\` varchar(36) NULL, \`product_id_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_b1d192ffd1e67e45905f8f021d\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` ADD CONSTRAINT \`FK_7501d310528f10646e2b12d0c5d\` FOREIGN KEY (\`branch_id_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` ADD CONSTRAINT \`FK_9a670e4a3adf7081954726c02eb\` FOREIGN KEY (\`menu_id_column\`) REFERENCES \`menu_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` ADD CONSTRAINT \`FK_56b146150311ea4f8a7db4ab19c\` FOREIGN KEY (\`product_id_column\`) REFERENCES \`product_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` DROP FOREIGN KEY \`FK_56b146150311ea4f8a7db4ab19c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` DROP FOREIGN KEY \`FK_9a670e4a3adf7081954726c02eb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` DROP FOREIGN KEY \`FK_7501d310528f10646e2b12d0c5d\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b1d192ffd1e67e45905f8f021d\` ON \`menu_item_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`menu_item_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_6ceb8ad1d1418f6af556803f6f\` ON \`menu_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`menu_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_fdbd66162fdc2accee313b75bb\` ON \`branch_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`branch_tbl\``);
  }
}
