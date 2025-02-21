import { AutoMap } from "@automapper/classes";
import { Base } from "src/app/base.entity";
import { ApplicablePromotion } from "src/applicable-promotion/applicable-promotion.entity";
import { Branch } from "src/branch/branch.entity";
import { MenuItem } from "src/menu-item/menu-item.entity";
import { OrderItem } from "src/order-item/order-item.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity("promotion_tbl")
export class Promotion extends Base {
  @AutoMap()
  @Column({ name: "title_column" })
  title: string;

  @AutoMap()
  @Column({ name: "description_column", nullable: true, type: "text" })
  description?: string;

  @AutoMap()
  @Column({ name: "start_date_column" })
  startDate: Date;
  
  @AutoMap()
  @Column({ name: "end_date_column" })
  endDate: Date;

  @AutoMap()
  @Column({ name: "type_column" })
  type: string;

  @AutoMap()
  @Column({ name: "value_column" })
  value: number;

  @AutoMap()
  @ManyToOne(() => Branch, (branch) => branch.promotions)
  @JoinColumn({ name: "branch_column" })
  branch: Branch;

  @OneToMany(
    () => ApplicablePromotion, 
    (applicablePromotion) => applicablePromotion.promotion
  )
  applicablePromotions: ApplicablePromotion[];

  @OneToMany(
    () => OrderItem,
    (orderItem) => orderItem.promotion
  )
  orderItems: OrderItem[];

  @OneToMany(() => MenuItem, (menuItem) => menuItem.promotion)
  menuItems: MenuItem[];
}