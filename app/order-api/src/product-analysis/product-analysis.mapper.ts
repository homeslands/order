import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import {
  ProductAnalysisQueryByBranchAndHourDto,
  ProductAnalysisQueryDto,
  ProductAnalysisResponseDto,
} from './product-analysis.dto';
import { ProductAnalysis } from './product-analysis.entity';
import moment from 'moment';

@Injectable()
export class ProductAnalysisProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, ProductAnalysis, ProductAnalysisResponseDto);

      // Map entity to response
      createMap(
        mapper,
        ProductAnalysisQueryDto,
        ProductAnalysis,
        forMember(
          (destination) => destination.totalQuantity,
          mapFrom((source) => +source.totalProducts),
        ),
        forMember(
          (destination) => destination.orderDate,
          mapFrom((source) => {
            // Date format: YYYY-MM-DDT00:00:00Z
            // Example: source.date = 2024-12-25T17:00:00.000Z
            // destination.date: 2024-12-26T00:00:00.000Z
            return moment(source.orderDate).add(7, 'hours').toDate();
          }),
        ),
      );
      createMap(
        mapper,
        ProductAnalysisQueryByBranchAndHourDto,
        ProductAnalysis,
        forMember(
          (destination) => destination.totalQuantity,
          mapFrom((source) => +source.totalProducts),
        ),
        forMember(
          (destination) => destination.orderDate,
          mapFrom(() => {
            // Date format: YYYY-MM-DDT00:00:00Z
            // Example: source.date = 2024-12-25T17:00:00.000Z
            // destination.date: 2024-12-26T00:00:00.000Z
            return moment().add(7, 'hours').toDate();
          }),
        ),
      );
    };
  }
}
