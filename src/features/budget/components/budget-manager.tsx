"use client";

import { useState, useTransition } from "react";
import { BudgetPlan, BudgetPeriod, SavingsGoal } from "../types";
import {
  addBudgetTransactionAction,
  addSavingsAmountAction,
  confirmBudgetTransactionAction,
  setMonthlyLimitAction,
  createSavingsGoalAction,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Wallet } from "lucide-react";

const periodLabels: Record<BudgetPeriod, string> = { month: "Tháng", year: "Năm" };
const money = (value: number) => `${value.toLocaleString("vi-VN")} ₫`;

export function BudgetManager({
  initialPlans,
  initialSavingsGoals,
}: {
  initialPlans: BudgetPlan[];
  initialSavingsGoals: SavingsGoal[];
}) {
  const [plans] = useState(initialPlans);
  const [savingsGoals] = useState(initialSavingsGoals);
  const [tab, setTab] = useState<BudgetPeriod | "savings">("month");
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [warningAmount, setWarningAmount] = useState("");
  const [category, setCategory] = useState("");
  const [spent, setSpent] = useState("");
  const [spentOn, setSpentOn] = useState(new Date().toISOString().slice(0, 10));
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [savingAmount, setSavingAmount] = useState("");
  const [message, setMessage] = useState("");
  const now = new Date();
  const currentPeriodKey = tab === "month"
    ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    : String(now.getFullYear());
  const current = tab === "savings" ? undefined : plans.find((plan) =>
    plan.period_type === tab && plan.period_start.startsWith(currentPeriodKey)
  );
  const refresh = () => window.location.reload();

  const create = () => startTransition(async () => {
    const result = await setMonthlyLimitAction(Number(amount), warningAmount ? Number(warningAmount) : null);
    if (!result.success) setMessage(result.message ?? "Không thể tạo kế hoạch.");
    else refresh();
  });

  const addExpense = () => startTransition(async () => {
    const result = await addBudgetTransactionAction({
      planId: current?.id ?? "", spentOn, category, amount: Number(spent),
    });
    if (!result.success) setMessage(result.message ?? "Không thể lưu khoản chi.");
    else refresh();
  });

  const createGoal = () => startTransition(async () => {
    const result = await createSavingsGoalAction(goalName, Number(goalTarget));
    if (!result.success) setMessage(result.message ?? "Không thể tạo mục tiêu.");
    else refresh();
  });

  const addSaving = (goalId: string) => startTransition(async () => {
    const result = await addSavingsAmountAction(goalId, Number(savingAmount));
    if (!result.success) setMessage(result.message ?? "Không thể thêm tiền.");
    else refresh();
  });

  const warningReached = current?.warning_amount !== null && current !== undefined && current.spent >= (current.warning_amount ?? Infinity);

  return <section className="space-y-3">
    <div className="flex items-center justify-between">
      <div><h3 className="font-bold text-[#201A1D]">Khoản chi & tiết kiệm</h3><p className="text-xs text-[#786D73]">Lập hạn mức tháng, ghi khoản chi và xác nhận số tiền thực tế</p></div>
    </div>
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#ECE2DC] p-1">
      {(Object.keys(periodLabels) as BudgetPeriod[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-lg py-2 text-xs font-bold ${tab === item ? "bg-white text-[#7C4DFF]" : "text-[#786D73]"}`}>{periodLabels[item]}</button>)}
      <button onClick={() => setTab("savings")} className={`rounded-lg py-2 text-xs font-bold ${tab === "savings" ? "bg-white text-[#7C4DFF]" : "text-[#786D73]"}`}>Tiết kiệm</button>
    </div>
    {tab === "month" && <Card className="space-y-2 p-3">
      <input className="w-full rounded-xl border p-2 text-xs" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Hạn mức (₫)" />
      {tab === "month" && <input className="w-full rounded-xl border p-2 text-xs" type="number" value={warningAmount} onChange={(e) => setWarningAmount(e.target.value)} placeholder="Cảnh báo nhẹ khi đã chi đến (₫, tùy chọn)" />}
      <Button className="w-full" disabled={pending} onClick={create}>Lưu hạn mức tháng</Button>
    </Card>}
    {tab !== "savings" && (!current ? <Card className="p-5 text-center text-xs text-[#786D73]"><Wallet className="mx-auto mb-2 h-6 w-6 text-[#7C4DFF]" />Chưa có kế hoạch {periodLabels[tab].toLowerCase()}.</Card> :
      <Card className="space-y-3 p-4">
        <div className="flex justify-between"><div><p className="font-bold">{current.name}</p><p className="text-xs text-[#786D73]">Đã xác nhận {money(current.spent)}</p></div><strong className={current.remaining < 0 ? "text-red-600" : "text-[#1B9B68]"}>{current.remaining < 0 ? `Vượt ${money(Math.abs(current.remaining))}` : `Còn ${money(current.remaining)}`}</strong></div>
        <div className="h-2 overflow-hidden rounded-full bg-[#F2EAE5]"><div className={`h-full ${current.remaining < 0 ? "bg-red-500" : "bg-[#7C4DFF]"}`} style={{ width: `${Math.min(100, current.budget_amount ? current.spent / current.budget_amount * 100 : 0)}%` }} /></div>
        {warningReached && <p className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-700">Bạn đã gần chạm ngưỡng cảnh báo của tháng. Mình cùng xem lại nhé.</p>}
        {current.period_type === "month" && current.previous_month_spent > 0 && <p className="text-[11px] text-[#786D73]">So với tháng trước: {current.spent >= current.previous_month_spent ? "tăng" : "giảm"} {money(Math.abs(current.spent - current.previous_month_spent))}.</p>}
        <p className="text-[11px] text-[#786D73]">Khoản chi theo ngày sẽ tự vào kế hoạch tháng tương ứng. Cần xác nhận sau khi kiểm tra số tiền.</p>
        {current.period_type === "month" && <>
          <div className="grid grid-cols-[1fr_7rem] gap-2"><input className="rounded-xl border p-2 text-xs" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Khoản chi..." /><input className="rounded-xl border p-2 text-xs" type="number" value={spent} onChange={(e) => setSpent(e.target.value)} placeholder="Số tiền" /></div>
          <div className="flex gap-2"><input className="flex-1 rounded-xl border p-2 text-xs" type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} /><Button size="sm" disabled={pending} onClick={addExpense}>Ghi khoản chi</Button></div>
        </>}
        {current.period_type === "year" && <p className="text-[11px] text-[#786D73]">Khoản chi được nhập trong kế hoạch tháng; màn hình này dùng để xem tổng cả năm.</p>}
        {current.period_type === "month" && <ul className="space-y-1 text-xs">{current.transactions.map((item) => <li key={item.id} className="flex items-center justify-between border-b border-[#F2EAE5] py-1"><span>{item.category} · {money(item.amount)} <em className="text-[10px] text-[#9E9096]">{item.status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}</em></span>{item.status === "pending" && <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(async () => { await confirmBudgetTransactionAction(item.id); refresh(); })}><Check className="h-4 w-4 text-[#1B9B68]" /></Button>}</li>)}</ul>}
        {current.period_type === "year" && <div className="rounded-xl bg-[#FAF6F3] p-2"><p className="mb-1 text-xs font-bold">12 tháng trong năm {current.period_start.slice(0, 4)}</p><div className="grid grid-cols-3 gap-2 text-[11px]">{current.monthly_breakdown.map((item) => <div key={item.month} className="rounded-lg bg-white p-2"><span>Tháng {Number(item.month.slice(5))}</span><strong className="block">{money(item.spent)}</strong></div>)}</div></div>}
      </Card>)}
    {tab === "savings" && <div className="space-y-3">
      <Card className="space-y-2 p-3"><input className="w-full rounded-xl border p-2 text-xs" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Tên mục tiêu, ví dụ: Du lịch Đà Lạt" /><input className="w-full rounded-xl border p-2 text-xs" type="number" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="Số tiền muốn tiết kiệm (₫)" /><Button className="w-full" disabled={pending} onClick={createGoal}>Tạo mục tiêu tiết kiệm</Button></Card>
      {savingsGoals.map((goal) => <Card key={goal.id} className="space-y-2 p-4"><div className="flex justify-between text-xs"><strong>{goal.name}</strong><span>{money(goal.saved_amount)} / {money(goal.target_amount)}</span></div><div className="h-2 rounded-full bg-[#F2EAE5]"><div className="h-full rounded-full bg-[#1B9B68]" style={{ width: `${Math.min(100, goal.saved_amount / goal.target_amount * 100)}%` }} /></div><div className="flex gap-2"><input className="flex-1 rounded-xl border p-2 text-xs" type="number" value={savingAmount} onChange={(e) => setSavingAmount(e.target.value)} placeholder="Thêm tiền (₫)" /><Button size="sm" disabled={pending} onClick={() => addSaving(goal.id)}>Thêm tiền</Button></div></Card>)}
    </div>}
    {message && <p className="text-xs text-red-600">{message}</p>}
  </section>;
}
