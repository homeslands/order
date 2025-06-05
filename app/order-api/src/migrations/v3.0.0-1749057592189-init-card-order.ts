import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCardOrder1749057592189 implements MigrationInterface {
  name = 'InitCardOrder1749057592189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`gift_card_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`card_name_column\` varchar(255) NOT NULL, \`card_points_column\` int NOT NULL, \`status_column\` varchar(255) NOT NULL DEFAULT 'available', \`serial_number_column\` varchar(255) NOT NULL, \`code_column\` varchar(255) NOT NULL, \`card_order_id_column\` varchar(255) NOT NULL, \`used_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`used_by_column\` varchar(255) NULL, \`expired_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`card_order_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_d21b079db66a8063ed0b13baf0\` (\`slug_column\`), UNIQUE INDEX \`IDX_788b0ab93e28eea367ccca6b09\` (\`serial_number_column\`), UNIQUE INDEX \`IDX_b9a7df05ee234851941cfbe17c\` (\`code_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`receipient_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`quantity_column\` int NOT NULL, \`status_column\` varchar(255) NOT NULL DEFAULT 'pending', \`message_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`phone_column\` varchar(255) NOT NULL, \`recipient_id_column\` varchar(255) NOT NULL, \`sender_id_column\` varchar(255) NOT NULL, \`sender_name_column\` varchar(255) NOT NULL, \`sender_phone_column\` varchar(255) NOT NULL, \`card_order_id_column\` varchar(255) NULL, \`recipient_column\` varchar(36) NULL, \`sender_column\` varchar(36) NULL, \`card_order_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_c2956c686af857844b71a8aee1\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`card_order_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`type_column\` varchar(255) NOT NULL, \`status_column\` varchar(255) NOT NULL DEFAULT 'pending', \`total_amount_column\` int NOT NULL, \`order_date_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`quantity_column\` int NOT NULL, \`card_id_column\` varchar(255) NOT NULL, \`card_title_column\` varchar(255) NOT NULL, \`card_point_column\` int NOT NULL, \`card_image_column\` varchar(255) NULL, \`card_price_column\` int NOT NULL, \`customer_id_column\` varchar(255) NOT NULL, \`customer_name_column\` varchar(255) NOT NULL, \`customer_phone_column\` varchar(255) NOT NULL, \`cashier_id_column\` varchar(255) NULL, \`cashier_name_column\` varchar(255) NULL, \`cashier_phone_column\` varchar(255) NULL, \`payment_status_column\` varchar(255) NOT NULL DEFAULT 'pending', \`payment_method_column\` varchar(255) NULL, \`card_column\` varchar(36) NULL, \`customer_column\` varchar(36) NULL, \`cashier_column\` varchar(36) NULL, \`payment_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_8e4c205bc489404c2dbda71997\` (\`slug_column\`), UNIQUE INDEX \`REL_ce7b152dbd47f47b570120f026\` (\`payment_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`balance_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`points_column\` decimal(10,2) NOT NULL DEFAULT '0.00', \`user_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_97e0639ba0fc2f7429784194dc\` (\`slug_column\`), UNIQUE INDEX \`REL_622fc043e34b6fb281cb73e96b\` (\`user_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` ADD CONSTRAINT \`FK_74d82b0a20a03070d87b4cea358\` FOREIGN KEY (\`card_order_column\`) REFERENCES \`card_order_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`receipient_tbl\` ADD CONSTRAINT \`FK_0ccac2b0b35d2ffb2e3b8a7bada\` FOREIGN KEY (\`recipient_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`receipient_tbl\` ADD CONSTRAINT \`FK_422d88cc299da5044e4f4fb2ce7\` FOREIGN KEY (\`sender_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`receipient_tbl\` ADD CONSTRAINT \`FK_1f77eb372d6efb1bc13a670d937\` FOREIGN KEY (\`card_order_column\`) REFERENCES \`card_order_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` ADD CONSTRAINT \`FK_8c74955cd943f2dae6d84aeac24\` FOREIGN KEY (\`card_column\`) REFERENCES \`card_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` ADD CONSTRAINT \`FK_12c6ffead231be5a11949170db0\` FOREIGN KEY (\`customer_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` ADD CONSTRAINT \`FK_3b40aac75acc5a2e3c5b6d67c47\` FOREIGN KEY (\`cashier_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` ADD CONSTRAINT \`FK_ce7b152dbd47f47b570120f026e\` FOREIGN KEY (\`payment_column\`) REFERENCES \`payment_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`balance_tbl\` ADD CONSTRAINT \`FK_622fc043e34b6fb281cb73e96be\` FOREIGN KEY (\`user_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Insert balance = 0 for existing users
    await queryRunner.query(
      `INSERT INTO \`balance_tbl\` (\`id_column\`, \`points_column\`, \`user_column\`) SELECT UUID(), 0, \`id_column\` FROM \`user_tbl\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`balance_tbl\` DROP FOREIGN KEY \`FK_622fc043e34b6fb281cb73e96be\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP FOREIGN KEY \`FK_ce7b152dbd47f47b570120f026e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP FOREIGN KEY \`FK_3b40aac75acc5a2e3c5b6d67c47\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP FOREIGN KEY \`FK_12c6ffead231be5a11949170db0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP FOREIGN KEY \`FK_8c74955cd943f2dae6d84aeac24\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`receipient_tbl\` DROP FOREIGN KEY \`FK_1f77eb372d6efb1bc13a670d937\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`receipient_tbl\` DROP FOREIGN KEY \`FK_422d88cc299da5044e4f4fb2ce7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`receipient_tbl\` DROP FOREIGN KEY \`FK_0ccac2b0b35d2ffb2e3b8a7bada\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_card_tbl\` DROP FOREIGN KEY \`FK_74d82b0a20a03070d87b4cea358\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_622fc043e34b6fb281cb73e96b\` ON \`balance_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97e0639ba0fc2f7429784194dc\` ON \`balance_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`balance_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`REL_ce7b152dbd47f47b570120f026\` ON \`card_order_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_8e4c205bc489404c2dbda71997\` ON \`card_order_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`card_order_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_c2956c686af857844b71a8aee1\` ON \`receipient_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`receipient_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_b9a7df05ee234851941cfbe17c\` ON \`gift_card_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_788b0ab93e28eea367ccca6b09\` ON \`gift_card_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d21b079db66a8063ed0b13baf0\` ON \`gift_card_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`gift_card_tbl\``);
  }
}
