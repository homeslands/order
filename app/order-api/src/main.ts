import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { corsOptions } from './config/cors.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { otelSDK } from './otel';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  otelSDK.start();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 8080;
  const version = configService.get('VERSION');

  app.setGlobalPrefix(`api/${version}`);
  app.enableCors(corsOptions);
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Order API')
    .setDescription('The Order API documentation')
    .setVersion('v1.0.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/api-docs', app, documentFactory, {
    // jsonDocumentUrl: 'api/swagger/json',
    jsonDocumentUrl: 'swagger.json',
  });

  logger.log(`Server running on port ${port}`);
  logger.log(`Swagger running at http://localhost:${port}/api/api-docs`);
  await app.listen(port);
}
bootstrap();
