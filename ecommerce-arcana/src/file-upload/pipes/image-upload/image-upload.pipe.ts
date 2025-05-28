import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ImageUploadPipe implements PipeTransform {
  private readonly mimeTypes = ['image/png','image/jpg','image/jpeg','image/gif'];
  private readonly maxSizeInBytes = 10485760; //10 megas
  transform(file: Express.Multer.File) {
    if(!file) throw new BadRequestException('No fue posible subir el archivo');

    if(!this.mimeTypes.includes(file.mimetype)) throw new BadRequestException('tipo de archivo invalido');

    if(file.size> this.maxSizeInBytes)throw new BadRequestException('el archivo es muy pesado');
    
    return file;
  }
}
