import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderAndOrderItemEntity1732246014546
  implements MigrationInterface
{
  name = 'AddOrderAndOrderItemEntity1732246014546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`order_item_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`quantity_column\` int NOT NULL, \`subtotal_column\` int NOT NULL, \`note_column\` varchar(255) NULL, \`order_column\` varchar(36) NULL, \`variant_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_bdb7be58424f64f8c6cc7c6162\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`order_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`subtotal_column\` int NOT NULL, \`status_column\` varchar(255) NOT NULL DEFAULT 'pending', \`type_column\` varchar(255) NOT NULL, \`table_name_column\` varchar(255) NULL, \`branch_column\` varchar(36) NULL, \`owner_column\` varchar(36) NULL, \`approval_by_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_fe669a5f1fd32302a8d33d10a1\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` ADD CONSTRAINT \`FK_bbabfa8dc8f90323ce969d97b4d\` FOREIGN KEY (\`order_column\`) REFERENCES \`order_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` ADD CONSTRAINT \`FK_6380059d68e0499272ea87bf9d9\` FOREIGN KEY (\`variant_column\`) REFERENCES \`variant_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_9535968981c1dac6c95b11291de\` FOREIGN KEY (\`branch_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_e6b7165b28ad737b59f09e3ab0e\` FOREIGN KEY (\`owner_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD CONSTRAINT \`FK_bc8a86c76b7cf293a8901b5dcde\` FOREIGN KEY (\`approval_by_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_bc8a86c76b7cf293a8901b5dcde\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_e6b7165b28ad737b59f09e3ab0e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP FOREIGN KEY \`FK_9535968981c1dac6c95b11291de\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` DROP FOREIGN KEY \`FK_6380059d68e0499272ea87bf9d9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` DROP FOREIGN KEY \`FK_bbabfa8dc8f90323ce969d97b4d\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_fe669a5f1fd32302a8d33d10a1\` ON \`order_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`order_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_bdb7be58424f64f8c6cc7c6162\` ON \`order_item_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`order_item_tbl\``);
  }
}
