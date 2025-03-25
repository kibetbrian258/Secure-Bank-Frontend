export interface Transaction {
  transactionId: string;
  accountNumber: string;
  type: string;
  amount: number;
  balanceAfterTransaction: number;
  transactionDateTime: Date;
  status: string;
  destinationAccountNumber?: string;
}
