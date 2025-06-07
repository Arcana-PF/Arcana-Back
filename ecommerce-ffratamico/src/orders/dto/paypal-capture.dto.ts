import { IsString } from 'class-validator';

export class PayPalCaptureDto {
  @IsString()
  orderId: string;

  @IsString()
  localOrderId: string;
}