import { CoinPolicyConstanst } from 'src/gift-card-modules/coin-policy/coin-policy.constants';
import { CoinPolicyKeyEnum } from 'src/gift-card-modules/coin-policy/coin-policy.enum';
import { getRandomString } from 'src/helper';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class InitCoinPolicySchemaMigration1760691981269 implements MigrationInterface {
    private readonly TABLE = 'coin_policy_tbl';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const policy = {
            id: uuidv4(),
            slug: getRandomString(),
            name: 'Số dư tối đa',
            key: CoinPolicyKeyEnum.MAX_BALANCE,
            desc: 'Giới hạn số lượng xu mà người dùng có thể sở hữu trong tài khoản',
            value: CoinPolicyConstanst.DEFAULT_MAX_BALANCE_VALUE,
            isActive: true,
            createdBy: 'system'
        }
        const query = `
            INSERT INTO ${this.TABLE} 
                (id_column, slug_column, key_column, name_column, description_column, value_column, is_active_column, created_by_column)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await queryRunner.query(query, [policy.id, policy.slug, policy.key, policy.name, policy.desc, policy.value, policy.isActive, policy.createdBy]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM ${this.TABLE} WHERE key_column = ?`;
        await queryRunner.query(query, [CoinPolicyKeyEnum.MAX_BALANCE]);
    }

}
