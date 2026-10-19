import React from 'react';

function Contact() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h1>Contact Us</h1>
      <p>Email: info@example.com</p>
      <p>Phone: +123-456-7890</p>
      <p>Address: 123 Main Street, Your City</p>

      <form style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Your Email" />
        <textarea placeholder="Your Message" rows="4"></textarea>
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
}

export default Contact;