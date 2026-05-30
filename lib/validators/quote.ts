import { z } from "zod";

export const quoteSchema = z.object({
  pickup: z.string().min(2, "Nhập điểm lấy hàng"),
  delivery: z.string().min(2, "Nhập điểm giao hàng"),
  cargoType: z.string().min(2, "Nhập loại hàng"),
  weight: z.string().min(1, "Nhập trọng lượng"),
  dimensions: z.string().optional(),
  vehicleType: z.string().min(2, "Chọn loại xe"),
  shipDate: z.string().min(1, "Chọn ngày vận chuyển")
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;
