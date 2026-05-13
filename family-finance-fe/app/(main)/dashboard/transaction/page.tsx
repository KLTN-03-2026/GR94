"use client";

import React, { useState, useRef } from "react";
import { Plus, MagnifyingGlass, Funnel, Calendar as CalendarIcon, Microphone, Stop } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionTable } from "./_components/transaction-table";
import { AddTransactionModal } from "./_components/add-transaction-modal";
import { TransactionMobileDetail } from "./_components/transaction-mobile-detail";
import { DeleteConfirmModal } from "./_components/delete-confirm-modal";
import { getIncomesAction, getCategoriesAction, deleteIncomeAction, getExpensesAction, deleteExpenseAction, getTagsAction, processVoiceAudioAction } from "@/lib/action";
import { useAuthStore } from "@/store/auth.store";
import { ICategory } from "@/lib/category.api";
import { toast } from "sonner";
import { IIncome, GetIncomeDto, ITag } from "@/types";

export default function TransactionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<IIncome | null>(null);
  const [mobileDetailTransaction, setMobileDetailTransaction] = useState<IIncome | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<IIncome | null>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  
  // Filters State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTime, setSelectedTime] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceInitialData, setVoiceInitialData] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleVoiceInput = async () => {
    // If already recording, stop it
    if (isListening && mediaRecorderRef.current) {
      console.log("[Voice] Stopping recording...");
      mediaRecorderRef.current.stop();
      return;
    }

    console.log("[Voice] Starting recording...");

    // Request microphone permission and get stream
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[Voice] Microphone permission granted");
    } catch (err: any) {
      console.error("[Voice] Microphone permission denied:", err);
      toast.error("Vui lòng cấp quyền sử dụng Microphone để dùng tính năng này.");
      return;
    }

    // Setup MediaRecorder
    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm',
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
        console.log("[Voice] Audio chunk received:", event.data.size, "bytes");
      }
    };

    mediaRecorder.onstop = async () => {
      console.log("[Voice] Recording stopped, processing...");
      setIsListening(false);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log("[Voice] Total audio size:", audioBlob.size, "bytes");

      if (audioBlob.size < 1000) {
        toast.warning("Đoạn ghi âm quá ngắn. Hãy thử lại.");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        console.log("[Voice] Audio base64 length:", base64.length);

        const toastId = toast.loading("🤖 AI đang phân tích giọng nói...");
        try {
          // Lấy danh sách TẤT CẢ tên danh mục để gửi cho AI
          const allCategoryNames = categories.map(c => c.name);
          
          const response: any = await processVoiceAudioAction(base64, 'audio/webm', allCategoryNames);
          console.log("[Voice] AI response:", response);
          toast.dismiss(toastId);

          if (response && response.data && response.data.amount !== undefined) {
            const parsedData = response.data;
            console.log("[Voice] Parsed data:", parsedData);
            
            if (response.transcription) {
              toast.success(`AI nghe thấy: "${response.transcription}"`, { duration: 5000 });
            } else {
              toast.success("AI đã phân tích xong!");
            }

            // Tự động khớp tên danh mục trả về với ID danh mục trong hệ thống (tìm trong tất cả danh mục)
            const matchedCategory = categories.find(c => 
              c.name.toLowerCase() === parsedData.category?.toLowerCase()
            );

            setVoiceInitialData({
              amount: parsedData.amount ? String(parsedData.amount) : "",
              description: parsedData.description || "",
              type: matchedCategory ? (matchedCategory.type as "income" | "expense") : (parsedData.type || activeTab),
              categoryID: matchedCategory ? matchedCategory._id : "",
              date: parsedData.date ? new Date(parsedData.date) : new Date()
            });

            setEditTransaction(null);
            setIsModalOpen(true);
          } else {
            console.warn("[Voice] AI returned unexpected response:", response);
            toast.error("AI không nhận diện được dữ liệu. Vui lòng thử lại.");
          }
        } catch (error) {
          toast.dismiss(toastId);
          toast.error("Lỗi khi kết nối với AI");
          console.error("[Voice] API error:", error);
        }
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.onerror = (event: any) => {
      console.error("[Voice] MediaRecorder error:", event);
      setIsListening(false);
      stream.getTracks().forEach(track => track.stop());
      toast.error("Lỗi ghi âm. Vui lòng thử lại.");
    };

    // Start recording
    mediaRecorder.start(250); // collect data every 250ms
    setIsListening(true);
    toast.info("🎤 Đang ghi âm... Nhấn lại để dừng.");
    console.log("[Voice] MediaRecorder started");
  };

  // Query Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategoriesAction();
      console.log("Categories API Response:", res);
      // Backend returns array directly for categories
      return Array.isArray(res) ? res : [];
    },
  });

  // Query Tags
  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await getTagsAction();
      return Array.isArray(res) ? res : [];
    },
  });
  const tags: ITag[] = Array.isArray(tagsData) ? tagsData : [];

  const queryClient = useQueryClient();

  // Mutation for deleting a transaction
  const deleteMutation = useMutation({
    mutationFn: (id: string) => activeTab === "income" ? deleteIncomeAction(id) : deleteExpenseAction(id),
    onSuccess: (res: any) => {
      if (res.error) {
        toast.error(res.message || "Có lỗi xảy ra khi xóa");
        return;
      }
      toast.success("Xóa giao dịch thành công");
      setTransactionToDelete(null);
      if (mobileDetailTransaction && mobileDetailTransaction._id === res._id) {
         setMobileDetailTransaction(null);
      }
      queryClient.invalidateQueries({ queryKey: ["transactions", activeTab] });
      // Khi xóa expense, budget cần tính lại spentAmount ngay
      if (activeTab === "expense") {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
      }
    },
    onError: () => {
      toast.error("Lỗi kết nối đến máy chủ");
    },
  });


  const handleEdit = (transaction: IIncome) => {
    setEditTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (transaction: IIncome) => {
    setTransactionToDelete(transaction);
  };

  // Query Transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["transactions", activeTab, selectedCategory, selectedTime, selectedTag],
    queryFn: async () => {
      const query: GetIncomeDto = {
        page: 1,
        limit: 100,
      };

      if (selectedCategory !== "all") {
        query.categoryId = selectedCategory;
      }

      if (selectedTag !== "all") {
        query.tagId = selectedTag;
      }

      if (selectedTime === "this-month") {
        const now = new Date();
        query.month = now.getMonth() + 1;
        query.year = now.getFullYear();
      } else if (selectedTime === "last-month") {
        const now = new Date();
        let month = now.getMonth();
        let year = now.getFullYear();
        if (month === 0) {
          month = 12;
          year -= 1;
        }
        query.month = month;
        query.year = year;
      }

      const res = activeTab === "income" 
        ? await getIncomesAction(query) 
        : await getExpensesAction(query);
      console.log(`[API ${activeTab}] Response:`, res);
      
      return res?.data?.result || [];
    },
  });

  const transactions: IIncome[] = Array.isArray(transactionsData) ? transactionsData : [];
  const categories: ICategory[] = Array.isArray(categoriesData) ? categoriesData : [];
  const displayCategories = categories.filter(c => c.type === activeTab);

  // Diagnostic: Check if user has a spaceId
  const { user } = useAuthStore();
  const hasSpace = !!user?.spaceId;

  // Client-side search (for snappiness)
  const filteredTransactions = transactions.filter((t: IIncome) => 
    t.description?.toLowerCase().includes(search.toLowerCase()) || 
    t.categoryID?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            Lịch sử giao dịch
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Minh bạch từng khoản chi, gắn kết cả nhà
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleVoiceInput}
            className={`${isListening ? "bg-red-500 animate-pulse text-white" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white"} px-4 py-6 rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-2 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600`}
            title={isListening ? "Nhấn để dừng ghi âm" : "Nhập bằng giọng nói"}
          >
            {isListening ? (
              <Stop size={20} weight="fill" className="text-white" />
            ) : (
              <Microphone size={20} weight="bold" className="text-emerald-600 dark:text-emerald-400" />
            )}
          </Button>

          <Button 
            onClick={() => {
              setEditTransaction(null);
              setVoiceInitialData(null);
              setIsModalOpen(true);
            }}
            className={`${activeTab === "income" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"} text-white px-6 py-6 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2`}
          >
            <Plus size={20} weight="bold" />
            <span>Thêm giao dịch</span>
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
        <button
          onClick={() => {
            setActiveTab("income");
            setSearch("");
            setSelectedCategory("all");
            setSelectedTag("all");
          }}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === "income"
              ? "bg-white dark:bg-[#1C2C22] text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Khoản Thu
        </button>
        <button
          onClick={() => {
            setActiveTab("expense");
            setSearch("");
            setSelectedCategory("all");
            setSelectedTag("all");
          }}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === "expense"
              ? "bg-white dark:bg-[#2C1C1C] text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Khoản Chi
        </button>
      </div>

      {!hasSpace && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl flex items-start gap-4">
            <Funnel size={24} className="text-amber-600 mt-1" />
            <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-400">Chưa chọn Không gian!</h4>
                <p className="text-sm text-amber-700/80 dark:text-amber-400/60 mt-1">
                    Tài khoản của bạn chưa tham gia vào Không gian gia đình nào. Hãy tạo hoặc tham gia không gian để xem và quản lý giao dịch.
                </p>
            </div>
        </div>
      )}

      {/* Action Bar (Filters) */}
      <div className="bg-white dark:bg-[#122017] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-xs flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <MagnifyingGlass 
            size={20} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" 
          />
          <Input 
            placeholder="Tìm kiếm giao dịch..." 
            className="pl-12 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-emerald-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px] h-12 bg-slate-50 border-none rounded-xl font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <Funnel size={18} />
              <SelectValue placeholder="Danh mục" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {displayCategories.map(cat => (
              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time Filter */}
        <Select value={selectedTime} onValueChange={setSelectedTime}>
          <SelectTrigger className="w-[180px] h-12 bg-slate-50 border-none rounded-xl font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} />
              <SelectValue placeholder="Thời gian" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Mọi lúc</SelectItem>
            <SelectItem value="this-month">Tháng này</SelectItem>
            <SelectItem value="last-month">Tháng trước</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter (Horizontal Scroll) */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedTag("all")}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedTag === "all"
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Tất cả thẻ
          </button>
          {tags.map((tag) => (
            <button
              key={tag._id}
              onClick={() => setSelectedTag(tag._id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 border border-transparent ${
                selectedTag === tag._id
                  ? "shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: tag.color || "#10B981" }}
              />
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Transactions Table Section */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium italic">Đang tải dữ liệu...</p>
            </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
              Danh sách giao dịch ({filteredTransactions.length})
            </span>
          </div>
          <TransactionTable 
            type={activeTab}
            transactions={filteredTransactions} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMobileSelect={(transaction) => setMobileDetailTransaction(transaction)}
          />
        </div>
      )}

      {/* Modal */}
      <AddTransactionModal 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditTransaction(null);
            setVoiceInitialData(null);
          }
        }}
        categories={categories}
        editData={editTransaction}
        type={activeTab}
        initialData={voiceInitialData}
      />

      {/* Mobile Detail Sheet */}
      <TransactionMobileDetail
        type={activeTab}
        transaction={mobileDetailTransaction}
        isOpen={!!mobileDetailTransaction}
        onClose={() => setMobileDetailTransaction(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        type={activeTab}
        transaction={transactionToDelete}
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete) deleteMutation.mutate(transactionToDelete._id);
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
