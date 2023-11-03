import express from 'express';
import cors from 'cors';
import hash from "ipfs-only-hash";

const app = express();

/**
 * We're saving data in here. It's totally fine since this service is only intended
 * to be ran ephemerally in the context of an E2E test.
 */
const GLOBAL_KEY_STORE: Record<string, unknown> = {};

app.use(express.json());
app.use(cors());

app.post('/pinning/pinJSONToIPFS', async (req, res) => {
  const { pinataContent } = req.body;

  if (!pinataContent) return res.sendStatus(400);

  try {
    const cid = await hash.of(JSON.stringify(pinataContent));

    GLOBAL_KEY_STORE[cid] = pinataContent;

    res.json({
      IpfsHash: cid,
      PinSize: pinataContent.length,
      Timestamp: new Date().toISOString(),
    });

    console.log(`PIN SUCCESS — ${cid}`, pinataContent)
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.get('/ipfs/:cid', async (req, res) => {
  const { cid } = req.params;

  const pinataContent = GLOBAL_KEY_STORE[cid];

  if (!pinataContent) {
    return res.sendStatus(404);
  }

  res.json(pinataContent);

  console.log(`RETRIEVE SUCCESS — ${cid}`, pinataContent)
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
