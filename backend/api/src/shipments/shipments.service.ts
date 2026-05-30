import { Injectable } from "@nestjs/common";

@Injectable()
export class ShipmentsService {
  private shipments = [
    {
      code: "SPL-260528-01",
      route: "Hải Phòng → Bình Dương",
      status: "in_transit",
      statusLabel: "Đang vận chuyển",
      eta: "29/05/2026 18:30"
    }
  ];

  findAll() {
    return this.shipments;
  }

  findOne(code: string) {
    return this.shipments.find((s) => s.code === code);
  }
}
