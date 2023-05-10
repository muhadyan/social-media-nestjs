export interface LoginReponse {
  userID: string;
  token: string;
}

export interface GetUserResponse {
  userID: string;
  email: string;
  username: string;
  fullname: string;
  photo: string;
}
