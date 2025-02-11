export interface User {
  id: string;
  email: string;
  roleId?: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string; // опційно
  country?: string;
  city?: string;
  registrationDate: string;
  rating?: number;
  about?: string; // опційно
  emailConfirmed?: boolean;
  isfavorited?: boolean;
}
