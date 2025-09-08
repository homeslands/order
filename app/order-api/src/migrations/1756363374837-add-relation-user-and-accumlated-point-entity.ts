import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationUserAndAccumlatedPointEntity1756363374837
  implements MigrationInterface
{
  name = 'AddRelationUserAndAccumlatedPointEntity1756363374837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD \`accumulated_point_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD UNIQUE INDEX \`IDX_4bf612cd5546f2fc59895eb3f5\` (\`accumulated_point_column\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_4bf612cd5546f2fc59895eb3f5\` ON \`user_tbl\` (\`accumulated_point_column\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD CONSTRAINT \`FK_4bf612cd5546f2fc59895eb3f51\` FOREIGN KEY (\`accumulated_point_column\`) REFERENCES \`accumulated_point_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP FOREIGN KEY \`FK_4bf612cd5546f2fc59895eb3f51\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_4bf612cd5546f2fc59895eb3f5\` ON \`user_tbl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP INDEX \`IDX_4bf612cd5546f2fc59895eb3f5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP COLUMN \`accumulated_point_column\``,
    );
  }
}
