"use client";
// import { createCheckoutSession } from "@/actions/actions";
import H1 from "@/components/h1";
import { Button } from "@/components/ui/button";
import React, { useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const success = searchParams?.success === "true";
  const canceled = searchParams?.canceled === "true";
  const [isPending, startTransition] = useTransition();
  const { data: session, update, status } = useSession();
  const router = useRouter();

  const handleCheckout = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
        });
        const data = await res.json();
        if (data.url) {
          window.location.assign(data.url); // Redirect to Stripe
        } else {
          alert("Failed to start checkout. Please try again.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  };
  return (
    <main className="flex flex-col items-center space-y-10">
      <H1>PetSoft Pro Access requires payment</H1>

      {success && (
        <Button
          disabled={status === "loading" || session?.user.hasAccess}
          onClick={async () => {
            await update(true);
            router.push("/app/dashboard");
          }}
        >
          Access PetSoft Pro.
        </Button>
      )}

      {!success && (
        <Button
          disabled={isPending}
          onClick={
            /*async () => {
            startTransition(async () => {
              await createCheckoutSession();
            });
          }*/
            handleCheckout
          }
        >
          Buy Lifetime access for just $299.
        </Button>
      )}
      {success && (
        <p className="text-sm text-green-700">
          Payment successful. You now have lifetime access to PetSoft Pro
        </p>
      )}
      {canceled && (
        <p className="text-sm text-red-700">
          Payment cancelled. You can try again.
        </p>
      )}
    </main>
  );
}
