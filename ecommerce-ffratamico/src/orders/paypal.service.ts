
import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PayPalService {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const environment = process.env.PAYPAL_ENV === 'live'
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder(amount: number, currency: string): Promise<{ id: string; links: any[] }> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: currency, value: Number(amount).toFixed(2) },
      }],
    });

    const response = await this.client.execute(request);
    return {
      id: response.result.id,
      links: response.result.links,
    };
  }

  async captureOrder(orderId: string): Promise<any> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await this.client.execute(request);
    return response.result;
  }
}
