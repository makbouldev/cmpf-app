const FORM_SUBMIT_EMAIL = 'noureddinemakboul03@gmail.com';

const toText = (value) => {
  if (value === null || value === undefined) {
    return '-';
  }
  const cleaned = String(value).trim();
  return cleaned || '-';
};

const buildBody = ({ type, payload }) => {
  const createdAt = new Date().toISOString();
  const data = {
    _subject: `[CMPF] Nouvelle demande ${type}`,
    _template: 'table',
    _captcha: 'false',
    type: toText(type),
    nom: toText(payload.name),
    telephone: toText(payload.phone),
    from: toText(payload.fromLocation),
    to: toText(payload.toLocation),
    mode: toText(payload.transferMode),
    adresse: toText(payload.address),
    adresse_destination: toText(payload.destinationAddress),
    notes: toText(payload.notes),
    latitude: toText(payload.lat),
    longitude: toText(payload.lng),
    date: createdAt,
  };
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
};

export const submitRequestWithFormSubmit = async ({ type, payload }) => {
  try {
    const body = buildBody({ type, payload });
    const response = await fetch(`https://formsubmit.co/${encodeURIComponent(FORM_SUBMIT_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const text = await response.text();
    const activationNeeded = /confirm your email/i.test(text) || /activate your form/i.test(text);

    return {
      ok: response.ok,
      activationNeeded,
      status: response.status,
      error: '',
    };
  } catch (error) {
    return {
      ok: false,
      activationNeeded: false,
      status: 0,
      error: String(error?.message || 'network request failed'),
    };
  }
};
