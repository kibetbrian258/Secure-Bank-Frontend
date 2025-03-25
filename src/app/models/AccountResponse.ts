export interface AccountResponse {
  id: number;
  accountNumber: string;
  customerId: string;
  balance: number;
  status: string;
  interestRate: number;
  branchName: string;
  branchCode: string;
  onlineBanking: boolean;
  mobileBanking: boolean;
  monthlyFee: number;
  minimumBalance: number;
  withdrawalLimit: number;
  transferLimit: number;
}
