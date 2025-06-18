import { IsInt, Min, Max } from 'class-validator';

export class RateProductDto {
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;
}