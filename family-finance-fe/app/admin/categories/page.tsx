"use client";
import { useEffect, useState } from "react";
import {
  getSystemCategoriesAction,
  createSystemCategoryAction,
  deleteSystemCategoryAction,
} from "@/lib/action";

const CATEGORY_ICONS = ["🍔", "🚗", "🏠", "💊", "🎓", "🎮", "👗", "💸"];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "🍔",
    type: "expense",
    color: "#22C55E",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getSystemCategoriesAction();
      if (res.data) setCategories(res.data);
      else if (Array.isArray(res)) setCategories(res as any);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      await createSystemCategoryAction(formData);
      setShowForm(false);
      setFormData({ name: "", icon: "🍔", type: "expense", color: "#22C55E" });
      fetchCategories();
    } catch (e) {
      alert("Tạo thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này sẽ ảnh hưởng toàn hệ thống?")) return;
    try {
      await deleteSystemCategoryAction(id);
      fetchCategories();
    } catch (e) {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="bg-white dark:bg-[#122017] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight uppercase">
          Danh mục hệ thống
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          {showForm ? "Đóng form" : "+ Thêm danh mục"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-wrap gap-4 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
              Tên danh mục
            </label>
            <input
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Ăn uống, Giải trí..."
              required
            />
          </div>
          <div className="w-24">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
              Icon
            </label>
            <select
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
            >
              {CATEGORY_ICONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
              Loại
            </label>
            <select
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Lưu ngay
          </button>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Đang tải danh mục...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            Chưa có danh mục mặc định nào
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="relative group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] font-bold mt-0.5 text-slate-500 uppercase tracking-widest">
                  {cat.type === "expense" ? "Khoản chi" : "Khoản thu"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(cat._id)}
                className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
