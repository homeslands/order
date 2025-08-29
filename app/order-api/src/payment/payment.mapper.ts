import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { PaymentResponseDto } from './payment.dto';
import { Payment } from './payment.entity';
import { OrderPaymentResponseDto } from 'src/order/order.dto';

@Injectable()
export class PaymentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, Payment, PaymentResponseDto);
      createMap(mapper, Payment, OrderPaymentResponseDto);
    };
  }
}
