export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string | null;
  dateOfBirth?: Date | null;
}
