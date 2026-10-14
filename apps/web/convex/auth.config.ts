// Clerk JWT template named "convex" backs Convex auth.
//
// Convex reads this file on `convex dev` / `convex deploy` and accepts Clerk
// session tokens minted with the "convex" JWT template. The matching client
// half is `ConvexProviderWithClerk` in components/providers.tsx, which calls
// Clerk's `getToken({ template: "convex" })`.
export default {
  providers: [
    {
      domain: "https://accepted-turkey-8693.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
