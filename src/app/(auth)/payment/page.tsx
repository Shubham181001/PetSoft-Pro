import H1 from "@/components/h1";
// import { Button } from "@/components/ui/button";
import React, { Suspense, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PaymentActions from "@/components/payment-actions";

export default function Page() {
  // const { success, canceled } = React.use(searchParams);
  // const searchParams = useSearchParams();
  // const success = searchParams.get("success");
  // const canceled = searchParams.get("canceled");
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

      <Suspense fallback={null}>
        <PaymentActions
          handleCheckout={handleCheckout}
          session={session}
          update={update}
          status={status}
          router={router}
          isPending={isPending}
        />
      </Suspense>
    </main>
  );
}
