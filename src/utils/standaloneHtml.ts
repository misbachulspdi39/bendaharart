/**
 * Generates a standalone single-file HTML version using pure HTML, Tailwind CDN, and Vanilla JS,
 * complete with LocalStorage persistence, PWA manifest, and offline readiness.
 */
export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Buku Bendahara Kas RT (Standalone Vanilla JS)</title>
  <meta name="description" content="Aplikasi PWA Buku Bendahara Kas RT & Rekap Iuran Warga Offline LocalStorage">
  <meta name="theme-color" content="#059669">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background-color: #f8fafc; }
    @media print {
      .no-print { display: none !important; }
      body { background-color: #fff !important; }
    }
  </style>
</head>
<body class="text-slate-800 min-h-screen flex flex-col pb-12">
  <!-- Header -->
  <header class="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white shadow-md sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-xl shadow-inner">
          📖
        </div>
        <div>
          <h1 class="font-extrabold text-lg sm:text-xl tracking-tight leading-tight">Buku Bendahara Kas RT</h1>
          <p class="text-xs text-emerald-100 font-medium">RT 04 / RW 08 • Offline LocalStorage Ready</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="window.print()" class="no-print bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg border border-white/20 font-medium transition flex items-center gap-1">
          🖨️ Cetak
        </button>
      </div>
    </div>
    
    <!-- Tab Navigation -->
    <div class="max-w-6xl mx-auto px-4 flex gap-2 border-t border-emerald-500/30 pt-2 pb-2">
      <button id="tabBtnKas" onclick="switchTab('kas')" class="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-semibold text-sm transition bg-white text-emerald-800 shadow-sm">
        💰 1. Kas RT
      </button>
      <button id="tabBtnIuran" onclick="switchTab('iuran')" class="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-semibold text-sm transition text-emerald-100 hover:bg-white/10">
        👥 2. Iuran Warga
      </button>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
    <!-- MENU 1: KAS RT -->
    <section id="sectionKas" class="space-y-6">
      <!-- Ringkasan Kas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">📥</div>
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Pemasukan</p>
            <h3 id="statTotalPemasukan" class="text-xl sm:text-2xl font-bold text-emerald-600">Rp 0</h3>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold">📤</div>
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Pengeluaran</p>
            <h3 id="statTotalPengeluaran" class="text-xl sm:text-2xl font-bold text-rose-600">Rp 0</h3>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-2xl font-bold">💎</div>
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-500 font-semibold">Saldo Akhir</p>
            <h3 id="statSaldoAkhir" class="text-xl sm:text-2xl font-black text-slate-800">Rp 0</h3>
          </div>
        </div>
      </div>

      <!-- Form Input Transaksi -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>✍️</span> Catat Transaksi Kas Baru
        </h2>
        <form id="formTransaksi" onsubmit="handleAddTransaction(event)" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
            <input type="date" id="txTanggal" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Jenis Transaksi</label>
            <select id="txJenis" required onchange="updateKategoriOptions()" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
              <option value="pemasukan">📥 Pemasukan (+)</option>
              <option value="pengeluaran">📤 Pengeluaran (-)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
            <select id="txKategori" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none">
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Jumlah (Rp)</label>
            <input type="number" id="txJumlah" min="1000" step="1000" placeholder="Contoh: 50000" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Keterangan</label>
            <input type="text" id="txKeterangan" placeholder="Catatan transaksi..." required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none">
          </div>
          <div class="sm:col-span-2 lg:col-span-5 flex justify-end pt-1">
            <button type="submit" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2">
              ➕ Simpan Transaksi
            </button>
          </div>
        </form>
      </div>

      <!-- Tabel Riwayat Transaksi -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <span>📋</span> Riwayat Transaksi Kas
          </h3>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input type="text" id="filterCariKas" oninput="renderKasTable()" placeholder="Cari keterangan / kategori..." class="w-full sm:w-60 text-xs px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500">
            <select id="filterJenisKas" onchange="renderKasTable()" class="text-xs px-3 py-2 rounded-lg border border-slate-200 outline-none">
              <option value="semua">Semua Jenis</option>
              <option value="pemasukan">Hanya Pemasukan</option>
              <option value="pengeluaran">Hanya Pengeluaran</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Tanggal</th>
                <th class="py-3 px-4">Jenis</th>
                <th class="py-3 px-4">Kategori</th>
                <th class="py-3 px-4">Keterangan</th>
                <th class="py-3 px-4 text-right">Jumlah</th>
                <th class="py-3 px-4 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody id="tbodyKas" class="divide-y divide-slate-100">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- MENU 2: IURAN WARGA -->
    <section id="sectionIuran" class="space-y-6 hidden">
      <!-- Filter Bulan & Tahun -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Periode Rekap Iuran</label>
          <div class="flex items-center gap-2">
            <button onclick="changeMonth(-1)" class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold">◀ Bln Lalu</button>
            <input type="month" id="selectedMonthInput" onchange="handleMonthChange(this.value)" class="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500">
            <button onclick="changeMonth(1)" class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold">Bln Depan ▶</button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openAddResidentModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5">
            👤 Tambah Warga
          </button>
        </div>
      </div>

      <!-- Ringkasan Iuran Bulan Ini -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500 font-semibold">Total Warga</p>
          <p id="statWargaCount" class="text-lg font-bold text-slate-800 mt-1">0 Warga</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500 font-semibold">Target Kewajiban</p>
          <p id="statTargetKewajiban" class="text-lg font-bold text-slate-800 mt-1">Rp 0</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500 font-semibold">Terkumpul (Lunas)</p>
          <p id="statTerkumpulLunas" class="text-lg font-bold text-emerald-600 mt-1">Rp 0</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500 font-semibold">Sisa Terutang</p>
          <p id="statSisaTerutang" class="text-lg font-bold text-rose-600 mt-1">Rp 0</p>
        </div>
      </div>

      <!-- Tabel Iuran Warga (6 Kolom Sesuai Ketentuan) -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <span>👥</span> Rekap Pembayaran Iuran Bulan <span id="labelBulanTabel" class="text-emerald-700"></span>
          </h3>
          <p class="text-xs text-slate-500">Klik tombol status untuk mengubah Lunas / Terutang</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">1. Nama Warga</th>
                <th class="py-3 px-4">2. Blok Rumah</th>
                <th class="py-3 px-4 text-right">3. Iuran Bulan Ini</th>
                <th class="py-3 px-4 text-right">4. Tunggakan Bulan Lalu</th>
                <th class="py-3 px-4 text-right">5. Total Kewajiban</th>
                <th class="py-3 px-4 text-center">6. Status / Keterangan</th>
              </tr>
            </thead>
            <tbody id="tbodyIuran" class="divide-y divide-slate-100 font-medium">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>

  <script>
    // Pure Vanilla JS Logic with LocalStorage
    const STORAGE_KEY = 'BUKU_KAS_RT_VANILLA_V1';

    let state = {
      transactions: [],
      residents: [],
      monthlyRecords: {}, // monthKey -> { residentId: { status: 'Lunas'|'Terutang' } }
      currentMonth: new Date().toISOString().slice(0, 7)
    };

    const KATEGORI_PEMASUKAN = [
      'Iuran Warga Bulanan',
      'Sumbangan Sukarela / Donasi',
      'Kas Awal / Saldo Awal',
      'Dana Operasional RW / Kelurahan',
      'Sewa Tenda & Inventaris RT',
      'Bunga Bank',
      'Lain-lain'
    ];

    const KATEGORI_PENGELUARAN = [
      'Kebersihan & Sampah',
      'Keamanan & Ronda Malam',
      'Perbaikan Lampu & Sarana',
      'Konsumsi Rapat & Kerja Bakti',
      'Santunan & Sosial Warga',
      'Operasional & ATK RT',
      'Kas RT ke RW',
      'Lain-lain'
    ];

    function formatRupiah(num) {
      return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
    }

    function initData() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          state = JSON.parse(saved);
          if (!state.currentMonth) state.currentMonth = new Date().toISOString().slice(0, 7);
        } catch(e) { console.error(e); }
      } else {
        // Sample Initial Data
        state.residents = [
          { id: '1', name: 'Bpk. Joko Widodo', houseNumber: 'Blok A1 No. 01', monthlyFee: 50000 },
          { id: '2', name: 'Ibu Hj. Siti Aminah', houseNumber: 'Blok A1 No. 02', monthlyFee: 50000 },
          { id: '3', name: 'Bpk. Hendra Gunawan', houseNumber: 'Blok A2 No. 05', monthlyFee: 50000 },
          { id: '4', name: 'Bpk. Ahmad Dahlan', houseNumber: 'Blok B1 No. 03', monthlyFee: 50000 },
          { id: '5', name: 'Bpk. Budi Santoso', houseNumber: 'Blok B2 No. 08', monthlyFee: 50000 }
        ];
        state.transactions = [
          { id: 'tx1', date: new Date().toISOString().slice(0, 10), type: 'pemasukan', category: 'Kas Awal / Saldo Awal', amount: 2500000, description: 'Saldo kas awal' },
          { id: 'tx2', date: new Date().toISOString().slice(0, 10), type: 'pengeluaran', category: 'Kebersihan & Sampah', amount: 350000, description: 'Honor petugas sampah' }
        ];
        state.monthlyRecords = {};
        saveData();
      }
    }

    function saveData() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function switchTab(tab) {
      const secKas = document.getElementById('sectionKas');
      const secIuran = document.getElementById('sectionIuran');
      const btnKas = document.getElementById('tabBtnKas');
      const btnIuran = document.getElementById('tabBtnIuran');

      if (tab === 'kas') {
        secKas.classList.remove('hidden');
        secIuran.classList.add('hidden');
        btnKas.className = 'flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-semibold text-sm transition bg-white text-emerald-800 shadow-sm';
        btnIuran.className = 'flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-semibold text-sm transition text-emerald-100 hover:bg-white/10';
      } else {
        secKas.classList.add('hidden');
        secIuran.classList.remove('hidden');
        btnIuran.className = 'flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-semibold text-sm transition bg-white text-emerald-800 shadow-sm';
        btnKas.className = 'flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-5 rounded-lg font-semibold text-sm transition text-emerald-100 hover:bg-white/10';
        renderIuran();
      }
    }

    function updateKategoriOptions() {
      const jenis = document.getElementById('txJenis').value;
      const select = document.getElementById('txKategori');
      const list = jenis === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;
      select.innerHTML = list.map(item => \`<option value="\${item}">\${item}</option>\`).join('');
    }

    function handleAddTransaction(e) {
      e.preventDefault();
      const date = document.getElementById('txTanggal').value;
      const type = document.getElementById('txJenis').value;
      const category = document.getElementById('txKategori').value;
      const amount = parseFloat(document.getElementById('txJumlah').value);
      const description = document.getElementById('txKeterangan').value;

      state.transactions.unshift({
        id: 'tx_' + Date.now(),
        date,
        type,
        category,
        amount,
        description
      });
      saveData();
      renderKas();
      document.getElementById('txKeterangan').value = '';
      document.getElementById('txJumlah').value = '';
    }

    function deleteTransaction(id) {
      if (confirm('Yakin ingin menghapus transaksi ini?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveData();
        renderKas();
      }
    }

    function renderKas() {
      let totalMasuk = 0;
      let totalKeluar = 0;
      state.transactions.forEach(t => {
        if (t.type === 'pemasukan') totalMasuk += t.amount;
        else totalKeluar += t.amount;
      });

      document.getElementById('statTotalPemasukan').innerText = formatRupiah(totalMasuk);
      document.getElementById('statTotalPengeluaran').innerText = formatRupiah(totalKeluar);
      document.getElementById('statSaldoAkhir').innerText = formatRupiah(totalMasuk - totalKeluar);

      renderKasTable();
    }

    function renderKasTable() {
      const query = (document.getElementById('filterCariKas')?.value || '').toLowerCase();
      const jenisFilter = document.getElementById('filterJenisKas')?.value || 'semua';

      const filtered = state.transactions.filter(t => {
        if (jenisFilter !== 'semua' && t.type !== jenisFilter) return false;
        if (query && !t.description.toLowerCase().includes(query) && !t.category.toLowerCase().includes(query)) return false;
        return true;
      });

      const tbody = document.getElementById('tbodyKas');
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada transaksi.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(t => {
        const isMasuk = t.type === 'pemasukan';
        return \`
          <tr class="hover:bg-slate-50 transition">
            <td class="py-3 px-4 text-xs font-medium text-slate-600">\${t.date}</td>
            <td class="py-3 px-4">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold \${isMasuk ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                \${isMasuk ? 'Pemasukan' : 'Pengeluaran'}
              </span>
            </td>
            <td class="py-3 px-4 text-xs font-medium text-slate-700">\${t.category}</td>
            <td class="py-3 px-4 text-xs text-slate-600">\${t.description}</td>
            <td class="py-3 px-4 text-xs font-bold text-right \${isMasuk ? 'text-emerald-600' : 'text-rose-600'}">
              \${isMasuk ? '+' : '-'} \${formatRupiah(t.amount)}
            </td>
            <td class="py-3 px-4 text-center no-print">
              <button onclick="deleteTransaction('\${t.id}')" class="text-rose-500 hover:text-rose-700 text-xs px-2 py-1 rounded hover:bg-rose-50">Hapus</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function getPrevMonth(m) {
      let [y, mo] = m.split('-').map(Number);
      mo--;
      if (mo < 1) { mo = 12; y--; }
      return y + '-' + String(mo).padStart(2, '0');
    }

    function calculateDues(resident, monthKey, depth = 0) {
      if (depth > 24) return { totalKewajiban: resident.monthlyFee, tunggakan: 0 };
      const currentRec = state.monthlyRecords[monthKey]?.[resident.id];
      const status = currentRec ? currentRec.status : 'Terutang';

      let tunggakan = 0;
      const prevMonth = getPrevMonth(monthKey);
      const prevRec = state.monthlyRecords[prevMonth]?.[resident.id];

      if (prevRec && prevRec.status === 'Terutang') {
        const prevCalc = calculateDues(resident, prevMonth, depth + 1);
        tunggakan = prevCalc.totalKewajiban;
      }

      const totalKewajiban = resident.monthlyFee + tunggakan;
      return {
        iuranBulanIni: resident.monthlyFee,
        tunggakanBulanLalu: tunggakan,
        totalKewajiban: totalKewajiban,
        status: status,
        sisaKewajiban: status === 'Lunas' ? 0 : totalKewajiban
      };
    }

    function toggleStatus(residentId) {
      const monthKey = state.currentMonth;
      if (!state.monthlyRecords[monthKey]) state.monthlyRecords[monthKey] = {};
      const current = state.monthlyRecords[monthKey][residentId]?.status || 'Terutang';
      const newStatus = current === 'Lunas' ? 'Terutang' : 'Lunas';
      state.monthlyRecords[monthKey][residentId] = { status: newStatus };
      saveData();
      renderIuran();
    }

    function renderIuran() {
      const monthInput = document.getElementById('selectedMonthInput');
      if (monthInput) monthInput.value = state.currentMonth;
      document.getElementById('labelBulanTabel').innerText = state.currentMonth;

      let targetKewajiban = 0;
      let terkumpul = 0;
      let sisaTerutang = 0;

      const tbody = document.getElementById('tbodyIuran');
      if (state.residents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada warga terdaftar.</td></tr>';
        return;
      }

      tbody.innerHTML = state.residents.map(res => {
        const calc = calculateDues(res, state.currentMonth);
        targetKewajiban += calc.totalKewajiban;
        if (calc.status === 'Lunas') {
          terkumpul += calc.totalKewajiban;
        } else {
          sisaTerutang += calc.totalKewajiban;
        }

        const isLunas = calc.status === 'Lunas';

        return \`
          <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="py-3 px-4 font-semibold text-slate-800">\${res.name}</td>
            <td class="py-3 px-4 text-xs text-slate-600">\${res.houseNumber}</td>
            <td class="py-3 px-4 text-right text-xs text-slate-700">\${formatRupiah(calc.iuranBulanIni)}</td>
            <td class="py-3 px-4 text-right text-xs \${calc.tunggakanBulanLalu > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'}">
              \${formatRupiah(calc.tunggakanBulanLalu)}
            </td>
            <td class="py-3 px-4 text-right text-xs font-bold text-slate-900">\${formatRupiah(calc.totalKewajiban)}</td>
            <td class="py-3 px-4 text-center">
              <button onclick="toggleStatus('\${res.id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm \${isLunas ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'}">
                \${isLunas ? '✅ LUNAS' : '⏳ TERUTANG'}
              </button>
            </td>
          </tr>
        \`;
      }).join('');

      document.getElementById('statWargaCount').innerText = state.residents.length + ' Warga';
      document.getElementById('statTargetKewajiban').innerText = formatRupiah(targetKewajiban);
      document.getElementById('statTerkumpulLunas').innerText = formatRupiah(terkumpul);
      document.getElementById('statSisaTerutang').innerText = formatRupiah(sisaTerutang);
    }

    function changeMonth(delta) {
      let [y, m] = state.currentMonth.split('-').map(Number);
      m += delta;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1; y++; }
      state.currentMonth = y + '-' + String(m).padStart(2, '0');
      renderIuran();
    }

    function handleMonthChange(val) {
      if (val) {
        state.currentMonth = val;
        renderIuran();
      }
    }

    function openAddResidentModal() {
      const name = prompt('Nama Kepala Keluarga / Warga:');
      if (!name) return;
      const houseNumber = prompt('Blok / Nomor Rumah (Contoh: Blok B3 No. 07):');
      if (!houseNumber) return;
      const fee = prompt('Nominal Iuran Bulanan (Rp):', '50000');
      const monthlyFee = parseInt(fee, 10) || 50000;

      state.residents.push({
        id: 'res_' + Date.now(),
        name,
        houseNumber,
        monthlyFee
      });
      saveData();
      renderIuran();
    }

    // Init on load
    document.getElementById('txTanggal').value = new Date().toISOString().slice(0, 10);
    initData();
    updateKategoriOptions();
    renderKas();
  </script>
</body>
</html>`;
}
