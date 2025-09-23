import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DistanceAndDurationResponseDto,
  LocationResponseDto,
  RouteAndDirectionResponseDto,
  SuggestionAddressResultResponseDto,
} from './dto/google-map.response.dto';
import { GoogleMapConnectorClient } from './google-map-connector.client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GetAddressDirectionDto,
  GetAddressDistanceAndDurationDto,
} from './dto/google-map.request.dto';
import { Branch } from 'src/branch/branch.entity';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class GoogleMapService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly googleMapConnectorClient: GoogleMapConnectorClient,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}
  async getAddressSuggestion(
    name: string,
  ): Promise<SuggestionAddressResultResponseDto[]> {
    const data = await this.googleMapConnectorClient.getSuggestionAddress(name);
    return data;
  }

  async getLocationByPlaceId(placeId: string): Promise<LocationResponseDto> {
    const data =
      await this.googleMapConnectorClient.getLocationByPlaceId(placeId);
    return data;
  }

  async getAddressDirection(
    option: GetAddressDirectionDto,
  ): Promise<RouteAndDirectionResponseDto> {
    const context = `${GoogleMapService.name}.${this.getAddressDirection.name}`;
    const branch = await this.branchRepository.findOne({
      where: {
        slug: option.branch,
      },
      relations: {
        addressDetail: true,
      },
    });
    if (!branch) {
      this.logger.warn(`Branch not found when get address direction`, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }
    if (!branch.addressDetail) {
      this.logger.warn(
        `Branch address detail not found when get address direction`,
        context,
      );
      throw new BranchException(
        BranchValidation.BRANCH_ADDRESS_DETAIL_NOT_FOUND,
      );
    }
    const origin = `${branch.addressDetail.lat},${branch.addressDetail.lng}`;
    const destination = `${option.lat},${option.lng}`;
    const data = await this.googleMapConnectorClient.getDirection(
      origin,
      destination,
    );
    return data;
  }

  async getDistanceAndDuration(
    option: GetAddressDistanceAndDurationDto,
  ): Promise<DistanceAndDurationResponseDto> {
    const context = `${GoogleMapService.name}.${this.getDistanceAndDuration.name}`;
    const branch = await this.branchRepository.findOne({
      where: {
        slug: option.branch,
      },
      relations: {
        addressDetail: true,
      },
    });
    if (!branch) {
      this.logger.warn(
        `Branch not found when get address distance and duration`,
        context,
      );
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }
    if (!branch.addressDetail) {
      this.logger.warn(
        `Branch address detail not found when get address distance and duration`,
        context,
      );
      throw new BranchException(
        BranchValidation.BRANCH_ADDRESS_DETAIL_NOT_FOUND,
      );
    }
    const origins = `${branch.addressDetail.lat},${branch.addressDetail.lng}`;
    const destinations = `${option.lat},${option.lng}`;
    const data = await this.googleMapConnectorClient.getDistanceAndDuration(
      origins,
      destinations,
    );
    return data;
  }
}
