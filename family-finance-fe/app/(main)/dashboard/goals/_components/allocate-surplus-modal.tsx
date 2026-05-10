import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { allocateSurplusAction } from '@/lib/action';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconRenderer } from '@/components/ui/icon-renderer';
import { PiggyBank, Scales, ArrowRight, Wallet, Info } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Goal {
  _id: string;
  name: string;
  icon: string;
  currentAmount: number;
  targetAmount: number;
  color?: string;
}

export const AllocateSurplusModal = ({
  isOpen,
  onClose,
  surplus,
  goals,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  surplus: number;
  goals: Goal[];
  onSuccess: () => void;
}) => {
  const [allocations, setAllocations] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleAllocationChange = (goalId: string, value: string) => {
    setAllocations({
      ...allocations,
      [goalId]: value,
    });
  };

  const totalAllocated = Object.values(allocations).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const remaining = surplus - totalAllocated;

  const queryClient = useQueryClient();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAllocated > surplus) {
      toast.error("Tổng số tiền phân bổ không được vượt quá số dư hiện tại.");
      return;
    }

    const payload = Object.entries(allocations)
      .filter(([_, amount]) => Number(amount) > 0)
      .map(([goalID, amount]) => ({
        goalID,
        amount: Number(amount),
      }));

    if (payload.length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await allocateSurplusAction(payload);
      if (res.error || res.statusCode !== 200) {
        toast.error(res.message || 'Lỗi khi phân bổ');
        return;
      }
      toast.success("Phân bổ tài chính thành công!");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDivideEqually = () => {
    if (goals.length === 0 || surplus <= 0) return;
    const equalAmount = Math.floor(surplus / goals.length);
    const newAllocations: { [key: string]: string } = {};
    goals.forEach(goal => {
      newAllocations[goal._id] = equalAmount.toString();
    });
    setAllocations(newAllocations);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        {/* HEADER SECTION - Same style as CreateGoalModal */}
        <div className="bg-emerald-600/5 dark:bg-emerald-500/10 p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-1">
              <div className="p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none shrink-0">
                <Scales size={28} color="white" weight="bold" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Phân bổ tài chính
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                  Tối ưu hóa số tiền nhàn rỗi cho các mục tiêu của gia đình
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6 pt-2 space-y-6">
          {/* Surplus Display Card - More Premium */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-3xl shadow-xl shadow-emerald-100 dark:shadow-none">
            <div className="absolute top-[-20%] right-[-10%] opacity-10">
              <PiggyBank size={180} weight="fill" color="white" />
            </div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-emerald-100/80 text-[11px] font-black uppercase tracking-widest mb-1">
                  <Wallet size={16} weight="bold" />
                  Số dư khả dụng
                </div>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {formatCurrency(surplus)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-emerald-100/80 text-[11px] font-black uppercase tracking-widest mb-1">Còn lại</div>
                <p className={cn(
                  "text-xl font-black tracking-tight",
                  remaining < 0 ? "text-red-300" : "text-white"
                )}>
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>
            
            {/* Progress indicator for surplus usage */}
            <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  remaining < 0 ? "bg-red-400" : "bg-white"
                )}
                style={{ width: `${Math.min(100, (totalAllocated / surplus) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Danh sách mục tiêu</h3>
            {goals.length > 0 && (
              <button 
                type="button" 
                onClick={handleDivideEqually} 
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Scales size={16} weight="bold" />
                Chia đều số dư
              </button>
            )}
          </div>

          <form id="allocate-form" onSubmit={handleSubmit} className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar pb-2">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Info size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-bold">Chưa có mục tiêu nào</p>
                <p className="text-slate-400 text-xs mt-1">Hãy tạo kế hoạch mới trước khi phân bổ.</p>
              </div>
            ) : (
              goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const allocationVal = Number(allocations[goal._id]) || 0;
                
                return (
                  <div 
                    key={goal._id} 
                    className={cn(
                      "group p-4 rounded-[2rem] border-2 transition-all duration-300 bg-white dark:bg-[#122017]",
                      allocations[goal._id] 
                        ? "border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/20" 
                        : "border-slate-50 dark:border-slate-800/60 hover:border-emerald-200 dark:hover:border-emerald-800/40"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${goal.color || '#10b981'}15`, color: goal.color || '#10b981' }}
                        >
                          <IconRenderer icon={goal.icon || "Target"} size={24} weight="duotone" />
                        </div>
                        <div>
                          <Label htmlFor={goal._id} className="font-black text-slate-800 dark:text-slate-100 cursor-pointer block text-base tracking-tight">{goal.name}</Label>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Đã đạt: {percent}%</span>
                            <div className="h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mục tiêu</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₫</div>
                      <Input
                        id={goal._id}
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-14 pl-10 pr-4 bg-slate-50/80 dark:bg-slate-800/50 border-none rounded-2xl focus-visible:ring-emerald-500/20 text-right text-xl font-black text-emerald-600 dark:text-emerald-400"
                        value={allocations[goal._id] || ''}
                        onChange={(e) => handleAllocationChange(goal._id, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </form>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 h-12 rounded-2xl font-black text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              form="allocate-form" 
              disabled={loading || totalAllocated > surplus || goals.length === 0}
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 gap-2 transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                <>
                  Xác nhận phân bổ
                  <ArrowRight size={18} weight="bold" />
                </>
              )}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

