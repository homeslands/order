import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';

@Entity('firebase_device_token_tbl')
@Index(['userId'])
export class FirebaseDeviceToken extends Base {
  @AutoMap()
  @Column({ name: 'user_id_column' })
  userId: string;

  @AutoMap()
  @Column({ name: 'token_column', unique: true })
  token: string;

  @AutoMap()
  @Column({ name: 'platform_column' })
  platform: string;

  @AutoMap()
  @Column({ name: 'user_agent_column', nullable: true })
  userAgent?: string;

  @AutoMap()
  @ManyToOne(() => User, (user) => user.firebaseDeviceTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_column' })
  user: User;
}
