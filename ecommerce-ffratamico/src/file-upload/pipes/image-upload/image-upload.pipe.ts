import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ImageUploadPipe implements PipeTransform {
  private readonly mimeTypes = ['image/png','image/jpg','image/jpeg','image/gif'];
  private readonly maxSizeInBytes = 1 * 1024 * 1024; //10 megas
  transform(file: Express.Multer.File) {
    if(!file) throw new BadRequestException('No fue posible subir el archivo');

    if(!this.mimeTypes.includes(file.mimetype)) throw new BadRequestException('tipo de archivo invalido');

    if(file.size> this.maxSizeInBytes)throw new BadRequestException('El archivo es demasiado grande. El tamaño máximo permitido es 1 MB');
    
    return file;
  }
}
