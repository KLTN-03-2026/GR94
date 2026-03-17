// Response từ NestJS 
interface IBackendRes<T = any> {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  data?: T;
  // login trả thêm
  access_token?: string;
  user?: IUser;
  _id?: string;
}

// User 
interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  spaceId: string | null;
  role: "parent" | "member" | null;
  accountId: string;
}

// sendRequest options 
interface IRequest {
  url: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  useCredentials?: boolean;
  nextOption?: RequestInit;
  isFormData?: boolean;
}
