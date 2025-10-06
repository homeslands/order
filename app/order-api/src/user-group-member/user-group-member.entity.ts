import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { User } from 'src/user/user.entity';
import { UserGroup } from 'src/user-group/user-group.entity';

@Entity('user_group_member_tbl')
export class UserGroupMember extends Base {
  @AutoMap(() => User)
  @ManyToOne(() => User, (user) => user.userGroupMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_column' })
  user: User;

  // Many to one with user group
  @AutoMap(() => UserGroup)
  @ManyToOne(() => UserGroup, (userGroup) => userGroup.userGroupMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_group_column' })
  userGroup: UserGroup;

  @AutoMap()
  @Column({ name: 'is_active_column', default: true })
  isActive: boolean;
}
