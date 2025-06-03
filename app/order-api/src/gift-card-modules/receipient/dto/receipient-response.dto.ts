import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { BaseResponseDto } from "src/app/base.dto";

export class ReceipientResponseDto extends BaseResponseDto {
    @ApiProperty()
    @AutoMap()
    name: string;
}