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

  // Handle contact form field changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle contact form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFeedback("❌ Please fill in all fields.");
      return;
    }

    // Simulate sending message (could be replaced with API call)
    setFeedback("✅ Your message has been sent!");
    setFormData({ name: "", email: "", message: "" }); // Reset form
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

      {/* Contact Support Form */}
      <section className="contact-form">
        <h3>📩 Contact Support</h3>
        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="support-input"
          />

          {/* Email input */}
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="support-input"
          />

          {/* Message textarea */}
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="support-textarea"
          />

          {/* Submit button */}
          <button type="submit" className="support-btn">Send Message</button>

          {/* Feedback after submission */}
          {feedback && <p className="support-feedback">{feedback}</p>}
        </form>
      </section>
    </div>
  );
};

export default HelpSupport;
