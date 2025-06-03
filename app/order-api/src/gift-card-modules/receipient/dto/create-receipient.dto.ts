import { IsOptional } from "class-validator";

import { IsNumber } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsNotEmpty } from "class-validator";

export class CreateReceipientDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    recipientSlug: string;
  
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    quantity: number;
  
    @IsOptional()
    @ApiProperty()
    message?: string;
  }