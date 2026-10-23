Part of #11

## Parent

#11

## What to build

A functioning mobile app shell styled with NativeWind and gated by Clerk authentication.
When an unauthenticated user opens the app, they see a clean sign-in screen allowing login via Clerk.
Once authenticated, the app renders the authenticated shell connected to the Convex backend with Clerk auth tokens.
Includes testing setup to verify the authentication gate transitions between unauthenticated and authenticated states.

## Acceptance criteria

- [ ] NativeWind is installed and configured for React Native styling
- [ ] Clerk Expo authentication is configured with secure keychain token storage
- [ ] Convex React client is wrapped in Clerk auth provider using web JWT template `convex`
- [ ] Unauthenticated users see a sign-in screen
- [ ] Authenticated users see the app shell with user identity and sign-out option
- [ ] Test harness passes verifying auth gate rendering states

## Blocked by

- None (can start immediately)
