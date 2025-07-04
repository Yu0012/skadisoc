import React, { useState } from "react";
import "../styles.css";

const HelpSupport = () => {
  // State to manage which FAQ item is expanded
  const [expanded, setExpanded] = useState(null);

  // Form data for contact form
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  // Feedback message after form submission
  const [feedback, setFeedback] = useState("");

  // List of FAQs
  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Go to User Settings > Reset Password, enter your new password and confirm it.",
    },
    {
      question: "How do I schedule a post?",
      answer: "When creating a post, click the calendar icon to pick a date and time before posting.",
    },
    {
      question: "Can I edit a scheduled post?",
      answer: "Yes. Go to Posts > click the menu icon > Edit the post and reschedule.",
    },
  ];

  // Toggle FAQ expand/collapse
  const toggleFAQ = (index) => {
    setExpanded(expanded === index ? null : index);
  };



  return (
    <div className="support-container">
      <h2>🆘 Help & Support</h2>

      {/* FAQ Section */}
      <section className="faq-section">
        <h3>📚 Frequently Asked Questions</h3>
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            {/* Question toggle */}
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              {faq.question}
              <span>{expanded === index ? "−" : "+"}</span>
            </div>

            {/* Answer shown only if expanded. Added transition to make shown answer look better */}
            <div className={`faq-answer-wrapper ${expanded === index ? "expanded" : ""}`}>
               {expanded === index && <div className="faq-answer">{faq.answer}</div>}
             </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HelpSupport;
