import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCoinPolicyDto } from './create-coin-policy.dto';
import { AutoMap } from '@automapper/classes';
import { IsNotEmpty } from 'class-validator';

export class UpdateCoinPolicyDto extends PartialType(CreateCoinPolicyDto) {
    @IsNotEmpty()
    @ApiProperty()
    @AutoMap()
    value: string;
}

export class ToggleCoinPolicyActivationDto extends PartialType(CreateCoinPolicyDto) {
    @IsNotEmpty()
    @ApiProperty()
    @AutoMap()
    isActive: boolean;
}
