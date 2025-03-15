import { Controller } from '@nestjs/common';
import { AuthorityService } from './authority.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('authority')
@ApiTags('Authority')
@ApiBearerAuth()
export class AuthorityController {
  constructor(private readonly authorityService: AuthorityService) {}
}
