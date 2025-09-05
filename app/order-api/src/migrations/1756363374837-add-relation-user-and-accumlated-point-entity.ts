import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationUserAndAccumlatedPointEntity1756363374837
  implements MigrationInterface
{
  name = 'AddRelationUserAndAccumlatedPointEntity1756363374837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_tbl\` ADD \`user_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_tbl\` ADD CONSTRAINT \`FK_d147c1e6ca5657e84c64cfe956a\` FOREIGN KEY (\`user_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_tbl\` DROP FOREIGN KEY \`FK_d147c1e6ca5657e84c64cfe956a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_tbl\` DROP COLUMN \`user_column\``,
    );
  }
}
