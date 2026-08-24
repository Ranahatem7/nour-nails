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
    <div>
      <h1>Our Services</h1>

      <div>
        {services.map((service) => (
          <div key={service.id}>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <p>{service.price} EGP</p>
            <p>{service.duration_minutes} min</p>
          </div>
        ))}
      </div>
    </div>
  );
}