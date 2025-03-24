import { Controller } from '@nestjs/common';
import { ChefOrderItemService } from './chef-order-item.service';

@Controller('chef-order-item')
export class ChefOrderItemController {
  constructor(private readonly chefOrderItemService: ChefOrderItemService) {}
}
