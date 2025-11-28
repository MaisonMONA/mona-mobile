import { mount } from "@vue/test-utils";
import RegisterPage from "@/views/RegisterPage.vue";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/internal/databases/UserData", () => ({
  UserData: {
    populate: vi.fn().mockResolvedValue(undefined),
    hasSeenTutorial: vi.fn().mockReturnValue(true),
    getToken: vi.fn().mockReturnValue(""),
  },
}));

describe("RegisterPage.vue", () => {
  it("shows the registration hero copy", async () => {
    const wrapper = mount(RegisterPage, {
      global: {
        mocks: {
          $router: { replace: vi.fn() },
        },
      },
    });

    expect(wrapper.text()).toContain("Inscription");
    expect(wrapper.text()).toContain("Bienvenue !");
  });
});
