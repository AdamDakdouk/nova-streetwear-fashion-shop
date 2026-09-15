import { redactConnectionString } from "../../src/config/db";

describe("redactConnectionString", () => {
  it("strips username and password from an SRV connection string", () => {
    const uri = "mongodb+srv://adamdak2003_db_user:Serenity17@ecommerce.zblowct.mongodb.net/nova?appName=Ecommerce";
    const redacted = redactConnectionString(uri);
    expect(redacted).toBe("mongodb+srv://<redacted>@ecommerce.zblowct.mongodb.net/nova?appName=Ecommerce");
    expect(redacted).not.toContain("Serenity17");
    expect(redacted).not.toContain("adamdak2003_db_user");
  });

  it("strips credentials from a standard (non-SRV) multi-host connection string", () => {
    const uri =
      "mongodb://user:pass@ac-x-shard-00-00.mongodb.net:27017,ac-x-shard-00-01.mongodb.net:27017/db?ssl=true";
    expect(redactConnectionString(uri)).toBe(
      "mongodb://<redacted>@ac-x-shard-00-00.mongodb.net:27017,ac-x-shard-00-01.mongodb.net:27017/db?ssl=true"
    );
  });

  it("still fully swallows the credential portion even with an invalid raw '@' in the password", () => {
    const uri = "mongodb://user:p@ss@host.mongodb.net:27017/db";
    const redacted = redactConnectionString(uri);
    expect(redacted).toBe("mongodb://<redacted>@host.mongodb.net:27017/db");
    expect(redacted).not.toContain("p@ss");
  });

  it("leaves a credential-free local URI unchanged", () => {
    const uri = "mongodb://127.0.0.1:27017/ecommerce_platform";
    expect(redactConnectionString(uri)).toBe(uri);
  });
});
