export interface IAdAccount {
  id: string;
  name: string;
}

export interface IAccoutData {
  name: string;
  icon: string;
  accessToken?: string;
  refreshToken?: string;
  adAccount?: IAdAccount[]; // ✅ array of objects
}
