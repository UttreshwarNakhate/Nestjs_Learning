import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function startApplication () {
  const APP_PORT=3333
  const app = await NestFactory.create(AppModule);
  await app.listen(APP_PORT);
}
void startApplication();
