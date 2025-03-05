import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { prismaClient } from "@/app/lib/db";
import Email from "next-auth/providers/email";
import { Providers } from "@/app/providers";

const handler = NextAuth({
    //i need to use google 
    providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
      ],
      secret: process.env.NEXTAUTH_SECRET ?? "secret",
      callbacks: {
        async signIn(params) {
          if (!params.user.email) {
            return false;
          }
          try {
            const existingUser = await prismaClient.user.findUnique({
              where: { email: params.user.email }
            });
      
            if (!existingUser) {
              await prismaClient.user.create({
                data: {
                  email: params.user.email,
                  provider: "Google"  // Ensure 'provider' matches your schema
                }
              });
            }
          } catch (e) {
            console.error("Error signing in:", e);
            return false; // Prevent sign-in if there's an error
          }
      
          return true;
        }
      }
})

export { handler as GET, handler as POST }