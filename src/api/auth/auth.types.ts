export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  password: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  email: string;
  otp: string;
  newPassword: string;
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export type TwoFactorSetupResponse = {
  qrCode: string;
  secret: string;
};

export type TwoFactorVerifyData = {
  token: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserRole = {
  id: string;
  name: string;
};

export type UserPermission = {
  module: string;
  action: string;
  scope: string;
};

export type UserAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    companyId: string;
    roleId: string;
    role: UserRole;
    permissions: UserPermission[];
  };
};

export type LogoutData = {
  refreshToken: string;
};
