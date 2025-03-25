export interface TransactionSearchRequest {
  accountNumber?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}
