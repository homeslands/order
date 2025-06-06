import { FindOptionsOrder } from 'typeorm';

export function createSortOptions<T>(sort: string[]): FindOptionsOrder<T> {
  return sort.length > 0
    ? sort.reduce((acc, sort) => {
        const [field, direction] = sort.split(',');
        acc[field] = direction?.toUpperCase() as 'ASC' | 'DESC';
        return acc;
      }, {} as FindOptionsOrder<T>)
    : ({ createdAt: 'DESC' } as unknown as FindOptionsOrder<T>);
}
