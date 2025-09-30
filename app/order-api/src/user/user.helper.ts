import { Repository, In, IsNull } from 'typeorm';
import { User } from './user.entity';

/**
 * Attach createdBy user to array entity
 * @param entities - Array of entities
 * @param userRepo - User repository
 * @param mapField - Field name to map createdBy user
 * @returns Array of entities with createdBy user
 */
export const attachCreatedByForArrayEntity = async <
  T extends { createdBy?: string | null },
>(
  entities: T[],
  userRepo: Repository<User>,
): Promise<Array<T & { createdBy: User | null }>> => {
  if (!entities || entities.length === 0) return [];

  const ids = Array.from(
    new Set(entities.map((e) => e.createdBy).filter(Boolean)),
  ) as string[];

  if (ids.length === 0) {
    return entities.map((e) => ({ ...e, ['createdBy']: null }));
  }

  // Query user
  const users = await userRepo.find({
    where: { id: In(ids) },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return entities.map((e) => ({
    ...e,
    ['createdBy']: e.createdBy ? (userMap.get(e.createdBy) ?? null) : null,
  }));
};

/**
 * Attach createdBy user to single entity
 * @param entities - Single entity
 * @param userRepo - User repository
 * @param mapField - Field name to map createdBy user
 * @returns Single entity with createdBy user
 */
export const attachCreatedByForSingleEntity = async <
  T extends { createdBy?: string | null },
>(
  entity: T,
  userRepo: Repository<User>,
): Promise<T & { createdBy: User | null }> => {
  if (!entity) return null;

  // Query user
  const user = await userRepo.findOne({
    where: { id: entity.createdBy ?? IsNull() },
  });

  return { ...entity, ['createdBy']: user ?? null };
};
