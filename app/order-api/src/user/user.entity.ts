import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { Branch } from 'src/branch/branch.entity';
import { Order } from 'src/order/order.entity';
import { ForgotPasswordToken } from 'src/auth/forgot-password-token.entity';
import { Role } from 'src/role/role.entity';
import { VerifyEmailToken } from 'src/auth/verify-email-token.entity';

@Entity('user_tbl')
export class User extends Base {
  @AutoMap()
  @Column({ name: 'phonenumber_column', unique: true })
  phonenumber: string;

  @Column({ name: 'password_column' })
  password: string;

  @Column({ name: 'first_name_column' })
  @AutoMap()
  firstName: string;

  @Column({ name: 'last_name_column' })
  @AutoMap()
  lastName: string;

  @Column({ name: 'is_active_column', default: true })
  @AutoMap()
  isActive: boolean;

  @Column({ name: 'dob_column', nullable: true })
  @AutoMap()
  dob?: string;

  @AutoMap()
  @Column({ name: 'email_column', nullable: true, unique: true })
  email?: string;

  @AutoMap()
  @Column({ name: 'address_column', nullable: true })
  address?: string;

  @AutoMap()
  @Column({ name: 'image_column', nullable: true })
  image?: string;

  // Many to one with branch
  @AutoMap(() => Branch)
  @ManyToOne(() => Branch, (branch) => branch.users)
  @JoinColumn({ name: 'branch_id_column' })
  branch: Branch;

  // One to many with owner order
  @OneToMany(() => Order, (order) => order.owner)
  ownerOrders: Order[];

  // One to many with approval order
  @OneToMany(() => Order, (order) => order.approvalBy)
  approvalOrders: Order[];

  @OneToMany(() => ForgotPasswordToken, (token) => token.user)
  forgotPasswordTokens: ForgotPasswordToken[];

  // One to one with role
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_column' })
  @AutoMap(() => Role)
  role: Role;

  @Column({ name: 'is_verified_email_column', default: false })
  @AutoMap()
  isVerifiedEmail: boolean;

  @Column({ name: 'is_verified_phonenumber_column', default: false })
  @AutoMap()
  isVerifiedPhonenumber: boolean;

  @OneToMany(() => VerifyEmailToken, (token) => token.user)
  verifyEmailTokens: VerifyEmailToken[];
}
