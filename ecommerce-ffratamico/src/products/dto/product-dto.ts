import { IsBoolean, IsNumber, IsString } from "class-validator"

export class ProductDTO {
    @IsString()
    id: string;
    
    @IsString()
    name: string;
    
    @IsString()
    description: string;
    
    @IsNumber()
    price: number;
    
    @IsNumber()
    stock: number;
    
    @IsString()
    imgUrl: string;
}