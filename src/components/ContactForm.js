import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ChevronDown } from "lucide-react";
import { navigate } from "vike/client/router";

const API_BASE = import.meta.env.VITE_API_BASE || "https://novara-backend-one.vercel.app";

const validationSchema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters"),
  email: Yup.string()
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  inquiry_project: Yup.string()
    .oneOf(["Ecovara"], "Invalid project"),
  know_us: Yup.string(),
  message: Yup.string()
    .min(10, "Message must be at least 10 characters"),
  agreeToTerms: Yup.boolean()
    .oneOf([true], "Please accept the Terms of Use and Privacy Policy.")
    .required("Please accept the Terms of Use and Privacy Policy."),
});

const hearAboutOptions = [
  "Select",
  "Social Media",
  "Google Search",
  "Friend/Family",
  "Advertisement",
  "Real Estate Agent",
  "Other",
];

export default function ContactForm() {
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      inquiry_project: "Ecovara",
      know_us: "",
      message: "",
      agreeToTerms: false,
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        const response = await fetch(`${API_BASE}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.text();
        if (!response.ok) {
          alert(data || "Something went wrong, please try again.");
          return;
        }

         window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event:        "crm_lead",
      form_name:    `${values.firstName} ${values.lastName || ""}`.trim(),
      form_mobile:  values.phone,
      form_email:   values.email,
      form_message: values.message,
      form_source:  "Novara Website",
    });
        resetForm();
        // Vike navigate — pass state via query params or a global store
       setTimeout(() => {
  navigate(`/thankyou?name=${encodeURIComponent(
    `${values.firstName} ${values.lastName || ""}`.trim()
  )}&phone=${encodeURIComponent(values.phone)}`);
}, 500);
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("There was an error submitting the form.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-4">
      <div className="w-full max-w-[1600px] border-2 border-white/30 rounded-2xl p-6 lg:p-12 backdrop-blur-sm">
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">First Name</label>
              <input
                type="text" name="firstName" placeholder="Enter First Name"
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.firstName}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="text-red-300 text-xs mt-1">{formik.errors.firstName}</div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Last Name</label>
              <input
                type="text" name="lastName" placeholder="Enter Last Name"
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.lastName}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="text-red-300 text-xs mt-1">{formik.errors.lastName}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Email</label>
              <input
                type="email" name="email" placeholder="Enter your Email"
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-300 text-xs mt-1">{formik.errors.email}</div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Phone</label>
              <input
                type="tel" name="phone" placeholder="Enter Phone Number"
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.phone}
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="text-red-300 text-xs mt-1">{formik.errors.phone}</div>
              )}
            </div>

            {/* Inquiry Project */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Inquiry Project</label>
              <div className="relative">
                <select
                  name="inquiry_project"
                  onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.inquiry_project}
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                >
                  <option value="Ecovara">Ecovara</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" size={20} />
              </div>
              {formik.touched.inquiry_project && formik.errors.inquiry_project && (
                <div className="text-red-300 text-xs mt-1">{formik.errors.inquiry_project}</div>
              )}
            </div>

            {/* How Did You Hear */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">How Did You Hear About Us?</label>
              <div className="relative">
                <select
                  name="know_us"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.know_us}
                >
                  {hearAboutOptions.map((option, index) => (
                    <option key={index} value={option} disabled={index === 0}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" size={20} />
              </div>
              {formik.touched.know_us && formik.errors.know_us && (
                <div className="text-red-300 text-xs mt-1">{formik.errors.know_us}</div>
              )}
            </div>

            {/* Message */}
            <div className="lg:col-span-3">
              <label className="block text-white text-sm font-medium mb-2">Message</label>
              <textarea
                name="message" placeholder="Enter your Message here.." rows="5"
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.message}
              />
              {formik.touched.message && formik.errors.message && (
                <div className="text-red-300 text-xs mt-1">{formik.errors.message}</div>
              )}
            </div>
          </div>

          {/* Checkbox + Submit */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox" name="agreeToTerms" id="agreeToTerms"
                className="mt-0.5 w-5 h-5 rounded border-2 border-white bg-transparent checked:bg-white checked:border-white focus:ring-2 focus:ring-yellow-400 cursor-pointer accent-white"
                onChange={formik.handleChange} onBlur={formik.handleBlur} checked={formik.values.agreeToTerms}
              />
              <label htmlFor="agreeToTerms" className="text-white/80 text-sm cursor-pointer">
                I agree with <span className="font-semibold text-yellow-400">Terms of Use</span> and <span className="font-semibold text-yellow-400">Privacy Policy</span>
              </label>
            </div>
            {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
              <div className="text-red-300 text-xs">{formik.errors.agreeToTerms}</div>
            )}

            <button
              type="submit"
              className="w-full lg:w-auto bg-[#D4A521] hover:bg-[#F5C842] text-white font-semibold px-12 py-3 rounded-lg transition-colors duration-300 cursor-pointer"
            >
              Send Your Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
