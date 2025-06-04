import { ApiProperty } from "@nestjs/swagger";
import { BaseResponseDto } from "src/app/base.dto";
import { AutoMap } from "@automapper/classes";

export class GiftCardResponseDto extends BaseResponseDto {
    @AutoMap()
    @ApiProperty()
    cardName: string;

    @AutoMap()
    @ApiProperty()
    cardPoints: number;

    @AutoMap()
    @ApiProperty()
    status: string;

    @AutoMap()
    @ApiProperty()
    serial: string;

    @AutoMap()
    @ApiProperty()
    code: string;


    @AutoMap()
    @ApiProperty()
    usedAt: string;

    @AutoMap()
    @ApiProperty()
    usedBy: string;

}
