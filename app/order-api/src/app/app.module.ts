import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { validate } from './env.validation';
import { AuthModule } from 'src/auth/auth.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';
import { FileModule } from 'src/file/file.module';
import { HealthModule } from 'src/health/health.module';
import { SizeModule } from 'src/size/size.module';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { CatalogModule } from 'src/catalog/catalog.module';
import { ProductModule } from 'src/product/product.module';
import { VariantModule } from 'src/variant/variant.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { MenuModule } from 'src/menu/menu.module';
import { BranchModule } from 'src/branch/branch.module';
import { AppSubscriber } from './app.subscriber';
import { TableModule } from 'src/table/table.module';
import { MenuItemModule } from 'src/menu-item/menu-item.module';
import { PaymentModule } from 'src/payment/payment.module';
import { ACBConnectorModule } from 'src/acb-connector/acb-connector.module';
import { OrderItemModule } from 'src/order-item/order-item.module';
import { OrderModule } from 'src/order/order.module';
import { TrackingModule } from 'src/tracking/tracking.module';
import { TrackingOrderItemModule } from 'src/tracking-order-item/tracking-order-item.module';
import { RobotConnectorModule } from 'src/robot-connector/robot-connector.module';
import { UserModule } from 'src/user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'src/logger/logger.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { InvoiceItemModule } from 'src/invoice-item/invoice-item.module';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { DbModule } from 'src/db/db.module';
import { JwtAuthGuard } from 'src/auth/passport/jwt/jwt-auth.guard';
import { RoleModule } from 'src/role/role.module';
import { RolesGuard } from 'src/role/roles.guard';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { BullModule } from '@nestjs/bullmq';
import { ConnectionOptions } from 'bullmq';
import { RevenueModule } from 'src/revenue/revenue.module';
import { BranchRevenueModule } from 'src/branch-revenue/branch-revenue.module';
import { StaticPageModule } from 'src/static-page/static-page.module';
import { ProductAnalysisModule } from 'src/product-analysis/product-analysis.module';
import { PromotionModule } from 'src/promotion/promotion.module';
import { ApplicablePromotionModule } from 'src/applicable-promotion/applicable-promotion.module';
import { VoucherModule } from 'src/voucher/voucher.module';
import { BannerModule } from 'src/banner/banner.module';
import { LoggerMiddleware } from 'src/logger/logger.middleware';
import { AuthorityModule } from 'src/authority/authority.module';
import { AuthorityGroupModule } from 'src/authority-group/authority-group.module';
import { PermissionModule } from 'src/permission/permission.module';
import { ChefAreaModule } from 'src/chef-area/chef-area.module';
import { ProductChefAreaModule } from 'src/product-chef-area/product-chef-area.module';
import { ChefOrderModule } from 'src/chef-order/chef-order.module';
import { ChefOrderItemModule } from 'src/chef-order-item/chef-order-item.module';
import { NotificationModule } from 'src/notification/notification.module';
import { JobModule } from 'src/job/job.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { VoucherGroupModule } from 'src/voucher-group/voucher-group.module';
import { GiftCardModule } from 'src/gift-card-modules/gift-card.module';
import { VoucherProductModule } from 'src/voucher-product/voucher-product.module';
import { PrinterModule } from 'src/printer/printer.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const connectionOptions: ConnectionOptions = {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
          retryStrategy: (times) => {
            if (times > 10) return null;
            return 3000;
          },
        };
        return {
          connection: connectionOptions,
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve('public'),
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validate: validate,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 1000,
        },
      ],
    }),
    AuthModule,
    FileModule,
    HealthModule,
    SizeModule,
    CatalogModule,
    ProductModule,
    VariantModule,
    MenuModule,
    MenuItemModule,
    BranchModule,
    TransactionModule,
    LoggerModule,
    TableModule,
    PaymentModule,
    ACBConnectorModule,
    OrderItemModule,
    OrderModule,
    TrackingModule,
    TrackingOrderItemModule,
    RobotConnectorModule,
    UserModule,
    InvoiceModule,
    InvoiceItemModule,
    WorkflowModule,
    DbModule,
    RoleModule,
    SystemConfigModule,
    RevenueModule,
    BranchRevenueModule,
    StaticPageModule,
    ProductAnalysisModule,
    PromotionModule,
    ApplicablePromotionModule,
    VoucherModule,
    BannerModule,
    AuthorityModule,
    AuthorityGroupModule,
    PermissionModule,
    ChefAreaModule,
    ProductChefAreaModule,
    ChefOrderModule,
    ChefOrderItemModule,
    NotificationModule,
    JobModule,
    VoucherGroupModule,
    GiftCardModule,
    VoucherProductModule,
    PrinterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppSubscriber,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
