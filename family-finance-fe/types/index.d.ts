// Response từ NestJS 
export interface IBackendRes<T = any> {
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
export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  spaceId: string | null;
  role: "parent" | "member" | null;
  sysRole: "admin" | "user";
  accountId: string;
}

// sendRequest options 
export interface IRequest {
  url: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  useCredentials?: boolean;
  nextOption?: RequestInit;
  isFormData?: boolean;
}

// Income
export interface IIncome {
  _id: string;
  userID: {
    _id: string;
    name: string;
    avatar: string | null;
  };
  categoryID: {
    _id: string;
    name: string;
    icon: string;
    color?: string;
    type?: string;
  };
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeDto {
  categoryID: string;
  amount: number;
  date: string;
  description?: string;
}

export interface GetIncomeDto {
  month?: number;
  year?: number;
  categoryId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

// Aliases for Expense and Generic Transaction
export type IExpense = IIncome;
export type CreateExpenseDto = CreateIncomeDto;
export type GetExpenseDto = GetIncomeDto;
export type ITransaction = IIncome;
