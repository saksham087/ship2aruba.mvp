import { authClient } from "./auth";

export { authClient };
export const useSession = authClient.useSession;
export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const signUp = authClient.signUp;
