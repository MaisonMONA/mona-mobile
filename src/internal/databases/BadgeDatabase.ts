import { Badge } from "@/internal/Types";
import { Database } from "@/internal/databases/Database";

export class BadgeDatabase extends Database {
  protected static data: Badge[] = [];
  protected static path = "appdata/badges.json";
  protected static type = "badges";

  protected static createSingleElement(badge: any) {
    return new Badge(badge);
  }

  public static getFromId(id: number): Badge | null {
    return super.getFromId(id) as Badge | null;
  }

  public static getSubset(a?: number, b?: number): Badge[] {
    return super.getSubset(a, b) as Badge[];
  }
}
