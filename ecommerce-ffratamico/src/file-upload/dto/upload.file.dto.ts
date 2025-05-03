export interface UploadFileDTO{
    fieldname: string;
    originalname:string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}