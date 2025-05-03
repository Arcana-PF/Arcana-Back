import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { UploadFileDTO } from './dto/upload.file.dto';
import { ProductsRepository } from 'src/products/products.repository';

@Injectable()
export class FileUploadService {
    constructor(private readonly cloudinaryService: CloudinaryService,
        private readonly productRepository: ProductsRepository
    ){}

    async uploadFile (file:UploadFileDTO, id: string){
        const { fieldname, buffer, originalname, mimetype, size } = file;

        const product = await this.productRepository.getProductById(id);

        const url = await this.cloudinaryService.uploadFile(buffer, originalname);

        await this.productRepository.updateProduct(id, {imgUrl: url});

        const productUpdated = await this.productRepository.getProductById(id);

        return productUpdated;
    };

}
