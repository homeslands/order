import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { UserGroupMember } from 'src/user-group-member/user-group-member.entity';

@Entity('user_group_tbl')
export class UserGroup extends Base {
  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @AutoMap()
  @Column({ name: 'is_active_column', default: true })
  isActive: boolean;

  // One to many with user group members
  @OneToMany(
    () => UserGroupMember,
    (userGroupMember) => userGroupMember.userGroup,
  )
  userGroupMembers: UserGroupMember[];
}
