import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // เปิดระบบ CORS ให้หน้าบ้านดึงข้อมูลได้
  app.enableCors(); 
  
  await app.listen(3000);
}
bootstrap();