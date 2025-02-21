import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBannerEntity1740043811025 implements MigrationInterface {
    name = 'AddBannerEntity1740043811025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`banner_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`title_column\` varchar(255) NOT NULL, \`content_column\` varchar(255) NOT NULL, \`image_column\` varchar(255) NULL, \`is_active_column\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_0b687e7d692b7a37f053e9793b\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_0b687e7d692b7a37f053e9793b\` ON \`banner_tbl\``);
        await queryRunner.query(`DROP TABLE \`banner_tbl\``);
    }

}
