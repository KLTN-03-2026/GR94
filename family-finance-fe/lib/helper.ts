//  Format tiền VND 
export const formatVND = (price: any): string => {
  if (typeof price !== "number" || isNaN(price)) {
    return (0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  }
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

//  Rút gọn số lớn 
export const shortVND = (price: number): string => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return price.toString();
};

//  Parse message từ NestJS 
// NestJS có thể trả message là string hoặc string[]
export const parseMessage = (msg?: string | string[]): string => {
  if (!msg) return "Có lỗi xảy ra";
  if (Array.isArray(msg)) return msg[0];
  return msg;
};

//  Check response có lỗi không 
export const isError = (res: any): boolean => {
  return !!(res?.statusCode && res.statusCode >= 400);
};
