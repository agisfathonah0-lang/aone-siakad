import { Role } from './enums.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        roles?: Role[];
        tenantId: string | null;
        vendorUserId?: string;
      };
      tenant?: {
        id: string;
        slug: string;
        schemaName: string;
        name: string;
        paket: string;
        customDomain: string | null;
        subscriptionEndDate: string | null;
        subscriptionExpired: boolean;
      } | null;
    }
  }
}

export {};
