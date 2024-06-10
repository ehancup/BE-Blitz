import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { OwnerGuard } from 'src/guard/owner/owner.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/role.reflector';
import {
  AddProductImageDto,
  CreateProductDto,
  DeleteProductBulkDto,
  FindAllProductDto,
  UpdateProductDto,
} from './product.dto';
import { ProductService } from './product.service';
import { Pagination } from 'src/utils/decorators/page/page.decorator';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Post('/create/:id')
  createProduct(
    @Param('id') storeId: string,
    @Body() payload: CreateProductDto,
  ) {
    return this.productService.createProduct(storeId, payload);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Put('/update/:id/:product')
  updateProduct(
    @Param('product') productId: string,
    @Body() payload: UpdateProductDto,
  ) {
    return this.productService.updateProduct(productId, payload);
  }

  @Get('/list')
  list(@Pagination() query: FindAllProductDto) {
    return this.productService.findProduct(query);
  }

  @Get('/random')
  random() {
    return this.productService.generateRandProduct();
  }

  @Get('/detail/:id')
  getDetail(@Param('id') id: string) {
    return this.productService.getDetailProduct(id);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Delete('/delete-image/:id/:imageId')
  deleteImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.productService.deleteImageProduct(imageId);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Delete('/delete/:id/:productId')
  deleteProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productService.deleteProduct(productId);
  }
  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Put('/add-image/:id/:productId')
  addImageProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() payload: AddProductImageDto,
  ) {
    return this.productService.addImage(productId, payload);
  }

  @UseGuards(JwtGuard, RoleGuard, OwnerGuard)
  @Roles(['seller'])
  @Put('/delete-bulk/:id')
  deleteBulk(@Body() payload: DeleteProductBulkDto) {
    return this.productService.deleteProductBulk(payload.data);
  }
}
