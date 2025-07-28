import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Branch } from 'src/branch/branch.entity';
import { Printer } from 'src/printer/entity/printer.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('invoice_area_tbl')
export class InvoiceArea extends Base {
  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @AutoMap()
  @ManyToOne(() => Branch, (branch) => branch.invoiceAreas)
  @JoinColumn({ name: 'branch_column' })
  branch: Branch;

  @AutoMap()
  @OneToMany(() => Printer, (printer) => printer.invoiceArea)
  printers: Printer[];
}
