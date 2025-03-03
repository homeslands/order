import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Action } from './action.enum';
import { User } from 'src/user/user.entity';

type Subjects = InferSubjects<typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createForUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    // if (user.isAdmin) {
    //   can(Action.Manage, 'all'); // read-write access to everything
    // } else {
    //   can(Action.Read, 'all'); // read-only access to everything
    // }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
