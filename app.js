/**
 * ============================================================================
 * myMasterpiece — Sistem Pemantau Penulisan Karya Tulis Santri SMP DAFI
 * Frontend Application Logic (Dual Mode: Local Demo Sandbox & Live GAS API)
 * ============================================================================
 */

// ==================== CONSTANTS & SECTION SCHEMAS ====================

const STORAGE_KEYS = {
  THEME: 'maheda_portfolio_theme',
  SESSION: 'mymasterpiece_session_v1',
  AUTOSAVE_PREFIX: 'mymasterpiece_autosave_'
};

const MAX_CELL_CHARS = 49000;

const BAB1_CODES = ['BAB1_1', 'BAB1_2', 'BAB1_3', 'BAB1_4', 'BAB1_5'];
const BAB3_CODES = ['BAB3_1', 'BAB3_2', 'BAB3_3', 'BAB3_4', 'BAB3_5'];
const DEFAULT_BAB2_SUBS = [
  { code: 'BAB2_1', title: '2.1 Landasan Teori' },
  { code: 'BAB2_2', title: '2.2 Penelitian Terdahulu yang Relevan' },
  { code: 'BAB2_3', title: '2.3 Kerangka Berpikir' }
];

const SECTION_META = {
  ABSTRAK: {
    code: 'ABSTRAK',
    label: 'Abstrak & Kata Kunci',
    short: 'Abstrak',
    desc: 'Ringkasan penelitian maksimal 250 kata disertai 3–5 kata kunci.'
  },
  BAB1_1: {
    code: 'BAB1_1',
    label: '1.1 Latar Belakang',
    short: '1.1 Latar Belakang',
    desc: 'Konteks masalah, urgensi ilmiah, dan landasan fakta penelitian.'
  },
  BAB1_2: {
    code: 'BAB1_2',
    label: '1.2 Rumusan Masalah',
    short: '1.2 Rumusan Masalah',
    desc: 'Pertanyaan penelitian yang spesifik, terukur, dan fokus.'
  },
  BAB1_3: {
    code: 'BAB1_3',
    label: '1.3 Tujuan Penelitian',
    short: '1.3 Tujuan Penelitian',
    desc: 'Sasaran ilmiah yang selaras dengan rumusan masalah.'
  },
  BAB1_4: {
    code: 'BAB1_4',
    label: '1.4 Hipotesis (Opsional)',
    short: '1.4 Hipotesis',
    desc: 'Dugaan sementara berbasis teori (opsional sesuai jenis penelitian).'
  },
  BAB1_5: {
    code: 'BAB1_5',
    label: '1.5 Urgensi & Manfaat Penelitian',
    short: '1.5 Urgensi & Manfaat',
    desc: 'Dampak ilmiah, sosial, atau rekayasa dari hasil penelitian.'
  },
  BAB3_1: {
    code: 'BAB3_1',
    label: '3.1 Rancangan / Desain Penelitian',
    short: '3.1 Desain Penelitian',
    desc: 'Pendekatan, jenis penelitian, serta variabel bebas, terikat, dan kontrol.'
  },
  BAB3_2: {
    code: 'BAB3_2',
    label: '3.2 Waktu, Tempat, Alat & Bahan',
    short: '3.2 Waktu, Alat & Bahan',
    desc: 'Lokasi, waktu pelaksanaan, subjek/objek, alat, dan bahan penelitian.'
  },
  BAB3_3: {
    code: 'BAB3_3',
    label: '3.3 Prosedur & Pengumpulan Data',
    short: '3.3 Prosedur & Data',
    desc: 'Langkah kerja sistematis dan teknik/instrumen pengumpulan data.'
  },
  BAB3_4: {
    code: 'BAB3_4',
    label: '3.4 Teknik Analisis Data',
    short: '3.4 Analisis Data',
    desc: 'Metode pengolahan, rumus perhitungan, atau uji statistik yang digunakan.'
  },
  BAB3_5: {
    code: 'BAB3_5',
    label: '3.5 RAB, Jadwal & Ethical Clearance',
    short: '3.5 RAB, Jadwal & Etik',
    desc: 'Rencana anggaran biaya, jadwal pelaksanaan, dan keterangan ethical clearance.'
  },
  BAB4: {
    code: 'BAB4',
    label: 'BAB 4. Hasil dan Pembahasan',
    short: 'Bab 4. Hasil',
    desc: 'Penyajian data hasil uji, tabel, grafik/gambar, dan analisis ilmiah.'
  },
  BAB5: {
    code: 'BAB5',
    label: 'BAB 5. Kesimpulan dan Saran',
    short: 'Bab 5. Kesimpulan',
    desc: 'Jawaban atas rumusan masalah dan rekomendasi penelitian lanjutan.'
  },
  UCAPAN_TERIMA_KASIH: {
    code: 'UCAPAN_TERIMA_KASIH',
    label: 'Ucapan Terima Kasih',
    short: 'Ucapan Terima Kasih',
    desc: 'Apresiasi kepada pihak pendukung penelitian, pembimbing, dan sekolah.'
  },
  DAFTAR_PUSTAKA: {
    code: 'DAFTAR_PUSTAKA',
    label: 'Daftar Pustaka',
    short: 'Daftar Pustaka',
    desc: 'Daftar referensi primer sistem nama–tahun (hindari Wikipedia/blog pribadi).'
  },
  LAMPIRAN: {
    code: 'LAMPIRAN',
    label: 'Lampiran & Realisasi RAB',
    short: 'Lampiran',
    desc: 'Realisasi anggaran biaya serta dokumentasi dan instrumen pendukung.'
  }
};

function getBab2Meta(idKti, tahap, bagiansOverride) {
  const bags = bagiansOverride || (state.workspace && state.workspace.bagians) || [];
  const metaRow = bags.find((b) =>
    (!idKti || b.id_kti === idKti) && b.tahap === tahap && b.kode_bagian === 'BAB2_META'
  ) || bags.find((b) =>
    (!idKti || b.id_kti === idKti) && b.kode_bagian === 'BAB2_META'
  );
  let parsed = {};
  if (metaRow && metaRow.konten_html) {
    try { parsed = JSON.parse(metaRow.konten_html); } catch (e) {}
  }
  const subchapters = Array.isArray(parsed.subchapters) && parsed.subchapters.length
    ? parsed.subchapters
    : DEFAULT_BAB2_SUBS.map((s) => Object.assign({}, s));
  const guru_suggestions = Array.isArray(parsed.guru_suggestions) ? parsed.guru_suggestions : [];
  return { subchapters, guru_suggestions };
}

function getSectionMeta(code, idKti, tahap, bagiansOverride) {
  if (SECTION_META[code]) return SECTION_META[code];
  if (String(code).startsWith('BAB2_')) {
    const meta = getBab2Meta(idKti, tahap || state.viewingStage, bagiansOverride);
    const found = meta.subchapters.find((s) => s.code === code);
    const title = found ? found.title : code.replace('BAB2_', '2.');
    return {
      code,
      label: title,
      short: title,
      desc: 'Sub-bab Tinjauan Pustaka dengan sitasi sistem nama–tahun.'
    };
  }
  return { code, label: code, short: code, desc: '' };
}

function getStageSectionCodes(tahap, idKti, bagiansOverride) {
  const bab2Codes = getBab2Meta(idKti, tahap, bagiansOverride).subchapters.map((s) => s.code);
  if (tahap === 'laporan') {
    return ['ABSTRAK', ...BAB1_CODES, ...bab2Codes, ...BAB3_CODES, 'BAB4', 'BAB5', 'UCAPAN_TERIMA_KASIH', 'DAFTAR_PUSTAKA', 'LAMPIRAN'];
  }
  return [...BAB1_CODES, ...bab2Codes, ...BAB3_CODES, 'DAFTAR_PUSTAKA'];
}

const STATUS_STYLE = {
  draf: {
    label: 'Draf',
    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
  },
  review: {
    label: 'Menunggu Review',
    cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
  },
  revisi: {
    label: 'Perlu Revisi',
    cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
  },
  acc: {
    label: 'ACC',
    cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
  }
};

// ==================== APPLICATION STATE ====================

const state = {
  gasUrl: '',
  user: null,
  workspace: {
    config: {},
    users: [],
    ktis: [],
    activeKti: null,
    bagians: [],
    logs: []
  },
  viewingStage: 'proposal',
  activeSectionCode: 'COVER',
  quill: null,
  isDirty: false,
  autoSaveTimer: null,
  pendingBackup: null,
  selectedImageDataUri: '',
  selectedImageFileName: '',
  selectedImageMimeType: '',
  structuredBab3: {
    rab: [],
    jadwal: [],
    ethical: { manusia: false, hewan: false, mikro: false, kimia: false, catatan: '' }
  },
  structuredLampiran: {
    realisasi: []
  },
  guruPage: 'dashboard',
  guruSelectedKtiId: '',
  guruViewingStage: 'proposal',
  guruSelectedCode: 'BAB1_1',
  adminTab: 'monitoring',
  exportTarget: { tahap: 'proposal', idKti: '' },
  isFocusMode: false,
  confirmCallback: null
};

// ==================== PURE-JS SHA-256 (HTTP & FILE:// SAFE) ====================

function sha256Hex(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words = [];
  const utf8 = unescape(encodeURIComponent(String(ascii)));
  const asciiBitLength = utf8.length * 8;

  const hash = sha256Hex.h = sha256Hex.h || [];
  const k = sha256Hex.k = sha256Hex.k || [];
  let primeCounter = k.length;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  const h = hash.slice(0, 8);
  let padded = utf8 + '\x80';
  while ((padded.length % 64) - 56) padded += '\x00';
  for (let i = 0; i < padded.length; i++) {
    const j = padded.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = h.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = h[0], e = h[4];
      const temp1 = h[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & h[5]) ^ (~e & h[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
          w[i - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + w[i - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));
      h.unshift((temp1 + temp2) | 0);
      h[4] = (h[4] + temp1) | 0;
      h.pop();
    }
    for (let i = 0; i < 8; i++) h[i] = (h[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const b = (h[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// ==================== INITIALIZATION & THEME ====================

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  state.gasUrl = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.GAS_URL)
    ? String(window.APP_CONFIG.GAS_URL).trim()
    : '';
  initQuillEditor();
  restoreSessionIfPresent();
  updateOnlineStatus();
  if (window && typeof window.addEventListener === 'function') {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }
  document.addEventListener('keydown', function (ev) {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 's') {
      if (state.user && state.user.role === 'siswa' && state.activeSectionCode !== 'COVER') {
        ev.preventDefault();
        saveCurrentSection('draf');
      }
    } else if (ev.key === 'Escape' && state.isFocusMode) {
      toggleFocusMode(false);
    }
  });
  refreshIcons();
});

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function initTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
}

function toggleTheme() {
  const html = document.documentElement;
  const nextDark = !html.classList.contains('dark');
  html.classList.toggle('dark', nextDark);
  localStorage.setItem(STORAGE_KEYS.THEME, nextDark ? 'dark' : 'light');
}

function updateOnlineStatus() {
  const banner = document.getElementById('offlineAlertBanner');
  if (!banner) return;
  const isOffline = (typeof navigator !== 'undefined' && navigator.onLine === false);
  banner.classList.toggle('hidden', !isOffline);
}

function toggleFocusMode(forceState) {
  const panel = document.getElementById('panelSectionEditor');
  const label = document.getElementById('btnFocusModeLabel');
  if (!panel) return;
  const next = typeof forceState === 'boolean' ? forceState : !state.isFocusMode;
  state.isFocusMode = next;
  panel.classList.toggle('editor-focus-mode', next);
  if (label) label.textContent = next ? 'Keluar Fokus (Esc)' : 'Mode Fokus';
  refreshIcons();
}

function showConfirmModal({ title, messageHtml, confirmText = 'Lanjutkan', onConfirm }) {
  state.confirmCallback = onConfirm || null;
  document.getElementById('confirmModalTitle').textContent = title || 'Konfirmasi';
  document.getElementById('confirmModalMessage').innerHTML = messageHtml || '';
  document.getElementById('confirmModalOkBtn').textContent = confirmText;
  document.getElementById('modalConfirm').classList.remove('hidden');
  refreshIcons();
}

function executeConfirmModal() {
  const cb = state.confirmCallback;
  state.confirmCallback = null;
  closeModal('modalConfirm');
  if (typeof cb === 'function') cb();
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const inner = document.getElementById('toastInner');
  const palette = {
    success: 'bg-emerald-600 text-white border-emerald-500',
    error: 'bg-rose-600 text-white border-rose-500',
    warning: 'bg-amber-600 text-white border-amber-500',
    info: 'bg-slate-900 dark:bg-slate-800 text-white border-slate-700'
  };
  inner.className = 'px-5 py-3 rounded-2xl shadow-xl border text-xs font-heading font-bold flex items-center gap-2.5 ' + (palette[type] || palette.info);
  inner.textContent = msg;
  container.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(function () {
    container.classList.add('hidden');
  }, 3600);
}

// ==================== QUILL 2 CUSTOM BLOTS & EDITOR INIT ====================

function initQuillEditor() {
  const mount = document.getElementById('quillEditorContainer');
  if (!mount) return;

  if (typeof Quill === 'undefined') {
    mount.innerHTML = '<div id="fallbackEditable" contenteditable="true" class="p-4 min-h-[320px] outline-none"></div>';
    return;
  }

  const BlockEmbed = Quill.import('blots/block/embed');

  class AcademicFigureBlot extends BlockEmbed {
    static create(value) {
      const node = super.create();
      node.setAttribute('contenteditable', 'false');
      node.className = 'academic-figure';
      const img = document.createElement('img');
      img.setAttribute('src', value.src || '');
      img.setAttribute('alt', value.caption || 'Gambar Penelitian');
      const cap = document.createElement('figcaption');
      cap.textContent = value.caption || 'Gambar: Keterangan';
      node.appendChild(img);
      node.appendChild(cap);
      return node;
    }
    static value(node) {
      const img = node.querySelector('img');
      const cap = node.querySelector('figcaption');
      return {
        src: img ? img.getAttribute('src') : '',
        caption: cap ? cap.textContent : ''
      };
    }
  }
  AcademicFigureBlot.blotName = 'academic-figure';
  AcademicFigureBlot.tagName = 'figure';
  AcademicFigureBlot.className = 'academic-figure';

  class AcademicTableBlot extends BlockEmbed {
    static create(value) {
      const node = super.create();
      node.setAttribute('contenteditable', 'false');
      node.className = 'academic-table-wrap';
      const cap = document.createElement('p');
      cap.className = 'table-caption';
      cap.textContent = value.caption || 'Tabel: Judul Tabel';
      const tableWrap = document.createElement('div');
      tableWrap.innerHTML = value.tableHtml || '<table><tbody><tr><th>Kolom 1</th><th>Kolom 2</th></tr><tr><td>Data 1</td><td>Data 2</td></tr></tbody></table>';
      node.appendChild(cap);
      node.appendChild(tableWrap.firstElementChild);
      return node;
    }
    static value(node) {
      const cap = node.querySelector('.table-caption');
      const tbl = node.querySelector('table');
      return {
        caption: cap ? cap.textContent : 'Tabel',
        tableHtml: tbl ? tbl.outerHTML : ''
      };
    }
  }
  AcademicTableBlot.blotName = 'academic-table';
  AcademicTableBlot.tagName = 'div';
  AcademicTableBlot.className = 'academic-table-wrap';

  Quill.register(AcademicFigureBlot, true);
  Quill.register(AcademicTableBlot, true);

  state.quill = new Quill('#quillEditorContainer', {
    theme: 'snow',
    placeholder: 'Mulai menulis naskah ilmiah Anda di sini...',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['clean']
      ]
    }
  });

  state.quill.on('text-change', function () {
    state.isDirty = true;
    onEditorContentChanged();
  });

  // Periodic local auto-save every 5 seconds
  clearInterval(state.autoSaveTimer);
  state.autoSaveTimer = setInterval(function () {
    if (state.user && state.user.role === 'siswa' && state.activeSectionCode !== 'COVER' && state.isDirty) {
      saveLocalAutosave();
    }
  }, 5000);
}

function getEditorHtmlRaw() {
  if (state.quill) {
    const html = state.quill.root.innerHTML;
    return html === '<p><br></p>' ? '' : html;
  }
  const fb = document.getElementById('fallbackEditable');
  return fb ? fb.innerHTML : '';
}

function setEditorHtmlRaw(html) {
  const safeHtml = html || '';
  if (state.quill) {
    state.quill.setContents([]);
    if (safeHtml.trim()) {
      state.quill.clipboard.dangerouslyPasteHTML(safeHtml);
    }
  } else {
    const fb = document.getElementById('fallbackEditable');
    if (fb) fb.innerHTML = safeHtml;
  }
  state.isDirty = false;
  onEditorContentChanged();
}

function getPlainTextFromHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || div.innerText || '').trim();
}

// ==================== GOOGLE APPS SCRIPT API CLIENT ====================

function getGasUrl() {
  if (state.gasUrl) return state.gasUrl;
  const fromConfig = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.GAS_URL)
    ? String(window.APP_CONFIG.GAS_URL).trim()
    : '';
  state.gasUrl = fromConfig;
  return fromConfig;
}

async function callBackend(action, payload = {}) {
  const url = getGasUrl();
  if (!url) {
    throw new Error('URL Backend GAS belum dikonfigurasi pada file config.js.');
  }
  const body = Object.assign({ action }, payload);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Terjadi kesalahan pada server GAS.');
  return json;
}

// ==================== AUTH & SESSION ====================

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('signupForm').classList.toggle('hidden', isLogin);

  const activeCls = 'nav-tab-btn py-2.5 px-3 rounded-xl text-xs font-heading font-bold bg-red-600 text-white shadow-xs';
  const idleCls = 'nav-tab-btn py-2.5 px-3 rounded-xl text-xs font-heading font-bold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800';
  document.getElementById('authTabLogin').className = isLogin ? activeCls : idleCls;
  document.getElementById('authTabSignup').className = !isLogin ? activeCls : idleCls;

  if (!isLogin) {
    loadSignupMentors();
    onSignupRoleChange();
  }
  refreshIcons();
}

function onSignupRoleChange() {
  const role = document.getElementById('signupRole').value;
  const isSiswa = role === 'siswa';
  document.getElementById('signupEmailLabel').textContent = 'Email';
  document.getElementById('signupEmail').placeholder = isSiswa ? 'contoh: santri11@smp.belajar.id' : 'contoh: pembimbing@smp.belajar.id';
  document.getElementById('signupKelasLabel').textContent = isSiswa ? 'Kelas' : 'Bidang Pembimbingan';
  document.getElementById('signupKelas').placeholder = isSiswa ? 'Contoh: IX-A' : 'Contoh: Pembimbing IPA/STEM';
  document.getElementById('signupPembimbingWrap').classList.toggle('hidden', !isSiswa);
}

async function loadSignupMentors() {
  const sel = document.getElementById('signupPembimbing');
  if (!sel) return;
  try {
    const res = await callBackend('getMentors', {});
    const mentors = res.mentors || [];
    sel.innerHTML = '<option value="">-- Pilih Guru Pembimbing --</option>' +
      mentors.map((m) => `<option value="${escapeHtml(m.id_user)}">${escapeHtml(m.nama_lengkap)}${m.kelas ? ' (' + escapeHtml(m.kelas) + ')' : ''}</option>`).join('');
  } catch (e) {
    sel.innerHTML = '<option value="">-- Guru Pembimbing Belum Tersedia --</option>';
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

async function handleSignupSubmit(e) {
  e.preventDefault();
  const role = document.getElementById('signupRole').value;
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const nama_lengkap = document.getElementById('signupNama').value.trim();
  const kelas = document.getElementById('signupKelas').value.trim();
  const id_pembimbing = role === 'siswa' ? document.getElementById('signupPembimbing').value : '';
  const pass = document.getElementById('signupPassword').value;
  const passConfirm = document.getElementById('signupPasswordConfirm').value;

  if (!isValidEmail(email)) {
    return showToast('Format email tidak valid (contoh: santri11@smp.belajar.id).', 'warning');
  }
  if (pass !== passConfirm) {
    return showToast('Konfirmasi kata sandi tidak cocok.', 'warning');
  }

  const btn = document.getElementById('btnSignupSubmit');
  btn.disabled = true;
  btn.innerHTML = '<span>Mendaftarkan akun...</span>';

  try {
    const res = await callBackend('signup', {
      role,
      email,
      nama_lengkap,
      kelas,
      id_pembimbing,
      password_hash: sha256Hex(pass)
    });
    state.user = res.user;
    state.workspace = res.workspace;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ id_user: res.user.id_user }));
    applySchoolLogoToNav();
    routeByRole();
    showToast('Pendaftaran berhasil! Selamat datang, ' + res.user.nama_lengkap, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="user-plus" class="w-4 h-4"></i><span>Daftar &amp; Masuk</span>';
    refreshIcons();
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  if (!isValidEmail(email)) {
    return showToast('Masukkan alamat email yang valid.', 'warning');
  }
  const btn = document.getElementById('btnLoginSubmit');
  btn.disabled = true;
  btn.innerHTML = '<span>Memeriksa akun...</span>';

  try {
    const res = await callBackend('login', {
      email,
      password_hash: sha256Hex(password)
    });
    state.user = res.user;
    state.workspace = res.workspace;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ id_user: res.user.id_user }));
    applySchoolLogoToNav();
    routeByRole();
    showToast('Selamat datang, ' + res.user.nama_lengkap + '!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="log-in" class="w-4 h-4"></i><span>Masuk</span>';
    refreshIcons();
  }
}

async function restoreSessionIfPresent() {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) {
    showView('viewLogin');
    return;
  }
  try {
    const sess = JSON.parse(raw);
    const res = await callBackend('getWorkspace', { id_user: sess.id_user });
    state.user = res.user;
    state.workspace = res.workspace;
    applySchoolLogoToNav();
    routeByRole();
  } catch (e) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    showView('viewLogin');
  }
}

function logoutUser() {
  if (state.isFocusMode) toggleFocusMode(false);
  state.user = null;
  state.guruPage = 'dashboard';
  state.guruSelectedKtiId = '';
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  document.getElementById('navUserBox').classList.add('hidden');
  document.getElementById('navUserBox').classList.remove('flex');
  showView('viewLogin');
  switchAuthTab('login');
  showToast('Anda telah keluar.', 'info');
}

function applySchoolLogoToNav() {
  const logoUrl = (state.workspace.config && state.workspace.config.logo_sekolah_url) || 'assets/logo-dafi.png';
  const navLogo = document.getElementById('navSchoolLogo');
  if (navLogo) navLogo.src = logoUrl;
}

function showView(viewId) {
  ['viewLogin', 'viewSiswa', 'viewGuru', 'viewAdmin'].forEach((id) => {
    document.getElementById(id).classList.toggle('hidden', id !== viewId);
  });
}

function formatRoleLabel(role) {
  if (role === 'siswa') return 'Santri';
  if (role === 'guru') return 'Guru Pembimbing';
  if (role === 'admin') return 'Admin';
  return String(role || '');
}

function routeByRole() {
  if (!state.user) return showView('viewLogin');
  const navBox = document.getElementById('navUserBox');
  navBox.classList.remove('hidden');
  navBox.classList.add('flex');
  document.getElementById('navUserName').textContent = state.user.nama_lengkap;
  document.getElementById('navUserRole').textContent = formatRoleLabel(state.user.role);

  if (state.user.role === 'siswa') {
    showView('viewSiswa');
    initSiswaWorkspace();
  } else if (state.user.role === 'guru') {
    showView('viewGuru');
    initGuruWorkspace();
  } else {
    showView('viewAdmin');
    initAdminWorkspace();
  }
  refreshIcons();
}

async function refreshWorkspaceFromBackend(selectedIdKti) {
  if (!state.user) return;
  try {
    const res = await callBackend('getWorkspace', {
      id_user: state.user.id_user,
      selected_id_kti: selectedIdKti || (state.workspace.activeKti && state.workspace.activeKti.id_kti) || ''
    });
    state.workspace = res.workspace;
    routeByRole();
    showToast('Data diperbarui.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== BADGE HELPERS ====================

function renderStatusBadgeHtml(statusKey) {
  const st = STATUS_STYLE[statusKey] || STATUS_STYLE.draf;
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold ${st.cls}">${st.label}</span>`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==================== SISWA WORKSPACE ====================

function initSiswaWorkspace() {
  const kti = state.workspace.activeKti;
  if (!kti) return;

  state.viewingStage = kti.tahap_aktif || 'proposal';
  const isLaporan = kti.tahap_aktif === 'laporan';

  document.getElementById('siswaStageBadge').textContent = isLaporan ? 'Tahap 2: Laporan Penelitian' : 'Tahap 1: Proposal Penelitian';
  document.getElementById('siswaBidangBadge').textContent = kti.bidang || '-';
  document.getElementById('siswaProjectTitle').textContent = kti.judul || 'Judul Belum Diisi';
  document.getElementById('siswaTeamSubtitle').textContent = 'Tim Peneliti: ' + (kti.nama_tim || state.user.nama_lengkap);

  const jSt = STATUS_STYLE[kti.status_judul] || STATUS_STYLE.draf;
  const judulBadge = document.getElementById('siswaJudulStatusBadge');
  judulBadge.className = 'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ' + jSt.cls;
  judulBadge.textContent = 'Judul: ' + jSt.label;

  const pct = Number(kti.persentase_progres || 0);
  document.getElementById('siswaProgressText').textContent = pct + '%';
  document.getElementById('siswaProgressBar').style.width = pct + '%';

  // Keep document download buttons hidden in Student UI as requested
  document.getElementById('btnDownloadProposalSiswa').classList.add('hidden');
  document.getElementById('btnDownloadLaporanSiswa').classList.add('hidden');
  document.getElementById('btnAdvanceStage').classList.toggle('hidden', isLaporan);

  updateStageTabsUi();
  renderSiswaSidebarSections();
  selectSiswaSection(state.activeSectionCode || 'COVER');
}

function updateStageTabsUi() {
  const propBtn = document.getElementById('tabViewProposal');
  const lapBtn = document.getElementById('tabViewLaporan');
  const activeCls = 'bg-red-600 text-white shadow-xs';
  const idleCls = 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800';
  propBtn.className = 'nav-tab-btn py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all ' + (state.viewingStage === 'proposal' ? activeCls : idleCls);
  lapBtn.className = 'nav-tab-btn py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all ' + (state.viewingStage === 'laporan' ? activeCls : idleCls);
}

function switchViewingStage(stage) {
  const kti = state.workspace.activeKti;
  if (stage === 'laporan' && kti && kti.tahap_aktif !== 'laporan') {
    showToast('Anda masih di Tahap 1 (Proposal). Klik "Lanjut ke Tahap Laporan" bila siap beralih.', 'warning');
    return;
  }
  state.viewingStage = stage;
  updateStageTabsUi();
  renderSiswaSidebarSections();
  const list = getStageSectionCodes(stage, kti ? kti.id_kti : '', state.workspace.bagians);
  if (state.activeSectionCode !== 'COVER' && !list.includes(state.activeSectionCode)) {
    state.activeSectionCode = list[0];
  }
  selectSiswaSection(state.activeSectionCode);
}

function renderSiswaSidebarSections() {
  const container = document.getElementById('siswaSectionNavList');
  const kti = state.workspace.activeKti;
  const idKti = kti ? kti.id_kti : '';
  const codes = getStageSectionCodes(state.viewingStage, idKti);

  document.getElementById('sidebarCoverStatus').innerHTML = renderStatusBadgeHtml(kti ? kti.status_judul : 'draf');

  const renderBtn = (code) => {
    const meta = getSectionMeta(code, idKti, state.viewingStage);
    const bag = state.workspace.bagians.find((b) => b.tahap === state.viewingStage && b.kode_bagian === code);
    const st = bag ? bag.status : 'draf';
    const isActive = state.activeSectionCode === code;
    const activeRing = isActive
      ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
      : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-700/70 hover:border-red-200 text-slate-700 dark:text-slate-200';
    return `
      <button type="button" onclick="selectSiswaSection('${code}')" class="w-full px-3 py-2 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${activeRing}">
        <span class="text-xs font-heading font-bold truncate">${escapeHtml(meta.short)}</span>
        ${renderStatusBadgeHtml(st)}
      </button>
    `;
  };

  const bab2Codes = getBab2Meta(idKti, state.viewingStage).subchapters.map((s) => s.code);
  const groupHeader = (title, extraBtn = '') => `
    <div class="flex items-center justify-between px-1.5 pt-2 pb-1">
      <span class="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">${title}</span>
      ${extraBtn}
    </div>
  `;

  let html = '';
  if (codes.includes('ABSTRAK')) html += renderBtn('ABSTRAK');
  html += groupHeader('BAB 1. Pendahuluan') + BAB1_CODES.map(renderBtn).join('');
  html += groupHeader(
    'BAB 2. Tinjauan Pustaka',
    `<button type="button" onclick="selectSiswaSection('${bab2Codes[0] || 'BAB2_1'}')" class="text-[10px] font-heading font-bold text-red-600 dark:text-red-400 hover:underline">Atur (${bab2Codes.length})</button>`
  ) + bab2Codes.map(renderBtn).join('');
  html += groupHeader('BAB 3. Metodologi') + BAB3_CODES.map(renderBtn).join('');
  const tailCodes = codes.filter((c) => c !== 'ABSTRAK' && !BAB1_CODES.includes(c) && !bab2Codes.includes(c) && !BAB3_CODES.includes(c));
  if (tailCodes.length) {
    html += groupHeader('Bagian Akhir') + tailCodes.map(renderBtn).join('');
  }
  container.innerHTML = html;
}

function selectSiswaSection(code) {
  if (state.user && state.user.role === 'siswa' && state.activeSectionCode !== 'COVER' && state.activeSectionCode !== code && state.isDirty) {
    saveLocalAutosave();
  }
  state.activeSectionCode = code;
  const navCover = document.getElementById('navBtnCover');
  navCover.className = 'w-full mb-3 p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ' +
    (code === 'COVER'
      ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700'
      : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-700/70 hover:border-red-200');

  renderSiswaSidebarSections();

  const panelCover = document.getElementById('panelCoverEditor');
  const panelEditor = document.getElementById('panelSectionEditor');

  if (code === 'COVER') {
    panelCover.classList.remove('hidden');
    panelEditor.classList.add('hidden');
    populateCoverMetadataForm();
  } else {
    panelCover.classList.add('hidden');
    panelEditor.classList.remove('hidden');
    loadSectionIntoEditor(code);
  }
  refreshIcons();
}

// ==================== COVER METADATA ====================

function populateCoverMetadataForm() {
  const kti = state.workspace.activeKti || {};
  const cfg = state.workspace.config || {};

  document.getElementById('coverJenisDokumen').value = kti.tahap_aktif === 'laporan' ? 'LAPORAN PENELITIAN' : 'PROPOSAL PENELITIAN';
  document.getElementById('coverJudulInput').value = kti.judul || '';
  document.getElementById('coverStatusBadgeLarge').innerHTML = renderStatusBadgeHtml(kti.status_judul || 'draf');

  const bidangRaw = cfg.bidang_kompetisi || 'Integrasi Keislaman dan Keilmuan|Desain Teknologi Tepat Guna|Sains dan Lingkungan|Pendidikan, Sosial dan Budaya';
  const bidangOpts = bidangRaw.split('|').map((s) => s.trim()).filter(Boolean);
  const sel = document.getElementById('coverBidangSelect');
  sel.innerHTML = bidangOpts.map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
  if (kti.bidang && !bidangOpts.includes(kti.bidang)) {
    sel.innerHTML += `<option value="${escapeHtml(kti.bidang)}">${escapeHtml(kti.bidang)}</option>`;
  }
  sel.value = kti.bidang || bidangOpts[0];

  document.getElementById('coverSekolahDisplay').value = cfg.nama_sekolah || 'SMPIT Darul Fikri Sidoarjo';
  document.getElementById('coverKabProvDisplay').value = cfg.kabupaten_provinsi || 'Kabupaten Sidoarjo, Jawa Timur';
  document.getElementById('coverTahunDisplay').value = cfg.tahun || '2026';

  const members = String(kti.nama_tim || state.user.nama_lengkap || '').split(',').map((s) => s.trim()).filter(Boolean);
  renderTeamMembersInputs(members.length ? members : [state.user.nama_lengkap]);

  const titleLogs = state.workspace.logs.filter((l) => l.id_bagian === ('JUDUL-' + kti.id_kti));
  const logBox = document.getElementById('titleLogContainer');
  if (titleLogs.length) {
    logBox.innerHTML = '<div class="text-xs font-heading font-bold text-slate-600 dark:text-slate-300 mb-1.5">Catatan Pembimbing tentang Judul:</div>' +
      titleLogs.slice().reverse().map((l) => `
        <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs mb-1.5">
          <div class="flex justify-between text-[10px] text-slate-400 mb-0.5"><span>${escapeHtml(l.pengirim)}</span><span>${new Date(l.timestamp).toLocaleString('id-ID')}</span></div>
          <div>${escapeHtml(l.catatan)}</div>
        </div>
      `).join('');
  } else {
    logBox.innerHTML = '';
  }
}

function renderTeamMembersInputs(members) {
  const wrap = document.getElementById('teamMembersContainer');
  wrap.innerHTML = members.map((m, idx) => `
    <div class="flex items-center gap-2">
      <input type="text" value="${escapeHtml(m)}" placeholder="Nama lengkap anggota ${idx + 1}" class="team-member-input flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
      ${members.length > 1 ? `<button type="button" onclick="removeTeamMemberInput(${idx})" class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` : ''}
    </div>
  `).join('');
  refreshIcons();
}

function getTeamMembersList() {
  return Array.from(document.querySelectorAll('.team-member-input')).map((el) => el.value.trim()).filter(Boolean);
}

function addTeamMemberInput() {
  const list = getTeamMembersList();
  list.push('');
  renderTeamMembersInputs(list);
}

function removeTeamMemberInput(idx) {
  const list = getTeamMembersList();
  list.splice(idx, 1);
  renderTeamMembersInputs(list.length ? list : ['']);
}

async function saveCoverMetadata(statusJudul) {
  const kti = state.workspace.activeKti;
  const judul = document.getElementById('coverJudulInput').value.trim();
  const team = getTeamMembersList();
  const bidang = document.getElementById('coverBidangSelect').value;

  if (!judul) return showToast('Judul penelitian wajib diisi.', 'warning');
  if (!team.length) return showToast('Minimal isi 1 nama peneliti.', 'warning');

  try {
    await callBackend('saveCoverMetadata', {
      id_kti: kti.id_kti,
      judul,
      nama_tim: team.join(', '),
      bidang,
      status_judul: statusJudul
    });
    await refreshWorkspaceFromBackend(kti.id_kti);
    showToast(statusJudul === 'review' ? 'Judul diajukan untuk review pembimbing!' : 'Metadata sampul disimpan.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== SECTION ACADEMIC EDITOR ====================

function getAutosaveKey(idKti, tahap, code) {
  return `${STORAGE_KEYS.AUTOSAVE_PREFIX}${idKti}_${tahap}_${code}`;
}

function loadSectionIntoEditor(code) {
  const kti = state.workspace.activeKti;
  const meta = getSectionMeta(code, kti.id_kti, state.viewingStage);
  const bag = state.workspace.bagians.find((b) => b.tahap === state.viewingStage && b.kode_bagian === code);

  document.getElementById('editorSectionCodeBadge').textContent = `${state.viewingStage.toUpperCase()} • ${code}`;
  document.getElementById('editorSectionStatusBadge').innerHTML = renderStatusBadgeHtml(bag ? bag.status : 'draf');
  document.getElementById('editorSectionVersion').textContent = 'v' + (bag ? bag.versi : 1);
  document.getElementById('editorSectionTitle').textContent = meta.label;
  document.getElementById('editorSectionDesc').textContent = meta.desc;

  const isReadOnlyArchive = kti.tahap_aktif === 'laporan' && state.viewingStage === 'proposal';
  document.getElementById('readOnlyStageBanner').classList.toggle('hidden', !isReadOnlyArchive);
  document.getElementById('btnSaveDraft').disabled = isReadOnlyArchive;
  document.getElementById('btnSubmitReview').disabled = isReadOnlyArchive;
  if (state.quill) state.quill.enable(!isReadOnlyArchive);

  const isBab2 = String(code).startsWith('BAB2_');
  const isBab3Structured = code === 'BAB3_5';

  // Toggle special panels
  document.getElementById('specialAbstrakBox').classList.toggle('hidden', code !== 'ABSTRAK');
  document.getElementById('specialPustakaBox').classList.toggle('hidden', code !== 'DAFTAR_PUSTAKA');
  document.getElementById('specialBab2Box').classList.toggle('hidden', !isBab2);
  document.getElementById('specialBab3Box').classList.toggle('hidden', !isBab3Structured);
  document.getElementById('specialLampiranBox').classList.toggle('hidden', code !== 'LAMPIRAN');

  const rawHtml = bag ? (bag.konten_html || '') : '';
  const extracted = extractStructuredBlocks(rawHtml, code);

  if (code === 'ABSTRAK') {
    document.getElementById('abstrakKeywordsInput').value = bag ? (bag.kata_kunci || '') : '';
  }

  if (isBab2) {
    renderStudentBab2Manager();
  }

  if (isBab3Structured) {
    state.structuredBab3 = extracted.bab3 || defaultStructuredBab3();
    renderRabTable();
    renderJadwalTable();
    populateEthicalInputs();
  }

  if (code === 'LAMPIRAN') {
    state.structuredLampiran = extracted.lampiran || defaultStructuredLampiran();
    renderRealisasiTable();
  }

  setEditorHtmlRaw(extracted.narrativeHtml);
  document.getElementById('studentSubmitNote').value = '';

  // Check localStorage backup
  state.pendingBackup = null;
  document.getElementById('localRecoveryBanner').classList.add('hidden');
  const savedRaw = localStorage.getItem(getAutosaveKey(kti.id_kti, state.viewingStage, code));
  if (savedRaw && !isReadOnlyArchive) {
    try {
      const backup = JSON.parse(savedRaw);
      const serverTime = bag && bag.updated_at ? new Date(bag.updated_at).getTime() : 0;
      if (backup.savedAt > serverTime && backup.html !== extracted.narrativeHtml) {
        state.pendingBackup = backup;
        document.getElementById('recoveryTimeText').textContent = new Date(backup.savedAt).toLocaleTimeString('id-ID');
        document.getElementById('localRecoveryBanner').classList.remove('hidden');
      }
    } catch (e) {}
  }

  renderSectionRevisionLogs(bag ? bag.id_bagian : null);
}

function saveLocalAutosave() {
  const kti = state.workspace.activeKti;
  if (!kti || state.activeSectionCode === 'COVER') return;
  localStorage.setItem(getAutosaveKey(kti.id_kti, state.viewingStage, state.activeSectionCode), JSON.stringify({
    html: getEditorHtmlRaw(),
    kata_kunci: document.getElementById('abstrakKeywordsInput').value || '',
    bab3: state.activeSectionCode === 'BAB3_5' ? state.structuredBab3 : null,
    lampiran: state.activeSectionCode === 'LAMPIRAN' ? state.structuredLampiran : null,
    savedAt: Date.now()
  }));
  state.isDirty = false;
  document.getElementById('autoSaveText').textContent = 'Tersimpan lokal ' + new Date().toLocaleTimeString('id-ID');
}

function restoreLocalBackup() {
  if (!state.pendingBackup) return;
  setEditorHtmlRaw(state.pendingBackup.html || '');
  if (state.activeSectionCode === 'ABSTRAK' && state.pendingBackup.kata_kunci !== undefined) {
    document.getElementById('abstrakKeywordsInput').value = state.pendingBackup.kata_kunci;
    validateAbstrakMetrics();
  }
  if (state.activeSectionCode === 'BAB3_5' && state.pendingBackup.bab3) {
    state.structuredBab3 = state.pendingBackup.bab3;
    renderRabTable();
    renderJadwalTable();
    populateEthicalInputs();
  }
  if (state.activeSectionCode === 'LAMPIRAN' && state.pendingBackup.lampiran) {
    state.structuredLampiran = state.pendingBackup.lampiran;
    renderRealisasiTable();
  }
  document.getElementById('localRecoveryBanner').classList.add('hidden');
  showToast('Cadangan lokal berhasil dipulihkan ke editor.', 'success');
}

function dismissLocalBackup() {
  document.getElementById('localRecoveryBanner').classList.add('hidden');
  state.pendingBackup = null;
}

function onEditorContentChanged() {
  const code = state.activeSectionCode;
  const fullCompiled = compileSectionHtmlForSave(code);
  const charCount = fullCompiled.length;
  const limitEl = document.getElementById('charLimitText');
  limitEl.textContent = `${charCount.toLocaleString('id-ID')} / 49.000 karakter`;
  limitEl.className = charCount > MAX_CELL_CHARS
    ? 'text-[11px] font-mono font-bold text-rose-600'
    : 'text-[11px] font-mono text-slate-400';

  if (code === 'ABSTRAK') validateAbstrakMetrics();
  if (code === 'DAFTAR_PUSTAKA') validatePustakaSources();
}

function validateAbstrakMetrics() {
  const text = getPlainTextFromHtml(getEditorHtmlRaw());
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const wordBadge = document.getElementById('abstrakWordBadge');
  wordBadge.textContent = `${words} / 250 kata`;
  if (words > 250) {
    wordBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
  } else {
    wordBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  }

  const kwRaw = document.getElementById('abstrakKeywordsInput').value;
  const kws = kwRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const kwBadge = document.getElementById('abstrakKeywordBadge');
  kwBadge.textContent = `${kws.length} kata kunci (syarat: 3–5)`;
  kwBadge.className = (kws.length >= 3 && kws.length <= 5)
    ? 'text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400'
    : 'text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400';

  return { words, kws };
}

function validatePustakaSources() {
  const text = getPlainTextFromHtml(getEditorHtmlRaw()).toLowerCase();
  const forbidden = ['wikipedia.org', 'wikipedia', 'blogspot', 'wordpress'];
  const matches = forbidden.filter((term) => text.includes(term));
  const box = document.getElementById('pustakaWarningAlert');
  const detail = document.getElementById('pustakaWarningDetail');

  if (matches.length) {
    box.classList.remove('hidden');
    detail.textContent = `Terdeteksi kata/domain sumber non-ilmiah: ${matches.join(', ')}. Ganti dengan jurnal ilmiah, buku teks, atau situs lembaga resmi (.ac.id, .go.id, .edu).`;
  } else {
    box.classList.add('hidden');
  }
  return matches;
}

// ==================== BAB 2 DYNAMIC SUB-CHAPTER MANAGER (SISWA) ====================

let workingBab2Subchapters = [];

function renderStudentBab2Manager() {
  const kti = state.workspace.activeKti;
  if (!kti) return;
  const meta = getBab2Meta(kti.id_kti, state.viewingStage);
  workingBab2Subchapters = meta.subchapters.map((s) => Object.assign({}, s));
  document.getElementById('bab2CountInput').value = workingBab2Subchapters.length;
  renderBab2SubchaptersInputs();

  const banner = document.getElementById('bab2GuruSuggestBanner');
  const listEl = document.getElementById('bab2GuruSuggestList');
  if (meta.guru_suggestions && meta.guru_suggestions.length) {
    banner.classList.remove('hidden');
    listEl.innerHTML = meta.guru_suggestions.map((g, i) => `
      <li><strong>2.${i + 1} ${escapeHtml(g.title)}</strong>${g.note ? ' — <span class="italic">' + escapeHtml(g.note) + '</span>' : ''}</li>
    `).join('');
  } else {
    banner.classList.add('hidden');
  }
  refreshIcons();
}

function renderBab2SubchaptersInputs() {
  const wrap = document.getElementById('bab2SubchaptersEditorList');
  wrap.innerHTML = workingBab2Subchapters.map((sub, idx) => `
    <div class="flex items-center gap-2">
      <span class="w-14 text-[11px] font-mono font-bold text-slate-500">BAB2_${idx + 1}</span>
      <input type="text" value="${escapeHtml(sub.title)}" oninput="workingBab2Subchapters[${idx}].title=this.value"
        placeholder="Judul sub-bab 2.${idx + 1}"
        class="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
    </div>
  `).join('');
}

function setBab2SubchapterCount(val) {
  const count = Math.max(1, Math.min(10, Number(val || 3)));
  document.getElementById('bab2CountInput').value = count;
  while (workingBab2Subchapters.length < count) {
    const idx = workingBab2Subchapters.length + 1;
    workingBab2Subchapters.push({ code: 'BAB2_' + idx, title: `2.${idx} Kajian Teori ${idx}` });
  }
  if (workingBab2Subchapters.length > count) {
    workingBab2Subchapters = workingBab2Subchapters.slice(0, count);
  }
  renderBab2SubchaptersInputs();
}

function applyGuruBab2Suggestions() {
  const kti = state.workspace.activeKti;
  if (!kti) return;
  const meta = getBab2Meta(kti.id_kti, state.viewingStage);
  if (!meta.guru_suggestions.length) return;
  workingBab2Subchapters = meta.guru_suggestions.slice(0, 10).map((g, idx) => ({
    code: 'BAB2_' + (idx + 1),
    title: `2.${idx + 1} ${g.title.replace(/^2\.\d+\s*/, '')}`
  }));
  document.getElementById('bab2CountInput').value = workingBab2Subchapters.length;
  renderBab2SubchaptersInputs();
  saveBab2Structure();
}

async function saveBab2Structure() {
  const kti = state.workspace.activeKti;
  if (!kti) return;
  const cleaned = workingBab2Subchapters.map((s, idx) => ({
    code: 'BAB2_' + (idx + 1),
    title: (s.title || `2.${idx + 1} Sub-bab ${idx + 1}`).trim()
  }));
  try {
    await callBackend('saveBab2Meta', {
      id_kti: kti.id_kti,
      tahap: state.viewingStage,
      subchapters: cleaned
    });
    if (!cleaned.some((s) => s.code === state.activeSectionCode)) {
      state.activeSectionCode = cleaned[0].code;
    }
    await refreshWorkspaceFromBackend(kti.id_kti);
    showToast('Struktur sub-bab Bab 2 berhasil disimpan!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== STRUCTURED BAB 3 & LAMPIRAN BUILDERS ====================

function defaultStructuredBab3() {
  return {
    rab: [
      { item: 'Bahan habis pakai penelitian', vol: 1, satuan: 'paket', harga: 150000 }
    ],
    jadwal: [
      { kegiatan: 'Studi literatur & persiapan alat', b: [true, false, false, false, false, false] },
      { kegiatan: 'Pelaksanaan eksperimen / pengambilan data', b: [false, true, true, false, false, false] },
      { kegiatan: 'Analisis data & penyusunan laporan', b: [false, false, false, true, true, false] }
    ],
    ethical: { manusia: false, hewan: false, mikro: false, kimia: false, catatan: '' }
  };
}

function defaultStructuredLampiran() {
  return {
    realisasi: [
      { item: 'Bahan habis pakai penelitian', rencana: 150000, realisasi: 145000, ket: 'Nota #01 terlampir' }
    ]
  };
}

function extractStructuredBlocks(html, code) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html || '';
  let bab3 = null;
  let lampiran = null;

  if (code === 'BAB3_5') {
    const el = wrapper.querySelector('[data-structured-bab3]');
    if (el) {
      try {
        bab3 = JSON.parse(decodeURIComponent(el.getAttribute('data-structured-bab3')));
      } catch (e) {}
      el.remove();
    }
  }
  if (code === 'LAMPIRAN') {
    const el = wrapper.querySelector('[data-structured-lampiran]');
    if (el) {
      try {
        lampiran = JSON.parse(decodeURIComponent(el.getAttribute('data-structured-lampiran')));
      } catch (e) {}
      el.remove();
    }
  }
  return { narrativeHtml: wrapper.innerHTML.trim(), bab3, lampiran };
}

function buildBab3StructuredHtml(data) {
  const total = data.rab.reduce((acc, r) => acc + (Number(r.vol || 0) * Number(r.harga || 0)), 0);
  const rabRows = data.rab.map((r, i) => {
    const sub = Number(r.vol || 0) * Number(r.harga || 0);
    return `<tr><td>${i + 1}</td><td>${escapeHtml(r.item)}</td><td>${r.vol}</td><td>${escapeHtml(r.satuan)}</td><td>Rp ${Number(r.harga || 0).toLocaleString('id-ID')}</td><td>Rp ${sub.toLocaleString('id-ID')}</td></tr>`;
  }).join('');

  const jadwalRows = data.jadwal.map((j, i) => {
    const cells = j.b.map((chk) => `<td>${chk ? '&#10003;' : '-'}</td>`).join('');
    return `<tr><td>${i + 1}</td><td>${escapeHtml(j.kegiatan)}</td>${cells}</tr>`;
  }).join('');

  const ethFlags = [];
  if (data.ethical.manusia) ethFlags.push('Subjek Manusia');
  if (data.ethical.hewan) ethFlags.push('Hewan Uji');
  if (data.ethical.mikro) ethFlags.push('Mikroorganisme');
  if (data.ethical.kimia) ethFlags.push('Bahan Kimia Berbahaya');
  const ethSummary = ethFlags.length ? ethFlags.join(', ') : 'Tidak melibatkan objek berisiko etik';

  const encoded = encodeURIComponent(JSON.stringify(data));
  return `<div data-structured-bab3="${encoded}">
    <p class="table-caption">Tabel Rencana Anggaran Biaya (RAB)</p>
    <table>
      <thead><tr><th>No</th><th>Uraian Kebutuhan</th><th>Vol</th><th>Satuan</th><th>Harga Satuan</th><th>Subtotal</th></tr></thead>
      <tbody>${rabRows}<tr><th colspan="5">Total Rencana Anggaran</th><th>Rp ${total.toLocaleString('id-ID')}</th></tr></tbody>
    </table>
    <p class="table-caption">Tabel Jadwal Pelaksanaan Penelitian</p>
    <table>
      <thead><tr><th>No</th><th>Kegiatan</th><th>B1</th><th>B2</th><th>B3</th><th>B4</th><th>B5</th><th>B6</th></tr></thead>
      <tbody>${jadwalRows}</tbody>
    </table>
    <p><strong>Keterangan Ethical Clearance:</strong> ${escapeHtml(ethSummary)}. ${escapeHtml(data.ethical.catatan || '')}</p>
  </div>`;
}

function buildLampiranStructuredHtml(data) {
  const totR = data.realisasi.reduce((a, r) => a + Number(r.rencana || 0), 0);
  const totA = data.realisasi.reduce((a, r) => a + Number(r.realisasi || 0), 0);
  const rows = data.realisasi.map((r, i) => `
    <tr><td>${i + 1}</td><td>${escapeHtml(r.item)}</td><td>Rp ${Number(r.rencana || 0).toLocaleString('id-ID')}</td><td>Rp ${Number(r.realisasi || 0).toLocaleString('id-ID')}</td><td>${escapeHtml(r.ket || '-')}</td></tr>
  `).join('');
  const encoded = encodeURIComponent(JSON.stringify(data));
  return `<div data-structured-lampiran="${encoded}">
    <p class="table-caption">Tabel Realisasi Anggaran Biaya Penelitian</p>
    <table>
      <thead><tr><th>No</th><th>Uraian Pengeluaran</th><th>Rencana</th><th>Realisasi</th><th>Keterangan</th></tr></thead>
      <tbody>${rows}<tr><th colspan="2">Total</th><th>Rp ${totR.toLocaleString('id-ID')}</th><th>Rp ${totA.toLocaleString('id-ID')}</th><th>Selisih: Rp ${(totR - totA).toLocaleString('id-ID')}</th></tr></tbody>
    </table>
  </div>`;
}

function compileSectionHtmlForSave(code) {
  let html = getEditorHtmlRaw();
  if (code === 'BAB3_5') {
    html += '\n' + buildBab3StructuredHtml(state.structuredBab3);
  } else if (code === 'LAMPIRAN') {
    html += '\n' + buildLampiranStructuredHtml(state.structuredLampiran);
  }
  return html;
}

function renderRabTable() {
  const tbody = document.getElementById('rabTableBody');
  let total = 0;
  tbody.innerHTML = state.structuredBab3.rab.map((r, idx) => {
    const sub = Number(r.vol || 0) * Number(r.harga || 0);
    total += sub;
    return `
      <tr>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="text" value="${escapeHtml(r.item)}" oninput="updateRabField(${idx}, 'item', this.value)" class="w-full px-2 py-1 rounded bg-transparent text-xs"></td>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="number" min="1" value="${r.vol}" oninput="updateRabField(${idx}, 'vol', this.value)" class="w-full px-1 py-1 rounded bg-transparent text-xs text-center"></td>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="text" value="${escapeHtml(r.satuan)}" oninput="updateRabField(${idx}, 'satuan', this.value)" class="w-full px-2 py-1 rounded bg-transparent text-xs text-center"></td>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="number" min="0" value="${r.harga}" oninput="updateRabField(${idx}, 'harga', this.value)" class="w-full px-2 py-1 rounded bg-transparent text-xs text-right font-mono"></td>
        <td class="p-2 border border-slate-200 dark:border-slate-700 text-right font-mono">Rp ${sub.toLocaleString('id-ID')}</td>
        <td class="p-1 border border-slate-200 dark:border-slate-700 text-center"><button type="button" onclick="removeRabRow(${idx})" class="text-rose-500 hover:text-rose-700 font-bold">&times;</button></td>
      </tr>
    `;
  }).join('');
  document.getElementById('rabTotalCell').textContent = 'Rp ' + total.toLocaleString('id-ID');
}

function updateRabField(idx, field, val) {
  state.structuredBab3.rab[idx][field] = (field === 'vol' || field === 'harga') ? Number(val || 0) : val;
  renderRabTable();
  onEditorContentChanged();
}

function addRabRow() {
  state.structuredBab3.rab.push({ item: '', vol: 1, satuan: 'buah', harga: 0 });
  renderRabTable();
}

function removeRabRow(idx) {
  state.structuredBab3.rab.splice(idx, 1);
  renderRabTable();
}

function renderJadwalTable() {
  const tbody = document.getElementById('jadwalTableBody');
  tbody.innerHTML = state.structuredBab3.jadwal.map((j, idx) => {
    const checks = j.b.map((v, bIdx) => `
      <td class="p-1 text-center border border-slate-200 dark:border-slate-700">
        <input type="checkbox" ${v ? 'checked' : ''} onchange="toggleJadwalCell(${idx}, ${bIdx}, this.checked)" class="rounded text-red-600">
      </td>
    `).join('');
    return `
      <tr>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="text" value="${escapeHtml(j.kegiatan)}" oninput="state.structuredBab3.jadwal[${idx}].kegiatan=this.value" class="w-full px-2 py-1 rounded bg-transparent text-xs"></td>
        ${checks}
        <td class="p-1 text-center border border-slate-200 dark:border-slate-700"><button type="button" onclick="removeJadwalRow(${idx})" class="text-rose-500 font-bold">&times;</button></td>
      </tr>
    `;
  }).join('');
}

function toggleJadwalCell(idx, bIdx, checked) {
  state.structuredBab3.jadwal[idx].b[bIdx] = checked;
  onEditorContentChanged();
}

function addJadwalRow() {
  state.structuredBab3.jadwal.push({ kegiatan: '', b: [false, false, false, false, false, false] });
  renderJadwalTable();
}

function removeJadwalRow(idx) {
  state.structuredBab3.jadwal.splice(idx, 1);
  renderJadwalTable();
}

function populateEthicalInputs() {
  const e = state.structuredBab3.ethical;
  document.getElementById('ethManusia').checked = Boolean(e.manusia);
  document.getElementById('ethHewan').checked = Boolean(e.hewan);
  document.getElementById('ethMikro').checked = Boolean(e.mikro);
  document.getElementById('ethKimia').checked = Boolean(e.kimia);
  document.getElementById('ethCatatan').value = e.catatan || '';
}

function onStructuredInputChange() {
  state.structuredBab3.ethical = {
    manusia: document.getElementById('ethManusia').checked,
    hewan: document.getElementById('ethHewan').checked,
    mikro: document.getElementById('ethMikro').checked,
    kimia: document.getElementById('ethKimia').checked,
    catatan: document.getElementById('ethCatatan').value
  };
  onEditorContentChanged();
}

function syncStructuredBab3ToEditor() {
  onStructuredInputChange();
  const box = document.getElementById('bab3CompiledPreview');
  if (!box.classList.contains('hidden')) {
    box.classList.add('hidden');
    return;
  }
  box.innerHTML = '<div class="font-heading font-bold text-red-600 dark:text-red-400 mb-1">Pratinjau Gabungan Komponen Terstruktur Bab 3:</div>' + buildBab3StructuredHtml(state.structuredBab3);
  box.classList.remove('hidden');
  showToast('Pratinjau tabel Bab 3 ditampilkan. Data otomatis tergabung saat simpan & ekspor.', 'success');
}

function renderRealisasiTable() {
  const tbody = document.getElementById('realisasiTableBody');
  let totR = 0, totA = 0;
  tbody.innerHTML = state.structuredLampiran.realisasi.map((r, idx) => {
    totR += Number(r.rencana || 0);
    totA += Number(r.realisasi || 0);
    return `
      <tr>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="text" value="${escapeHtml(r.item)}" oninput="updateRealisasiField(${idx}, 'item', this.value)" class="w-full px-2 py-1 bg-transparent text-xs"></td>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="number" min="0" value="${r.rencana}" oninput="updateRealisasiField(${idx}, 'rencana', this.value)" class="w-full px-2 py-1 bg-transparent text-xs text-right font-mono"></td>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="number" min="0" value="${r.realisasi}" oninput="updateRealisasiField(${idx}, 'realisasi', this.value)" class="w-full px-2 py-1 bg-transparent text-xs text-right font-mono"></td>
        <td class="p-1 border border-slate-200 dark:border-slate-700"><input type="text" value="${escapeHtml(r.ket)}" oninput="updateRealisasiField(${idx}, 'ket', this.value)" class="w-full px-2 py-1 bg-transparent text-xs"></td>
        <td class="p-1 border border-slate-200 dark:border-slate-700 text-center"><button type="button" onclick="removeRealisasiRow(${idx})" class="text-rose-500 font-bold">&times;</button></td>
      </tr>
    `;
  }).join('');
  document.getElementById('realisasiRencanaTotal').textContent = 'Rp ' + totR.toLocaleString('id-ID');
  document.getElementById('realisasiAktualTotal').textContent = 'Rp ' + totA.toLocaleString('id-ID');
}

function updateRealisasiField(idx, field, val) {
  state.structuredLampiran.realisasi[idx][field] = (field === 'rencana' || field === 'realisasi') ? Number(val || 0) : val;
  renderRealisasiTable();
  onEditorContentChanged();
}

function addRealisasiRow() {
  state.structuredLampiran.realisasi.push({ item: '', rencana: 0, realisasi: 0, ket: '' });
  renderRealisasiTable();
}

function removeRealisasiRow(idx) {
  state.structuredLampiran.realisasi.splice(idx, 1);
  renderRealisasiTable();
}

function syncRealisasiToEditor() {
  showToast('Tabel Realisasi RAB otomatis disisipkan ke Lampiran saat simpan & ekspor!', 'success');
}

// ==================== SAVE SECTION & ADVANCE STAGE ====================

async function saveCurrentSection(targetStatus) {
  const kti = state.workspace.activeKti;
  const code = state.activeSectionCode;
  if (!kti || code === 'COVER') return;

  if (code === 'BAB3_5') onStructuredInputChange();
  const compiledHtml = compileSectionHtmlForSave(code);
  const plainText = getPlainTextFromHtml(compiledHtml);

  if (compiledHtml.length > MAX_CELL_CHARS) {
    return showToast('Teks terlalu panjang (> 49.000 karakter). Pastikan gambar diunggah via tombol Sisip Gambar.', 'error');
  }

  let kataKunci = '';
  if (code === 'ABSTRAK') {
    const metrics = validateAbstrakMetrics();
    kataKunci = document.getElementById('abstrakKeywordsInput').value.trim();
    if (metrics.words > 250) {
      return showToast('Abstrak melebihi batas maksimal 250 kata (' + metrics.words + ' kata).', 'warning');
    }
    if (targetStatus === 'review' && (metrics.kws.length < 3 || metrics.kws.length > 5)) {
      return showToast('Abstrak wajib memiliki 3 sampai 5 kata kunci sebelum diajukan review.', 'warning');
    }
  }

  if (code === 'DAFTAR_PUSTAKA' && targetStatus === 'review') {
    const bad = validatePustakaSources();
    if (bad.length) {
      return showToast('Daftar Pustaka masih memuat sumber non-ilmiah (' + bad.join(', ') + '). Harap ganti sebelum mengajukan review.', 'warning');
    }
  }

  if (targetStatus === 'review' && state.gasUrl && typeof navigator !== 'undefined' && navigator.onLine === false) {
    saveLocalAutosave();
    return showToast('Anda sedang offline. Naskah dicadangkan di perangkat; ajukan review setelah internet tersambung.', 'warning');
  }

  if (targetStatus === 'review' && plainText.length < 15) {
    return showToast('Naskah bagian ini masih terlalu singkat untuk diajukan review.', 'warning');
  }

  try {
    await callBackend('saveBagian', {
      id_kti: kti.id_kti,
      tahap: state.viewingStage,
      kode_bagian: code,
      status: targetStatus,
      konten_html: compiledHtml,
      kata_kunci: kataKunci,
      catatan_pengaju: document.getElementById('studentSubmitNote').value.trim(),
      pengirim: state.user.nama_lengkap
    });
    localStorage.removeItem(getAutosaveKey(kti.id_kti, state.viewingStage, code));
    state.isDirty = false;
    await refreshWorkspaceFromBackend(kti.id_kti);
    showToast(targetStatus === 'review' ? 'Bagian berhasil diajukan ke Guru Pembimbing!' : 'Draf bagian berhasil disimpan.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderSectionRevisionLogs(idBagian) {
  const box = document.getElementById('sectionRevisionLogs');
  const countEl = document.getElementById('sectionLogCount');
  const logs = idBagian ? state.workspace.logs.filter((l) => l.id_bagian === idBagian) : [];
  countEl.textContent = logs.length + ' catatan';
  if (!logs.length) {
    box.innerHTML = '<div class="text-xs text-slate-400 italic py-2">Belum ada catatan revisi untuk bagian ini.</div>';
    return;
  }
  box.innerHTML = logs.slice().reverse().map((l) => `
    <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
      <div class="flex items-center justify-between text-[11px]">
        <span class="font-heading font-bold text-slate-800 dark:text-slate-100">${escapeHtml(l.pengirim)} <span class="font-mono text-slate-400 font-normal">• v${l.versi}</span></span>
        <span class="text-slate-400">${new Date(l.timestamp).toLocaleString('id-ID')}</span>
      </div>
      <p class="text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(l.catatan)}</p>
    </div>
  `).join('');
}

function promptAdvanceToLaporan() {
  const kti = state.workspace.activeKti;
  if (!kti || kti.tahap_aktif === 'laporan') return;
  showConfirmModal({
    title: 'Lanjut ke Tahap 2: Laporan Penelitian?',
    messageHtml: `
      <p>Sistem akan mengaktifkan tab <strong>Laporan Penelitian</strong> dan otomatis menyalin bagian berikut dari Proposal Anda agar tidak perlu mengetik ulang:</p>
      <ul class="list-disc pl-4 mt-2 space-y-0.5 text-slate-600 dark:text-slate-300">
        <li><strong>BAB 1 (1.1 – 1.5)</strong> Pendahuluan</li>
        <li><strong>BAB 2</strong> Tinjauan Pustaka (seluruh sub-bab)</li>
        <li><strong>BAB 3 (3.1 – 3.5)</strong> Metodologi Penelitian (beserta RAB, Jadwal &amp; Ethical Clearance)</li>
        <li><strong>Daftar Pustaka</strong></li>
      </ul>
    `,
    confirmText: 'Aktifkan Tahap Laporan',
    onConfirm: async function () {
      try {
        const res = await callBackend('advanceToLaporan', { id_kti: kti.id_kti });
        state.viewingStage = 'laporan';
        state.activeSectionCode = 'ABSTRAK';
        await refreshWorkspaceFromBackend(kti.id_kti);
        showToast(`Berhasil beralih ke Tahap Laporan! ${res.copied_count} bagian otomatis terbawa.`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });
}

// ==================== IMAGE UPLOAD & TABLE BUILDER MODALS ====================

function getChapterNumberForCode(code) {
  if (!code) return null;
  if (code.startsWith('BAB1')) return '1';
  if (code.startsWith('BAB2')) return '2';
  if (code.startsWith('BAB3')) return '3';
  if (code === 'BAB4') return '4';
  if (code === 'BAB5') return '5';
  return null;
}

function getNextAcademicNumberPrefix(kind) {
  const code = state.activeSectionCode;
  const chap = getChapterNumberForCode(code);
  const selector = kind === 'figure' ? 'figure, .academic-figure' : '.academic-table-wrap, table';

  const countMatches = (htmlStr) => {
    const div = document.createElement('div');
    div.innerHTML = htmlStr || '';
    if (kind === 'table') {
      // Avoid double-counting <table> nested inside .academic-table-wrap
      const wraps = div.querySelectorAll('.academic-table-wrap').length;
      const standalone = Array.from(div.querySelectorAll('table')).filter((t) => !t.closest('.academic-table-wrap')).length;
      return wraps + standalone;
    }
    return div.querySelectorAll(selector).length;
  };

  let existingCount = 0;
  const stageBags = (state.workspace.bagians || []).filter((b) => b.tahap === state.viewingStage);
  if (chap) {
    stageBags.forEach((b) => {
      if (getChapterNumberForCode(b.kode_bagian) === chap && b.kode_bagian !== code) {
        existingCount += countMatches(b.konten_html);
      }
    });
    existingCount += countMatches(getEditorHtmlRaw());
    const label = kind === 'figure' ? 'Gambar' : 'Tabel';
    return `${label} ${chap}.${existingCount + 1}: `;
  }

  stageBags.forEach((b) => {
    if (b.kode_bagian !== code) existingCount += countMatches(b.konten_html);
  });
  existingCount += countMatches(getEditorHtmlRaw());
  const label = kind === 'figure' ? 'Gambar' : 'Tabel';
  return `${label} ${existingCount + 1}: `;
}

function openImageUploadModal() {
  state.selectedImageDataUri = '';
  const suggested = getNextAcademicNumberPrefix('figure');
  document.getElementById('imgFileInput').value = '';
  document.getElementById('imgCaptionInput').value = suggested;
  document.getElementById('imgPreviewWrap').classList.add('hidden');
  document.getElementById('modalImage').classList.remove('hidden');
  refreshIcons();
}

function previewSelectedImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 3.5 * 1024 * 1024) {
    showToast('Ukuran gambar disarankan di bawah 3,5 MB.', 'warning');
  }
  state.selectedImageFileName = file.name;
  state.selectedImageMimeType = file.type || 'image/png';
  const reader = new FileReader();
  reader.onload = function (ev) {
    state.selectedImageDataUri = ev.target.result;
    document.getElementById('imgPreviewEl').src = ev.target.result;
    document.getElementById('imgPreviewWrap').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

async function confirmInsertImage() {
  if (!state.selectedImageDataUri) return showToast('Pilih file gambar terlebih dahulu.', 'warning');
  let caption = document.getElementById('imgCaptionInput').value.trim();
  const suggested = getNextAcademicNumberPrefix('figure');
  if (!caption || caption === suggested.trim()) {
    return showToast('Judul Gambar wajib dilengkapi (contoh: ' + suggested + 'Morfologi sampel).', 'warning');
  }
  if (!/^gambar\s+\d+(?:\.\d+)?/i.test(caption)) {
    caption = suggested + caption;
  }

  const btn = document.getElementById('btnConfirmInsertImg');
  btn.disabled = true;
  btn.textContent = 'Mengunggah...';
  try {
    const res = await callBackend('uploadImage', {
      id_kti: state.workspace.activeKti.id_kti,
      fileName: state.selectedImageFileName,
      mimeType: state.selectedImageMimeType,
      base64Data: state.selectedImageDataUri
    });

    if (state.quill) {
      const range = state.quill.getSelection(true) || { index: state.quill.getLength() };
      state.quill.insertEmbed(range.index, 'academic-figure', { src: res.url, caption }, 'user');
      state.quill.setSelection(range.index + 1, 0);
    }
    closeModal('modalImage');
    showToast('Gambar berhasil diunggah dan disisipkan!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Unggah & Sisipkan';
  }
}

function openTableBuilderModal() {
  document.getElementById('tblCaptionInput').value = getNextAcademicNumberPrefix('table');
  document.getElementById('tblRowsInput').value = 4;
  document.getElementById('tblColsInput').value = 3;
  rebuildModalTableGrid();
  document.getElementById('modalTable').classList.remove('hidden');
  refreshIcons();
}

function rebuildModalTableGrid() {
  const rows = Math.max(2, Math.min(15, Number(document.getElementById('tblRowsInput').value || 4)));
  const cols = Math.max(2, Math.min(8, Number(document.getElementById('tblColsInput').value || 3)));
  let html = '<table class="w-full text-xs border-collapse">';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      const placeholder = r === 0 ? `Header ${c + 1}` : `Data ${r}.${c + 1}`;
      const bg = r === 0 ? 'bg-slate-100 dark:bg-slate-900 font-bold' : 'bg-white dark:bg-slate-800';
      html += `<td class="border border-slate-200 dark:border-slate-700 p-1 ${bg}"><input type="text" data-r="${r}" data-c="${c}" placeholder="${placeholder}" class="tbl-grid-cell w-full px-2 py-1 bg-transparent text-xs text-center outline-none"></td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  document.getElementById('modalTableGridWrap').innerHTML = html;
}

function confirmInsertTable() {
  let caption = document.getElementById('tblCaptionInput').value.trim();
  const suggested = getNextAcademicNumberPrefix('table');
  if (!caption || caption === suggested.trim()) {
    return showToast('Judul Tabel wajib dilengkapi (contoh: ' + suggested + 'Data hasil uji).', 'warning');
  }
  if (!/^tabel\s+\d+(?:\.\d+)?/i.test(caption)) {
    caption = suggested + caption;
  }

  const rows = Math.max(2, Math.min(15, Number(document.getElementById('tblRowsInput').value || 4)));
  const cols = Math.max(2, Math.min(8, Number(document.getElementById('tblColsInput').value || 3)));
  const inputs = document.querySelectorAll('.tbl-grid-cell');
  const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
  inputs.forEach((inp) => {
    grid[Number(inp.dataset.r)][Number(inp.dataset.c)] = inp.value.trim() || inp.placeholder;
  });

  let tblHtml = '<table><thead><tr>';
  for (let c = 0; c < cols; c++) tblHtml += `<th>${escapeHtml(grid[0][c])}</th>`;
  tblHtml += '</tr></thead><tbody>';
  for (let r = 1; r < rows; r++) {
    tblHtml += '<tr>';
    for (let c = 0; c < cols; c++) tblHtml += `<td>${escapeHtml(grid[r][c])}</td>`;
    tblHtml += '</tr>';
  }
  tblHtml += '</tbody></table>';

  if (state.quill) {
    const range = state.quill.getSelection(true) || { index: state.quill.getLength() };
    state.quill.insertEmbed(range.index, 'academic-table', { caption, tableHtml: tblHtml }, 'user');
    state.quill.setSelection(range.index + 1, 0);
  }
  closeModal('modalTable');
  showToast('Tabel terstruktur berhasil disisipkan!', 'success');
}

function openCitationModal() {
  document.getElementById('modalCitation').classList.remove('hidden');
  refreshIcons();
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// ==================== GURU PEMBIMBING WORKSPACE (2 HALAMAN: DASHBOARD & REVIEW) ====================

function switchGuruPage(page) {
  state.guruPage = page === 'review' ? 'review' : 'dashboard';
  const isDash = state.guruPage === 'dashboard';

  document.getElementById('guruPageDashboard').classList.toggle('hidden', !isDash);
  document.getElementById('guruPageReview').classList.toggle('hidden', isDash);

  const actCls = 'nav-tab-btn px-4 py-2 rounded-xl text-xs font-heading font-bold inline-flex items-center gap-1.5 bg-red-600 text-white shadow-xs';
  const idleCls = 'nav-tab-btn px-4 py-2 rounded-xl text-xs font-heading font-bold inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800';
  document.getElementById('guruNavDashboard').className = isDash ? actCls : idleCls;
  document.getElementById('guruNavReview').className = !isDash ? actCls : idleCls;

  if (!isDash) {
    if (!state.guruSelectedKtiId && (state.workspace.ktis || []).length > 0) {
      selectGuruTeam(state.workspace.ktis[0].id_kti, true);
      return;
    }
    renderGuruSelectedTeamDetail();
  }
  refreshIcons();
}

function openGuruReviewForTeam(idKti) {
  selectGuruTeam(idKti, true);
}

function initGuruWorkspace() {
  const ktis = state.workspace.ktis || [];
  const statsMap = state.workspace.bagianStats || {};
  document.getElementById('guruStatTeams').textContent = ktis.length;

  let pending = 0, revisi = 0, acc = 0;
  if (Object.keys(statsMap).length > 0) {
    Object.values(statsMap).forEach((s) => {
      pending += Number(s.review || 0);
      revisi += Number(s.revisi || 0);
      acc += Number(s.acc || 0);
    });
  } else {
    (state.workspace.bagians || []).forEach((b) => {
      if (b.status === 'review') pending++;
      else if (b.status === 'revisi') revisi++;
      else if (b.status === 'acc') acc++;
    });
  }
  document.getElementById('guruStatPending').textContent = pending;
  document.getElementById('guruStatRevisi').textContent = revisi;
  document.getElementById('guruStatAcc').textContent = acc;

  renderGuruTeamList();
  switchGuruPage(state.guruPage || 'dashboard');
}

function renderGuruTeamList() {
  const q = (document.getElementById('guruSearchInput').value || '').toLowerCase();
  const list = (state.workspace.ktis || []).filter((k) =>
    (k.judul || '').toLowerCase().includes(q) ||
    (k.nama_tim || '').toLowerCase().includes(q) ||
    (k.bidang || '').toLowerCase().includes(q)
  );
  const statsMap = state.workspace.bagianStats || {};
  const el = document.getElementById('guruTeamList');
  if (!list.length) {
    el.innerHTML = '<div class="md:col-span-2 text-xs text-slate-400 text-center py-8">Tidak ada karya tulis santri bimbingan yang cocok.</div>';
    return;
  }
  el.innerHTML = list.map((k) => {
    const st = statsMap[k.id_kti] || { review: 0, revisi: 0, acc: 0, draf: 0 };
    const pct = Number(k.persentase_progres || 0);
    return `
      <div class="maheda-card maheda-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col justify-between gap-4">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-800/60">
              Tahap: ${escapeHtml(k.tahap_aktif)}
            </span>
            ${renderStatusBadgeHtml(k.status_judul || 'draf')}
          </div>
          <h3 class="font-heading font-extrabold text-base text-slate-900 dark:text-white leading-snug">${escapeHtml(k.judul)}</h3>
          <div class="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
            <div><strong>Tim Peneliti:</strong> ${escapeHtml(k.nama_tim)}</div>
            <div><strong>Topik/Bidang:</strong> ${escapeHtml(k.bidang)}</div>
          </div>
        </div>

        <div class="space-y-3 pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
          <div>
            <div class="flex justify-between text-[11px] font-heading font-bold mb-1">
              <span class="text-slate-500 dark:text-slate-400">Progres ACC</span>
              <span class="text-red-600 dark:text-red-400">${pct}%</span>
            </div>
            <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-red-600 to-emerald-500 rounded-full" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 text-[10px] font-bold">
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">${st.review || 0} Menunggu</span>
              <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">${st.revisi || 0} Revisi</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">${st.acc || 0} ACC</span>
            </div>
            <button type="button" onclick="openGuruReviewForTeam('${k.id_kti}')" class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-heading font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors">
              <span>Review Naskah</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  refreshIcons();
}

async function selectGuruTeam(idKti, goToReviewPage = false) {
  state.guruSelectedKtiId = idKti;
  if (goToReviewPage) state.guruPage = 'review';
  try {
    const res = await callBackend('getWorkspace', {
      id_user: state.user.id_user,
      selected_id_kti: idKti
    });
    state.workspace = res.workspace;
    const activeKti = state.workspace.activeKti;
    state.guruViewingStage = activeKti ? activeKti.tahap_aktif : 'proposal';
    initGuruWorkspace();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderGuruSelectedTeamDetail() {
  const kti = state.workspace.activeKti;
  if (!kti || kti.id_kti !== state.guruSelectedKtiId) {
    document.getElementById('guruEmptyState').classList.remove('hidden');
    document.getElementById('guruReviewWorkspace').classList.add('hidden');
    return;
  }
  document.getElementById('guruEmptyState').classList.add('hidden');
  document.getElementById('guruReviewWorkspace').classList.remove('hidden');

  document.getElementById('guruActiveStageBadge').textContent = kti.tahap_aktif === 'laporan' ? 'Tahap Aktif: Laporan' : 'Tahap Aktif: Proposal';
  document.getElementById('guruJudulStatusBadge').innerHTML = renderStatusBadgeHtml(kti.status_judul || 'draf');
  document.getElementById('guruSelectedJudul').textContent = kti.judul;
  document.getElementById('guruSelectedMeta').textContent = `Tim: ${kti.nama_tim} • Topik: ${kti.bidang}`;
  document.getElementById('btnGuruDownloadLaporan').classList.toggle('hidden', kti.tahap_aktif !== 'laporan');

  // Title ACC logic: hide title revision inputs if already ACC, show only last title note
  const isTitleAcc = kti.status_judul === 'acc';
  document.getElementById('guruTitleDecisionForm').classList.toggle('hidden', isTitleAcc);
  const titleLastBox = document.getElementById('guruTitleLastNoteBox');
  if (isTitleAcc) {
    const titleLogs = (state.workspace.logs || []).filter((l) => l.id_bagian === ('JUDUL-' + kti.id_kti));
    const lastTitleLog = titleLogs.length ? titleLogs[titleLogs.length - 1] : null;
    titleLastBox.innerHTML = lastTitleLog
      ? `<strong>Judul Sudah ACC</strong> • Catatan terakhir (${escapeHtml(lastTitleLog.pengirim)}, ${new Date(lastTitleLog.timestamp).toLocaleString('id-ID')}): <em>${escapeHtml(lastTitleLog.catatan)}</em>`
      : '<strong>Judul Sudah ACC</strong> • Tidak ada catatan revisi tambahan.';
    titleLastBox.classList.remove('hidden');
  } else {
    titleLastBox.classList.add('hidden');
  }

  const propBtn = document.getElementById('guruStageTabProposal');
  const lapBtn = document.getElementById('guruStageTabLaporan');
  const actCls = 'py-2 px-2 rounded-xl text-xs font-heading font-bold bg-red-600 text-white shadow-xs';
  const idleCls = 'py-2 px-2 rounded-xl text-xs font-heading font-bold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800';
  propBtn.className = state.guruViewingStage === 'proposal' ? actCls : idleCls;
  lapBtn.className = state.guruViewingStage === 'laporan' ? actCls : idleCls;

  renderGuruSectionTabs();
  renderGuruBab2SuggestBox();
}

function switchGuruStage(stage) {
  state.guruViewingStage = stage;
  const kti = state.workspace.activeKti;
  const codes = getStageSectionCodes(stage, kti ? kti.id_kti : '');
  if (!codes.includes(state.guruSelectedCode)) state.guruSelectedCode = codes[0];
  renderGuruSelectedTeamDetail();
}

function renderGuruSectionTabs() {
  const filter = document.getElementById('guruStatusFilter').value;
  const kti = state.workspace.activeKti;
  const idKti = kti ? kti.id_kti : '';
  const codes = getStageSectionCodes(state.guruViewingStage, idKti);
  const filtered = codes.filter((c) => {
    if (filter === 'all') return true;
    const bag = state.workspace.bagians.find((b) => b.tahap === state.guruViewingStage && b.kode_bagian === c);
    return (bag ? bag.status : 'draf') === filter;
  });

  if (filtered.length && !filtered.includes(state.guruSelectedCode)) {
    state.guruSelectedCode = filtered[0];
  }

  const tabsEl = document.getElementById('guruSectionTabs');
  tabsEl.innerHTML = filtered.length ? filtered.map((c) => {
    const meta = getSectionMeta(c, idKti, state.guruViewingStage);
    const bag = state.workspace.bagians.find((b) => b.tahap === state.guruViewingStage && b.kode_bagian === c);
    const st = bag ? bag.status : 'draf';
    const active = state.guruSelectedCode === c;
    return `
      <button type="button" onclick="selectGuruSection('${c}')" class="w-full px-3 py-2.5 rounded-2xl text-xs font-heading font-bold border flex items-center justify-between gap-2 text-left transition-all ${active ? 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300' : 'border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-red-200'}">
        <span class="truncate">${escapeHtml(meta.short)}</span>
        ${renderStatusBadgeHtml(st)}
      </button>
    `;
  }).join('') : '<span class="text-xs text-slate-400 italic py-2">Tidak ada bagian dengan status filter ini.</span>';

  renderGuruSectionReader();
}

let workingGuruBab2Suggests = [];

function renderGuruBab2SuggestBox() {
  const kti = state.workspace.activeKti;
  if (!kti) return;
  const meta = getBab2Meta(kti.id_kti, state.guruViewingStage);
  workingGuruBab2Suggests = meta.guru_suggestions.length
    ? meta.guru_suggestions.map((g) => Object.assign({}, g))
    : [{ title: '', note: '' }];
  renderGuruBab2SuggestInputs();
}

function renderGuruBab2SuggestInputs() {
  const wrap = document.getElementById('guruBab2SuggestInputs');
  wrap.innerHTML = workingGuruBab2Suggests.map((g, idx) => `
    <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
      <div class="flex items-center gap-1">
        <input type="text" value="${escapeHtml(g.title)}" oninput="workingGuruBab2Suggests[${idx}].title=this.value"
          placeholder="Judul saran sub-bab ${idx + 1}" class="flex-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
        <button type="button" onclick="removeGuruBab2SuggestRow(${idx})" class="text-rose-500 font-bold px-1.5">&times;</button>
      </div>
      <input type="text" value="${escapeHtml(g.note)}" oninput="workingGuruBab2Suggests[${idx}].note=this.value"
        placeholder="Catatan singkat (opsional)" class="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">
    </div>
  `).join('');
}

function addGuruBab2SuggestRow() {
  workingGuruBab2Suggests.push({ title: '', note: '' });
  renderGuruBab2SuggestInputs();
}

function removeGuruBab2SuggestRow(idx) {
  workingGuruBab2Suggests.splice(idx, 1);
  if (!workingGuruBab2Suggests.length) workingGuruBab2Suggests.push({ title: '', note: '' });
  renderGuruBab2SuggestInputs();
}

async function saveGuruBab2Suggestions() {
  const kti = state.workspace.activeKti;
  if (!kti) return;
  const cleaned = workingGuruBab2Suggests
    .map((g) => ({ title: String(g.title || '').trim(), note: String(g.note || '').trim() }))
    .filter((g) => g.title);
  try {
    await callBackend('saveBab2Meta', {
      caller_id: state.user.id_user,
      id_kti: kti.id_kti,
      tahap: state.guruViewingStage,
      guru_suggestions: cleaned
    });
    await selectGuruTeam(kti.id_kti, true);
    showToast('Saran daftar sub-bab Bab 2 terkirim ke santri!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function selectGuruSection(code) {
  state.guruSelectedCode = code;
  renderGuruSectionTabs();
}

function renderGuruSectionReader() {
  const code = state.guruSelectedCode;
  const kti = state.workspace.activeKti;
  const meta = getSectionMeta(code, kti ? kti.id_kti : '', state.guruViewingStage);
  const bag = state.workspace.bagians.find((b) => b.tahap === state.guruViewingStage && b.kode_bagian === code);

  document.getElementById('guruReviewSecTitle').textContent = meta.label;
  document.getElementById('guruReviewSecMeta').textContent = bag
    ? `Versi ${bag.versi} • Diperbarui ${new Date(bag.updated_at).toLocaleString('id-ID')}`
    : 'Bagian ini belum ditulis/disimpan oleh santri.';
  document.getElementById('guruReviewSecBadge').innerHTML = renderStatusBadgeHtml(bag ? bag.status : 'draf');

  const reader = document.getElementById('guruReviewHtmlBody');
  reader.innerHTML = bag && bag.konten_html
    ? bag.konten_html
    : '<p class="text-slate-400 italic">(Belum ada konten naskah)</p>';

  // Mentor automated quality insights
  const insightsEl = document.getElementById('guruReviewInsights');
  const insights = [];
  if (code === 'ABSTRAK' && bag) {
    const words = getPlainTextFromHtml(bag.konten_html).split(/\s+/).filter(Boolean).length;
    const kws = String(bag.kata_kunci || '').split(',').map((s) => s.trim()).filter(Boolean);
    insights.push(`Jumlah kata Abstrak: <strong>${words} / 250 kata</strong> ${words > 250 ? '<span class="text-rose-600 font-bold">(Melebihi batas!)</span>' : '(OK)'}`);
    insights.push(`Kata Kunci (${kws.length}): <strong>${escapeHtml(bag.kata_kunci || '-')}</strong>`);
  }
  if (code === 'DAFTAR_PUSTAKA' && bag) {
    const txt = getPlainTextFromHtml(bag.konten_html).toLowerCase();
    const bad = ['wikipedia.org', 'wikipedia', 'blogspot', 'wordpress'].filter((t) => txt.includes(t));
    if (bad.length) insights.push(`<span class="text-rose-600 font-bold">Peringatan Sumber: Ditemukan ${bad.join(', ')}</span>`);
  }
  if (insights.length) {
    insightsEl.classList.remove('hidden');
    insightsEl.innerHTML = insights.map((i) => `<div>• ${i}</div>`).join('');
  } else {
    insightsEl.classList.add('hidden');
  }

  document.getElementById('guruReviewNoteInput').value = '';
  const logs = bag ? state.workspace.logs.filter((l) => l.id_bagian === bag.id_bagian) : [];
  const isSectionAcc = Boolean(bag && bag.status === 'acc');

  // If section is already ACC: hide revision input/buttons & full history, show ONLY last revision note
  document.getElementById('guruSectionDecisionForm').classList.toggle('hidden', isSectionAcc);
  document.getElementById('guruSectionLogsWrap').classList.toggle('hidden', isSectionAcc);
  const lastNoteBox = document.getElementById('guruLastRevisionNoteBox');
  const lastNoteContent = document.getElementById('guruLastRevisionNoteContent');

  if (isSectionAcc) {
    const lastLog = logs.length ? logs[logs.length - 1] : null;
    lastNoteContent.innerHTML = lastLog
      ? `<div class="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">${escapeHtml(lastLog.pengirim)} • v${lastLog.versi} • ${new Date(lastLog.timestamp).toLocaleString('id-ID')}</div><p>${escapeHtml(lastLog.catatan)}</p>`
      : '<p class="italic text-slate-500">Disetujui tanpa catatan revisi tambahan.</p>';
    lastNoteBox.classList.remove('hidden');
  } else {
    lastNoteBox.classList.add('hidden');
    document.getElementById('guruSectionLogs').innerHTML = logs.length ? logs.slice().reverse().map((l) => `
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
        <div class="flex justify-between text-[10px] text-slate-400 mb-0.5"><span>${escapeHtml(l.pengirim)} • v${l.versi}</span><span>${new Date(l.timestamp).toLocaleString('id-ID')}</span></div>
        <div>${escapeHtml(l.catatan)}</div>
      </div>
    `).join('') : '<div class="text-xs text-slate-400 italic">Belum ada riwayat catatan.</div>';
  }
  refreshIcons();
}

async function submitGuruTitleReview(statusJudul) {
  const kti = state.workspace.activeKti;
  if (!kti) return;
  try {
    await callBackend('reviewTitle', {
      caller_id: state.user.id_user,
      id_kti: kti.id_kti,
      status_judul: statusJudul,
      catatan: document.getElementById('guruTitleNote').value.trim(),
      pengirim: state.user.nama_lengkap
    });
    document.getElementById('guruTitleNote').value = '';
    await selectGuruTeam(kti.id_kti);
    showToast(`Status judul diperbarui: ${statusJudul.toUpperCase()}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function submitGuruSectionReview(status) {
  const bag = state.workspace.bagians.find((b) => b.tahap === state.guruViewingStage && b.kode_bagian === state.guruSelectedCode);
  if (!bag) return showToast('Santri belum menyimpan naskah pada bagian ini.', 'warning');
  const catatan = document.getElementById('guruReviewNoteInput').value.trim();
  if (status === 'revisi' && !catatan) {
    return showToast('Mohon tuliskan catatan revisi agar santri mengetahui hal yang perlu diperbaiki.', 'warning');
  }
  try {
    await callBackend('submitReview', {
      caller_id: state.user.id_user,
      id_bagian: bag.id_bagian,
      status,
      catatan,
      pengirim: state.user.nama_lengkap
    });
    await selectGuruTeam(state.guruSelectedKtiId);
    showToast(status === 'acc' ? 'Bagian berhasil di-ACC!' : 'Catatan revisi terkirim ke santri.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== ADMIN WORKSPACE ====================

function initAdminWorkspace() {
  switchAdminTab(state.adminTab || 'monitoring');
}

function switchAdminTab(tab) {
  state.adminTab = tab;
  const map = {
    monitoring: ['adminTabMonitoring', 'adminPanelMonitoring'],
    config: ['adminTabConfig', 'adminPanelConfig'],
    users: ['adminTabUsers', 'adminPanelUsers']
  };
  Object.keys(map).forEach((k) => {
    const [btnId, panelId] = map[k];
    const active = k === tab;
    document.getElementById(btnId).className = 'px-3.5 py-2 rounded-xl text-xs font-heading font-bold ' +
      (active ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800');
    document.getElementById(panelId).classList.toggle('hidden', !active);
  });

  if (tab === 'monitoring') renderAdminMonitoring();
  if (tab === 'config') renderAdminConfig();
  if (tab === 'users') renderAdminUsers();
}

function renderAdminMonitoring() {
  const q = (document.getElementById('adminKtiSearch').value || '').toLowerCase();
  const ktis = (state.workspace.ktis || []).filter((k) =>
    (k.judul || '').toLowerCase().includes(q) || (k.nama_tim || '').toLowerCase().includes(q)
  );
  const tbody = document.getElementById('adminKtiTableBody');
  tbody.innerHTML = ktis.map((k) => `
    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
      <td class="py-3 px-3 font-semibold text-slate-900 dark:text-white">${escapeHtml(k.nama_tim)}</td>
      <td class="py-3 px-3 max-w-xs">${escapeHtml(k.judul)}</td>
      <td class="py-3 px-3">${escapeHtml(k.bidang)}</td>
      <td class="py-3 px-3 uppercase font-mono">${escapeHtml(k.tahap_aktif)}</td>
      <td class="py-3 px-3 font-mono font-bold text-red-600 dark:text-red-400">${k.persentase_progres || 0}%</td>
      <td class="py-3 px-3 text-right">
        <button type="button" onclick="openExportModal('${k.tahap_aktif}', '${k.id_kti}')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 font-heading font-bold hover:bg-red-600 hover:text-white transition-colors">Pratinjau</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="py-6 text-center text-slate-400">Belum ada data KTI.</td></tr>';
}

function renderAdminConfig() {
  const cfg = state.workspace.config || {};
  document.getElementById('cfgNamaSekolah').value = cfg.nama_sekolah || '';
  document.getElementById('cfgKabProv').value = cfg.kabupaten_provinsi || '';
  document.getElementById('cfgTahun').value = cfg.tahun || '2026';
  document.getElementById('cfgDriveFolder').value = cfg.folder_drive_id || '';
  document.getElementById('cfgLogoUrl').value = cfg.logo_sekolah_url || 'assets/logo-dafi.png';
  document.getElementById('cfgLogoPreview').src = cfg.logo_sekolah_url || 'assets/logo-dafi.png';
  document.getElementById('cfgBidangList').value = cfg.bidang_kompetisi || '';
}

async function uploadAdminLogo(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function (ev) {
    try {
      showToast('Mengunggah logo sekolah...', 'info');
      const res = await callBackend('uploadImage', {
        id_kti: 'SCHOOL_LOGO',
        fileName: 'logo_sekolah_' + file.name,
        mimeType: file.type || 'image/png',
        base64Data: ev.target.result
      });
      document.getElementById('cfgLogoUrl').value = res.url;
      document.getElementById('cfgLogoPreview').src = res.url;
      showToast('Logo berhasil diunggah! Klik Simpan Konfigurasi untuk menerapkan.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  reader.readAsDataURL(file);
}

async function saveAdminConfig() {
  try {
    await callBackend('saveConfig', {
      caller_id: state.user.id_user,
      config: {
        nama_sekolah: document.getElementById('cfgNamaSekolah').value.trim(),
        kabupaten_provinsi: document.getElementById('cfgKabProv').value.trim(),
        tahun: document.getElementById('cfgTahun').value.trim(),
        folder_drive_id: document.getElementById('cfgDriveFolder').value.trim(),
        logo_sekolah_url: document.getElementById('cfgLogoUrl').value.trim(),
        bidang_kompetisi: document.getElementById('cfgBidangList').value.trim()
      }
    });
    await refreshWorkspaceFromBackend();
    showToast('Konfigurasi sekolah berhasil disimpan!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderAdminUsers() {
  const users = state.workspace.users || [];
  const gurus = users.filter((u) => u.role === 'guru');
  const selPemb = document.getElementById('usrPembimbing');
  selPemb.innerHTML = '<option value="">-- Pilih Pembimbing (untuk Santri) --</option>' +
    gurus.map((g) => `<option value="${g.id_user}">${escapeHtml(g.nama_lengkap)}</option>`).join('');

  const tbody = document.getElementById('adminUsersTableBody');
  tbody.innerHTML = users.map((u) => {
    const mentor = users.find((g) => g.id_user === u.id_pembimbing);
    return `
      <tr>
        <td class="py-2.5 px-3 font-mono">${escapeHtml(u.email || u.username || '')}</td>
        <td class="py-2.5 px-3 font-semibold">${escapeHtml(u.nama_lengkap)}</td>
        <td class="py-2.5 px-3 uppercase font-bold">${escapeHtml(formatRoleLabel(u.role))}</td>
        <td class="py-2.5 px-3">${escapeHtml(u.kelas || '-')}</td>
        <td class="py-2.5 px-3">${mentor ? escapeHtml(mentor.nama_lengkap) : '-'}</td>
        <td class="py-2.5 px-3 text-right space-x-2">
          <button type="button" onclick="editAdminUser('${u.id_user}')" class="text-sky-600 hover:underline font-bold">Edit</button>
          <button type="button" onclick="deleteAdminUser('${u.id_user}')" class="text-rose-600 hover:underline font-bold">Hapus</button>
        </td>
      </tr>
    `;
  }).join('');
}

function editAdminUser(idUser) {
  const u = (state.workspace.users || []).find((x) => x.id_user === idUser);
  if (!u) return;
  document.getElementById('usrEditId').value = u.id_user;
  document.getElementById('usrEmail').value = u.email || u.username || '';
  document.getElementById('usrNama').value = u.nama_lengkap;
  document.getElementById('usrPassword').value = '';
  document.getElementById('usrRole').value = u.role;
  document.getElementById('usrKelas').value = u.kelas || '';
  document.getElementById('usrPembimbing').value = u.id_pembimbing || '';
}

function clearAdminUserForm() {
  ['usrEditId', 'usrEmail', 'usrNama', 'usrPassword', 'usrKelas'].forEach((id) => {
    document.getElementById(id).value = '';
  });
  document.getElementById('usrRole').value = 'siswa';
  document.getElementById('usrPembimbing').value = '';
}

async function saveAdminUser() {
  const email = document.getElementById('usrEmail').value.trim().toLowerCase();
  const nama_lengkap = document.getElementById('usrNama').value.trim();
  if (!email || !nama_lengkap) return showToast('Email dan Nama Lengkap wajib diisi.', 'warning');
  if (!isValidEmail(email)) return showToast('Format email tidak valid.', 'warning');

  try {
    await callBackend('manageUser', {
      caller_id: state.user.id_user,
      operation: 'upsert',
      user: {
        id_user: document.getElementById('usrEditId').value || undefined,
        email,
        nama_lengkap,
        password: document.getElementById('usrPassword').value,
        role: document.getElementById('usrRole').value,
        kelas: document.getElementById('usrKelas').value.trim(),
        id_pembimbing: document.getElementById('usrPembimbing').value
      }
    });
    clearAdminUserForm();
    await refreshWorkspaceFromBackend();
    showToast('Data pengguna berhasil disimpan.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function deleteAdminUser(idUser) {
  if (idUser === state.user.id_user) return showToast('Tidak dapat menghapus akun yang sedang aktif.', 'warning');
  const target = (state.workspace.users || []).find((x) => x.id_user === idUser);
  showConfirmModal({
    title: 'Hapus Akun Pengguna?',
    messageHtml: `Anda akan menghapus akun <strong>${escapeHtml(target ? target.nama_lengkap : idUser)}</strong>. Tindakan ini tidak dapat dibatalkan.`,
    confirmText: 'Ya, Hapus Pengguna',
    onConfirm: async function () {
      try {
        await callBackend('manageUser', {
          caller_id: state.user.id_user,
          operation: 'delete',
          user: { id_user: idUser }
        });
        await refreshWorkspaceFromBackend();
        showToast('Pengguna dihapus.', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });
}

// ==================== A4 DOCUMENT PREVIEW & EXPORT (PDF / DOCX) ====================

async function openExportModal(tahap, overrideIdKti) {
  let kti = state.workspace.activeKti;
  let bagians = state.workspace.bagians;

  if (overrideIdKti && (!kti || kti.id_kti !== overrideIdKti)) {
    const res = await callBackend('getWorkspace', {
      id_user: state.user.id_user,
      selected_id_kti: overrideIdKti
    });
    state.workspace = res.workspace;
    kti = state.workspace.activeKti;
    bagians = state.workspace.bagians;
  }

  if (!kti) return;
  state.exportTarget = { tahap, idKti: kti.id_kti };
  document.getElementById('exportModalTitle').textContent =
    (tahap === 'laporan' ? 'Pratinjau Dokumen Utuh: LAPORAN PENELITIAN' : 'Pratinjau Dokumen Utuh: PROPOSAL PENELITIAN');

  const cfg = state.workspace.config || {};
  const stageBags = bagians.filter((b) => b.tahap === tahap);
  const getBag = (code) => stageBags.find((b) => b.kode_bagian === code);
  const getHtml = (code) => {
    const b = getBag(code);
    return (b && b.konten_html) ? b.konten_html : '<p><em>(Belum diisi)</em></p>';
  };

  const jenisDok = tahap === 'laporan' ? 'LAPORAN PENELITIAN' : 'PROPOSAL PENELITIAN';
  const logoSrc = cfg.logo_sekolah_url || 'assets/logo-dafi.png';

  let sheetsHtml = `
    <div class="a4-sheet a4-cover">
      <div style="width:100%;">
        <img src="${escapeHtml(logoSrc)}" alt="Logo Sekolah" class="a4-cover-logo" />
        <div class="a4-cover-jenis">${jenisDok}</div>
        <div class="a4-cover-judul">${escapeHtml(kti.judul)}</div>
      </div>
      <div class="a4-cover-tim">${escapeHtml(kti.nama_tim)}</div>
      <div class="a4-cover-meta">
        <div>${escapeHtml(kti.bidang)}</div>
        <div>${escapeHtml(cfg.nama_sekolah || 'SMPIT Darul Fikri Sidoarjo')}</div>
        <div>${escapeHtml(cfg.kabupaten_provinsi || 'Kabupaten Sidoarjo, Jawa Timur')}</div>
        <div>${escapeHtml(cfg.tahun || '2026')}</div>
      </div>
    </div>
  `;

  if (tahap === 'laporan') {
    const abs = getBag('ABSTRAK');
    sheetsHtml += `
      <div class="a4-sheet">
        <h1 class="a4-bab-title">ABSTRAK</h1>
        <div class="a4-body">${getHtml('ABSTRAK')}</div>
        <p class="a4-body" style="margin-top:10pt;"><strong>Kata Kunci:</strong> ${escapeHtml((abs && abs.kata_kunci) || '-')}</p>
      </div>
    `;
  }

  const bab2Meta = getBab2Meta(kti.id_kti, tahap, bagians);
  const bab2InnerHtml = bab2Meta.subchapters.map((sub) =>
    `<h2 class="a4-subbab-title">${escapeHtml(sub.title)}</h2><div class="a4-body">${getHtml(sub.code)}</div>`
  ).join('');

  sheetsHtml += `
    <div class="a4-sheet">
      <h1 class="a4-bab-title">BAB 1. PENDAHULUAN</h1>
      <h2 class="a4-subbab-title">1.1 Latar Belakang</h2><div class="a4-body">${getHtml('BAB1_1')}</div>
      <h2 class="a4-subbab-title">1.2 Rumusan Masalah</h2><div class="a4-body">${getHtml('BAB1_2')}</div>
      <h2 class="a4-subbab-title">1.3 Tujuan Penelitian</h2><div class="a4-body">${getHtml('BAB1_3')}</div>
      <h2 class="a4-subbab-title">1.4 Hipotesis</h2><div class="a4-body">${getHtml('BAB1_4')}</div>
      <h2 class="a4-subbab-title">1.5 Urgensi dan Manfaat Penelitian</h2><div class="a4-body">${getHtml('BAB1_5')}</div>
    </div>
    <div class="a4-sheet">
      <h1 class="a4-bab-title">BAB 2. TINJAUAN PUSTAKA</h1>
      ${bab2InnerHtml}
    </div>
    <div class="a4-sheet">
      <h1 class="a4-bab-title">BAB 3. METODOLOGI PENELITIAN</h1>
      <h2 class="a4-subbab-title">3.1 Rancangan / Desain Penelitian</h2><div class="a4-body">${getHtml('BAB3_1')}</div>
      <h2 class="a4-subbab-title">3.2 Waktu, Tempat, Alat, dan Bahan</h2><div class="a4-body">${getHtml('BAB3_2')}</div>
      <h2 class="a4-subbab-title">3.3 Prosedur Penelitian &amp; Pengumpulan Data</h2><div class="a4-body">${getHtml('BAB3_3')}</div>
      <h2 class="a4-subbab-title">3.4 Teknik Analisis Data</h2><div class="a4-body">${getHtml('BAB3_4')}</div>
      <h2 class="a4-subbab-title">3.5 RAB, Jadwal Penelitian &amp; Ethical Clearance</h2><div class="a4-body">${getHtml('BAB3_5')}</div>
    </div>
  `;

  if (tahap === 'laporan') {
    sheetsHtml += `
      <div class="a4-sheet"><h1 class="a4-bab-title">BAB 4. HASIL DAN PEMBAHASAN</h1><div class="a4-body">${getHtml('BAB4')}</div></div>
      <div class="a4-sheet"><h1 class="a4-bab-title">BAB 5. KESIMPULAN DAN SARAN</h1><div class="a4-body">${getHtml('BAB5')}</div></div>
      <div class="a4-sheet"><h1 class="a4-bab-title">UCAPAN TERIMA KASIH</h1><div class="a4-body">${getHtml('UCAPAN_TERIMA_KASIH')}</div></div>
    `;
  }

  sheetsHtml += `
    <div class="a4-sheet"><h1 class="a4-bab-title">DAFTAR PUSTAKA</h1><div class="a4-body">${getHtml('DAFTAR_PUSTAKA')}</div></div>
  `;

  if (tahap === 'laporan') {
    sheetsHtml += `<div class="a4-sheet"><h1 class="a4-bab-title">LAMPIRAN</h1><div class="a4-body">${getHtml('LAMPIRAN')}</div></div>`;
  }

  document.getElementById('printAreaContainer').innerHTML = sheetsHtml;
  document.getElementById('modalExport').classList.remove('hidden');
  refreshIcons();
}

async function resolveLogoDataUriForExport() {
  const img = document.getElementById('navSchoolLogo');
  if (!img || !img.complete || !img.naturalWidth) return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (e) {
    return '';
  }
}

async function executeDocumentExport(format) {
  const { tahap, idKti } = state.exportTarget;
  if (!idKti) return;

  showToast(`Menyusun dokumen ${format.toUpperCase()} di server GAS...`, 'info');
  try {
    const logoDataUri = await resolveLogoDataUriForExport();
    const res = await callBackend('exportDocument', {
      id_kti: idKti,
      tahap,
      format,
      logoDataUri
    });
    const link = document.createElement('a');
    link.href = `data:${res.mimeType};base64,${res.base64}`;
    link.download = res.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`${res.fileName} berhasil diunduh!`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
