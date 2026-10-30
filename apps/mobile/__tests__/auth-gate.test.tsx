import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { AuthGate } from "@/components/auth-gate";
import { useConvexAuth } from "convex/react";
import { useUser, useClerk, useSSO } from "@clerk/expo";
import { Text } from "react-native";

jest.mock("convex/react", () => ({
  useConvexAuth: jest.fn(),
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("@clerk/expo", () => ({
  useUser: jest.fn(),
  useClerk: jest.fn(),
  useSSO: jest.fn(),
}));

describe("AuthGate", () => {
  const mockSignOut = jest.fn();
  const mockSetActive = jest.fn().mockResolvedValue(undefined);
  const mockStartSSOFlow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });
    mockStartSSOFlow.mockResolvedValue({
      createdSessionId: "test_session_id",
      setActive: mockSetActive,
    });
    (useSSO as jest.Mock).mockReturnValue({
      startSSOFlow: mockStartSSOFlow,
    });
  });

  it("renders loading state when auth status is initializing", async () => {
    (useConvexAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    await render(
      <AuthGate>
        <Text>Protected Content</Text>
      </AuthGate>
    );

    expect(screen.getByText("Loading DayStitch...")).toBeTruthy();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("renders sign-in screen when unauthenticated", async () => {
    (useConvexAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    await render(
      <AuthGate>
        <Text>Protected Content</Text>
      </AuthGate>
    );

    expect(screen.getByText("Sign In to DayStitch")).toBeTruthy();
    expect(screen.getByTestId("sign-in-button")).toBeTruthy();
    expect(screen.getByText("Sign In with Google")).toBeTruthy();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("triggers onSignIn when sign-in button is pressed with callback prop", async () => {
    const mockOnSignIn = jest.fn();
    (useConvexAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    await render(
      <AuthGate onSignIn={mockOnSignIn}>
        <Text>Protected Content</Text>
      </AuthGate>
    );

    const signInBtn = screen.getByTestId("sign-in-button");
    fireEvent.press(signInBtn);
    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    expect(mockStartSSOFlow).not.toHaveBeenCalled();
  });

  it("triggers Google-only OAuth via useSSO and sets active session on success", async () => {
    (useConvexAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    await render(
      <AuthGate>
        <Text>Protected Content</Text>
      </AuthGate>
    );

    const signInBtn = screen.getByTestId("sign-in-button");
    await act(async () => {
      fireEvent.press(signInBtn);
    });

    expect(mockStartSSOFlow).toHaveBeenCalledWith({
      strategy: "oauth_google",
    });
    expect(mockSetActive).toHaveBeenCalledWith({
      session: "test_session_id",
    });
  });

  it("handles OAuth dismissal or failure gracefully without alerting", async () => {
    mockStartSSOFlow.mockRejectedValueOnce(new Error("User dismissed browser"));
    (useConvexAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    await render(
      <AuthGate>
        <Text>Protected Content</Text>
      </AuthGate>
    );

    const signInBtn = screen.getByTestId("sign-in-button");
    await act(async () => {
      fireEvent.press(signInBtn);
    });

    expect(mockStartSSOFlow).toHaveBeenCalledWith({
      strategy: "oauth_google",
    });
    expect(mockSetActive).not.toHaveBeenCalled();
  });

  it("renders authenticated shell with user identity and sign-out action when authenticated", async () => {
    (useConvexAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      user: {
        primaryEmailAddress: {
          emailAddress: "user@example.com",
        },
      },
    });

    await render(
      <AuthGate>
        <Text>Protected Content</Text>
      </AuthGate>
    );

    expect(screen.getByText("Signed in as user@example.com")).toBeTruthy();
    expect(screen.getByText("Protected Content")).toBeTruthy();

    const signOutBtn = screen.getByTestId("sign-out-button");
    expect(signOutBtn).toBeTruthy();

    fireEvent.press(signOutBtn);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
