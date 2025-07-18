import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('zalo_oa_connector_config_tbl')
export class ZaloOaConnectorConfig extends Base {
  @AutoMap()
  @Column({ name: 'strategy_column', unique: true })
  strategy: string;

  @AutoMap()
  @Column({ name: 'template_id_column' })
  templateId: string;
}
