import { Controller, Get, Post, Body, Param, Delete, Put, Res, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAllProducts(@Res() response: Response) {
    response.status(200).send(this.productsService.getAll());
  }

  @Get('page')
    getUsersWithPagination(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 5,
    ) {
      return this.productsService.getProductsWithPagination(page, limit);
    }

  @Get(':id')
  getProductById(@Param('id') id: string, @Res() response: Response) {
    response.status(200).send(this.productsService.getProductById(id));
  }

  @Post()
  @UseGuards(AuthGuard) // Header de autorizacion
  create(@Body() newProduct: CreateProductDto, @Res() response: Response) {
    response.status(201).send(this.productsService.createProduct(newProduct));
  }

  @Delete(':id')
  @UseGuards(AuthGuard) // Header de autorizacion
  remove(@Param('id') id: string,@Res() response: Response) {
    response.status(200).send(this.productsService.removeProduct(id));
  }

  @Put(':id')
  @UseGuards(AuthGuard) // Header de autorizacion
  update(@Param('id') id: string, @Body() updateProduct: UpdateProductDto, @Res() response: Response) {
    response.status(200).send(this.productsService.update(id, updateProduct))
  }
}
