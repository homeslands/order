import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthJwtPayload } from './auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CurrentUserDto } from 'src/user/user.dto';
import { AuthUtils } from './auth.utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authUtils: AuthUtils,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      usernameField: 'phonenumber',
    });
  }

  async validate(payload: AuthJwtPayload) {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
      },
      relations: ['role.permissions.authority.authorityGroup'],
    });
    if (!user) throw new UnauthorizedException();

    const scope = this.authUtils.buildScope(user);
    return {
      userId: payload.sub,
      scope: this.authUtils.parseScope(scope),
    } as CurrentUserDto;
  }
}
