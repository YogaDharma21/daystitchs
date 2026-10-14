// Clerk JWT template named "convex" backs Convex auth.
//
// Convex reads this file on `convex dev` / `convex deploy` and accepts Clerk
// session tokens minted with the "convex" JWT template. The matching client
// half is `ConvexProviderWithClerk` in components/providers.tsx, which calls
// Clerk's `getToken({ template: "convex" })`.
//
// Owner setup: create a JWT template named `convex` in the Clerk dashboard,
// then set CLERK_JWT_ISSUER_DOMAIN to the template's issuer
// (e.g. https://<instance>.clerk.accounts.dev) before running `convex dev`.
// Until the real issuer is set, the placeholder domain below keeps
// typecheck/build unblocked but will NOT verify real Clerk tokens.
export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ??
        "https://clerk.daystitch.local",
      applicationID: "convex",
    },
  ],
};
