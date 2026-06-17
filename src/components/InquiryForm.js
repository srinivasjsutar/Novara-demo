import { useFormik } from "formik";
import * as Yup from "yup";
import { navigate } from "vike/client/router";

const API_BASE = import.meta.env.VITE_API_BASE || "https://novara-backend-one.vercel.app";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  agreeToTerms: Yup.boolean()
    .oneOf([true], "You must agree to the terms")
    .required("You must agree to the terms"),
});

export default function InquiryForm() {
  const formik = useFormik({
    initialValues: { name: "", email: "", phone: "", agreeToTerms: false },
    validationSchema,
    onSubmit: async (values) => {
      formik.resetForm();
      try {
        const response = await fetch(`${API_BASE}/blogs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.text();
        if (response.ok) {
          alert(data);
        } else {
          alert("Something went wrong, please try again.");
        }
        navigate(`/thankyou?name=${encodeURIComponent(values.name)}&phone=${encodeURIComponent(values.phone)}`);
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("There was an error submitting the form.");
      }
    },
  });

  return (
    <div className="flex justify-center items-center font-urbanist">
      <div className="bg-[#1A614F] text-white rounded-lg px-6 py-4">
        <h2 className="text-[18px] font-semibold text-center font-urbanist">
          Make a Smart Investment Today !!!
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="py-1">
            <input type="text" name="name" id="name" placeholder="Name"
              className="w-full p-2 rounded-lg mt-2 text-gray-800"
              onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-300 text-xs mt-1">{formik.errors.name}</div>
            )}
          </div>

          <div className="py-1">
            <input type="email" name="email" id="email" placeholder="Enter your Email"
              className="w-full p-2 rounded-lg mt-2 text-gray-800"
              onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-300 text-xs mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div className="py-1">
            <input type="tel" name="phone" id="phone" placeholder="Enter Phone Number"
              className={`w-full p-2 rounded-lg text-gray-800 mt-2 ${formik.touched.phone && formik.errors.phone ? "border-red-500" : "border-gray-300"}`}
              onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.phone}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-300 text-xs mt-1">{formik.errors.phone}</div>
            )}
          </div>

          <div className="flex items-center pt-2">
            <input type="checkbox" name="agreeToTerms" id="agreeToTerms"
              className="mr-2 w-5 h-5"
              onChange={formik.handleChange} onBlur={formik.handleBlur} checked={formik.values.agreeToTerms}
            />
            <label htmlFor="agreeToTerms" className="text-[14px] text-[#999999]">
              I agree with Terms of Use and Privacy Policy
            </label>
          </div>
          {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
            <div className="text-red-300 text-xs mt-1">{formik.errors.agreeToTerms}</div>
          )}

          <button type="submit" className="w-full bg-[#DCA000] text-white p-2 rounded-lg mt-4">
            Send Your Message
          </button>
        </form>
      </div>
    </div>
  );
}