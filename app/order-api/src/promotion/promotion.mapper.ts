import { createMap, extend, forMember, mapFrom, Mapper, mapWith, typeConverter } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { Promotion } from "./promotion.entity";
import { CreatePromotionRequestDto, PromotionResponseDto, UpdatePromotionRequestDto } from "./promotion.dto";
import { baseMapper } from "src/app/base.mapper";
import { BranchResponseDto } from "src/branch/branch.dto";
import { Branch } from "src/branch/branch.entity";
import moment from "moment";

@Injectable()
export class PromotionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper, 
        CreatePromotionRequestDto, 
        Promotion,
        forMember(
          (destination) => destination.startDate,
          mapFrom((source) => {
            const date = source.startDate;
            date.setHours(7, 0, 0, 0);
            return date;
          })
        ),
        forMember(
          (destination) => destination.endDate,
          mapFrom((source) => {
            const date = source.endDate;
            date.setHours(7, 0, 0, 0);
            return date;
          })
        ),
      );
      createMap(
        mapper, 
        UpdatePromotionRequestDto, 
        Promotion,
        forMember(
          (destination) => destination.startDate,
          mapFrom((source) => {
            const date = source.startDate;
            date.setHours(7, 0, 0, 0);
            return date;
          })
        ),
        forMember(
          (destination) => destination.endDate,
          mapFrom((source) => {
            const date = source.endDate;
            date.setHours(7, 0, 0, 0);
            return date;
          })
        ),
      );
      createMap(
        mapper, 
        Promotion, 
        PromotionResponseDto,
        forMember(
          (destination) => destination.branch,
          mapWith(
            BranchResponseDto,
            Branch,
            (source) => source.branch
          )
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}