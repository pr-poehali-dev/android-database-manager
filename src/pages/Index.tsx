import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

interface DSERecord {
  id: number;
  number: string;
  designation: string;
  name: string;
  grade: number | "";
  hours: number | "";
}

const INITIAL_RECORDS: DSERecord[] = [
  { id: 1, number: "001", designation: "ДСЕ-001.00.00", name: "Корпус редуктора", grade: 5, hours: 12.5 },
  { id: 2, number: "002", designation: "ДСЕ-002.00.00", name: "Вал приводной", grade: 4, hours: 8.0 },
  { id: 3, number: "003", designation: "ДСЕ-003.00.00", name: "Шестерня ведущая", grade: 6, hours: 15.75 },
  { id: 4, number: "004", designation: "ДСЕ-004.00.00", name: "Крышка подшипника", grade: 3, hours: 4.5 },
  { id: 5, number: "005", designation: "ДСЕ-005.00.00", name: "Фланец соединительный", grade: 5, hours: 6.0 },
  { id: 6, number: "006", designation: "ДСЕ-006.00.00", name: "Кронштейн опорный", grade: 4, hours: 9.25 },
  { id: 7, number: "007", designation: "ДСЕ-007.00.00", name: "Втулка направляющая", grade: 3, hours: 3.0 },
  { id: 8, number: "008", designation: "ДСЕ-008.00.00", name: "Плита основания", grade: 6, hours: 22.0 },
];

const EMPTY_FORM: Omit<DSERecord, "id"> = {
  number: "",
  designation: "",
  name: "",
  grade: "",
  hours: "",
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

export default function Index() {
  const [records, setRecords] = useState<DSERecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<DSERecord, "id">>(EMPTY_FORM);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [gradeFilter, setGradeFilter] = useState<number | "">("");

  const filtered = useMemo(() => {
    let result = records.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.number.toLowerCase().includes(q) ||
        r.designation.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q);
      const matchGrade = gradeFilter === "" || r.grade === gradeFilter;
      return matchSearch && matchGrade;
    });
    result = [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === "" || av === undefined) return 1;
      if (bv === "" || bv === undefined) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [records, search, gradeFilter, sortKey, sortDir]);

  const detailRecord = records.find((r) => r.id === detailId) ?? null;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function handleAdd() {
    if (!form.number.trim() || !form.name.trim()) return;
    const newRecord: DSERecord = {
      id: Date.now(),
      number: form.number.trim(),
      designation: form.designation.trim(),
      name: form.name.trim(),
      grade: form.grade === "" ? "" : Number(form.grade),
      hours: form.hours === "" ? "" : Number(form.hours),
    };
    setRecords((prev) => [...prev, newRecord]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleDelete(id: number) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeleteId(null);
    if (detailId === id) setDetailId(null);
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

          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Поиск по обозначению, наименованию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={13} />
                </button>
              )}
            </div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value === "" ? "" : Number(e.target.value))}
              className="bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer min-w-[110px]"
            >
              <option value="">Все разряды</option>
              {[1,2,3,4,5,6,7,8].map((g) => (
                <option key={g} value={g}>{g} разряд</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Table */}
      <main className="flex-1 overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in px-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Icon name="TableProperties" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Записи не найдены</p>
            {(search || gradeFilter !== "") && (
              <button onClick={() => { setSearch(""); setGradeFilter(""); }} className="mt-3 text-primary text-sm hover:underline">
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead className="sticky top-[105px] z-20 bg-background border-b border-border">
              <tr>
                {(["number", "designation", "name", "grade", "hours"] as SortKey[]).map((col, i) => {
                  const labels: Record<string, string> = {
                    number: "№",
                    designation: "Обозначение ДСЕ",
                    name: "Наименование ДСЕ",
                    grade: "Разряд",
                    hours: "Норма, ч",
                  };
                  const aligns = ["text-center", "text-left", "text-left", "text-center", "text-right"];
                  return (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      className={`px-3 py-2.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors ${aligns[i]}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {labels[col]}
                        <SortIcon col={col} />
                      </span>
                    </th>
                  );
                })}
                <th className="px-3 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => setDetailId(r.id)}
                  className="border-b border-border/50 cursor-pointer hover:bg-card transition-colors animate-fade-in group"
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <td className="px-3 py-3 text-center text-muted-foreground font-mono text-xs w-14">
                    {r.number}
                  </td>
                  <td className="px-3 py-3 text-foreground font-medium text-xs font-mono whitespace-nowrap">
                    {r.designation || <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-3 py-3 text-foreground text-sm">
                    {r.name}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {r.grade !== "" ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${GRADE_COLOR[r.grade as number] ?? "bg-muted text-muted-foreground"}`}>
                        {r.grade}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-sm text-foreground">
                    {r.hours !== "" ? (
                      <span>{Number(r.hours).toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 w-10">
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
            {/* Footer totals */}
            <tfoot className="border-t-2 border-border">
              <tr className="bg-muted/30">
                <td className="px-3 py-2.5 text-xs text-muted-foreground text-center" colSpan={2}>
                  Итого: {filtered.length} поз.
                </td>
                <td className="px-3 py-2.5" />
                <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                  {filtered.filter(r => r.grade !== "").length > 0
                    ? `∅ ${(filtered.filter(r => r.grade !== "").reduce((s, r) => s + (r.grade as number), 0) / filtered.filter(r => r.grade !== "").length).toFixed(1)}`
                    : "—"}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-sm font-bold text-foreground">
                  {filtered.filter(r => r.hours !== "").reduce((s, r) => s + (r.hours as number), 0).toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </main>

      {/* Detail Modal */}
      {detailRecord && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setDetailId(null)}
        >
          <div
            className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1">№{detailRecord.number}</span>
                {detailRecord.grade !== "" && (
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${GRADE_COLOR[detailRecord.grade as number] ?? "bg-muted text-muted-foreground"}`}>
                    {detailRecord.grade}
                  </span>
                )}
              </div>
              <button onClick={() => setDetailId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>

            <h2 className="text-base font-bold text-foreground mb-1">{detailRecord.name}</h2>
            {detailRecord.designation && (
              <p className="text-sm font-mono text-muted-foreground mb-4">{detailRecord.designation}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Разряд</p>
                <p className="text-lg font-bold text-foreground">{detailRecord.grade !== "" ? detailRecord.grade : "—"}</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Норма часы</p>
                <p className="text-lg font-bold text-foreground">{detailRecord.hours !== "" ? `${Number(detailRecord.hours).toFixed(2)} ч` : "—"}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <button
                onClick={() => setDeleteId(detailRecord.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 text-destructive rounded-xl py-2.5 text-sm font-semibold hover:bg-destructive/20 transition-all"
              >
                <Icon name="Trash2" size={15} />
                Удалить
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
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-secondary transition-all"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-destructive text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-all"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
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
                  <input
                    type="text"
                    placeholder="001"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Обозначение ДСЕ</label>
                  <input
                    type="text"
                    placeholder="ДСЕ-001.00.00"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Наименование ДСЕ *</label>
                <input
                  type="text"
                  placeholder="Например: Корпус редуктора"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Разряд (1–8)</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value === "" ? "" : Number(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">— не указан</option>
                    {[1,2,3,4,5,6,7,8].map((g) => (
                      <option key={g} value={g}>{g} разряд</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Норма часы</label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    placeholder="0.00"
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value === "" ? "" : Number(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-secondary transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.number.trim() || !form.name.trim()}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
