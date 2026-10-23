import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { AuthGate } from "@/components/auth-gate";
import { useConvexAuth } from "convex/react";
import { useUser, useClerk, useSignIn } from "@clerk/expo";
import { Text } from "react-native";

jest.mock("convex/react", () => ({
  useConvexAuth: jest.fn(),
}));

jest.mock("@clerk/expo", () => ({
  useUser: jest.fn(),
  useClerk: jest.fn(),
  useSignIn: jest.fn(),
}));

describe("AuthGate", () => {
  const mockSignOut = jest.fn();
  const mockSignInCreate = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });
    (useSignIn as jest.Mock).mockReturnValue({
      isLoaded: true,
      signIn: {
        create: mockSignInCreate,
      },
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
  });

  it("invokes Clerk signIn.create when pressing sign-in button without onSignIn prop", async () => {
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
    fireEvent.press(signInBtn);
    expect(mockSignInCreate).toHaveBeenCalledTimes(1);
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
