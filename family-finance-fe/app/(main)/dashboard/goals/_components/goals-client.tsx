'use client';

import { useEffect, useState } from 'react';
import { getGoalsAction, getSurplusAction, deleteGoalAction, getDashboardSummaryAction } from '@/lib/action';
import { useAuthStore } from "@/store/auth.store";
import { Target, Plus, PiggyBank, ArrowRight, CheckCircle, Clock, Trash, PencilSimple, DotsThreeVertical } from '@phosphor-icons/react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { AllocateSurplusModal } from './allocate-surplus-modal';
import { CreateGoalModal } from './create-goal-modal';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
  status: string;
  expectedDate?: string;
}

export const GoalsClient = ({ isAllocate }: { isAllocate: boolean }) => {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [surplus, setSurplus] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(isAllocate);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsRes, surplusRes, dashboardRes] = await Promise.all([
        getGoalsAction(),
        getSurplusAction(),
        getDashboardSummaryAction()
      ]);

      if (goalsRes.statusCode === 200) {
        if (Array.isArray(goalsRes.data)) {
          setGoals(goalsRes.data);
        } else if (goalsRes.data?.data) {
          setGoals(goalsRes.data.data);
        } else {
          setGoals(goalsRes.data);
        }
      }

      if (surplusRes.statusCode === 200 && surplusRes.data?.surplus !== undefined) {
        setSurplus(surplusRes.data.surplus);
      }

      if (dashboardRes.statusCode === 200 && dashboardRes.data?.recentTransactions) {
        setTransactions(dashboardRes.data.recentTransactions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingGoalId) return;
    
    try {
      const res = await deleteGoalAction(deletingGoalId);
      if (res.statusCode === 200) {
        toast.success('Đã xóa kế hoạch thành công');
        fetchData();
      } else {
        toast.error(res.message || 'Lỗi khi xóa kế hoạch');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setDeletingGoalId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 relative">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            Kế hoạch tài chính
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Quản lý và theo dõi các mục tiêu tương lai của gia đình
          </p>
        </div>

        {user?.role !== 'member' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} weight="bold" />
            <span>Tạo kế hoạch</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {/* SURPLUS BANNER CARD */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-green-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
              <PiggyBank size={160} weight="duotone" />
            </div>
            
            <div className="relative z-10">
              <p className="text-green-100 font-bold text-[12px] uppercase tracking-widest opacity-90 pl-1 mb-2">
                {user?.role === 'member' ? 'Số dư của bạn' : 'Số dư chưa phân bổ'}
              </p>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
                {formatCurrency(surplus)}
              </h3>
              {user?.role === 'member' ? (
                <div className="text-green-100 text-sm mt-3 max-w-md space-y-2">
                  <p>Các giao dịch bạn đã thực hiện đóng góp vào kế hoạch chung.</p>
                  <div className="bg-white/10 rounded-xl p-3 max-h-[100px] overflow-y-auto min-w-[250px]">
                    {transactions.filter(tx => tx.userId?._id === user?._id).length > 0 ? (
                      transactions.filter(tx => tx.userId?._id === user?._id).slice(0, 2).map((tx, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-1 border-b border-white/10 last:border-0">
                          <span>{tx.description || tx.categoryID?.name || "Giao dịch"}</span>
                          <span className="font-bold">{formatCurrency(tx.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-green-200">Chưa có giao dịch nào.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-green-100 text-sm mt-3 max-w-md">
                  Đây là khoản tiền dư ra từ thu nhập trừ đi chi phí trong các tháng trước. Hãy phân bổ vào các kế hoạch để tiền làm việc cho bạn!
                </p>
              )}
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
              {surplus > 0 && (
                <button
                  onClick={() => setIsAllocateModalOpen(true)}
                  className="px-6 py-3.5 bg-white text-green-700 hover:bg-green-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <ArrowRight size={20} weight="bold" />
                  Phân bổ ngay
                </button>
              )}
              {user?.role !== 'member' && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-sm active:scale-95 border border-white/30"
                >
                  <Plus size={20} weight="bold" />
                  Thêm Mục Tiêu
                </button>
              )}
            </div>
          </div>

          {/* GOALS GRID */}
          <div className="pt-2">

            {goals.length === 0 ? (
              <div className="bg-white dark:bg-[#122017] border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <Target size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Chưa có kế hoạch nào</h4>
                <p className="text-slate-500 max-w-sm mb-6">
                  Tạo kế hoạch mua xe, mua nhà, hay tiết kiệm học phí cho con cái để bắt đầu hành trình tài chính!
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                  <Plus size={20} weight="bold" />
                  Tạo kế hoạch đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                  const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  const isCompleted = goal.status === 'COMPLETED' || percent >= 100;
                  
                  return (
                    <div 
                      key={goal._id}
                      className="bg-white dark:bg-[#122017] border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group relative"
                    >
                      {/* ACTIONS DROP DOWN */}
                      {user?.role !== 'member' && (
                        <div className="absolute top-4 right-4 z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <DotsThreeVertical size={20} weight="bold" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5">
                              <DropdownMenuItem 
                                onClick={() => setEditingGoal(goal)}
                                className="rounded-lg font-bold text-slate-600 dark:text-slate-300 gap-2 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600"
                              >
                                <PencilSimple size={18} />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingGoalId(goal._id)}
                                className="rounded-lg font-bold text-red-600 gap-2 cursor-pointer focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600"
                              >
                                <Trash size={18} />
                                Xóa kế hoạch
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      {/* HEADER */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                            style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                          >
                            <IconRenderer icon={goal.icon || "Target"} size={28} weight="duotone" />
                          </div>
                          <div className="pr-8">
                            <h4 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">{goal.name}</h4>
                            <div className="flex items-center gap-1.5 text-xs font-medium mt-1">
                              {isCompleted ? (
                                <span className="text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                  <CheckCircle size={14} weight="fill" /> Đã hoàn thành
                                </span>
                              ) : (
                                <span className="text-blue-500 flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                                  <Clock size={14} weight="fill" /> Đang thực hiện
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AMOUNTS & PROGRESS */}
                      <div className="space-y-3">
                        {user?.role !== 'member' && (
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Hiện tại</p>
                              <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(goal.currentAmount)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Mục tiêu</p>
                              <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(goal.targetAmount)}</p>
                            </div>
                          </div>
                        )}

                        {/* PROGRESS BAR */}
                        <div className="relative pt-2">
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${percent}%`,
                                backgroundColor: isCompleted ? '#22c55e' : goal.color 
                              }}
                            />
                          </div>
                          <div 
                            className="absolute right-0 top-6 text-xs font-bold"
                            style={{ color: isCompleted ? '#22c55e' : goal.color }}
                          >
                            {percent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {isAllocateModalOpen && (
        <AllocateSurplusModal 
          isOpen={isAllocateModalOpen} 
          onClose={() => setIsAllocateModalOpen(false)} 
          surplus={surplus}
          goals={goals}
          onSuccess={fetchData}
        />
      )}

      {(isCreateModalOpen || editingGoal) && (
        <CreateGoalModal
          isOpen={isCreateModalOpen || !!editingGoal}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingGoal(null);
          }}
          onSuccess={fetchData}
          initialData={editingGoal || undefined}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deletingGoalId} onOpenChange={() => setDeletingGoalId(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tight">Xóa kế hoạch này?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium pt-2">
              Hành động này không thể hoàn tác. Toàn bộ tiến trình tích lũy của kế hoạch sẽ bị xóa khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-4">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

