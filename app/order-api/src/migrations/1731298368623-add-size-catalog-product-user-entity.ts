import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSizeCatalogProductUserEntity1731298368623
  implements MigrationInterface
{
  name = 'AddSizeCatalogProductUserEntity1731298368623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`size_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_5dca1ee353b510b6a216c0b10a\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`catalog_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_6d7cdb0d8786eeb979a49f9495\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`product_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, \`is_active_column\` tinyint NOT NULL DEFAULT 1, \`is_limit_column\` tinyint NOT NULL DEFAULT 1, \`image_column\` varchar(255) NULL, \`rating_column\` int NULL, \`catalog_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_0a9a0a7fabecf3158db11a16fe\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`variant_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`price_column\` int NOT NULL, \`size_column\` varchar(36) NULL, \`product_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_512c03d08f80f8d3525b452c1f\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`phonenumber_column\` varchar(255) NOT NULL, \`password_column\` varchar(255) NOT NULL, \`first_name_column\` varchar(255) NOT NULL, \`last_name_column\` varchar(255) NOT NULL, \`is_active_column\` tinyint NOT NULL DEFAULT 1, \`dob_column\` varchar(255) NULL, \`email_column\` varchar(255) NULL, \`address_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_3842ddd99ca5836e20c666401a\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`logger\` (\`id\` int NOT NULL AUTO_INCREMENT, \`level\` varchar(255) NOT NULL, \`message\` varchar(255) NOT NULL, \`context\` tinyint NOT NULL DEFAULT 1, \`timestamp\` varchar(255) NOT NULL, \`pid\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD CONSTRAINT \`FK_efe95e82d6cbed87edf39ad994d\` FOREIGN KEY (\`catalog_column\`) REFERENCES \`catalog_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`variant_tbl\` ADD CONSTRAINT \`FK_d84d002767b3983b596833e5607\` FOREIGN KEY (\`size_column\`) REFERENCES \`size_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`variant_tbl\` ADD CONSTRAINT \`FK_e48e2688bea27aea5e32982236f\` FOREIGN KEY (\`product_column\`) REFERENCES \`product_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`variant_tbl\` DROP FOREIGN KEY \`FK_e48e2688bea27aea5e32982236f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`variant_tbl\` DROP FOREIGN KEY \`FK_d84d002767b3983b596833e5607\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP FOREIGN KEY \`FK_efe95e82d6cbed87edf39ad994d\``,
    );
    await queryRunner.query(`DROP TABLE \`logger\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_3842ddd99ca5836e20c666401a\` ON \`user_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`user_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_512c03d08f80f8d3525b452c1f\` ON \`variant_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`variant_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0a9a0a7fabecf3158db11a16fe\` ON \`product_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`product_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_6d7cdb0d8786eeb979a49f9495\` ON \`catalog_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`catalog_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5dca1ee353b510b6a216c0b10a\` ON \`size_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`size_tbl\``);
  }
}
