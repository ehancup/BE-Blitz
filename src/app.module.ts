import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './app/mail/mail.module';
import { UploadController } from './app/upload/upload.controller';
import { StoreModule } from './app/store/store.module';
import { EtalaseModule } from './app/etalase/etalase.module';
import { ProductModule } from './app/product/product.module';
import { CategoryModule } from './app/category/category.module';
import { AddressModule } from './app/address/address.module';
import { WalletModule } from './app/wallet/wallet.module';
import { WishlistModule } from './app/wishlist/wishlist.module';
import { CartModule } from './app/cart/cart.module';
import { OrderModule } from './app/order/order.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailModule,
    StoreModule,
    EtalaseModule,
    ProductModule,
    CategoryModule,
    AddressModule,
    WalletModule,
    WishlistModule,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
