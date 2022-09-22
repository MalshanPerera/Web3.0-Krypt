export interface TransactionInterface {
  addressTo: string;
  addressFrom: string;
  timestamp: string;
  message: string;
  keyword: string;
  amount: number;
  url?: string;
}
