import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import { authSchema } from "./validations";
import { nextAuthEdgeConfig } from "./auth-edge";

const config = {
  ...nextAuthEdgeConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        //runs on login

        //validate the object
        const validatedFormData = authSchema.safeParse(credentials);
        if (!validatedFormData.success) {
          return null;
        }

        //extract the values
        const { email, password } = validatedFormData.data;

        const user = await getUserByEmail(email);

        if (!user) {
          console.log("No user found");
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          password,
          user.hashedPassword
        );

        if (!passwordsMatch) {
          console.log("Invalid Credentials");
          return null;
        }

        return user;
      },
    }),
  ],
  // callbacks: {
  //   async jwt({ token, user, trigger }) {
  //     if (user && user.id) {
  //       token.userId = user.id;
  //       token.email = user.email;
  //       token.hasAccess = user.hasAccess;
  //     }
  //     if (trigger === "update") {
  //       const userFromDb = await prisma.user.findUnique({
  //         where: {
  //           email: token.email,
  //         },
  //       });
  //       if (userFromDb) {
  //         token.hasAccess = userFromDb.hasAccess;
  //       }
  //     }
  //     return token;
  //   },
  //   session({ session, token }) {
  //     if (session.user) {
  //       session.user.id = token.userId;
  //       session.user.hasAccess = token.hasAccess;
  //     }
  //     return session;
  //   },
  // },
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(config);
