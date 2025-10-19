import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoinPolicySchemaMigration1760690641411 implements MigrationInterface {
    name = 'CreateCoinPolicySchemaMigration1760690641411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`coin_policy_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`key_column\` varchar(255) NOT NULL, \`name_column\` varchar(255) NULL, \`description_column\` text NULL, \`value_column\` varchar(255) NOT NULL, \`is_active_column\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_d42df2c178e0a676aa00f94139\` (\`slug_column\`), UNIQUE INDEX \`IDX_4615332454e8b08536bcabf346\` (\`key_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_4615332454e8b08536bcabf346\` ON \`coin_policy_tbl\``);
        await queryRunner.query(`DROP INDEX \`IDX_d42df2c178e0a676aa00f94139\` ON \`coin_policy_tbl\``);
        await queryRunner.query(`DROP TABLE \`coin_policy_tbl\``);
    }

}
