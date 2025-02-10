import { createMap, extend, forMember, Mapper, mapWith } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { Promotion } from "./promotion.entity";
import { CreatePromotionRequestDto, PromotionResponseDto, UpdatePromotionRequestDto } from "./promotion.dto";
import { baseMapper } from "src/app/base.mapper";
import { BranchResponseDto } from "src/branch/branch.dto";
import { Branch } from "src/branch/branch.entity";

@Injectable()
export class PromotionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreatePromotionRequestDto, Promotion);
      createMap(mapper, UpdatePromotionRequestDto, Promotion);
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