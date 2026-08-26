import { createClient } from "@/lib/supabase-server";

export default async function ServicesPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    return <p>Could not load services.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Our Services</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {services.map((service) => (
          <div
            key={service.id}
            style={{
              border: "1px solid #444",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "160px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#2a2a2a",
                  color: "#999",
                  textAlign: "center",
                  padding: "0.5rem",
                }}
              >
                {service.name}
              </div>
            )}

            <div style={{ padding: "1rem" }}>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <p>{service.price} EGP</p>
              <p>{service.duration_minutes} min</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
