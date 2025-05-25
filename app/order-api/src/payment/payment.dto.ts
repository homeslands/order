import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';

export class CreatePaymentDto {
  @AutoMap()
  @ApiProperty()
  @ApiProperty({
    example: 'bank-transfer',
    description: 'Payment method',
    enum: ['cash', 'bank-transfer', 'internal'],
  })
  paymentMethod: string;

  @AutoMap()
  @ApiProperty()
  orderSlug: string;
}

export class GetSpecificPaymentRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'Request trace' })
  transaction: string;
}

export class PaymentResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  paymentMethod: string;

  @AutoMap()
  @ApiProperty()
  amount: number;

  @AutoMap()
  @ApiProperty()
  loss: number;

  @AutoMap()
  @ApiProperty()
  message: string;

  @AutoMap()
  @ApiProperty()
  transactionId: string;

  @AutoMap()
  @ApiProperty()
  qrCode: string;

  @AutoMap()
  @ApiProperty()
  userId: string;

  @AutoMap()
  @ApiProperty()
  statusCode: string;

  @AutoMap()
  @ApiProperty()
  statusMessage: string;
}
