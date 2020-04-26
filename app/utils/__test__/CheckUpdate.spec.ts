import { checkUpdate } from "../CheckUpdate";

describe("CheckUpdates", () => {
  it("should compare semvers", async () => {
    jest.mock("node-fetch", async () => {
      const release = {
        name: "v1.4.0",
      };
      return {
        json: () => Promise.resolve(release),
      };
    });

    const hasNewUpdate = await checkUpdate();
    expect(hasNewUpdate).toBe(true);
  });
});
