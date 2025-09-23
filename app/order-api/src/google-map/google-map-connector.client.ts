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
  GeocodingAddressResponseDto,
  GeocodingAddressResultDto,
  LocationResponseDto,
  PlaceAutocompleteResponseDto,
  PlaceDetailsResponseDto,
  PlaceDetailsResultResponseDto,
  RouteAndDirectionResponseDto,
  SuggestionAddressResponseDto,
  SuggestionAddressResultResponseDto,
} from './dto/google-map.response.dto';
import { GoogleMapException } from './google-map.exception';
import { GoogleMapValidation } from './google-map.validation';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';

@Injectable()
export class GoogleMapConnectorClient {
  private googleMapsApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly systemConfigService: SystemConfigService,
  ) {
    this.googleMapsApiKey = this.configService.get<string>(
      'GOOGLE_MAPS_API_KEY',
    );
  }

  async getGoogleMapsApiUrl() {
    return this.systemConfigService.get(SystemConfigKey.GOOGLE_MAPS_API_URL);
  }

  async getPlacesGoogleMapsApiUrlV1() {
    return this.systemConfigService.get(
      SystemConfigKey.PLACES_GOOGLE_MAPS_API_URL_V1,
    );
  }

  async getAutocompleteAddress(
    name: string,
  ): Promise<AutocompleteAddressResponseDto[]> {
    const context = `${GoogleMapConnectorClient.name}.${this.getAutocompleteAddress.name}`;
    const requestUrl = `${await this.getGoogleMapsApiUrl()}/place/autocomplete/json?input=${encodeURIComponent(
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

  async getGeocodingAddress(
    name: string,
  ): Promise<GeocodingAddressResultDto[]> {
    const context = `${GoogleMapConnectorClient.name}.${this.getGeocodingAddress.name}`;
    const requestUrl = `${await this.getGoogleMapsApiUrl()}/geocode/json?address=${encodeURIComponent(
      name,
    )}&components=country:VN&key=${this.googleMapsApiKey}`;

    const { data } = await firstValueFrom(
      this.httpService
        .get<GeocodingAddressResponseDto>(requestUrl, {
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
      this.logger.error(`Get geocoding address failed: ${name}`, context);
      throw new GoogleMapException(
        GoogleMapValidation.ERROR_WHEN_GET_ADDRESS,
        data.status,
      );
    }

    return data.results;
  }

  async getSuggestionAddress(
    name: string,
  ): Promise<SuggestionAddressResultResponseDto[]> {
    const context = `${GoogleMapConnectorClient.name}.${this.getGeocodingAddress.name}`;
    const requestUrl = `${await this.getPlacesGoogleMapsApiUrlV1()}/places:autocomplete?key=${this.googleMapsApiKey}`;

    const body = {
      input: name,
      includedRegionCodes: ['VN'],
      languageCode: 'vi',
      // includeQueryPredictions: false,
      // locationBias: {
      //   circle: {
      //     center: { latitude: 10.7769, longitude: 106.7009 }, // ví dụ HCM
      //     radius: 50000, // mét
      //   },
      // },
    };

    const { data } = await firstValueFrom(
      this.httpService
        .post<SuggestionAddressResponseDto>(requestUrl, body, {
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

    return data.suggestions;
  }

  async getLocationByPlaceId(placeId: string): Promise<LocationResponseDto> {
    const context = `${GoogleMapConnectorClient.name}.${this.getLocationByPlaceId.name}`;
    const requestUrl = `${await this.getGoogleMapsApiUrl()}/place/details/json?place_id=${placeId}&key=${this.googleMapsApiKey}`;

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
    const requestUrl = `${await this.getGoogleMapsApiUrl()}/place/details/json?place_id=${placeId}&key=${this.googleMapsApiKey}`;

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
    const requestUrl = `${await this.getGoogleMapsApiUrl()}/directions/json`;

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
    const requestUrl = `${await this.getGoogleMapsApiUrl()}/distancematrix/json`;

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
