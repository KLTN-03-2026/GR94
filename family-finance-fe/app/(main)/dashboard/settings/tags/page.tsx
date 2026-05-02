"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Tag as TagIcon,
  PencilSimple,
  Trash,
  CaretLeft,
  DotsThreeVertical,
  PlusCircle,
  MagnifyingGlass,
  ArrowLeft,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { getTagsAction } from "@/lib/action";
import { ITag } from "@/types";
import { TagModal } from "@/components/tags/tag-modal";
import { DeleteTagModal } from "@/components/tags/delete-tag-modal";
import { TagMobileDetail } from "./_components/tag-mobile-detail";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function TagsManagementPage() {
  const [tags, setTags] = useState<ITag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ITag | null>(null);

  // Mobile detail state
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [selectedMobileTag, setSelectedMobileTag] = useState<ITag | null>(null);

  const handleOpenMobileDetail = (tag: ITag) => {
    setSelectedMobileTag(tag);
    setIsMobileDetailOpen(true);
  };

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await getTagsAction();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (tag: ITag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleDelete = (tag: ITag) => {
    setSelectedTag(tag);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTag(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F0C] pb-24 lg:pb-10">
      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-white dark:bg-[#122017] border-b border-slate-100 dark:border-slate-800/60 sticky top-0 z-30 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard/settings"
            className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft size={24} weight="bold" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Quản lý Tag
          </h1>
          <button
            onClick={handleCreate}
            className="p-2 -mr-2 text-emerald-600 dark:text-emerald-400"
          >
            <PlusCircle size={28} weight="fill" />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlass size={18} />
          </div>
          <Input
            placeholder="Tìm kiếm tag..."
            className="w-full pl-10 h-11 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden lg:block max-w-6xl mx-auto pt-10 px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link
                href="/dashboard/settings"
                className="hover:text-emerald-600 transition-colors"
              >
                Cài đặt
              </Link>
              <span className="opacity-30">/</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Quản lý Tag
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TagIcon size={24} weight="duotone" />
              </div>
              Danh sách Nhãn
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <MagnifyingGlass size={18} />
              </div>
              <Input
                placeholder="Tìm kiếm..."
                className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCreate}
              className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-emerald-500/20 gap-2 border-none"
            >
              <Plus size={20} weight="bold" />
              Thêm Tag Mới
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 mt-6 lg:mt-0">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-24 bg-white dark:bg-[#122017] rounded-3xl p-4 animate-pulse border border-slate-100 dark:border-slate-800/60"
              />
            ))}
          </div>
        ) : filteredTags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <div
                key={tag._id}
                onClick={() => handleOpenMobileDetail(tag)}
                className="group relative bg-white dark:bg-[#122017] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/60 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{
                      backgroundColor: tag.color || "#10b981",
                      boxShadow: `0 8px 16px -4px ${tag.color}40`,
                    }}
                  >
                    <TagIcon size={24} weight="duotone" />
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(tag);
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <PencilSimple size={18} weight="bold" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tag);
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  </div>

                  {/* Mobile Actions */}
                  <div className="lg:hidden">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(tag);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-600"
                      >
                        <PencilSimple size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tag);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg line-clamp-1 mb-1">
                  {tag.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {tag.color}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#122017] rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
              <TagIcon size={40} weight="thin" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
              Chưa có tag nào
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs mb-8">
              Bắt đầu tạo các nhãn để phân loại giao dịch của bạn chi tiết hơn.
            </p>
            <Button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-8 font-bold border-none shadow-lg shadow-emerald-500/20"
            >
              Tạo Tag Đầu Tiên
            </Button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <TagModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTag(null);
        }}
        onSuccessCallback={fetchTags}
        editData={
          selectedTag
            ? {
                _id: selectedTag._id,
                name: selectedTag.name,
                color: selectedTag.color,
              }
            : null
        }
      />

      <DeleteTagModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTag(null);
        }}
        onSuccessCallback={fetchTags}
        tagData={
          selectedTag ? { _id: selectedTag._id, name: selectedTag.name } : null
        }
      />

      {/* Mobile Detail Modal */}
      <TagMobileDetail
        isOpen={isMobileDetailOpen}
        onClose={() => setIsMobileDetailOpen(false)}
        tag={selectedMobileTag}
        onEdit={(tag) => handleEdit(tag)}
        onDelete={(tag) => handleDelete(tag)}
      />
    </div>
  );
}
