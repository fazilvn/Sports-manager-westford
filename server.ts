import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("westford.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    full_name TEXT
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    status TEXT, -- 'active', 'completed', 'upcoming'
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    num_winners INTEGER DEFAULT 1,
    winner_positions TEXT, -- JSON string
    selection_type TEXT DEFAULT 'automatic', -- 'automatic', 'spin_and_win'
    background_image TEXT
  );

  -- Ensure new columns exist for existing tables
  PRAGMA table_info(campaigns);
`);

// Add missing columns if they don't exist (for existing databases)
const columns = db.prepare("PRAGMA table_info(campaigns)").all() as any[];
const columnNames = columns.map(c => c.name);

if (!columnNames.includes('num_winners')) {
  db.exec("ALTER TABLE campaigns ADD COLUMN num_winners INTEGER DEFAULT 1");
}
if (!columnNames.includes('winner_positions')) {
  db.exec("ALTER TABLE campaigns ADD COLUMN winner_positions TEXT");
}
if (!columnNames.includes('selection_type')) {
  db.exec("ALTER TABLE campaigns ADD COLUMN selection_type TEXT DEFAULT 'automatic'");
}
if (!columnNames.includes('background_image')) {
  db.exec("ALTER TABLE campaigns ADD COLUMN background_image TEXT");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    campaign_id INTEGER,
    is_winner INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)").run("admin", "admin123", "admin", "System Admin");
  
  db.prepare("INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners, selection_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    "Summer Spin & Win", "Spin and Win", "active", "2026-03-01", "2026-05-31", "Offline spin and win campaign at Westford Sports outlets.", 5, "spin_and_win"
  );
  db.prepare("INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    "Westford Cricket League 2026", "Tournament", "active", "2026-02-15", "2026-03-15", "The premier cricket tournament for local clubs and teams.", 1
  );
  db.prepare("INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    "Winter Sports Fest", "Offline Event", "completed", "2025-12-01", "2025-12-15", "Annual winter sports festival.", 10
  );
  db.prepare("INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    "New Year Fitness Drive", "Offline Event", "completed", "2026-01-01", "2026-01-31", "Start your year with a fitness challenge at our centers.", 3
  );
  db.prepare("INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    "Spring Marathon 2026", "Marathon", "upcoming", "2026-04-15", "2026-04-16", "Get ready for the biggest marathon in the city. Register now to secure your spot.", 1
  );
  db.prepare("INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    "Tennis Open Championship", "Tournament", "upcoming", "2026-05-10", "2026-05-20", "Westford Sports presents the annual Tennis Open. Open for all age groups.", 2
  );
  db.prepare("INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    "Summer Swimming Gala", "Tournament", "upcoming", "2026-06-20", "2026-06-25", "Cool off with our annual swimming competition for all ages.", 5
  );
  db.prepare("INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    "Badminton Smash Challenge", "Offline Event", "active", "2026-03-01", "2026-03-10", "Test your reflexes in our quick-fire badminton challenge.", 2
  );

  const campaign = db.prepare("SELECT id FROM campaigns WHERE name = ?").get("Summer Spin & Win") as { id: number };
  db.prepare("INSERT INTO participants (full_name, phone, email, campaign_id, is_winner) VALUES (?, ?, ?, ?, ?)").run(
    "John Doe", "1234567890", "john@example.com", campaign.id, 1
  );
  db.prepare("INSERT INTO participants (full_name, phone, email, campaign_id, is_winner) VALUES (?, ?, ?, ?, ?)").run(
    "Jane Smith", "0987654321", "jane@example.com", campaign.id, 0
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    // Try to find real user first
    let user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    // If not found, allow login anyway with a mock user
    if (!user) {
      user = {
        id: 999,
        username: username || "guest",
        role: "admin",
        full_name: username || "Guest Admin"
      };
    }

    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        full_name: user.full_name 
      } 
    });
  });

  app.get("/api/campaigns/:id", (req, res) => {
    const campaign = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(req.params.id);
    if (campaign) {
      res.json(campaign);
    } else {
      res.status(404).json({ message: "Campaign not found" });
    }
  });

  app.get("/api/campaigns/:id/participants", (req, res) => {
    const participants = db.prepare("SELECT * FROM participants WHERE campaign_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(participants);
  });

  app.post("/api/campaigns/:id/pick-winner", (req, res) => {
    const campaignId = req.params.id;
    const participants = db.prepare("SELECT id FROM participants WHERE campaign_id = ? AND is_winner = 0").all(campaignId) as { id: number }[];
    
    if (participants.length === 0) {
      return res.status(400).json({ message: "No eligible participants found" });
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];
    db.prepare("UPDATE participants SET is_winner = 1 WHERE id = ?").run(winner.id);
    
    const winnerDetails = db.prepare("SELECT * FROM participants WHERE id = ?").get(winner.id);
    res.json(winnerDetails);
  });

  app.get("/api/dashboard/stats", (req, res) => {
    const activeCampaigns = db.prepare("SELECT count(*) as count FROM campaigns WHERE status = 'active'").get() as { count: number };
    const totalParticipants = db.prepare("SELECT count(*) as count FROM participants").get() as { count: number };
    const totalWinners = db.prepare("SELECT count(*) as count FROM participants WHERE is_winner = 1").get() as { count: number };
    
    res.json({
      activeCampaigns: activeCampaigns.count,
      totalParticipants: totalParticipants.count,
      totalWinners: totalWinners.count
    });
  });

  app.get("/api/campaigns", (req, res) => {
    const campaigns = db.prepare("SELECT * FROM campaigns").all();
    res.json(campaigns);
  });

  app.post("/api/campaigns", (req, res) => {
    const { name, type, status, start_date, end_date, description, num_winners, winner_positions, selection_type, background_image } = req.body;
    const result = db.prepare(`
      INSERT INTO campaigns (name, type, status, start_date, end_date, description, num_winners, winner_positions, selection_type, background_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, type, status, start_date, end_date, description, num_winners, JSON.stringify(winner_positions || []), selection_type, background_image
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/campaigns/:id", (req, res) => {
    const { name, type, status, start_date, end_date, description, num_winners, winner_positions, selection_type, background_image } = req.body;
    const { id } = req.params;
    db.prepare(`
      UPDATE campaigns 
      SET name = ?, type = ?, status = ?, start_date = ?, end_date = ?, description = ?, num_winners = ?, winner_positions = ?, selection_type = ?, background_image = ?
      WHERE id = ?
    `).run(name, type, status, start_date, end_date, description, num_winners, JSON.stringify(winner_positions || []), selection_type, background_image, id);
    res.json({ success: true });
  });

  app.get("/api/participants", (req, res) => {
    const participants = db.prepare(`
      SELECT p.*, c.name as campaign_name 
      FROM participants p 
      JOIN campaigns c ON p.campaign_id = c.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(participants);
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, username, role, full_name FROM users").all();
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
