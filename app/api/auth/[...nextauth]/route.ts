import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user.model";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials?.email }).select("+password");
        if (!user) {
          throw new Error("Invalid Email or Password");
        }
        const isPasswordMatched = await user.comparePassword(credentials?.password);
        if (!isPasswordMatched) {
          throw new Error("Invalid Email or Password");
        }
        return { id: user._id.toString(), email: user.email, name: user.name, _id: user._id.toString() };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      await dbConnect();
      if (account?.provider === "credentials") {
        user.id = user._id.toString();
      } else {
        const existingUser = await User.findOne({ email: user?.email });
        if (!existingUser) {
          const newUser = new User({
            email: user?.email,
            name: user?.name,
            profilePicture: { url: profile?.image || user?.image },
            authProviders: [
              {
                provider: account?.provider,
                providerId: profile?.id || profile?.sub,
              },
            ],
          });
          await newUser.save();
          console.log("Created user (Social):", newUser._id.toString());
          user.id = newUser._id.toString();
          user._id = newUser._id.toString();
        } else {
          const existingProvider = existingUser.authProviders.find(
            (provider: { provider: string }) => provider.provider === account?.provider
          );
          if (!existingProvider) {
            existingUser.authProviders.push({
              provider: account?.provider,
              providerId: profile?.id || profile?.sub,
            });
            if (!existingUser.profilePicture.url) {
              existingUser.profilePicture = { url: profile?.image || user?.image };
            }
            await existingUser.save();
          }
          user.id = existingUser._id.toString();
          user._id = existingUser._id.toString();
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.user = {
          _id: user._id || user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          authProviders: user.authProviders,
        };
      } else if (token.user?._id) {
        await dbConnect();
        const dbUser = await User.findById(token.user._id);
        if (dbUser) {
          token.user = {
            _id: dbUser._id.toString(),
            email: dbUser.email,
            name: dbUser.name,
            profilePicture: dbUser.profilePicture,
            authProviders: dbUser.authProviders,
          };
        }
      }
      if (trigger === "update") {
        await dbConnect();
        const updatedUser = await User.findById(token.user._id);
        if (updatedUser) {
          token.user = {
            _id: updatedUser._id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            profilePicture: updatedUser.profilePicture,
            authProviders: updatedUser.authProviders,
          };
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.user) {
        session.user = {
          _id: token.user._id,
          email: token.user.email,
          name: token.user.name,
          profilePicture: token.user.profilePicture,
          authProviders: token.user.authProviders,
        };
      }
      delete session.user.password;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const GET = NextAuth(options);
export const POST = NextAuth(options);