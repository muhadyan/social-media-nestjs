import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SharedService } from './shared.service';

@Module({
  imports: [JwtModule],
  providers: [SharedService],
})
export class SharedModule {}
