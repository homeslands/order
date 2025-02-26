import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPayment1732263799240 implements MigrationInterface {
  name = 'AddPayment1732263799240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payment_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`amount_column\` int NOT NULL, \`message_column\` varchar(255) NOT NULL, \`status_code_column\` varchar(255) NOT NULL, \`status_message_column\` varchar(255) NOT NULL, \`user_id_column\` varchar(255) NOT NULL, \`transaction_id_column\` varchar(255) NOT NULL, \`payment_method_column\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_cd48e807e4045747975f70b8f1\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_cd48e807e4045747975f70b8f1\` ON \`payment_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`payment_tbl\``);
  }
}
