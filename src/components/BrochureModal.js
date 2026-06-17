import { useState } from "react";
import { X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://novara-backend-one.vercel.app";

const DEFAULT_FIELDS = [
  { name: "name",  label: "Full Name",      type: "text",  placeholder: "Your name",        required: true },
  { name: "email", label: "Email Address",  type: "email", placeholder: "you@email.com",    required: true },
  { name: "phone", label: "Phone Number",   type: "tel",   placeholder: "+91 98765 43210",  required: true },
];

const DEFAULT_PROPS = {
  title:          "Download Brochure",
  description:    "Fill in your details and we'll send the brochure to you.",
  successTitle:   "Thank You!",
  successMessage: "Your brochure is on its way. Our team will reach out to you shortly.",
  submitLabel:    "Get Brochure",
  accentColor:    "#1A614F",
  ctaColor:       "#DCA000",
  ctaHoverColor:  "#E3A600",
};

/** Default submit handler — POSTs to /brochure and pushes a GTM event */
async function defaultOnSubmit(formData) {
  const response = await fetch(`${API_BASE}/brochure`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(formData),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || "Something went wrong. Please try again.");

  // GTM / dataLayer event (mirrors ContactForm pattern)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event:       "brochure_lead",
    form_name:   formData.name,
    form_mobile: formData.phone,
    form_email:  formData.email,
    form_source: "Novara Website – Brochure Modal",
  });
}

export default function BrochureModal({
  isOpen,
  onClose,
  onSubmit = defaultOnSubmit,
  title          = DEFAULT_PROPS.title,
  description    = DEFAULT_PROPS.description,
  successTitle   = DEFAULT_PROPS.successTitle,
  successMessage = DEFAULT_PROPS.successMessage,
  submitLabel    = DEFAULT_PROPS.submitLabel,
  fields         = DEFAULT_FIELDS,
  accentColor    = DEFAULT_PROPS.accentColor,
  ctaColor       = DEFAULT_PROPS.ctaColor,
  ctaHoverColor  = DEFAULT_PROPS.ctaHoverColor,
}) {
  const initialForm = Object.fromEntries(fields.map((f) => [f.name, ""]));

  const [form, setForm]           = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (onSubmit) await onSubmit({ ...form });
      setSubmitted(true);
    } catch (err) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closed so modal is fresh next time
    setForm(initialForm);
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <SuccessView
            title={successTitle}
            message={successMessage}
            accentColor={accentColor}
            onClose={handleClose}
          />
        ) : (
          <FormView
            title={title}
            description={description}
            submitLabel={submitLabel}
            fields={fields}
            form={form}
            loading={loading}
            error={error}
            accentColor={accentColor}
            ctaColor={ctaColor}
            ctaHoverColor={ctaHoverColor}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function SuccessView({ title, message, accentColor, onClose }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">🎉</div>
      <h2 className="font-brushelva text-2xl mb-2" style={{ color: accentColor }}>
        {title}
      </h2>
      <p className="text-gray-600 font-urbanist">{message}</p>
      <button
        onClick={onClose}
        className="mt-6 text-white px-6 py-2 rounded-lg transition font-urbanist"
        style={{ backgroundColor: accentColor }}
      >
        Close
      </button>
    </div>
  );
}

function FormView({
  title, description, submitLabel,
  fields, form, loading, error,
  accentColor, ctaColor, ctaHoverColor,
  onChange, onSubmit,
}) {
  return (
    <>
      <h2 className="font-brushelva text-2xl lg:text-3xl mb-1" style={{ color: accentColor }}>
        {title}
      </h2>
      <p className="text-gray-500 font-urbanist text-sm mb-6">{description}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 font-urbanist">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type ?? "text"}
              name={field.name}
              required={field.required ?? true}
              value={form[field.name] ?? ""}
              onChange={onChange}
              placeholder={field.placeholder ?? ""}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
              style={{ "--tw-ring-color": accentColor }}
            />
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
          style={{ backgroundColor: loading ? ctaColor : ctaColor }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ctaHoverColor)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ctaColor)}
        >
          {loading ? "Sending…" : submitLabel}
        </button>
      </form>
    </>
  );
}
