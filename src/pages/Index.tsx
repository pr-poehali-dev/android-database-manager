import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/90d46e9e-47f1-43d8-a601-c29c489e8aa1";

interface DSERecord {
  id: number;
  number: string;
  designation: string;
  name: string;
  grade: number | null;
  hours: number | null;
  work_date: string | null;
  order_num: string | null;
}

const EMPTY_FORM = {
  number: "",
  designation: "",
  name: "",
  grade: "",
  hours: "",
  work_date: "",
  order_num: "",
};

const GRADE_COLOR: Record<number, string> = {
  1: "bg-slate-500/15 text-slate-400",
  2: "bg-blue-500/15 text-blue-400",
  3: "bg-cyan-500/15 text-cyan-400",
  4: "bg-green-500/15 text-green-400",
  5: "bg-amber-500/15 text-amber-400",
  6: "bg-orange-500/15 text-orange-400",
  7: "bg-red-500/15 text-red-400",
  8: "bg-purple-500/15 text-purple-400",
};

type SortKey = keyof DSERecord;
type SortDir = "asc" | "desc";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function Index() {
  const [records, setRecords] = useState<DSERecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  async function loadRecords(s = search, df = dateFrom, dt = dateTo) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (s) params.set("search", s);
      if (df) params.set("date_from", df);
      if (dt) params.set("date_to", dt);
      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();
      setRecords(data);
    } catch {
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRecords(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return [...records].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [records, sortKey, sortDir]);

  const detailRecord = records.find((r) => r.id === detailId) ?? null;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  async function handleAdd() {
    if (!form.number.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: form.number.trim(),
          designation: form.designation.trim() || null,
          name: form.name.trim(),
          grade: form.grade ? Number(form.grade) : null,
          hours: form.hours ? Number(form.hours) : null,
          work_date: form.work_date || null,
          order_num: form.order_num.trim() || null,
        }),
      });
      const newRecord = await res.json();
      setRecords((prev) => [newRecord, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setError("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
      if (detailId === id) setDetailId(null);
    } catch {
      setError("Ошибка при удалении");
    } finally {
      setDeleting(false);
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <Icon name="ChevronsUpDown" size={12} className="text-muted-foreground/40" />;
    return sortDir === "asc"
      ? <Icon name="ChevronUp" size={12} className="text-primary" />
      : <Icon name="ChevronDown" size={12} className="text-primary" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Golos Text', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">ДСЕ — Нормирование</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{records.length} записей</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-3.5 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              <Icon name="Plus" size={15} />
              Добавить
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Поиск по обозначению или наименованию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadRecords(search, dateFrom, dateTo)}
                className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={13} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1 bg-muted border border-border rounded-xl px-3 py-2">
                <Icon name="Calendar" size={14} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent text-sm text-foreground focus:outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 bg-muted border border-border rounded-xl px-3 py-2">
                <Icon name="Calendar" size={14} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent text-sm text-foreground focus:outline-none w-full"
                />
              </div>
              <button
                onClick={() => loadRecords(search, dateFrom, dateTo)}
                className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90 transition-all flex-shrink-0"
              >
                <Icon name="Search" size={15} />
              </button>
              {(search || dateFrom || dateTo) && (
                <button
                  onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); loadRecords("", "", ""); }}
                  className="bg-muted border border-border text-muted-foreground rounded-xl px-3 py-2 text-sm hover:text-foreground transition-all flex-shrink-0"
                >
                  <Icon name="X" size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
          <Icon name="AlertCircle" size={15} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><Icon name="X" size={13} /></button>
        </div>
      )}

      {/* Table */}
      <main className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Icon name="TableProperties" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Записи не найдены</p>
          </div>
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                {([
                  { key: "number",      label: "№",              align: "text-center" },
                  { key: "designation", label: "Обозначение ДСЕ", align: "text-left" },
                  { key: "name",        label: "Наименование ДСЕ", align: "text-left" },
                  { key: "grade",       label: "Разряд",          align: "text-center" },
                  { key: "hours",       label: "Норма, ч",        align: "text-right" },
                  { key: "work_date",   label: "Дата",            align: "text-center" },
                  { key: "order_num",   label: "Наряд",           align: "text-left" },
                ] as { key: SortKey; label: string; align: string }[]).map(({ key, label, align }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={`px-3 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors ${align}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      <SortIcon col={key} />
                    </span>
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => setDetailId(r.id)}
                  className="border-b border-border/50 cursor-pointer hover:bg-card transition-colors animate-fade-in group"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <td className="px-3 py-3 text-center text-muted-foreground font-mono text-xs">{r.number}</td>
                  <td className="px-3 py-3 font-medium text-xs font-mono whitespace-nowrap text-foreground">
                    {r.designation || <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-3 py-3 text-foreground">{r.name}</td>
                  <td className="px-3 py-3 text-center">
                    {r.grade != null ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${GRADE_COLOR[r.grade] ?? "bg-muted text-muted-foreground"}`}>
                        {r.grade}
                      </span>
                    ) : <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {r.hours != null ? Number(r.hours).toFixed(2) : <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(r.work_date)}
                  </td>
                  <td className="px-3 py-3 text-foreground">
                    {r.order_num || <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-2 py-3 w-8">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDetailId(null)}>
          <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1">№{detailRecord.number}</span>
                {detailRecord.grade != null && (
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${GRADE_COLOR[detailRecord.grade] ?? "bg-muted text-muted-foreground"}`}>
                    {detailRecord.grade}
                  </span>
                )}
              </div>
              <button onClick={() => setDetailId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
            <h2 className="text-base font-bold text-foreground mb-1">{detailRecord.name}</h2>
            {detailRecord.designation && <p className="text-sm font-mono text-muted-foreground mb-3">{detailRecord.designation}</p>}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Норма часы</p>
                <p className="text-lg font-bold text-foreground">{detailRecord.hours != null ? `${Number(detailRecord.hours).toFixed(2)} ч` : "—"}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Дата</p>
                <p className="text-base font-bold text-foreground">{formatDate(detailRecord.work_date)}</p>
              </div>
              {detailRecord.order_num && (
                <div className="bg-muted rounded-xl p-3 col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Наряд</p>
                  <p className="text-base font-bold text-foreground">{detailRecord.order_num}</p>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-border">
              <button
                onClick={() => setDeleteId(detailRecord.id)}
                className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive rounded-xl py-2.5 text-sm font-semibold hover:bg-destructive/20 transition-all"
              >
                <Icon name="Trash2" size={15} />
                Удалить запись
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full animate-scale-in">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="Trash2" size={22} className="text-destructive" />
            </div>
            <h3 className="text-center font-bold text-foreground mb-1">Удалить запись?</h3>
            <p className="text-center text-sm text-muted-foreground mb-5">Это действие нельзя отменить</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-secondary transition-all">
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 bg-destructive text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {deleting ? "..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">Новая запись ДСЕ</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Номер *</label>
                  <input type="text" placeholder="001" value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Обозначение ДСЕ</label>
                  <input type="text" placeholder="ДСЕ-001.00.00" value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Наименование ДСЕ *</label>
                <input type="text" placeholder="Например: Корпус редуктора" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Разряд (1–8)</label>
                  <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                    <option value="">— не указан</option>
                    {[1,2,3,4,5,6,7,8].map((g) => <option key={g} value={g}>{g} разряд</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Норма часы</label>
                  <input type="number" min="0" step="0.25" placeholder="0.00" value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Дата</label>
                  <input type="date" value={form.work_date}
                    onChange={(e) => setForm({ ...form, work_date: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Наряд</label>
                  <input type="text" placeholder="№ наряда" value={form.order_num}
                    onChange={(e) => setForm({ ...form, order_num: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-secondary transition-all">
                Отмена
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.number.trim() || !form.name.trim() || saving}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {saving ? "Сохранение..." : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
