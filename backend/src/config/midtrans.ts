import Midtrans from 'midtrans-client';
import { config } from './index.js';

export const snap = new Midtrans.Snap({
  isProduction: config.midtrans.isProduction,
  serverKey: config.midtrans.serverKey,
  clientKey: config.midtrans.clientKey,
});

export const coreApi = new Midtrans.CoreApi({
  isProduction: config.midtrans.isProduction,
  serverKey: config.midtrans.serverKey,
  clientKey: config.midtrans.clientKey,
});
