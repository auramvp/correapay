export interface Client {
  id: string;
  name: string;
  cpf: string;
  gender: 'M' | 'F' | 'Other';
  birthDate: string;
  whatsapp: string;
  email: string;
  address?: {
    street: string;
    neighborhood: string;
    city: string;
    zip: string;
  };
  createdAt: number;
}

export interface PaymentOrder {
  id: string;
  clientId: string;
  amount: number;
  fee: number;
  total: number; // amount + fee
  status: 'pending' | 'completed' | 'cancelled';
  shippingType?: 'PIX' | 'TED' | 'DOC';
  destination?: {
    recipient: string;
    bank: string;
  };
  receiptUrl?: string;
  responsibleName?: string;
  createdAt: number;
}

export interface DashboardStats {
  totalVolume: number;
  totalFees: number;
  activeClients: number;
  transactionCount: number;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'revoked';
  createdAt: number;
}
