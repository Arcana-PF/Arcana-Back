import { IsUUID } from "class-validator";

export class IdParamDTO{
    
    @IsUUID(undefined, {message: 'El ID debe ser un UUID válido'})
    id: string;
}