import React from "react";
import { render, act } from "@testing-library/react-native";
import SSOCallbackScreen from "@/app/sso-callback";
import { useClerk } from "@clerk/expo";
import { useLocalSearchParams } from "expo-router";

jest.mock("@clerk/expo", () => ({
  useClerk: jest.fn(),
}));

jest.mock("expo-router", () => ({
  Redirect: jest.fn(() => null),
  useLocalSearchParams: jest.fn(),
}));

describe("SSOCallbackScreen", () => {
  const mockSetActive = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (useClerk as jest.Mock).mockReturnValue({
      setActive: mockSetActive,
    });
  });

  it("activates session and redirects when created_session_id is in params", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      created_session_id: "test_session_id_123",
    });

    await act(async () => {
      render(<SSOCallbackScreen />);
    });

    expect(mockSetActive).toHaveBeenCalledWith({
      session: "test_session_id_123",
    });
  });

  it("handles empty params without crashing and redirects", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    await act(async () => {
      render(<SSOCallbackScreen />);
    });

    expect(mockSetActive).not.toHaveBeenCalled();
  });
});
