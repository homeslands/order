import { IsOptional } from "class-validator";

import { IsNumber } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsNotEmpty } from "class-validator";
import { AutoMap } from '@automapper/classes';

export class CreateReceipientDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    recipientSlug: string;
  
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    @AutoMap()
    quantity: number;
  
    @IsOptional()
    @ApiProperty()
    @AutoMap()
    message?: string;
  }