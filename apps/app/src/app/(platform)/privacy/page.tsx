import { redirect } from "next/navigation";
import { marketingUrl } from "@/lib/urls";

export default function PrivacyRedirect() {
  redirect(marketingUrl("/privacy"));
}
