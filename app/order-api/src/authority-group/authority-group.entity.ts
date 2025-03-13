import { Base } from 'src/app/base.entity';
import { Authority } from 'src/authority/authority.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'authority_group_tbl' })
export class AuthorityGroup extends Base {
  @Column({ name: 'name_column' })
  name: string;

  @Column({ name: 'code_column' })
  code: string;

  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @OneToMany(() => Authority, (authority) => authority.authorityGroup, {
    cascade: ['insert', 'update'],
  })
  authorities: Authority[];
}
