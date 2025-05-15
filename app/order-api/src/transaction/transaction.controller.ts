import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/decorator/public.decorator';
import { ACBStatusRequestDto } from 'src/acb-connector/acb-connector.dto';

@Controller('transaction')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('callback')
  @Public()
  async statusCallback(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ACBStatusRequestDto,
  ) {
    return this.transactionService.callback(requestData);
  }
}
