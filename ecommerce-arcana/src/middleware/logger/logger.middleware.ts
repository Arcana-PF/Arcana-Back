import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log(`Se ejecuto el controlador ${req.url} en la ruta ${req.url}`);
    next();
  }
}

export function LoggerGlobal(req: Request, res: Response, next: () => void){
  const currentTime = new Date().toISOString();
  console.log(`[${currentTime}] ${req.method} ${req.url}`);
  next();
}