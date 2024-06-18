import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { EventsController } from './events/events.controller';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}
