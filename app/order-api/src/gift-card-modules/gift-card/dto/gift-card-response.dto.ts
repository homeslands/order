import { ApiProperty } from "@nestjs/swagger";
import { BaseResponseDto } from "src/app/base.dto";
import { AutoMap } from "@automapper/classes";

export class GiftCardResponseDto extends BaseResponseDto {
    @ApiProperty()
    @AutoMap()
    name: string;
}
