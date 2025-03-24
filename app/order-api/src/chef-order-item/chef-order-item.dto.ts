import { AutoMap } from '@automapper/classes';
import { BaseResponseDto } from 'src/app/base.dto';
import { ChefOrderResponseDto } from 'src/chef-order/chef-order.dto';
import { OrderItemResponseDto } from 'src/order-item/order-item.dto';

export class ChefOrderItemResponseDto extends BaseResponseDto {
  @AutoMap()
  status: string;

  @AutoMap()
  defaultQuantity: number;

  @AutoMap(() => OrderItemResponseDto)
  orderItem: OrderItemResponseDto;

  @AutoMap(() => ChefOrderResponseDto)
  chefOrder: ChefOrderResponseDto;
}
