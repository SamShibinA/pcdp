# PCDP Portal — My Leaves replica

## Run locally
1. Install Node.js (18+ recommended).
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000` on your computer. To test on your phone on the same Wi-Fi, open `http://YOUR_COMPUTER_LAN_IP:3000`.

## Data persistence
New requests are stored in `data.json` in this same project folder by `server.js`. Keep the server running and open the page through `http://localhost:3000` (not by double-clicking `index.html`) to use server storage. Back up `data.json` regularly.

## Status rule implemented
- Parent Status: always `Approved` for newly created sample requests.
- Status: `Approved` while the leave's To Date is today or in the future; `Completed` after the To Date is in the past.
- The page recalculates status when it loads, so old requests become Completed automatically.

## Important
This is a replica/demo, not connected to the real PCDP Portal. It does not submit anything to your college. For access from outside your local network, deploy the Node app to a server and use persistent disk/database storage; many serverless hosts do not preserve writes to local JSON files. Do not store sensitive real student data on an unsecured public server.
