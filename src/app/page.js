import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import Button from "@/components/Button";
import ServiceCard from "@/components/ServiceCard";
import theme from "@/lib/theme";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toDisplayTime = (time) => (time ? time.slice(0, 5) : "");

export default async function Home() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true })
    .limit(3);

  const { data: hours } = await supabase
    .from("working_hours")
    .select("*")
    .order("day_of_week", { ascending: true });

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(135deg, ${theme.colors.surfaceAlt}, ${theme.colors.background})`,
          padding: `${theme.spacing.xxl} ${theme.spacing.lg}`,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: theme.spacing.xl,
            alignItems: "center",
          }}
        >
          <div>
            <Image src="/logo.png" alt="Nour Nails" width={72} height={72} priority style={{ objectFit: "contain" }} />

            <h1
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: "2.75rem",
                color: theme.colors.text,
                margin: "1.25rem 0 0.75rem",
                lineHeight: 1.15,
              }}
            >
              Beautiful nails,
              <br />
              <span style={{ color: theme.colors.primary, fontStyle: "italic" }}>effortlessly booked.</span>
            </h1>

            <p
              style={{
                color: theme.colors.textMuted,
                fontSize: "1.05rem",
                lineHeight: 1.6,
                maxWidth: "440px",
                margin: "0 0 2rem",
              }}
            >
              Premium manicures, pedicures, and nail art in a calm, elegant studio.
              Pick your service, pick your time, and we&apos;ll take care of the rest.
            </p>

            <div style={{ display: "flex", gap: theme.spacing.md, flexWrap: "wrap" }}>
              <Button href="/booking" size="lg">
                Book Now
              </Button>
              <Button href="/services" variant="outline" size="lg">
                View Services
              </Button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: theme.spacing.md,
            }}
          >
            <div
              style={{
                position: "relative",
                aspectRatio: "3 / 4",
                borderRadius: theme.radii.lg,
                overflow: "hidden",
                boxShadow: theme.shadows.lg,
                marginTop: theme.spacing.xl,
              }}
            >
              <Image
                src="/hero-1.png"
                alt="Nour Nails manicure detail"
                fill
                sizes="(max-width: 768px) 45vw, 260px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div
              style={{
                position: "relative",
                aspectRatio: "3 / 4",
                borderRadius: theme.radii.lg,
                overflow: "hidden",
                boxShadow: theme.shadows.lg,
              }}
            >
              <Image
                src="/hero-2.png"
                alt="Nour Nails nail art detail"
                fill
                sizes="(max-width: 768px) 45vw, 260px"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services teaser */}
      <section style={{ padding: `${theme.spacing.xxl} ${theme.spacing.lg}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: theme.spacing.xl }}>
            <h2 style={{ fontFamily: theme.fonts.heading, fontSize: "2rem", color: theme.colors.text, margin: "0 0 0.5rem" }}>
              Our Signature Services
            </h2>
            <p style={{ color: theme.colors.textMuted, margin: 0 }}>
              A few favorites — see the full menu for everything we offer.
            </p>
          </div>

          {services && services.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: theme.spacing.lg,
              }}
            >
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: theme.colors.textMuted }}>
              Services are coming soon.
            </p>
          )}

          <div style={{ textAlign: "center", marginTop: theme.spacing.xl }}>
            <Button href="/services" variant="secondary">
              View all services
            </Button>
          </div>
        </div>
      </section>

      {/* Working hours */}
      <section style={{ background: theme.colors.surfaceAlt, padding: `${theme.spacing.xxl} ${theme.spacing.lg}` }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: theme.fonts.heading, fontSize: "2rem", color: theme.colors.text, margin: "0 0 1.5rem" }}>
            Working Hours
          </h2>

          <div
            style={{
              background: theme.colors.surface,
              borderRadius: theme.radii.md,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.sm,
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            {(hours || []).map((day, i) => (
              <div
                key={day.day_of_week}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  borderTop: i === 0 ? "none" : `1px solid ${theme.colors.border}`,
                }}
              >
                <span style={{ fontWeight: 500 }}>{DAY_NAMES[day.day_of_week]}</span>
                <span style={{ color: day.is_open ? theme.colors.textMuted : theme.colors.danger }}>
                  {day.is_open ? `${toDisplayTime(day.open_time)} – ${toDisplayTime(day.close_time)}` : "Closed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: theme.colors.primaryDark,
          color: theme.colors.textOnPrimary,
          padding: `${theme.spacing.xl} ${theme.spacing.lg}`,
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: theme.fonts.heading, fontSize: "1.4rem", margin: "0 0 0.5rem" }}>Nour Nails</p>
        <p style={{ opacity: 0.85, margin: "0 0 1rem", fontSize: "0.9rem" }}>
          Premium nail care, made simple to book.
        </p>
        <p style={{ opacity: 0.7, margin: 0, fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} Nour Nails. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
