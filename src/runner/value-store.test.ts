import { ValueStore } from "./value-store";

describe("ValueStore", () => {
  describe("setValue", () => {
    it("should set value when no delimiter", () => {
      const valueStore = new ValueStore();
      valueStore.setValue("a", 1);
      expect(valueStore.getValue("a")).toBe(1);
    });

    // it("should set value when name has delimiter", () => {
    //   const valueStore = new ValueStore();
    //   valueStore.setValue("a.b", 1);
    //   expect(valueStore.getValue("a.b")).toBe(1);
    // });
  });
});
