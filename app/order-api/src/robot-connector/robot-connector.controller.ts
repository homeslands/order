import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RobotConnectorService } from './robot-connector.service';

@ApiTags('CallRobot')
@Controller('call-robots')
@ApiBearerAuth()
export class CallRobotController {
  constructor(private readonly robotConnectorService: RobotConnectorService) {}
}
