export interface TransactionResponse {
  transactionId: string;
  accountNumber: string;
  type: string;
  amount: number;
  balanceAfterTransaction: number;
  transactionDateTime: string;
  status: string;
  destinationAccountNumber?: string;

  // Additional display fields (added by frontend)
  formattedAmount?: string;
  formattedBalance?: string;
  formattedDateTime?: string;
}
