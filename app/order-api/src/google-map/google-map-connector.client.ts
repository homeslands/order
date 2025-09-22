import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  AutocompleteAddressResponseDto,
  DirectionsResponseDto,
  DistanceAndDurationResponseDto,
  DistanceMatrixResponseDto,
  LocationResponseDto,
  PlaceAutocompleteResponseDto,
  PlaceDetailsResponseDto,
  PlaceDetailsResultResponseDto,
  RouteAndDirectionResponseDto,
} from './dto/google-map.response.dto';
import { GoogleMapException } from './google-map.exception';
import { GoogleMapValidation } from './google-map.validation';

@Injectable()
export class GoogleMapConnectorClient {
  private googleMapsApiUrl: string;
  private googleMapsApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.googleMapsApiUrl =
      this.configService.get<string>('GOOGLE_MAP_API_URL');
    this.googleMapsApiKey = this.configService.get<string>(
      'GOOGLE_MAPS_API_KEY',
    );
  }

  async getAddress(name: string): Promise<AutocompleteAddressResponseDto[]> {
    const context = `${GoogleMapConnectorClient.name}.${this.getAddress.name}`;
    const requestUrl = `${await this.googleMapsApiUrl}/place/autocomplete/json?input=${encodeURIComponent(
      name,
    )}&types=geocode&language=vi&key=${this.googleMapsApiKey}`;

    const { data } = await firstValueFrom(
      this.httpService
        .get<PlaceAutocompleteResponseDto>(requestUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Get address failed: ${JSON.stringify(error.response?.data)}`,
              error.stack,
              context,
            );
            throw new GoogleMapException(
              GoogleMapValidation.ERROR_WHEN_GET_ADDRESS,
              error.message,
            );
          }),
        ),
    );

    if (data.status !== 'OK') {
      this.logger.error(`Get address failed: ${name}`, context);
      throw new GoogleMapException(
        GoogleMapValidation.ERROR_WHEN_GET_ADDRESS,
        data.status,
      );
    }

    this.logger.log(`Get address success`, context);
    return data.predictions.map(
      (prediction) =>
        ({
          description: prediction.description,
          place_id: prediction.place_id,
        }) as AutocompleteAddressResponseDto,
    );
  }

  async getLocationByPlaceId(placeId: string): Promise<LocationResponseDto> {
    const context = `${GoogleMapConnectorClient.name}.${this.getLocationByPlaceId.name}`;
    const requestUrl = `${await this.googleMapsApiUrl}/place/details/json?place_id=${placeId}&key=${this.googleMapsApiKey}`;

    const { data } = await firstValueFrom(
      this.httpService
        .get<PlaceDetailsResponseDto>(requestUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Get location by place id failed: ${JSON.stringify(error.response?.data)}`,
              error.stack,
              context,
            );
            throw new GoogleMapException(
              GoogleMapValidation.ERROR_WHEN_GET_ADDRESS_BY_PLACE_ID,
              error.message,
            );
          }),
        ),
    );

    if (!data.result) {
      this.logger.error(
        `Get place details by place id failed: ${placeId}`,
        context,
      );
      throw new GoogleMapException(
        GoogleMapValidation.ERROR_WHEN_GET_ADDRESS_BY_PLACE_ID,
      );
    }

    this.logger.log(`Get location by place id success`, context);
    return {
      lat: data.result.geometry.location.lat,
      lng: data.result.geometry.location.lng,
    } as LocationResponseDto;
  }

  async getPlaceDetailsByPlaceId(
    placeId: string,
  ): Promise<PlaceDetailsResultResponseDto> {
    const context = `${GoogleMapConnectorClient.name}.${this.getLocationByPlaceId.name}`;
    const requestUrl = `${await this.googleMapsApiUrl}/place/details/json?place_id=${placeId}&key=${this.googleMapsApiKey}`;

    const { data } = await firstValueFrom(
      this.httpService
        .get<PlaceDetailsResponseDto>(requestUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Get place details by place id failed: ${JSON.stringify(error.response?.data)}`,
              error.stack,
              context,
            );
            throw new GoogleMapException(
              GoogleMapValidation.ERROR_WHEN_GET_ADDRESS_BY_PLACE_ID,
              error.message,
            );
          }),
        ),
    );

    if (!data.result) {
      this.logger.error(
        `Get place details by place id failed: ${placeId}`,
        context,
      );
      throw new GoogleMapException(
        GoogleMapValidation.ERROR_WHEN_GET_ADDRESS_BY_PLACE_ID,
      );
    }

    this.logger.log(`Get place details by place id success`, context);
    return data.result as PlaceDetailsResultResponseDto;
  }

  async getDirection(
    origin: string,
    destination: string,
  ): Promise<RouteAndDirectionResponseDto> {
    const context = `${GoogleMapConnectorClient.name}.${this.getDirection.name}`;
    const requestUrl = `${await this.googleMapsApiUrl}/directions/json`;

    const { data } = await firstValueFrom(
      this.httpService
        .get<DirectionsResponseDto>(requestUrl, {
          params: {
            origin,
            destination,
            key: this.googleMapsApiKey,
            mode: 'driving',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Get address direction failed: ${JSON.stringify(error.response?.data)}`,
              error.stack,
              context,
            );
            throw new GoogleMapException(
              GoogleMapValidation.ERROR_WHEN_GET_ADDRESS_DIRECTION,
              error.message,
            );
          }),
        ),
    );

    if (data.status !== 'OK') {
      this.logger.error(
        `Get address direction failed: ${origin} to ${destination}`,
        context,
      );
      throw new GoogleMapException(
        GoogleMapValidation.ERROR_WHEN_GET_ADDRESS_DIRECTION,
        data.status,
      );
    }

    this.logger.log(`Get address direction success`, context);
    return data.routes[0] as RouteAndDirectionResponseDto;
  }

  async getDistanceAndDuration(
    origins: string,
    destinations: string,
  ): Promise<DistanceAndDurationResponseDto> {
    const context = `${GoogleMapConnectorClient.name}.${this.getDistanceAndDuration.name}`;
    const requestUrl = `${await this.googleMapsApiUrl}/distancematrix/json`;

    const { data } = await firstValueFrom(
      this.httpService
        .get<DistanceMatrixResponseDto>(requestUrl, {
          params: {
            origins,
            destinations,
            key: this.googleMapsApiKey,
            mode: 'driving',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Get address direction failed: ${JSON.stringify(error.response?.data)}`,
              error.stack,
              context,
            );
            throw new GoogleMapException(
              GoogleMapValidation.ERROR_WHEN_GET_ADDRESS_DIRECTION,
              error.message,
            );
          }),
        ),
    );

    if (data.status !== 'OK') {
      this.logger.error(
        `Get address direction failed: ${origins} to ${destinations}`,
        context,
      );
      throw new GoogleMapException(
        GoogleMapValidation.ERROR_WHEN_GET_ADDRESS_DIRECTION,
        data.status,
      );
    }

    this.logger.log(`Get address direction success`, context);
    return {
      distance: data.rows[0].elements[0].distance.text,
      duration: data.rows[0].elements[0].duration.text,
    };
  }
}
