import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthorityAuthorityGroup1741850465616
  implements MigrationInterface
{
  name = 'AddAuthorityAuthorityGroup1741850465616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`authority_group_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`code_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_01fb768f7a342a50b3692952ba\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`authority_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`code_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, \`authority_group_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_7b7dc432e8adf6b32c0367bd98\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`authority_tbl\` ADD CONSTRAINT \`FK_d6a55b9a0eece3f303176652ed7\` FOREIGN KEY (\`authority_group_column\`) REFERENCES \`authority_group_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`authority_tbl\` DROP FOREIGN KEY \`FK_d6a55b9a0eece3f303176652ed7\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7b7dc432e8adf6b32c0367bd98\` ON \`authority_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`authority_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_01fb768f7a342a50b3692952ba\` ON \`authority_group_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`authority_group_tbl\``);
  }
}
