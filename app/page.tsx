import * as Components from "./components";
import { client } from "@/lib/shopify/serverClient";
import { getShop } from "@/lib/shopify/graphql/query";

export default async function Home() {
  "use cache";
  const resp = await client.request(getShop);
  return (
    <Components.NameInputRoot initialValue="world">
      <main className="w-screen h-screen flex flex-col gap-8 justify-center items-center max-w-2xl mx-auto">
        <h1 className="text-6xl">
          Hello <Components.NameDisplay /> and good luck 😄!
        </h1>
        {resp.data?.shop.name && (
          <h2 className="text-4xl">Store name: {resp.data?.shop?.name}</h2>
        )}
        <form>
          <Components.NameInput
            className="border-2 border-yellow-500 rounded p-4 text-2xl w-full dark:bg-black dark:text-gray-300 dark:placeholder:text-gray-400"
            name="name"
            placeholder="name"
          />
        </form>
      </main>
    </Components.NameInputRoot>
  );
}
