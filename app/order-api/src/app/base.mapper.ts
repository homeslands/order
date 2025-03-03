import { Mapper, createMap, typeConverter, Mapping } from '@automapper/core';
import { BaseResponseDto } from './base.dto';
import { Base } from './base.entity';

export const baseMapper = (mapper: Mapper): Mapping<Base, BaseResponseDto> => {
  return createMap(
    mapper,
    Base,
    BaseResponseDto,
    typeConverter(Date, String, (createdAt) => createdAt.toString()),
    typeConverter(Date, String, (updatedAt) => updatedAt.toString()),
  );
};
