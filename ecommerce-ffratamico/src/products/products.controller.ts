import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, Patch, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { IdParamDTO } from 'src/OthersDtos/id-param.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsAdminGuard } from 'src/auth/guard/is-admin/isAdmin.guard';
import { RateProductDto } from './dto/rate-product.dto';
import { Auth0Guard } from 'src/auth/guard/auth0/auth0.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAllProducts() {
    return await this.productsService.getAll();
  }

  @Get('page')
    async getUsersWithPagination(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 5,
    ) {
      return await this.productsService.getProductsWithPagination(page, limit);
    }

  @Get(':id')
  @ApiBearerAuth()
  async getProductById(@Param() param: IdParamDTO) {
    return await this.productsService.getProductById(param.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, IsAdminGuard)
  async create(@Body() newProduct: CreateProductDto) {
    return await this.productsService.createProduct(newProduct);
  }

  @Post('seeder')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, IsAdminGuard)
  async addProductsSeeder(){
    return await this.productsService.addProductsSeeder();
  }

  @Patch(':id/rating')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async rateProduct(
    @Param() param: IdParamDTO,
    @Body() rating: RateProductDto,
    @Req() req
  ) {
    return this.productsService.rateProduct(req.user.id, param.id, rating.score);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, IsAdminGuard) 
  async remove(@Param() param: IdParamDTO) {
    return await this.productsService.removeProduct(param.id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, IsAdminGuard)
  async update(@Param() param: IdParamDTO, @Body() updateProduct: UpdateProductDto) {
    return await this.productsService.update(param.id, updateProduct)
  }
}
