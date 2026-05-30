import { Module } from "@nestjs/common";
import { ShipmentsModule } from "./shipments/shipments.module";
import { HealthController } from "./health.controller";
import { TrackingGateway } from "./tracking/tracking.gateway";

@Module({
  imports: [ShipmentsModule],
  controllers: [HealthController],
  providers: [TrackingGateway]
})
export class AppModule {}
