import { redirect } from "next/navigation";

/** Product home — discovery lives here; marketing lives on its own app. */
export default function AppHomePage() {
  redirect("/events");
}
