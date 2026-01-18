import { NextResponse } from "next/server";
import { client } from "@/lib/shopify/serverClient";
import { getProductByHandle } from "@/lib/shopify/graphql/query/getProductByHandle";

//server api route to keep token private

export async function GET(req: Request) {
  var { searchParams } = new URL(req.url);
  var handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json({ error: "Missing handle" }, { status: 400 });
  }

  var resp = await client.request(getProductByHandle, {
    variables: { handle },
  });

  if (resp.errors) {
    return NextResponse.json({ error: resp.errors.message ?? "Shopify error" }, { status: 500 });
  }

  return NextResponse.json({ product: resp.data?.productByHandle ?? null });
}
