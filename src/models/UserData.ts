export interface UserDataInput {
  email: string;
  name: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
}

export type MaybeUserData = UserData | null;
