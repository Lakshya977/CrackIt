import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import User from "../models/user.model";
export const register = catchAsyncErrors( async (
  name: string,
  email: string,
  password: string
) => {
  await dbConnect();
  
  
await new Promise((resolve) => setTimeout(resolve, 5000));
   
  const newUser = await User.create({
    name,
    email,
    password,
    authProviders: [
      {
        provider: "credentials",
        providerId: email,
      },
    ],
  });

  return newUser?._id
    ? { created: true }
    : (() => {
        throw new Error("User not created");
      })();
});