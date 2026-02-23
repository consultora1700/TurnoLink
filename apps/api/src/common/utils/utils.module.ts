import { Global, Module } from '@nestjs/common';
import { TimeUtilsService } from './time.service';

@Global()
@Module({
  providers: [TimeUtilsService],
  exports: [TimeUtilsService],
})
export class UtilsModule {}
