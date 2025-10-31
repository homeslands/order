import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { UserLanguage } from 'src/user/user.constant';
import { Column, Entity } from 'typeorm';

@Entity('notification_tbl')
export class Notification extends Base {
  // title, body, link, language use for send notification to firebase fcm server
  @AutoMap()
  @Column({ name: 'title_column', nullable: true })
  title: string;

  @AutoMap()
  @Column({ name: 'body_column', nullable: true })
  body: string;

  @AutoMap()
  @Column({ name: 'link_column', nullable: true })
  link: string;

  @AutoMap()
  @Column({ name: 'language_column', default: UserLanguage.VI })
  language: string;

  // FE use message to display notification in UI
  @AutoMap()
  @Column({ name: 'message_column' })
  message: string;

  @AutoMap()
  @Column({ name: 'is_read_column', default: false })
  isRead: boolean;

  @AutoMap()
  @Column({ name: 'sender_id_column', nullable: true })
  senderId: string;

  @AutoMap()
  @Column({ name: 'receiver_id_column', nullable: false })
  receiverId: string;

  @AutoMap()
  @Column({ name: 'receiver_name_column', nullable: true })
  receiverName: string;

  @AutoMap()
  @Column({ name: 'sender_name_column', nullable: true })
  senderName: string;

  @AutoMap()
  @Column({ name: 'type_column' })
  type: string;

  @AutoMap()
  @Column({ name: 'metadata_column', type: 'json', nullable: true })
  metadata: string;
}
