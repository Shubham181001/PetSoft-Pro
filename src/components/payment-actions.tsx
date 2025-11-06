"use client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { UpdateSession } from "next-auth/react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type PaymentActionsProps = {
  handleCheckout: () => void;
  session: Session | null;
  update: UpdateSession;
  status: "loading" | "authenticated" | "unauthenticated";
  router: AppRouterInstance;
  isPending: boolean;
};

export default function PaymentActions({
  handleCheckout,
  session,
  update,
  status,
  router,
  isPending,
}: PaymentActionsProps) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  return (
    <>
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
        <Button disabled={isPending} onClick={handleCheckout}>
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
    </>
  );
}
