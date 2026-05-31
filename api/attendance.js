const fs = require('fs');
const DATA_FILE = '/tmp/busan-attendance.json';

let memCache = null;

function loadData() {
  if (memCache) return memCache;
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed._ts && Date.now() - parsed._ts < 86400000) {
      memCache = parsed;
      return memCache;
    }
  } catch {}
  memCache = { _ts: Date.now(), attendance: {}, sessions: {
    active: 1, open: false,
    passwords: {"1":"47","2":"83","3":"29","4":"61","5":"15","6":"78","7":"34","8":"92","9":"56","10":"73"},
    dates: {}
  }};
  return memCache;
}

function saveData(d) {
  d._ts = Date.now();
  memCache = d;
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(d)); } catch {}
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const data = loadData();

  if (req.method === 'GET') {
    return res.json({ ok: true, data });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const { action } = body;

    if (action === 'checkin') {
      const { cls, session, name, time, ip } = body;
      const s = String(session);
      if (!data.attendance[s]) data.attendance[s] = { mobile: {}, laptop: {} };
      if (data.attendance[s][cls] && data.attendance[s][cls][name] && data.attendance[s][cls][name].checked) {
        return res.json({ ok: false, msg: '이미 출석체크 되었습니다.' });
      }
      if (!data.attendance[s][cls]) data.attendance[s][cls] = {};
      data.attendance[s][cls][name] = { checked: true, time, ip: ip || '' };
      saveData(data);
      return res.json({ ok: true, data });
    }

    if (action === 'admin_update') {
      const { payload } = body;
      if (payload.sessions) data.sessions = { ...data.sessions, ...payload.sessions };
      if (payload.attendance) data.attendance = payload.attendance;
      saveData(data);
      return res.json({ ok: true, data });
    }

    if (action === 'admin_checkin_edit') {
      const { cls, session, name, checked, time } = body;
      const s = String(session);
      if (!data.attendance[s]) data.attendance[s] = { mobile: {}, laptop: {} };
      if (!data.attendance[s][cls]) data.attendance[s][cls] = {};
      if (checked) {
        data.attendance[s][cls][name] = { checked: true, time: time || new Date().toISOString(), ip: 'admin' };
      } else {
        data.attendance[s][cls][name] = { checked: false, time: null, ip: null };
      }
      saveData(data);
      return res.json({ ok: true, data });
    }

    if (action === 'restore') {
      const { payload } = body;
      memCache = { ...payload, _ts: Date.now() };
      saveData(memCache);
      return res.json({ ok: true, data: memCache });
    }

    return res.json({ ok: false, msg: 'Unknown action' });
  }

  return res.status(405).json({ ok: false, msg: 'Method not allowed' });
};
