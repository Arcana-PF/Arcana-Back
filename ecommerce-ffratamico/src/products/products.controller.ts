import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Res, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { response, Response } from 'express';

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
  create(@Body() newProduct: CreateProductDto, @Res() response: Response) {
    response.status(201).send(this.productsService.createProduct(newProduct));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }
}
