import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoutesModule } from './routes/routes.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, RoutesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
