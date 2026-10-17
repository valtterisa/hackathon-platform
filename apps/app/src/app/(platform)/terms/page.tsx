import { redirect } from "next/navigation";
import { marketingUrl } from "@/lib/urls";

export default function TermsRedirect() {
  redirect(marketingUrl("/terms"));
}
