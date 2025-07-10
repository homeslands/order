import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { User } from 'src/user/user.entity';
import { AutoMap } from '@automapper/classes';

@Entity('verify_phone_number_token_tbl')
export class VerifyPhoneNumberToken extends Base {
  @ManyToOne(() => User, (user) => user.verifyPhoneNumberTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_column' })
  user: User;

  @Column({ name: 'token_column' })
  token: string;

  @AutoMap()
  @Column({ name: 'expires_at_column' })
  expiresAt: Date;
}
