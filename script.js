const ratingItems = [
  ['A1', 'The image looks realistic.', 'Perceived authenticity'],
  ['A2', 'It looks like a genuine Xiaohongshu product post.', 'Perceived authenticity'],
  ['A3', 'The product shown appears physically plausible.', 'Perceived authenticity'],
  ['T1', 'I would trust the visual information in this post.', 'Trust'],
  ['T2', 'The image gives a believable impression of the product.', 'Trust'],
  ['P1', 'I would consider buying this product.', 'Purchase intention'],
  ['P2', 'I would be interested in learning more about it.', 'Purchase intention'],
  ['P3', 'If I needed this type of product, this image would increase my likelihood of purchase.', 'Purchase intention'],
];

const artVariants = [
  { bg: 'linear-gradient(135deg,#d8cce9,#b3a7cc 44%,#746d91)', cup: '#e47f79', dark: '#a4425f', shine: '#fff0e1', lid: '#554b7f', lidLight: '#958bcb', lidDark: '#3b345f', tilt: '-3deg', label: 'SOFT STUDIO', caption: 'warm / clean / centered' },
  { bg: 'linear-gradient(135deg,#f1e1cb,#d6b99c 51%,#b98a79)', cup: '#d5e0e0', dark: '#71888b', shine: '#ffffff', lid: '#425a61', lidLight: '#78949a', lidDark: '#30454b', tilt: '2deg', label: 'WINDOW LIGHT', caption: 'bright / tactile / cool' },
  { bg: 'linear-gradient(135deg,#a8c4c9,#6c939f 54%,#45636f)', cup: '#f1c5a5', dark: '#b67861', shine: '#fff9ed', lid: '#49666b', lidLight: '#7faab0', lidDark: '#334a51', tilt: '-1deg', label: 'COASTAL DESK', caption: 'calm / natural / matte' },
  { bg: 'linear-gradient(135deg,#d8d4cf,#a7a09c 54%,#716b6b)', cup: '#aeb6c4', dark: '#5d667a', shine: '#eef3ff', lid: '#373f4e', lidLight: '#69758c', lidDark: '#252b36', tilt: '4deg', label: 'LOW KEY', caption: 'contrast / shadow / crisp' },
  { bg: 'linear-gradient(135deg,#f0ced5,#d994a9 48%,#ab5f7e)', cup: '#d8bbda', dark: '#846397', shine: '#fff1ff', lid: '#6b4c81', lidLight: '#a885bb', lidDark: '#4a345b', tilt: '-4deg', label: 'PINK HOUR', caption: 'soft / lifestyle / glossy' },
  { bg: 'linear-gradient(135deg,#ded4bf,#b5a184 47%,#7d6b5b)', cup: '#d7d4c7', dark: '#77776d', shine: '#fffff3', lid: '#5e625c', lidLight: '#90958a', lidDark: '#444740', tilt: '1deg', label: 'EARTH TONE', caption: 'quiet / grounded / warm' },
];

const survey = { step: 1, image: 0, responses: {}, startedAt: new Date().toISOString() };
const form = document.querySelector('#survey-form');
const sections = [...document.querySelectorAll('.survey-section')];
const progressBar = document.querySelector('#progress-bar');
const progressStep = document.querySelector('#progress-step');
const progressName = document.querySelector('#progress-name');
const progressNames = ['Consent & eligibility', 'View & rate', 'About the set', 'Complete'];

function selected(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

function showStep(step) {
  survey.step = step;
  sections.forEach((section) => {
    const active = Number(section.dataset.step) === step;
    section.hidden = !active;
    section.classList.toggle('active', active);
  });
  progressStep.textContent = `${String(step).padStart(2, '0')} / 04`;
  progressName.textContent = progressNames[step - 1];
  progressBar.style.width = `${step * 25}%`;
  window.scrollTo({ top: document.querySelector('.progress-wrap').offsetTop - 22, behavior: 'smooth' });
}

function setError(id, message) {
  document.querySelector(`#${id}`).textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach((node) => { node.textContent = ''; });
  document.querySelectorAll('.required-field').forEach((node) => node.classList.remove('has-error'));
}

function validateConsent() {
  clearErrors();
  const required = ['C1', 'C2', 'C3', 'C4', 'S1', 'S2', 'S3'];
  const missing = required.filter((name) => !selected(name));
  missing.forEach((name) => form.querySelector(`[data-required-group="${name}"]`)?.classList.add('has-error'));
  if (missing.length) {
    setError('consent-error', 'Please answer every required question before continuing.');
    return false;
  }
  const eligible = selected('C1') === 'Yes' && selected('C2') === 'Yes' && selected('C3') === 'Yes' && selected('C4') === 'Yes' && selected('S2') === 'Yes' && ['Daily', '3–6 days weekly', '1–2 days weekly'].includes(selected('S1'));
  if (!eligible) {
    setError('consent-error', 'Thank you for checking. This pilot is for adults who browse Xiaohongshu product posts at least weekly and bought online in the past six months.');
    return false;
  }
  ['C1', 'C2', 'C3', 'C4', 'S1', 'S2', 'S3'].forEach((name) => { survey.responses[name] = selected(name); });
  return true;
}

function renderStimulus(index) {
  const v = artVariants[index];
  const art = document.querySelector('#stimulus-art');
  art.style.setProperty('--art-bg', v.bg);
  art.innerHTML = `<span class="art-label">${v.label}</span><div class="product-shadow"></div><div class="product-lid" style="--lid:${v.lid};--lid-light:${v.lidLight};--lid-dark:${v.lidDark};--tilt:${v.tilt}"></div><div class="product-tumbler" style="--cup:${v.cup};--cup-dark:${v.dark};--shine:${v.shine};--tilt:${v.tilt}"></div><span class="art-caption">${v.caption}</span>`;
  document.querySelector('#image-counter').textContent = `${String(index + 1).padStart(2, '0')} / 06`;
  document.querySelector('#stimulus-label').textContent = `Image ${index + 1}`;
  document.querySelector('#open-response').value = survey.responses[`O1_${index + 1}`] || '';
  ratingItems.forEach(([code]) => {
    const current = survey.responses[`${code}_${index + 1}`];
    const input = form.querySelector(`input[name="${code}_${index + 1}"][value="${current || ''}"]`);
    if (input) input.checked = true;
  });
}

function renderRatings() {
  document.querySelector('#rating-list').innerHTML = ratingItems.map(([code, statement, domain]) => `<div class="rating-row"><div class="rating-statement"><span class="rating-domain">${code} · ${domain}</span>${statement}</div><div class="scale-grid five-col">${[1,2,3,4,5].map((score) => `<label><input type="radio" name="${code}_${survey.image + 1}" value="${score}" /><span><b>${score}</b><small>${['Strongly disagree','Disagree','Neither','Agree','Strongly agree'][score - 1]}</small></span></label>`).join('')}</div></div>`).join('');
  renderStimulus(survey.image);
}

function validateImage() {
  const missing = ratingItems.filter(([code]) => !form.querySelector(`input[name="${code}_${survey.image + 1}"]:checked`));
  if (missing.length) { setError('image-error', 'Please select one response for each statement.'); return false; }
  ratingItems.forEach(([code]) => { survey.responses[`${code}_${survey.image + 1}`] = form.querySelector(`input[name="${code}_${survey.image + 1}"]:checked`).value; });
  survey.responses[`O1_${survey.image + 1}`] = document.querySelector('#open-response').value.trim();
  return true;
}

function renderImageChoices() {
  document.querySelector('#image-choice-grid').innerHTML = artVariants.map((_, i) => `<label class="image-choice"><input type="radio" name="F2" value="${i + 1}" /><span>Image ${i + 1}</span></label>`).join('');
}

function validateWrap() {
  const required = ['F1', 'F2', 'F4'];
  const missing = required.filter((name) => !selected(name));
  if (missing.length) { setError('wrap-error', 'Please answer the required questions before submitting.'); return false; }
  required.forEach((name) => { survey.responses[name] = selected(name); });
  survey.responses.F3 = form.querySelector('[name="F3"]').value.trim();
  survey.responses.F5 = form.querySelector('[name="F5"]').value.trim();
  return true;
}

function finalise() {
  survey.completedAt = new Date().toISOString();
  localStorage.setItem('ads401-pilot-response', JSON.stringify(survey));
  const image = survey.responses.F2 ? `Image ${survey.responses.F2}` : 'Not recorded';
  document.querySelector('#complete-summary').innerHTML = `<strong>Response saved locally</strong><br />You completed six image ratings and selected <strong>${image}</strong> as the most purchase-inspiring visual. Use “Download a copy” if you would like a JSON backup.`;
  showStep(4);
}

document.querySelector('[data-next="2"]').addEventListener('click', () => { if (validateConsent()) { renderRatings(); showStep(2); } });
document.querySelector('[data-prev="1"]').addEventListener('click', () => showStep(1));
document.querySelector('#next-image').addEventListener('click', () => { clearErrors(); if (!validateImage()) return; if (survey.image < 5) { survey.image += 1; renderRatings(); } else { renderImageChoices(); showStep(3); } });
document.querySelector('[data-prev="2"]').addEventListener('click', () => showStep(2));
document.querySelector('#review-submit').addEventListener('click', () => { clearErrors(); if (validateWrap()) finalise(); });
document.querySelector('#download-response').addEventListener('click', () => { const blob = new Blob([JSON.stringify(survey, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `ads401-pilot-response-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url); });
document.querySelector('#restart-survey').addEventListener('click', () => window.location.reload());
form.addEventListener('change', (event) => { const field = event.target.closest('.required-field'); if (field) field.classList.remove('has-error'); });

renderRatings();
