"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  duration_minutes: "",
  is_active: true,
};

export default function AdminServicesPage() {
  const supabase = createClient();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [newService, setNewService] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const loadServices = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setMessage("Could not load services: " + error.message);
    } else {
      setServices(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAdd = async () => {
    if (!newService.name || !newService.price || !newService.duration_minutes) {
      setMessage("Name, price, and duration are required.");
      return;
    }

    const { error } = await supabase.from("services").insert({
      name: newService.name,
      description: newService.description,
      price: Number(newService.price),
      duration_minutes: Number(newService.duration_minutes),
      is_active: newService.is_active,
    });

    if (error) {
      setMessage("Could not add service: " + error.message);
      return;
    }

    setNewService(EMPTY_FORM);
    setMessage("");
    loadServices();
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration_minutes: service.duration_minutes,
      is_active: service.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from("services")
      .update({
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
        duration_minutes: Number(editForm.duration_minutes),
        is_active: editForm.is_active,
      })
      .eq("id", id);

    if (error) {
      setMessage("Could not update service: " + error.message);
      return;
    }

    cancelEdit();
    loadServices();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service? This cannot be undone.")) return;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      setMessage("Could not delete service: " + error.message);
      return;
    }

    loadServices();
  };

  return (
    <div>
      <h1>Manage Services</h1>

      {message && <p>{message}</p>}

      <div style={{ border: "1px solid #444", padding: "1rem", margin: "1rem 0" }}>
        <h3>Add a service</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
          <input
            placeholder="Name"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          />
          <input
            placeholder="Description"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price (EGP)"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={newService.duration_minutes}
            onChange={(e) =>
              setNewService({ ...newService, duration_minutes: e.target.value })
            }
          />
          <label>
            <input
              type="checkbox"
              checked={newService.is_active}
              onChange={(e) =>
                setNewService({ ...newService, is_active: e.target.checked })
              }
            />{" "}
            Active
          </label>
          <button onClick={handleAdd}>Add service</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : services.length === 0 ? (
        <p>No services yet.</p>
      ) : (
        services.map((service) => (
          <div
            key={service.id}
            style={{ border: "1px solid #444", padding: "1rem", marginBottom: "0.75rem" }}
          >
            {editingId === service.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
                <input
                  type="number"
                  value={editForm.duration_minutes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, duration_minutes: e.target.value })
                  }
                />
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_active: e.target.checked })
                    }
                  />{" "}
                  Active
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleUpdate(service.id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h3>
                  {service.name} {!service.is_active && "(inactive)"}
                </h3>
                <p>{service.description}</p>
                <p>
                  {service.price} EGP · {service.duration_minutes} min
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => startEdit(service)}>Edit</button>
                  <button onClick={() => handleDelete(service.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
