import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { User } from 'src/user/user.entity';

@Entity('forgot_password_token_tbl')
export class ForgotPasswordToken extends Base {
  @ManyToOne(() => User, (user) => user.forgotPasswordTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_column' })
  user: User;

  @Column({ name: 'token_column', unique: true })
  token: string;

  @Column({ name: 'expires_at_column' })
  expiresAt: Date;
}
