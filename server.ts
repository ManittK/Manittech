import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;


  app.use(express.json());

  // Email API
  app.post("/api/notify", async (req, res) => {
    const { to, subject, body } = req.body;
    
    const user = process.env.NODEMAILER_USER;
    const pass = process.env.NODEMAILER_PASS;

    if (!user || !pass) {
      console.warn("Nodemailer credentials missing. Skipping email.");
      return res.status(200).json({ success: false, message: "Credentials missing" });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"Manittech Admin" <${user}>`,
        to: to || "manitt.kedia@manittech.com", // Default to owner as requested
        subject: subject || "System Notification",
        text: body,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
