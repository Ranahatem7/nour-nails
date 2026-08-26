"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

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
          <div>
            <label>Image</label>
            <br />
            <input type="file" accept="image/*" onChange={handleNewFileChange} />
          </div>
          {newImagePreview && (
            <img
              src={newImagePreview}
              alt="Preview"
              style={{ width: "120px", height: "120px", objectFit: "cover", border: "1px solid #444" }}
            />
          )}
          <button onClick={handleAdd} disabled={uploading}>
            {uploading ? "Uploading..." : "Add service"}
          </button>
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
                <div>
                  <label>Image</label>
                  <br />
                  <input type="file" accept="image/*" onChange={handleEditFileChange} />
                </div>
                {editImagePreview && (
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    style={{ width: "120px", height: "120px", objectFit: "cover", border: "1px solid #444" }}
                  />
                )}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleUpdate(service.id)} disabled={uploading}>
                    {uploading ? "Uploading..." : "Save"}
                  </button>
                  <button onClick={cancelEdit} disabled={uploading}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3>
                  {service.name} {!service.is_active && "(inactive)"}
                </h3>
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    style={{ width: "120px", height: "120px", objectFit: "cover", border: "1px solid #444" }}
                  />
                )}
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
