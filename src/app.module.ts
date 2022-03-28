import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GlobalMiddleware } from './global.middleware';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PPDBModule } from './ppdb/ppdb.module';
import { SpaceMapServiceModule } from './space-map-service/space-map-service.module';
import { SpaceMapProductModule } from './space-map-product/space-map-product.module';
import { CesiumModule } from './cesium/cesium.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactModule } from './contact/contact.module';
import { TleModule } from './tle/tle.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ResourceModule } from './resource/resource.module';
import { ResourceFileModule } from './resource-file/resource-file.module';
import { FileModule } from './file/file.module';
import { AdminModule } from './admin/admin.module';
import { AdminAuthMiddleware } from './admin-auth.middleware';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production', '.env'],
    }),
    AuthModule,
    UserModule,
    SpaceMapServiceModule,
    TypeOrmModule.forRoot({
      timezone: 'UTC',
      autoLoadEntities: true,
    }),
    SpaceMapProductModule,
    CesiumModule,
    ContactModule,
    // PPDBModule,
    // MongooseModule.forRoot(
    //   process.env.MONGODB_URL ??
    //     'TEST/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false',
    //   {
    //     dbName: 'COOP',
    //   },
    // ),
    // TleModule,
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.google.com',
        port: 587,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: process.env.GOOGLE_EMAIL,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_SECRET,
          accessToken: process.env.GMAIL_ACCESS_TOKEN,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        },
      },
      defaults: {
        from: '"Space Map" <contact@spacemap42.com>',
      },
      template: {
        dir: __dirname + '/views/templates',
        options: {
          strict: true,
        },
      },
    }),
    ResourceModule,
    ResourceFileModule,
    FileModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(GlobalMiddleware).forRoutes('*');
    consumer
      .apply(AdminAuthMiddleware)
      .exclude(
        { path: '/admin/login', method: RequestMethod.GET },
        { path: '/admin/login', method: RequestMethod.POST },
      )
      .forRoutes(AdminController);
  }
}
