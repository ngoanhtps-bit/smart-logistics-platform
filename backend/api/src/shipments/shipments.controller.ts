import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ShipmentsService } from "./shipments.service";

@Controller("shipments")
export class ShipmentsController {
  constructor(private readonly shipments: ShipmentsService) {}

  @Get()
  list() {
    return this.shipments.findAll();
  }

  @Get(":code")
  one(@Param("code") code: string) {
    const item = this.shipments.findOne(code);
    if (!item) throw new NotFoundException();
    return item;
  }
}
