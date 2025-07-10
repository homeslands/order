import { Column, Entity } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';

@Entity('zalo_oa_connector_history_tbl')
export class ZaloOaConnectorHistory extends Base {
  // The id of verify phone number token entity
  @AutoMap()
  @Column({ name: 'token_id_column' })
  tokenId: string;

  @AutoMap()
  @Column({ name: 'sms_id_column' })
  smsId: string;

  @AutoMap()
  @Column({ name: 'request_id_column' })
  requestId: string;

  @AutoMap()
  @Column({ name: 'template_id_column' })
  templateId: string;

  @AutoMap()
  @Column({ name: 'strategy_column' })
  strategy: string;

  @AutoMap()
  @Column({ name: 'status_column', nullable: true })
  status: string;

  @AutoMap()
  @Column({ name: 'type_column', nullable: true })
  type: string;

  @AutoMap()
  @Column({ name: 'telecom_provider_column', nullable: true })
  telecomProvider: string;

  @AutoMap()
  @Column({ name: 'error_info_column', nullable: true })
  errorInfo: string;
}
