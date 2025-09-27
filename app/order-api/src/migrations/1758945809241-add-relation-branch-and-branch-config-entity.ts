import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationBranchAndBranchConfigEntity1758945809241
  implements MigrationInterface
{
  name = 'AddRelationBranchAndBranchConfigEntity1758945809241';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_config_tbl\` ADD \`branch_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_b0d23952bd10820c5220b08c82\` ON \`branch_config_tbl\` (\`key_column\`, \`branch_column\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_config_tbl\` ADD CONSTRAINT \`FK_0087f080ea6bf5c58a9527601d5\` FOREIGN KEY (\`branch_column\`) REFERENCES \`branch_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_config_tbl\` DROP FOREIGN KEY \`FK_0087f080ea6bf5c58a9527601d5\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b0d23952bd10820c5220b08c82\` ON \`branch_config_tbl\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_config_tbl\` DROP COLUMN \`branch_column\``,
    );
  }
}
