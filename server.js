// PCDP Leave Replica: Express server with Vercel serverless support
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(__dirname));

let memoryLeaves = null;

function readLeaves() {
  if (memoryLeaves) return memoryLeaves;
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    memoryLeaves = JSON.parse(raw);
    return memoryLeaves;
  } catch (err) {
    return [];
  }
}

function writeLeaves(items) {
  memoryLeaves = items;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    // Read-only filesystem on Vercel / serverless
    console.warn('Filesystem is read-only, updated in-memory state.');
  }
}

function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return '';
  const time = timeStr || '08:00';
  const parts = time.split(':');
  const d = new Date(dateStr + 'T00:00:00');
  d.setHours(parseInt(parts[0] || '8', 10), parseInt(parts[1] || '0', 10));
  
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, '0');
  return `${month} ${day}, ${year}, ${formattedHours}:${minutes} ${ampm}`;
}

function calculateDuration(fromStr, toStr) {
  try {
    const from = new Date(fromStr.split('T')[0] + 'T00:00:00');
    const to = new Date(toStr.split('T')[0] + 'T00:00:00');
    const diff = Math.max(1, Math.round((to - from) / 86400000) + 1);
    return `${diff} ${diff === 1 ? 'day' : 'days'}`;
  } catch {
    return '1 day';
  }
}

app.get('/api/leaves', (req, res) => {
  res.json(readLeaves());
});

app.post('/api/leaves', (req, res) => {
  const { leaveType, fromDate, toDate, fromTime, toTime, remarks, company, venue } = req.body || {};
  if (!leaveType || !fromDate || !toDate || !remarks) {
    return res.status(400).json({ error: 'Please provide a valid leave type, date range, and remarks.' });
  }

  const leaves = readLeaves();
  const isOD = leaveType.toLowerCase().includes('onduty');
  const duration = calculateDuration(fromDate, toDate);

  const newLeave = {
    id: Date.now().toString(),
    leaveType,
    type: isOD ? 'OD' : 'Leave',
    fromDate,
    toDate,
    fromTime: fromTime || '08:00',
    toTime: toTime || '17:00',
    displayFrom: formatDateTime(fromDate, fromTime || '08:00'),
    displayTo: formatDateTime(toDate, toTime || '17:00'),
    duration,
    remarks,
    company: company || (isOD ? 'Codestax.Ai' : ''),
    venue: venue || (isOD ? 'Hostel' : ''),
    gateOut: '-',
    gateIn: '-',
    parentStatus: 'Pending',
    status: 'Approved',
    mentorName: 'IT2078 - Mr.PRABHU P S',
    mentorStatus: 'Approved',
    wardenName: 'BT11243 - Karthik M G',
    wardenStatus: 'Approved',
    createdAt: new Date().toISOString()
  };

  leaves.unshift(newLeave);
  writeLeaves(leaves);
  res.status(201).json(leaves);
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`PCDP Leave Replica running at http://localhost:${PORT}`));
}
