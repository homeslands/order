import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Branch } from 'src/branch/branch.entity';
import { Order } from 'src/order/order.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity({ name: 'address_tbl' })
export class Address extends Base {
  @AutoMap()
  @Column({ name: 'formatted_address_column' })
  formattedAddress: string;

  @AutoMap()
  @Column({ name: 'url_column', type: 'text' })
  url: string;

  @AutoMap()
  @Column({ name: 'lat_column', type: 'decimal', precision: 10, scale: 8 })
  lat: number;

  @AutoMap()
  @Column({ name: 'lng_column', type: 'decimal', precision: 11, scale: 8 })
  lng: number;

  @AutoMap()
  @Column({ name: 'place_id_column' })
  placeId: string;

  @OneToOne(() => Branch, (branch) => branch.addressDetail)
  branch: Branch;

  @OneToOne(() => Order, (order) => order.deliveryTo)
  order: Order;
}
