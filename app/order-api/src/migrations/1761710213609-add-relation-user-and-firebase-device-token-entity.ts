import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationUserAndFirebaseDeviceTokenEntity1761710213609
  implements MigrationInterface
{
  name = 'AddRelationUserAndFirebaseDeviceTokenEntity1761710213609';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`firebase_device_token_tbl\` ADD \`user_id_column\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`firebase_device_token_tbl\` ADD \`user_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_798f04d61042bd2493b30cc8f2\` ON \`firebase_device_token_tbl\` (\`user_id_column\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`firebase_device_token_tbl\` ADD CONSTRAINT \`FK_c688993ae6db7e8ebd9e7c39f2e\` FOREIGN KEY (\`user_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`firebase_device_token_tbl\` DROP FOREIGN KEY \`FK_c688993ae6db7e8ebd9e7c39f2e\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_798f04d61042bd2493b30cc8f2\` ON \`firebase_device_token_tbl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`firebase_device_token_tbl\` DROP COLUMN \`user_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`firebase_device_token_tbl\` DROP COLUMN \`user_id_column\``,
    );
  }
}
