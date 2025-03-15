import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Authority } from 'src/authority/authority.entity';
import { Role } from 'src/role/role.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'permission_tbl' })
export class Permission extends Base {
  @ManyToOne(() => Role, (role) => role.permissions)
  @JoinColumn({ name: 'role_column' })
  @AutoMap(() => Role)
  role: Role;

  @ManyToOne(() => Authority, (a) => a.permissions)
  @JoinColumn({ name: 'authority_column' })
  @AutoMap(() => Authority)
  authority: Authority;
}
