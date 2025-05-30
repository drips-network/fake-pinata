import express from 'express';
import cors from 'cors';
import hash from "ipfs-only-hash";
import db from './db'; // Import the database instance

const app = express();


app.use(express.json());
app.use(cors());

app.post('/pinning/pinJSONToIPFS', async (req, res) => {
  const { pinataContent } = req.body;

  if (!pinataContent) return res.sendStatus(400);

  try {
    const cid = await hash.of(JSON.stringify(pinataContent));

    // Check if CID already exists
    const selectStmt = db.prepare('SELECT cid, timestamp, pin_size FROM pins WHERE cid = ?');
    const existingPin = selectStmt.get(cid) as { cid: string; timestamp: string; pin_size: number } | undefined;

    if (existingPin) {
      // If CID exists, return existing data
      res.json({
        IpfsHash: existingPin.cid,
        PinSize: existingPin.pin_size,
        Timestamp: existingPin.timestamp,
      });
      console.log(`PIN DUPLICATE (already exists) — ${cid}`, pinataContent);
    } else {
      // If CID does not exist, insert new pin
      const timestamp = new Date().toISOString();
      const pinSize = JSON.stringify(pinataContent).length; // Calculate pin size from stringified content

      const insertStmt = db.prepare('INSERT INTO pins (cid, content, timestamp, pin_size) VALUES (?, ?, ?, ?)');
      insertStmt.run(cid, JSON.stringify(pinataContent), timestamp, pinSize);

      res.json({
        IpfsHash: cid,
        PinSize: pinSize,
        Timestamp: timestamp,
      });
      console.log(`PIN SUCCESS — ${cid}`, pinataContent);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.get('/ipfs/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const stmt = db.prepare('SELECT content FROM pins WHERE cid = ?');
    const row = stmt.get(cid) as { content: string } | undefined;

    if (!row) {
      return res.sendStatus(404);
    }

    const pinataContent = JSON.parse(row.content);
    res.json(pinataContent);

    console.log(`RETRIEVE SUCCESS — ${cid}`, pinataContent);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.listen(3000, '::', () => {
  console.log('Listening on port 3000 (IPv6 and IPv4)');
});
