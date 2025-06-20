
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
      application_context: {
      return_url: 'http://localhost:3000/cart/successpage', // 👉 URL a la que PayPal redirige si el pago se confirma
      cancel_url: 'http://localhost:3000/cart/canceledpage',   // 👉 URL a la que PayPal redirige si se cancela
      },
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

  async getOrderDetails(orderId: string): Promise<any> {
  const request = new paypal.orders.OrdersGetRequest(orderId);
  const response = await this.client.execute(request);
  return response.result;
  }
}
