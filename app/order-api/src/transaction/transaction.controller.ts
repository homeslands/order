import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/decorator/public.decorator';
import { ACBStatusRequestDto } from 'src/acb-connector/acb-connector.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('transaction')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @SkipThrottle()
  @Public()
  @Post('callback')
  async statusCallback(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ACBStatusRequestDto,
  ) {
    return this.transactionService.callback(requestData);
  }
}
