import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { CollectedBadge } from "./CollectedBadges";

export class UserBadges {
  private static userBadgesCollectionCache: any = null;
  public static resetPreferences() {
    this.userBadgesCollectionCache = {
      updateOnce: {
        badgesCollection: true,
      },
    };
    this.updateFile();
  }

  private static updateFile() {
    Filesystem.writeFile({
      path: "appdata/populateBadgesCollectionY.json",
      data: JSON.stringify(this.userBadgesCollectionCache),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      recursive: true,
    }).catch((err) => {
      console.error(`Failed to update populate badgeCollection file (${err})`);
    });
  }
  public static async populate() {
    if (await this.fileExist()) {
      try {
        const content = await Filesystem.readFile({
          path: "appdata/populateBadgesCollectionY.json",
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });

        if (typeof content.data === "string") {
          this.userBadgesCollectionCache = JSON.parse(content.data);
          this.collecteBadgesOnce();
        }
        console.log('successfully read file "badge collection"');
      } catch (err) {
        console.log(`error when parsing data (${err}).`);
        // Default user data
        this.resetPreferences();
        this.collecteBadgesOnce();
      }
    } else {
      this.resetPreferences();
      this.collecteBadgesOnce();
    }
  }
  public static collecteBadgesOnce() {
    if (this.userBadgesCollectionCache.updateOnce.badgesCollection) {
      console.log("Collected badges once");
      this.userBadgesCollectionCache.updateOnce.badgesCollection = false;
      CollectedBadge.collecteBadges();
      this.updateFile();
    }
  }
  public static async fileExist() {
    try {
      await Filesystem.stat({
        path: "appdata/populateBadgesCollectionY.json",
        directory: Directory.Data,
      });
      return true;
    } catch (checkDirException) {
      return false;
    }
  }
}
