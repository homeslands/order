import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { AuthorityGroup } from 'src/authority-group/authority-group.entity';
import { Permission } from 'src/permission/permission.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'authority_tbl' })
export class Authority extends Base {
  @Column({ name: 'name_column' })
  @AutoMap()
  name: string;

  @Column({ name: 'code_column' })
  @AutoMap()
  code: string;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @ManyToOne(
    () => AuthorityGroup,
    (authorityGroup) => authorityGroup.authorities,
  )
  @JoinColumn({ name: 'authority_group_column' })
  @AutoMap(() => AuthorityGroup)
  authorityGroup: AuthorityGroup;

  @AutoMap()
  @OneToMany(() => Permission, (p) => p.authority)
  permissions: Permission[];
}
