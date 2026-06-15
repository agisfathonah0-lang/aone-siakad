declare module 'midtrans-client' {
  export class Snap {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    createTransaction(params: Record<string, unknown>): Promise<Record<string, unknown>>;
    transactionStatus(orderId: string): Promise<Record<string, unknown>>;
    approve(orderId: string): Promise<Record<string, unknown>>;
    deny(orderId: string): Promise<Record<string, unknown>>;
    cancel(orderId: string): Promise<Record<string, unknown>>;
    expire(orderId: string): Promise<Record<string, unknown>>;
  }

  export class CoreApi {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    charge(params: Record<string, unknown>): Promise<Record<string, unknown>>;
    transactionStatus(transactionId: string): Promise<Record<string, unknown>>;
    approve(transactionId: string): Promise<Record<string, unknown>>;
    deny(transactionId: string): Promise<Record<string, unknown>>;
    cancel(transactionId: string): Promise<Record<string, unknown>>;
    expire(transactionId: string): Promise<Record<string, unknown>>;
  }
}
