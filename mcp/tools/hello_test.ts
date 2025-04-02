import { assertEquals, assertRejects } from "@std/assert";
import { hello } from "./hello.ts";

Deno.test("Hello tool - empty string", async () => {
  const result = await hello.cb({ input: "" });
  assertEquals(result.content[0].text, "Hello, !");
});

Deno.test("Hello tool - custom name parameter", async () => {
  const result = await hello.cb({ input: "Deno" });
  assertEquals(result.content[0].text, "Hello, Deno!");
});
