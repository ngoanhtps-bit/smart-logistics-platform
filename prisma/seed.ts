import { PrismaClient, ShipmentStatus, UserRole, VehicleStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.vn" },
    update: {},
    create: {
      email: "customer@demo.vn",
      name: "Khách hàng Demo",
      role: UserRole.customer,
      password: "hashed-demo",
      phone: "0901000001"
    }
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: "dispatcher@demo.vn" },
    update: {},
    create: {
      email: "dispatcher@demo.vn",
      name: "Điều phối Demo",
      role: UserRole.dispatcher,
      password: "hashed-demo"
    }
  });

  const vehicles = [
    { plate: "51H-888.66", type: "Mooc rào", status: VehicleStatus.busy, lat: 15.12, lng: 108.79 },
    { plate: "15C-442.19", type: "Container 40FT", status: VehicleStatus.available, lat: 20.86, lng: 106.68 },
    { plate: "29H-772.04", type: "Xe tải 15T", status: VehicleStatus.busy, lat: 21.2, lng: 106.0 }
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { plateNumber: v.plate },
      update: v,
      create: { ...v, plateNumber: v.plate, capacity: "30 tấn" }
    });
  }

  await prisma.shipment.upsert({
    where: { code: "SPL-260528-01" },
    update: {},
    create: {
      code: "SPL-260528-01",
      customerId: customer.id,
      pickupLocation: "Cảng Hải Phòng",
      deliveryLocation: "KCN Bình Dương",
      cargoType: "Pallet hàng kho",
      weight: "22 tấn",
      vehicleType: "Mooc rào",
      status: ShipmentStatus.in_transit,
      eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  });

  console.log("Seed OK:", { customer: customer.email, dispatcher: dispatcher.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
