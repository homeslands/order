import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';
import { AutoMap } from '@automapper/classes';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCardDto extends PartialType(CreateCardDto) {
    @IsNotEmpty()
    @ApiProperty()
    @AutoMap()
    @Transform(({ value }) => Number(value))
    version: number;
}
