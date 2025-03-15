import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Permission } from 'src/permission/permission.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('role_tbl')
export class Role extends Base {
  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @AutoMap()
  @Column({ name: 'name_column', unique: true })
  name: string;

  @AutoMap()
  @Column({ name: 'description_column', type: 'tinytext' })
  description: string;

  @AutoMap(() => Permission)
  @OneToMany(() => Permission, (p) => p.role)
  permissions: Permission[];
}
