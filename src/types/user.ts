export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  timezone: string;
  language: string;
  twoFactorEnabled: boolean;
};

export type CompanySettings = {
  id: string;
  name: string;
  logo?: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
};
