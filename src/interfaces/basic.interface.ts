export interface BasicResponse {
  statusCode: number;
  message: string;
  data?: any;
  meta?: MetaResponse;
}

interface MetaResponse {
  total: number;
  page: number;
  last_page: number;
}

export interface BasicQuery {
  search: string;
  page: string;
  limit: string;
}
