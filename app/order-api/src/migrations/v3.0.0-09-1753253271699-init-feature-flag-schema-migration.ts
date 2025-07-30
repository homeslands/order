import { getRandomString } from 'src/helper';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class InitFeatureFlagSchemaMigration1753253271699
  implements MigrationInterface
{
  name = 'InitFeatureFlagSchemaMigration1753253271699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`feature_flag_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`group_name_column\` varchar(255) NOT NULL, \`group_slug_column\` varchar(255) NOT NULL, \`name_column\` varchar(255) NOT NULL, \`is_locked_column\` tinyint NOT NULL DEFAULT 0, \`order_column\` int NOT NULL, \`group_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_c0efb0b6c56f0dfbc11f429ed8\` (\`slug_column\`), UNIQUE INDEX \`IDX_a4f792a5840db9bf3f6eaa3c91\` (\`name_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`feature_group_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`order_column\` int NOT NULL, UNIQUE INDEX \`IDX_e54078c85933d796009d8011df\` (\`slug_column\`), UNIQUE INDEX \`IDX_1fe1d1c7203a3a8091454ba8a2\` (\`name_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_tbl\` ADD CONSTRAINT \`FK_04efc52c66c7065cc314e02a0d6\` FOREIGN KEY (\`group_column\`) REFERENCES \`feature_group_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    const features = [
      // {
      //   id: uuidv4(),
      //   slug: getRandomString(),
      //   name: 'ALL',
      //   order: 1,
      //   createdBy: 'system',
      // },
      {
        id: uuidv4(),
        slug: getRandomString(),
        name: 'SELF',
        order: 1,
        createdBy: 'system',
      },
      {
        id: uuidv4(),
        slug: getRandomString(),
        name: 'GIFT',
        order: 2,
        createdBy: 'system',
      },
      {
        id: uuidv4(),
        slug: getRandomString(),
        name: 'BUY',
        order: 3,
        createdBy: 'system',
      },
    ];

    const group = {
      id: uuidv4(),
      slug: getRandomString(),
      name: 'GIFT_CARD',
      order: 1,
      createdBy: 'system',
      features,
    };

    await queryRunner.query(`
        INSERT INTO feature_group_tbl (
            id_column, 
            name_column, 
            slug_column, 
            order_column, 
            created_by_column
        ) 
        VALUES
            ('${group.id}', '${group.name}', '${group.slug}', ${group.order}, '${group.createdBy}')
    `);

    const values = group.features
      .map(
        (f) =>
          `('${f.id}', 
                    '${f.name}', 
                    '${f.slug}', 
                    '${group.name}', 
                    '${group.slug}', 
                    '${group.id}', 
                    false, 
                    ${f.order},
                    '${f.createdBy}'
                )`,
      )
      .join(', ');

    await queryRunner.query(`
            INSERT INTO feature_flag_tbl (
                id_column,
                name_column,
                slug_column,
                group_name_column,
                group_slug_column,
                group_column,
                is_locked_column,
                order_column,
                created_by_column
            ) VALUES
                ${values};
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_tbl\` DROP FOREIGN KEY \`FK_04efc52c66c7065cc314e02a0d6\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1fe1d1c7203a3a8091454ba8a2\` ON \`feature_group_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e54078c85933d796009d8011df\` ON \`feature_group_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`feature_group_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_a4f792a5840db9bf3f6eaa3c91\` ON \`feature_flag_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c0efb0b6c56f0dfbc11f429ed8\` ON \`feature_flag_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`feature_flag_tbl\``);
  }
}
