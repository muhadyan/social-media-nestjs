import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SharedDecodedToken } from './shared.service';

@Module({
  imports: [JwtModule],
  providers: [SharedDecodedToken],
})
export class SharedModule {}
