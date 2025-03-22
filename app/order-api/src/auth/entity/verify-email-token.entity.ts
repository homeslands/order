import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { User } from 'src/user/user.entity';

@Entity('verify_email_token_tbl')
export class VerifyEmailToken extends Base {
  @ManyToOne(() => User, (user) => user.verifyEmailTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_column' })
  user: User;

  @Column({ name: 'token_column', unique: true })
  token: string;

  @Column({ name: 'email_column' })
  email: string;

  @Column({ name: 'expires_at_column' })
  expiresAt: Date;
}
