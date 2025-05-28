import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { ProductsRepository } from 'src/products/products.repository';
import { ProductsModule } from 'src/products/products.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [ProductsModule, CategoriesModule],
  controllers: [FileUploadController],
  providers: [FileUploadService,CloudinaryService, ProductsRepository],
  exports:[FileUploadService]
})
export class FileUploadModule {}
