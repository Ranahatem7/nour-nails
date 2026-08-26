import { createClient } from "@/lib/supabase-server";
import ServiceCard from "@/components/ServiceCard";
import theme from "@/lib/theme";

export default async function ServicesPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    return <p style={{ padding: theme.spacing.xl, textAlign: "center" }}>Could not load services.</p>;
  }

  return (
    <div style={{ padding: `${theme.spacing.xl} ${theme.spacing.lg}`, maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: theme.spacing.xl }}>
        <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "2.25rem", color: theme.colors.text, margin: "0 0 0.5rem" }}>
          Our Services
        </h1>
        <p style={{ color: theme.colors.textMuted, margin: 0 }}>
          Every treatment, priced and timed so you know exactly what to expect.
        </p>
      </div>

      {services.length === 0 ? (
        <p style={{ textAlign: "center", color: theme.colors.textMuted }}>No services available right now.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: theme.spacing.lg,
          }}
        >
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
