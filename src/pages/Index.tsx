import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

type Category = "Все" | "Контакты" | "Товары" | "Задачи" | "Заметки";

interface DBRecord {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  tags: string[];
}

const INITIAL_RECORDS: DBRecord[] = [
  { id: 1, title: "Иванов Иван Иванович", subtitle: "ivan@example.com · +7 900 123-45-67", category: "Контакты", date: "10.06.2026", tags: ["VIP", "Клиент"] },
  { id: 2, title: "Ноутбук Dell XPS 15", subtitle: "Артикул: DX-9500 · Склад: A3", category: "Товары", date: "09.06.2026", tags: ["Электроника"] },
  { id: 3, title: "Подготовить квартальный отчёт", subtitle: "Срок: 15 июня · Ответственный: Смирнов", category: "Задачи", date: "08.06.2026", tags: ["Срочно"] },
  { id: 4, title: "Петрова Мария Сергеевна", subtitle: "maria@corp.ru · +7 912 000-11-22", category: "Контакты", date: "07.06.2026", tags: ["Партнёр"] },
  { id: 5, title: "Идеи для нового продукта", subtitle: "Встреча команды 12.06 — собрать предложения", category: "Заметки", date: "06.06.2026", tags: ["Идеи"] },
  { id: 6, title: "Офисное кресло Herman Miller", subtitle: "Артикул: HM-Aeron · Цена: 85 000 ₽", category: "Товары", date: "05.06.2026", tags: ["Мебель", "Офис"] },
  { id: 7, title: "Обновить сайт компании", subtitle: "Дизайн + новый раздел услуг", category: "Задачи", date: "04.06.2026", tags: ["В работе"] },
  { id: 8, title: "Сидоров Алексей", subtitle: "a.sidorov@mail.ru · Директор", category: "Контакты", date: "03.06.2026", tags: ["Руководство"] },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Контакты": "text-blue-400 bg-blue-400/10",
  "Товары":   "text-emerald-400 bg-emerald-400/10",
  "Задачи":   "text-amber-400 bg-amber-400/10",
  "Заметки":  "text-purple-400 bg-purple-400/10",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Контакты": "User",
  "Товары":   "Package",
  "Задачи":   "CheckSquare",
  "Заметки":  "FileText",
};

const CATEGORIES: Category[] = ["Все", "Контакты", "Товары", "Задачи", "Заметки"];

const EMPTY_FORM = { title: "", subtitle: "", category: "Заметки", tags: "" };

export default function Index() {
  const [records, setRecords] = useState<DBRecord[]>(INITIAL_RECORDS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Все");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchCat = activeCategory === "Все" || r.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [records, search, activeCategory]);

  const detailRecord = records.find((r) => r.id === detailId) ?? null;

  function handleAdd() {
    if (!form.title.trim()) return;
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
    const newRecord: DBRecord = {
      id: Date.now(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      category: form.category,
      date,
      tags,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleDelete(id: number) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeleteId(null);
    if (detailId === id) setDetailId(null);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Golos Text', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">База данных</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{records.length} записей</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              <Icon name="Plus" size={16} />
              Добавить
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по названию, описанию, тегам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Icon name="X" size={14} />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* List */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Icon name="Database" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Записи не найдены</p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-3 text-primary text-sm hover:underline">
                Сбросить поиск
              </button>
            )}
          </div>
        ) : (
          filtered.map((record, i) => (
            <div
              key={record.id}
              className="bg-card border border-border rounded-2xl px-4 py-3.5 cursor-pointer hover:border-primary/40 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => setDetailId(record.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${CATEGORY_COLORS[record.category] ?? "text-muted-foreground bg-muted"}`}>
                  <Icon name={CATEGORY_ICONS[record.category] ?? "File"} fallback="File" size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-foreground leading-tight truncate">{record.title}</p>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">{record.date}</span>
                  </div>
                  {record.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{record.subtitle}</p>
                  )}
                  {record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {record.tags.map((tag) => (
                        <span key={tag} className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Detail Modal */}
      {detailRecord && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setDetailId(null)}
        >
          <div
            className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${CATEGORY_COLORS[detailRecord.category] ?? "text-muted-foreground bg-muted"}`}>
                <Icon name={CATEGORY_ICONS[detailRecord.category] ?? "File"} fallback="File" size={20} />
              </div>
              <button onClick={() => setDetailId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">{detailRecord.title}</h2>
            {detailRecord.subtitle && (
              <p className="text-sm text-muted-foreground mb-3">{detailRecord.subtitle}</p>
            )}
            <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
              <span className={`rounded-lg px-2 py-1 font-medium ${CATEGORY_COLORS[detailRecord.category] ?? "bg-muted text-muted-foreground"}`}>
                {detailRecord.category}
              </span>
              <span>{detailRecord.date}</span>
            </div>
            {detailRecord.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {detailRecord.tags.map((tag) => (
                  <span key={tag} className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-xs font-medium">{tag}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-4 border-t border-border">
              <button
                onClick={() => setDeleteId(detailRecord.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 text-destructive rounded-xl py-2.5 text-sm font-semibold hover:bg-destructive/20 transition-all"
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

      {/* Add Form Modal */}
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
              <h2 className="text-base font-bold text-foreground">Новая запись</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Название *</label>
                <input
                  type="text"
                  placeholder="Введите название"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Описание</label>
                <input
                  type="text"
                  placeholder="Дополнительная информация"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Категория</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== "Все").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Теги <span className="font-normal">(через запятую)</span>
                </label>
                <input
                  type="text"
                  placeholder="Важное, Срочно, VIP..."
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
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
                disabled={!form.title.trim()}
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
