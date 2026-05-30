import { getSessionUser } from "@/lib/auth/session";
import {
  resolveDriverIdForUser,
  type ShipmentListFilters
} from "@/lib/repositories/shipment.repository";

export async function resolveShipmentListFilters(
  scope: string | null
): Promise<ShipmentListFilters | undefined> {
  if (scope !== "mine") return undefined;

  const user = await getSessionUser();
  if (!user) return undefined;

  if (user.role === "customer") return { customerId: user.id };

  if (user.role === "driver") {
    const driverId = await resolveDriverIdForUser(user.id);
    return driverId ? { driverId } : { driverId: "__no_driver__" };
  }

  return undefined;
}
