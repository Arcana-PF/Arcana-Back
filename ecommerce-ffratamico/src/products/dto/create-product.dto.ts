import { ArrayMinSize, IsArray, IsInt, IsNumber, IsString, IsUUID, MaxLength } from "class-validator"

export class CreateProductDto {
    @IsString()
    @MaxLength(50)
    name: string;

    @IsString()
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio no puede tener mas de 2 decimales' })
    price: number;

    @IsInt()
    stock: number;

    @IsString()
    imgUrl: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    categoryNames: string[];
}
