import { AutoMap } from "@automapper/classes";
import { Base } from "src/app/base.entity";
import { Column, Entity } from "typeorm";


@Entity("coin_policy_tbl")
export class CoinPolicy extends Base {
    @Column({ name: 'key_column', unique: true })
    @AutoMap()
    key: string;

    @Column({ name: 'name_column', nullable: true })
    @AutoMap()
    name: string;

    @Column({ name: 'description_column', type: 'text', nullable: true })
    @AutoMap()
    description: string;

    @Column({ name: 'value_column' })
    @AutoMap()
    value: string;

    @Column({ name: 'is_active_column', type: 'boolean', default: true })
    @AutoMap()
    isActive: boolean;
}
