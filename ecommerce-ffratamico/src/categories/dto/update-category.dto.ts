import { IsString } from "class-validator";

export class UpdateCategoryDto {
    @IsString()
    currentName: string;

    @IsString()
    newName: string;
}
