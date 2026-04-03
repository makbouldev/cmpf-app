const express = require('express')
const cors = require('cors')
const axios = require('axios')
const fs = require('fs/promises')
const path = require('path')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4000
const DATA_FILE = path.join(__dirname, 'data', 'requests.json')
const USERS_FILE = path.join(__dirname, 'data', 'users.json')
const ADMIN_PHONE = normalizeEnv(process.env.ADMIN_PHONE || 'admin')
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || 'admin123')
const adminTokens = new Set()
const MAIL_HOST = String(process.env.MAIL_HOST || '').trim()
const MAIL_PORT = Number(process.env.MAIL_PORT || 587)
const MAIL_SECURE = String(process.env.MAIL_SECURE || 'false').toLowerCase() === 'true'
const MAIL_USER = String(process.env.MAIL_USER || '').trim()
const MAIL_PASS = String(process.env.MAIL_PASS || '').trim()
const MAIL_FROM = String(process.env.MAIL_FROM || MAIL_USER || 'noreply@cmpf.local').trim()
const ALERT_EMAIL = String(process.env.ALERT_EMAIL || '').trim()
const FORM_SUBMIT_EMAIL = String(process.env.FORM_SUBMIT_EMAIL || 'noureddinemakboul03@gmail.com').trim()

let mailTransporter = null
if (MAIL_HOST && MAIL_USER && MAIL_PASS && ALERT_EMAIL) {
  mailTransporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number.isFinite(MAIL_PORT) ? MAIL_PORT : 587,
    secure: MAIL_SECURE,
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  })
}

app.use(cors())
app.use(express.json())

const safeText = (value = '') => String(value).trim().slice(0, 400)
const normalizePhone = (value = '') => String(value).replace(/\s+/g, '').trim()
const hashPassword = (password = '') => crypto.createHash('sha256').update(String(password)).digest('hex')
function normalizeEnv(value = '') {
  return String(value).replace(/\s+/g, '').trim().toLowerCase()
}
const normalizeAdminIdentifier = (value = '') => normalizeEnv(value)

const readRequests = async () => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
      await fs.writeFile(DATA_FILE, '[]', 'utf8')
      return []
    }
    throw error
  }
}

const writeRequests = async (items) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf8')
}

const readUsers = async () => {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
      await fs.writeFile(USERS_FILE, '[]', 'utf8')
      return []
    }
    throw error
  }
}

const writeUsers = async (items) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(items, null, 2), 'utf8')
}

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  age: user.age,
  gender: user.gender,
  createdAt: user.createdAt,
})
const ADMIN_STATUSES = ['pending', 'in-progress', 'completed', 'rejected']

const readAuthToken = (req) => {
  const header = req.headers?.authorization || ''
  const parts = String(header).split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return ''
  }
  return safeText(parts[1])
}

const ensureAdmin = (req, res, next) => {
  const token = readAuthToken(req)
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ error: 'admin unauthorized' })
  }
  next()
}

const createRequestHandler = (type) => async (req, res) => {
  const name = safeText(req.body?.name)
  const phone = safeText(req.body?.phone)
  const notes = safeText(req.body?.notes)
  const address = safeText(req.body?.address)
  const fromLocation = safeText(req.body?.fromLocation)
  const toLocation = safeText(req.body?.toLocation)
  const rawTransferMode = safeText(req.body?.transferMode).toLowerCase()
  const transferMode = rawTransferMode === 'city_to_city' || rawTransferMode === 'same_city' ? rawTransferMode : 'same_city'
  const lat = Number(req.body?.lat)
  const lng = Number(req.body?.lng)

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' })
  }

  const requests = await readRequests()

  const request = {
    id: Date.now().toString(),
    type,
    name,
    phone,
    address,
    fromLocation,
    toLocation,
    transferMode,
    notes,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  requests.unshift(request)
  await writeRequests(requests)
  const emailSent = await sendRequestEmail(request)

  return res.status(201).json({ message: 'request created', request, emailSent })
}

const sendRequestEmail = async (request) => {
  const subject = `[CMPF] Nouvelle demande ${request.type}`
  const lines = [
    `Type: ${request.type}`,
    `Nom: ${request.name || '-'}`,
    `Telephone: ${request.phone || '-'}`,
    `From: ${request.fromLocation || '-'}`,
    `To: ${request.toLocation || '-'}`,
    `Mode: ${request.transferMode || '-'}`,
    `Adresse: ${request.address || '-'}`,
    `Notes: ${request.notes || '-'}`,
    `Latitude: ${request.lat ?? '-'}`,
    `Longitude: ${request.lng ?? '-'}`,
    `Date: ${request.createdAt || '-'}`,
  ]

  if (FORM_SUBMIT_EMAIL) {
    try {
      const params = new URLSearchParams()
      params.set('_subject', subject)
      params.set('_template', 'table')
      params.set('_captcha', 'false')
      params.set('type', request.type)
      params.set('nom', request.name || '-')
      params.set('telephone', request.phone || '-')
      params.set('from', request.fromLocation || '-')
      params.set('to', request.toLocation || '-')
      params.set('mode', request.transferMode || '-')
      params.set('adresse', request.address || '-')
      params.set('notes', request.notes || '-')
      params.set('latitude', String(request.lat ?? '-'))
      params.set('longitude', String(request.lng ?? '-'))
      params.set('date', request.createdAt || '-')
      params.set('message', lines.join('\n'))

      await axios.post(
        `https://formsubmit.co/${encodeURIComponent(FORM_SUBMIT_EMAIL)}`,
        params.toString(),
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://cmpf-ambulance.app',
            Referer: 'https://cmpf-ambulance.app',
          },
        },
      )
      console.log(`FormSubmit sent for request ${request.id}`)
      return true
    } catch (formSubmitError) {
      console.log(`FormSubmit failed for request ${request.id}: ${formSubmitError.message}`)
      // Fallback below if SMTP is configured.
    }
  }

  if (mailTransporter && ALERT_EMAIL) {
    await mailTransporter.sendMail({
      from: MAIL_FROM,
      to: ALERT_EMAIL,
      subject,
      text: lines.join('\n'),
    })
    console.log(`SMTP sent for request ${request.id}`)
    return true
  }

  return false
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ambulance-api' })
})

app.post('/api/requests/ambulance', createRequestHandler('ambulance'))
app.post('/api/requests/doctor-home', createRequestHandler('doctor-home'))

app.post('/api/test-email', async (_req, res) => {
  try {
    const sample = {
      id: Date.now().toString(),
      type: 'test',
      name: 'test',
      phone: '0000000000',
      fromLocation: 'Casablanca',
      toLocation: 'Rabat',
      transferMode: 'city_to_city',
      address: 'test',
      notes: 'manual test',
      lat: null,
      lng: null,
      createdAt: new Date().toISOString(),
    }
    const emailSent = await sendRequestEmail(sample)
    return res.json({ ok: true, emailSent, message: emailSent ? 'email sent' : 'email not sent' })
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  const name = safeText(req.body?.name)
  const phone = normalizePhone(req.body?.phone)
  const password = safeText(req.body?.password)
  const age = Number(req.body?.age)
  const genderRaw = safeText(req.body?.gender).toLowerCase()
  const gender = genderRaw === 'male' || genderRaw === 'female' ? genderRaw : ''

  if (!name || !phone || !password || !Number.isFinite(age) || age < 1 || age > 120 || !gender) {
    return res.status(400).json({ error: 'name, phone, password, age and gender are required' })
  }

  const users = await readUsers()
  const existing = users.find((item) => item.phone === phone)
  if (existing) {
    return res.status(409).json({ error: 'phone already registered' })
  }

  const user = {
    id: Date.now().toString(),
    name,
    phone,
    age,
    gender,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  }

  users.unshift(user)
  await writeUsers(users)

  const token = crypto.randomBytes(24).toString('hex')
  return res.status(201).json({ message: 'signup successful', token, user: sanitizeUser(user) })
})

app.post('/api/auth/signin', async (req, res) => {
  const phone = normalizePhone(req.body?.phone)
  const password = safeText(req.body?.password)
  if (!phone || !password) {
    return res.status(400).json({ error: 'phone and password are required' })
  }

  const users = await readUsers()
  const user = users.find((item) => item.phone === phone)
  if (!user) {
    return res.status(401).json({ error: 'invalid phone or password' })
  }

  const incomingHash = hashPassword(password)
  if (incomingHash !== user.passwordHash) {
    return res.status(401).json({ error: 'invalid phone or password' })
  }

  const token = crypto.randomBytes(24).toString('hex')
  return res.json({ message: 'signin successful', token, user: sanitizeUser(user) })
})

app.post('/api/auth/update-account', async (req, res) => {
  const phone = normalizePhone(req.body?.phone)
  const currentPassword = safeText(req.body?.currentPassword)
  const newPhone = normalizePhone(req.body?.newPhone)
  const newPassword = safeText(req.body?.newPassword)

  if (!phone || !currentPassword) {
    return res.status(400).json({ error: 'phone and currentPassword are required' })
  }

  if (!newPhone && !newPassword) {
    return res.status(400).json({ error: 'newPhone or newPassword is required' })
  }

  const users = await readUsers()
  const index = users.findIndex((item) => item.phone === phone)
  if (index < 0) {
    return res.status(404).json({ error: 'user not found' })
  }

  const user = users[index]
  if (user.passwordHash !== hashPassword(currentPassword)) {
    return res.status(401).json({ error: 'invalid current password' })
  }

  if (newPhone && newPhone !== phone) {
    const exists = users.find((item) => item.phone === newPhone && item.id !== user.id)
    if (exists) {
      return res.status(409).json({ error: 'phone already registered' })
    }
    user.phone = newPhone
  }

  if (newPassword) {
    user.passwordHash = hashPassword(newPassword)
  }

  users[index] = user
  await writeUsers(users)

  return res.json({ message: 'account updated', user: sanitizeUser(user) })
})

app.post('/api/admin/signin', async (req, res) => {
  const identifier = normalizeAdminIdentifier(req.body?.identifier || req.body?.phone)
  const password = safeText(req.body?.password)
  if (!identifier || !password) {
    return res.status(400).json({ error: 'identifier and password are required' })
  }

  if (identifier !== ADMIN_PHONE || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'invalid admin credentials' })
  }

  const token = crypto.randomBytes(24).toString('hex')
  adminTokens.add(token)
  return res.json({
    message: 'admin signin successful',
    token,
    admin: { identifier: ADMIN_PHONE, role: 'admin' },
  })
})

app.get('/api/admin/requests', ensureAdmin, async (req, res) => {
  const typeFilter = safeText(req.query.type || '').toLowerCase()
  const statusFilter = safeText(req.query.status || '').toLowerCase()
  const requests = await readRequests()

  const filtered = requests.filter((item) => {
    const byType = !typeFilter || item.type === typeFilter
    const byStatus = !statusFilter || item.status === statusFilter
    return byType && byStatus
  })

  return res.json({ count: filtered.length, requests: filtered })
})

app.patch('/api/admin/requests/:id/status', ensureAdmin, async (req, res) => {
  const id = safeText(req.params.id)
  const status = safeText(req.body?.status).toLowerCase()
  if (!id || !ADMIN_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'valid id and status are required' })
  }

  const requests = await readRequests()
  const index = requests.findIndex((item) => item.id === id)
  if (index < 0) {
    return res.status(404).json({ error: 'request not found' })
  }

  requests[index] = {
    ...requests[index],
    status,
    updatedAt: new Date().toISOString(),
  }
  await writeRequests(requests)

  return res.json({ message: 'request status updated', request: requests[index] })
})

app.get('/api/requests', async (_req, res) => {
  const requests = await readRequests()
  res.json({ count: requests.length, requests })
})

app.get('/api/pharmacies/nearby', async (req, res) => {
  const lat = Number(req.query.lat)
  const lng = Number(req.query.lng)
  const radius = Math.min(Math.max(Number(req.query.radius) || 2000, 500), 10000)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat and lng query params are required' })
  }

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      way["amenity"="pharmacy"](around:${radius},${lat},${lng});
      relation["amenity"="pharmacy"](around:${radius},${lat},${lng});
    );
    out center tags;
  `

  try {
    const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 20000,
    })

    const pharmacies = (response.data.elements || []).map((item) => {
      const pLat = item.lat ?? item.center?.lat ?? null
      const pLng = item.lon ?? item.center?.lon ?? null
      return {
        id: `${item.type}-${item.id}`,
        name: item.tags?.name || 'Pharmacie',
        address: [item.tags?.['addr:street'], item.tags?.['addr:city']].filter(Boolean).join(', '),
        lat: pLat,
        lng: pLng,
      }
    })

    return res.json({ count: pharmacies.length, pharmacies })
  } catch (error) {
    return res.status(502).json({ error: 'Unable to fetch pharmacies right now' })
  }
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
  if (FORM_SUBMIT_EMAIL) {
    console.log(`FormSubmit alerts enabled -> ${FORM_SUBMIT_EMAIL}`)
  }
  if (!FORM_SUBMIT_EMAIL && (!mailTransporter || !ALERT_EMAIL)) {
    console.log('Email alerts disabled. Set FORM_SUBMIT_EMAIL or SMTP vars (MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM, ALERT_EMAIL).')
  }
})
