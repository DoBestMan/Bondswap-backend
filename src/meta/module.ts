import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficialAddress } from './entity';
import { MetaService } from './service';
import { MetaController } from './controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficialAddress,
    ]),
  ],
  providers: [
    MetaService,
  ],
  controllers: [
    MetaController,
  ],
})
export class MetaModule {}
