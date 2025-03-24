import { AutoMap } from '@automapper/classes';
import { BaseResponseDto } from 'src/app/base.dto';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { ChefOrderItemResponseDto } from 'src/chef-order-item/chef-order-item.dto';
import { OrderResponseDto } from 'src/order/order.dto';

export class ChefOrderResponseDto extends BaseResponseDto {
  @AutoMap()
  status: string;

  @AutoMap(() => ChefAreaResponseDto)
  chefArea: ChefAreaResponseDto;

  @AutoMap(() => OrderResponseDto)
  order: OrderResponseDto;

  @AutoMap(() => [ChefOrderItemResponseDto])
  chefOrderItems: ChefOrderItemResponseDto[];
}
