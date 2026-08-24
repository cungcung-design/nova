import { authOptions } from "../src/auth";

console.log("authOptions:", {
  session: authOptions.session,
  providers: authOptions.providers?.length,
  pages: authOptions.pages,
});
