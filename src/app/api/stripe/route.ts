import prisma from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  //verify webhook came from stripe
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("Webhook verification failed", error);
    return Response.json(null, { status: 400 });
  }

  // fulfill orders

  switch (event.type) {
    case "checkout.session.completed":
      await prisma.user.update({
        where: {
          email: event.data.object.customer_email,
        },
        data: {
          hasAccess: true,
        },
      });
      break;
    default:
      console.log("Unhandled event type", event.type);
  }

  //return 200 ok
  return Response.json(null, { status: 200 });
}
