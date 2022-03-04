import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ContactModule } from '../contact/contact.module';
import { ResourceModule } from '../resource/resource.module';
import { ResourceFileModule } from '../resource-file/resource-file.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, ContactModule, ResourceModule, ResourceFileModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
