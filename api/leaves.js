const fs = require('fs');
const path = require('path');

let memoryLeaves = null;

function loadLeaves() {
  if (memoryLeaves) return memoryLeaves;
  const paths = [
    path.join(process.cwd(), 'data.json'),
    path.join(__dirname, '../data.json'),
    path.join(__dirname, 'data.json')
  ];
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        memoryLeaves = JSON.parse(fs.readFileSync(p, 'utf8'));
        return memoryLeaves;
      }
    } catch (e) {}
  }
  return [];
}

function saveLeaves(items) {
  memoryLeaves = items;
  const paths = [
    path.join(process.cwd(), 'data.json'),
    path.join(__dirname, '../data.json')
  ];
  for (const p of paths) {
    try {
      fs.writeFileSync(p, JSON.stringify(items, null, 2), 'utf8');
      break;
    } catch (e) {}
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

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    return res.status(200).json(loadLeaves());
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { leaveType, fromDate, toDate, fromTime, toTime, remarks, company, venue } = body;
    if (!leaveType || !fromDate || !toDate || !remarks) {
      return res.status(400).json({ error: 'Please provide a valid leave type, date range, and remarks.' });
    }

    const leaves = loadLeaves();
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
    saveLeaves(leaves);
    return res.status(201).json(leaves);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
