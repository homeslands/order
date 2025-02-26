import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  ObjectLiteral,
  UpdateEvent,
} from 'typeorm';
import { Table } from './table.entity';
import { RobotConnectorClient } from 'src/robot-connector/robot-connector.client';
import { UpdateQRLocationRequestDto } from 'src/robot-connector/robot-connector.dto';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@EventSubscriber()
export class TableSubscriber implements EntitySubscriberInterface<Table> {
  constructor(
    dataSource: DataSource,
    private readonly robotConnectorClient: RobotConnectorClient,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Table;
  }

  async afterInsert(event: InsertEvent<Table>) {
    // Update location status after created a new table
    const context = `${TableSubscriber.name}.${this.afterInsert.name}`;
    this.logger.log(
      `Table location updated: ${event.entity.location}`,
      context,
    );
    await this.updateAssignedLocationStatus(event.entity);
  }

  async afterUpdate(event: UpdateEvent<Table>): Promise<void> {
    const context = `${TableSubscriber.name}.${this.afterUpdate.name}`;
    if (
      event.updatedColumns.some((column) => column.propertyName === 'location')
    ) {
      this.logger.log(
        `Table location updated: ${event.entity.location}`,
        context,
      );
      await this.updateAssignedLocationStatus(event.entity);
      await this.updateUnAssignedLocationStatus(event.databaseEntity.location);
    }
  }

  async updateAssignedLocationStatus(table: ObjectLiteral) {
    const location = await this.robotConnectorClient.getQRLocationById(
      table.location,
    );
    if (!location) return;
    const { isAssigned } = location.metadata;
    if (isAssigned) return;

    const requestData = {
      ...location,
      metadata: {
        // ...location.metadata,
        isAssigned: true,
      },
    } as UpdateQRLocationRequestDto;
    await this.robotConnectorClient.updateQRLocation(location.id, requestData);
  }

  async updateUnAssignedLocationStatus(locationId: string) {
    try {
      const location =
        await this.robotConnectorClient.getQRLocationById(locationId);
      if (!location) return;

      const { isAssigned } = location.metadata;
      if (!isAssigned) return;

      const requestData = {
        ...location,
        metadata: {
          isAssigned: false,
        },
      } as UpdateQRLocationRequestDto;
      await this.robotConnectorClient.updateQRLocation(
        location.id,
        requestData,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return;
    }
  }
}
