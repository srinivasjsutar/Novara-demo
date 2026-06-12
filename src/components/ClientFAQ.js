import { useState } from "react";
import { ChevronRight } from "lucide-react";

const defaultFaqs = [
  {
    id: 1,
    question: "What is Novara Nature Estates?",
    answer:
      "Novara Nature Estates is a premium farmland developer offering gated farm plots and agricultural land near Bangalore with clear titles, managed infrastructure, and long-term investment potential.",
  },
  {
    id: 2,
    question:
      "Where are your Projects located?",
    answer:
      "Our Project are strategically located near Lepakshi, in the fast-developing North Bangalore corridor, offering excellent connectivity to the airport region while preserving peaceful natural surroundings and long-term investment potential.",
  },
  {
    id: 3,
    question: "Is agricultural land a good investment near Bangalore?",
    answer:
      "Yes. Farmland near Bangalore has shown strong appreciation due to airport expansion, infrastructure growth, and increasing demand for gated farmland communities.",
  },
  {
    id: 4,
    question: "Do you provide gated farmland projects?",
    answer:
      "Yes. Novara offers gated farmland projects with internal roads, fencing, water facilities, and plantation support for a secure and structured investment experience.",
  },
  {
    id: 5,
    question:"Is the farmland legally clear?",
    answer:"All our agricultural land parcels come with clear titles, proper documentation, and legal due diligence to ensure a safe purchase."
  },
  {
    id: 6,
    question:"Do you provide plantation or farm management support?",
    answer:"Yes, we offer optional managed farmland services including plantation assistance and maintenance support."
  }
];

export function ClientFAQ({ title = "Frequently Asked Questions", faqs = defaultFaqs }) {
  const [selected, setSelected] = useState(faqs[1]?.id ?? faqs[0]?.id);

  const activeItem = faqs.find((f) => f.id === selected);

  return (
    
    <section className="w-full py-10 px-6 md:px-12 lg:px-[120px]">
      {/* Heading */}
      <h2
        className="text-3xl md:text-4xl lg:text-5xl mb-10 text-gray-900 font-brushelva"
      >
        {title}
      </h2>

      {/* Layout */}
      <div className="relative flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto">
        {/* Left: Question List */}
        <div className=" bg-gray-50/10 rounded-2xl lg:p-4 md:p-6 flex flex-col gap-1 lg:w-[640px]">
          {faqs.map((faq) => {
            const isActive = faq.id === selected;
            return (
              <button
                key={faq.id}
                onClick={() => setSelected(faq.id)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-4 rounded-xl text-left transition-all group ${
                  isActive ? "bg-white shadow-sm" : "hover:bg-white/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Dot */}
                  <span
                    className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full transition-colors ${
                      isActive ? "bg-teal-700" : "bg-teal-500/60"
                    }`}
                  />
                  <span
                    className={` md:text-[16px] leading-snug transition-colors ${
                      isActive ? "text-gray-900 font-medium" : "text-gray-800"
                    }`}
                  >
                    {faq.question}
                  </span>
                </div>
                <ChevronRight
                  className={`flex-shrink-0 w-4 h-4 transition-colors ${
                    isActive ? "text-teal-700" : "text-gray-400"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Answer Panel */}
          <div className=" lg:w-[648px] bg-[#FAFBFF] rounded-2xl p-6 md:p-8 flex flex-col justify-start min-h-[200px]">
          {activeItem ? (
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 leading-snug">
                {activeItem.question}
              </h3>
              <p className="text-sm md:text-[16px] text-gray-800 leading-relaxed">
                {activeItem.answer}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Select a question to see the answer.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ClientFAQ;