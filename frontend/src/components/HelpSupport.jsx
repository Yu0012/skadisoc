import React, { useState } from "react";
import "../styles.css";

const HelpSupport = () => {
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [feedback, setFeedback] = useState("");

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

  const toggleFAQ = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFeedback("❌ Please fill in all fields.");
      return;
    }
    // Simulate sending
    setFeedback("✅ Your message has been sent!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="support-container">
      <h2>🆘 Help & Support</h2>

      <section className="faq-section">
        <h3>📚 Frequently Asked Questions</h3>
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              {faq.question}
              <span>{expanded === index ? "−" : "+"}</span>
            </div>
            {expanded === index && <div className="faq-answer">{faq.answer}</div>}
          </div>
        ))}
      </section>

      <section className="contact-form">
        <h3>📩 Contact Support</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="support-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="support-input"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="support-textarea"
          />
          <button type="submit" className="support-btn">Send Message</button>
          {feedback && <p className="support-feedback">{feedback}</p>}
        </form>
      </section>
    </div>
  );
};

export default HelpSupport;
