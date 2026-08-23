import { redirect } from "next/navigation";

export default function AdminIntegrationsRedirectPage() {
  redirect("/admin/settings/integrations");
}
