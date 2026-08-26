"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import theme from "@/lib/theme";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  duration_minutes: "",
  is_active: true,
  image_url: "",
};

export default function AdminServicesPage() {
  const supabase = createClient();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [newService, setNewService] = useState(EMPTY_FORM);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");

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

  // Uploads a file to the service-images bucket and returns its public URL
  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("service-images")
      .upload(path, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("service-images").getPublicUrl(path);

    return publicUrl;
  };

  const handleNewFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewImageFile(file);
    setNewImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEditImageFile(file);
    setEditImagePreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleAdd = async () => {
    if (!newService.name || !newService.price || !newService.duration_minutes) {
      setMessage("Name, price, and duration are required.");
      return;
    }

    setMessage("");
    let imageUrl = null;

    if (newImageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadImage(newImageFile);
      } catch (err) {
        setMessage("Could not upload image: " + err.message);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const { error } = await supabase.from("services").insert({
      name: newService.name,
      description: newService.description,
      price: Number(newService.price),
      duration_minutes: Number(newService.duration_minutes),
      is_active: newService.is_active,
      image_url: imageUrl,
    });

    if (error) {
      setMessage("Could not add service: " + error.message);
      return;
    }

    setNewService(EMPTY_FORM);
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImageFile(null);
    setNewImagePreview("");
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
      image_url: service.image_url || "",
    });
    setEditImageFile(null);
    setEditImagePreview(service.image_url || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    if (editImagePreview && editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImageFile(null);
    setEditImagePreview("");
  };

  const handleUpdate = async (id) => {
    setMessage("");
    let imageUrl = editForm.image_url || null;

    if (editImageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadImage(editImageFile);
      } catch (err) {
        setMessage("Could not upload image: " + err.message);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const { error } = await supabase
      .from("services")
      .update({
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
        duration_minutes: Number(editForm.duration_minutes),
        is_active: editForm.is_active,
        image_url: imageUrl,
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

  const imageBoxStyle = {
    width: "110px",
    height: "110px",
    objectFit: "cover",
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
  };

  return (
    <div>
      <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "1.75rem", color: theme.colors.text, margin: "0 0 1.25rem" }}>
        Manage Services
      </h1>

      {message && (
        <p style={{ background: theme.colors.dangerBg, color: theme.colors.danger, padding: "0.6rem 0.9rem", borderRadius: theme.radii.sm, fontSize: "0.9rem" }}>
          {message}
        </p>
      )}

      <div
        style={{
          background: theme.colors.surfaceAlt,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.md,
          padding: theme.spacing.lg,
          margin: `${theme.spacing.md} 0 ${theme.spacing.xl}`,
        }}
      >
        <h3 style={{ fontFamily: theme.fonts.heading, margin: "0 0 1rem", fontSize: "1.1rem" }}>Add a service</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm, maxWidth: "400px" }}>
          <Input
            placeholder="Name"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Price (EGP)"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Duration (minutes)"
            value={newService.duration_minutes}
            onChange={(e) =>
              setNewService({ ...newService, duration_minutes: e.target.value })
            }
          />
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={newService.is_active}
              onChange={(e) =>
                setNewService({ ...newService, is_active: e.target.checked })
              }
            />
            Active
          </label>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Image
            </label>
            <input type="file" accept="image/*" onChange={handleNewFileChange} />
          </div>
          {newImagePreview && <img src={newImagePreview} alt="Preview" style={imageBoxStyle} />}
          <Button onClick={handleAdd} disabled={uploading}>
            {uploading ? (
              <>
                <Spinner size={14} /> Uploading...
              </>
            ) : (
              "Add service"
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: theme.spacing.xl }}>
          <Spinner />
        </div>
      ) : services.length === 0 ? (
        <p style={{ color: theme.colors.textMuted }}>No services yet.</p>
      ) : (
        services.map((service) => (
          <div
            key={service.id}
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md,
              boxShadow: theme.shadows.sm,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.md,
            }}
          >
            {editingId === service.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm, maxWidth: "400px" }}>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
                <Input
                  type="number"
                  value={editForm.duration_minutes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, duration_minutes: e.target.value })
                  }
                />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_active: e.target.checked })
                    }
                  />
                  Active
                </label>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                    Image
                  </label>
                  <input type="file" accept="image/*" onChange={handleEditFileChange} />
                </div>
                {editImagePreview && <img src={editImagePreview} alt="Preview" style={imageBoxStyle} />}
                <div style={{ display: "flex", gap: theme.spacing.sm }}>
                  <Button onClick={() => handleUpdate(service.id)} disabled={uploading}>
                    {uploading ? (
                      <>
                        <Spinner size={14} /> Uploading...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button variant="ghost" onClick={cancelEdit} disabled={uploading}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: theme.spacing.lg, flexWrap: "wrap" }}>
                {service.image_url && <img src={service.image_url} alt={service.name} style={imageBoxStyle} />}
                <div style={{ flex: "1 1 200px" }}>
                  <h3 style={{ fontFamily: theme.fonts.heading, margin: "0 0 0.3rem", fontSize: "1.1rem" }}>
                    {service.name} {!service.is_active && (
                      <span style={{ color: theme.colors.textMuted, fontWeight: 400, fontSize: "0.85rem" }}>(inactive)</span>
                    )}
                  </h3>
                  <p style={{ color: theme.colors.textMuted, margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
                    {service.description}
                  </p>
                  <p style={{ margin: "0 0 0.9rem", fontWeight: 600, color: theme.colors.primary }}>
                    {service.price} EGP · <span style={{ color: theme.colors.textMuted, fontWeight: 400 }}>{service.duration_minutes} min</span>
                  </p>
                  <div style={{ display: "flex", gap: theme.spacing.sm }}>
                    <Button variant="outline" size="sm" onClick={() => startEdit(service)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(service.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
