export interface TransactionResponse {
  transactionId: string;
  accountNumber: string;
  type: string;
  amount: number;
  balanceAfterTransaction: number;
  transactionDateTime: string;
  status: string;
  destinationAccountNumber?: string;

  formattedAmount?: string;
  formattedBalance?: string;
  formattedDateTime?: string;
}
