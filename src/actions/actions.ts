"use server";

import { signIn, signOut } from "@/lib/auth-no-edge";
import prisma from "@/lib/db";
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { checkAuth, getPetById } from "@/lib/server-utils";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//-----user actions------
export async function logIn(prevState: unknown, formData: unknown) {
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid Form Data",
    };
  }

  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return {
            message: "Invalid Credentials",
          };
        }
        default: {
          return {
            message: "Could not sign in",
          };
        }
      }
    }
    throw error; // nextjs redirect() throws error, so we need to rethrow it
  }
}

export async function signUp(prevState: unknown, formData: unknown) {
  //check if formData is of type FormData
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid Form Data",
    };
  }

  //convert formData to plain object
  const formDataEntries = Object.fromEntries(formData.entries());

  //validation
  const validatedFormData = authSchema.safeParse(formDataEntries);
  if (!validatedFormData.success) {
    return {
      message: "Invalid Form Data",
    };
  }

  const { email, password } = validatedFormData.data;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Email already exists",
        };
      }
    }
    return {
      message: "Could not create user!!",
    };
  }

  await signIn("credentials", formData);
}

export async function logOut() {
  await signOut({
    redirectTo: "/",
  });
}

// -----Pet actions-------
export async function addPet(newPet: unknown) {
  const session = await checkAuth();
  console.log("Adding pet for user:", session.user.id);

  const validatedPet = petFormSchema.safeParse(newPet);
  console.log("Validated pet:", validatedPet);
  if (!validatedPet.success) {
    return {
      message: "Invalid pet data",
    };
  }

  try {
    await prisma.pet.create({
      data: {
        ...validatedPet.data,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to add pet: " + error);
    return {
      message: "could not add pet",
    };
  }
  revalidatePath("/app", "layout");
}

export async function editPet(petId: unknown, newPetData: unknown) {
  //authentication
  const session = await checkAuth();

  //validation
  const validatedPetId = petIdSchema.safeParse(petId);
  const validatedPet = petFormSchema.safeParse(newPetData);

  if (!validatedPetId.success || !validatedPet.success) {
    return {
      message: "Invalid pet data",
    };
  }

  //authorization
  const pet = await getPetById(validatedPetId.data);

  if (!pet) {
    return {
      message: "No pet found!!!",
    };
  }

  if (pet.userId !== session.user.id) {
    return {
      messsage: "Not authorized",
    };
  }

  //Database mutation
  try {
    await prisma.pet.update({
      where: {
        id: validatedPetId.data,
      },
      data: validatedPet.data,
    });
  } catch (error) {
    console.error("Failed to edit pet: " + error);
    return {
      message: "could not update pet",
    };
  }
  revalidatePath("/app", "layout");
}

export async function deletePet(petId: unknown) {
  //authentication
  const session = await checkAuth();

  //validation
  const validatedPetId = petIdSchema.safeParse(petId);
  if (!validatedPetId.success) {
    return {
      message: "Invalid Pet data",
    };
  }

  //authorization check
  const pet = await getPetById(validatedPetId.data);

  if (!pet) {
    return {
      message: "No Pet found",
    };
  }

  if (pet.userId !== session.user.id) {
    return {
      message: "Not authorized",
    };
  }

  //database mutation
  try {
    await prisma.pet.delete({
      where: {
        id: validatedPetId.data,
      },
    });
  } catch (error) {
    console.error("Failed to delete pet: " + error);
    return {
      message: "could not delete pet",
    };
  }
  revalidatePath("/app", "layout");
}

//--- payment actions ---

export async function createCheckoutSession() {
  //authentication check
  const session = await checkAuth();

  //create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: "price_1SPi1RLPrBCnwcRTB1bSRqhu",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CANONICAL_URL}/payment?success=true`,
    cancel_url: `${process.env.CANONICAL_URL}/payment?canceled=true`,
  });
  // redirect user
  // redirect(checkoutSession.url);
  // console.log(checkoutSession.url);
  return checkoutSession.url;
}
