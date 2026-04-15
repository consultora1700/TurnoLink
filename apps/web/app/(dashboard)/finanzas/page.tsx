'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Repeat,
  CalendarRange,
  X,
  Users,
  Briefcase,
  DollarSign,
  Target,
  AlertTriangle,
  ChevronDown,
  Settings,
  ShoppingBag,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createApiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { isMercadoRubro, isGastronomiaRubro } from '@/lib/rubro-attributes';
import { UpgradeWall } from '@/components/dashboard/upgrade-wall';

// ============ CONSTANTS ============

const CATEGORY_ICONS: Record<string, string> = {
  SALARY: '👥', RENT: '🏠', TAXES: '📋', INTERNET: '🌐',
  ELECTRICITY: '⚡', GAS: '🔥', SUPPLIES: '📦', MARKETING: '📢',
  INSURANCE: '🛡️', MAINTENANCE: '🔧', OTHER: '📌',
};

const CATEGORY_LABELS: Record<string, string> = {
  SALARY: 'Sueldos', RENT: 'Alquiler', TAXES: 'Impuestos',
  INTERNET: 'Internet', ELECTRICITY: 'Electricidad', GAS: 'Gas',
  SUPPLIES: 'Insumos', MARKETING: 'Marketing', INSURANCE: 'Seguros',
  MAINTENANCE: 'Mantenimiento', OTHER: 'Otros', TOTAL: 'Total general',
};

const INCOME_CATEGORY_ICONS: Record<string, string> = {
  GASTRO_SALON: '🍽️', GASTRO_FOOD: '🍽️', GASTRO_TIPS: '💵', GASTRO_DELIVERY: '🛵', GASTRO_TAKEAWAY: '🥡',
  FREELANCE: '💼', CONSULTING: '🎯', RENTAL_INCOME: '🏠',
  INVESTMENT: '📈', REFUND: '↩️', COMMISSION: '🤝',
  GRANT: '🎓', OTHER_INCOME: '💰',
};

const INCOME_CATEGORY_LABELS: Record<string, string> = {
  GASTRO_SALON: 'Ventas de salón', GASTRO_FOOD: 'Consumo gastronómico', GASTRO_TIPS: 'Propinas',
  GASTRO_DELIVERY: 'Delivery', GASTRO_TAKEAWAY: 'Retira en local',
  FREELANCE: 'Trabajo independiente', CONSULTING: 'Consultoría',
  RENTAL_INCOME: 'Alquiler cobrado', INVESTMENT: 'Inversiones',
  REFUND: 'Reembolso', COMMISSION: 'Comisiones',
  GRANT: 'Subsidio / Beca', OTHER_INCOME: 'Otros ingresos',
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function hasFinanceAccess(features: string[]): boolean {
  return (
    features.includes('advanced_reports') ||
    features.includes('complete_reports') ||
    features.includes('finance_module')
  );
}

// ============ SKELETON ============

function FinanceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-[100px] rounded-xl sm:rounded-2xl bg-muted" />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="h-[300px] rounded-xl bg-muted" />
        <div className="h-[300px] rounded-xl bg-muted" />
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============

export default function FinanzasPage() {
  const { data: session } = useSession();
  const { rubro } = useTenantConfig();
  const terms = useRubroTerms();
  const isMercado = isMercadoRubro(rubro);
  const isGastro = isGastronomiaRubro(rubro);
  const { toast } = useToast();
  const now = new Date();
  const formRef = useRef<HTMLDivElement>(null);
  const incomeFormRef = useRef<HTMLDivElement>(null);

  // Auth & access
  const [accessLoading, setAccessLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  // Period
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // Core data
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<{ value: string; label: string }[]>([]);

  // Enterprise features
  const [projection, setProjection] = useState<any>(null);
  const [goalProgress, setGoalProgress] = useState<any>(null);
  const [budgetVsActual, setBudgetVsActual] = useState<any[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<any[]>([]);

  // Expense form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState('SALARY');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formRecurring, setFormRecurring] = useState(false);
  const [saving, setSaving] = useState(false);

  // Income form
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [incomeFormCategory, setIncomeFormCategory] = useState('FREELANCE');
  const [incomeFormDescription, setIncomeFormDescription] = useState('');
  const [incomeFormAmount, setIncomeFormAmount] = useState('');
  const [incomeFormRecurring, setIncomeFormRecurring] = useState(false);
  const [savingIncome, setSavingIncome] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);

  // Config section
  const [showConfig, setShowConfig] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('SALARY');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [alertCategory, setAlertCategory] = useState('TOTAL');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  // Config display
  const [budgets, setBudgets] = useState<any[]>([]);
  const [currentGoal, setCurrentGoal] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  const api = useMemo(
    () => (session?.accessToken ? createApiClient(session.accessToken as string) : null),
    [session?.accessToken],
  );

  useEffect(() => {
    if (!api) return;
    api.getSubscription().then((sub) => {
      const features = (sub.plan as any).features || [];
      const parsed: string[] = typeof features === 'string' ? JSON.parse(features) : features;
      setCanAccess(hasFinanceAccess(parsed));
      setAccessLoading(false);
    }).catch(() => setAccessLoading(false));
  }, [api]);

  const monthLabel = new Date(year, month - 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [sum, comp, exp, inc, cats, incCats, proj, gp, bva, alertCheck, budgetList, goal, alertList] = await Promise.all([
        rangeMode && rangeStart && rangeEnd
          ? api.getFinanceSummaryByRange(rangeStart, rangeEnd).catch(() => null)
          : api.getFinanceSummary(month, year).catch(() => null),
        api.getFinanceComparison(6).catch(() => null),
        api.getExpenses(month, year).catch(() => []),
        api.getIncomes(month, year).catch(() => []),
        api.getFinanceCategories().catch(() => []),
        api.getIncomeCategories().catch(() => []),
        api.getFinanceProjection(3).catch(() => null),
        api.getGoalProgress(month, year).catch(() => null),
        api.getBudgetVsActual(month, year).catch(() => []),
        api.checkAlerts(month, year).catch(() => []),
        api.getBudgets(month, year).catch(() => []),
        api.getRevenueGoal(month, year).catch(() => null),
        api.getExpenseAlerts().catch(() => []),
      ]);
      setSummary(sum);
      setComparison(comp);
      setExpenses(exp || []);
      setIncomes(inc || []);
      setCategories(cats || []);
      setIncomeCategories(incCats || []);
      setProjection(proj);
      setGoalProgress(gp);
      setBudgetVsActual(bva || []);
      setTriggeredAlerts((alertCheck || []).filter((a: any) => a.triggered));
      setBudgets(budgetList || []);
      setCurrentGoal(goal);
      setAlerts(alertList || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [api, month, year, rangeMode, rangeStart, rangeEnd]);

  useEffect(() => {
    if (canAccess) loadData();
  }, [canAccess, loadData]);

  const navigateMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  // Expense form handlers
  const resetForm = () => {
    setFormCategory('SALARY'); setFormDescription(''); setFormAmount('');
    setFormRecurring(false); setEditingId(null); setShowForm(false);
  };

  const handleSave = async () => {
    if (!api || !formAmount || Number(formAmount) <= 0) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateExpense(editingId, {
          category: formCategory, description: formDescription || undefined,
          amount: Number(formAmount), isRecurring: formRecurring,
        });
        toast({ title: 'Gasto actualizado' });
      } else {
        await api.createExpense({
          category: formCategory, description: formDescription || undefined,
          amount: Number(formAmount), isRecurring: formRecurring, month, year,
        });
        toast({ title: 'Gasto registrado' });
      }
      resetForm();
      loadData();
    } catch (error) { handleApiError(error); } finally { setSaving(false); }
  };

  const confirmDelete = async (id: string) => {
    if (!api) return;
    try {
      await api.deleteExpense(id);
      toast({ title: 'Gasto eliminado' });
      setDeletingId(null);
      loadData();
    } catch (error) { handleApiError(error); }
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setFormCategory(expense.category);
    setFormDescription(expense.description || '');
    setFormAmount(String(Number(expense.amount)));
    setFormRecurring(expense.isRecurring);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  // Income form handlers
  const resetIncomeForm = () => {
    setIncomeFormCategory('FREELANCE'); setIncomeFormDescription(''); setIncomeFormAmount('');
    setIncomeFormRecurring(false); setEditingIncomeId(null); setShowIncomeForm(false);
  };

  const handleSaveIncome = async () => {
    if (!api || !incomeFormAmount || Number(incomeFormAmount) <= 0) return;
    setSavingIncome(true);
    try {
      if (editingIncomeId) {
        await api.updateIncome(editingIncomeId, {
          category: incomeFormCategory, description: incomeFormDescription || undefined,
          amount: Number(incomeFormAmount), isRecurring: incomeFormRecurring,
        });
        toast({ title: 'Ingreso actualizado' });
      } else {
        await api.createIncome({
          category: incomeFormCategory, description: incomeFormDescription || undefined,
          amount: Number(incomeFormAmount), isRecurring: incomeFormRecurring, month, year,
        });
        toast({ title: 'Ingreso registrado' });
      }
      resetIncomeForm();
      loadData();
    } catch (error) { handleApiError(error); } finally { setSavingIncome(false); }
  };

  const handleEditIncome = (income: any) => {
    setEditingIncomeId(income.id);
    setIncomeFormCategory(income.category);
    setIncomeFormDescription(income.description || '');
    setIncomeFormAmount(String(Number(income.amount)));
    setIncomeFormRecurring(income.isRecurring);
    setShowIncomeForm(true);
    setTimeout(() => incomeFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const confirmDeleteIncome = async (id: string) => {
    if (!api) return;
    try {
      await api.deleteIncome(id);
      toast({ title: 'Ingreso eliminado' });
      setDeletingIncomeId(null);
      loadData();
    } catch (error) { handleApiError(error); }
  };

  const handleCopyRecurring = async () => {
    if (!api) return;
    try {
      const result = await api.copyRecurringExpenses(month, year);
      if (result.created > 0) {
        toast({ title: `${result.created} registros recurrentes copiados` });
        loadData();
      } else {
        toast({ title: 'Los recurrentes ya están registrados este mes' });
      }
    } catch (error) { handleApiError(error); }
  };

  // Config handlers
  const handleSaveBudget = async () => {
    if (!api || !budgetAmount || Number(budgetAmount) <= 0) return;
    setSavingConfig(true);
    try {
      await api.setBudget({ category: budgetCategory, amount: Number(budgetAmount), month, year });
      toast({ title: 'Presupuesto guardado' });
      setBudgetAmount('');
      loadData();
    } catch (error) { handleApiError(error); } finally { setSavingConfig(false); }
  };

  const handleSaveGoal = async () => {
    if (!api || !goalAmount || Number(goalAmount) <= 0) return;
    setSavingConfig(true);
    try {
      await api.setRevenueGoal({ amount: Number(goalAmount), month, year });
      toast({ title: 'Meta guardada' });
      setGoalAmount('');
      loadData();
    } catch (error) { handleApiError(error); } finally { setSavingConfig(false); }
  };

  const handleSaveAlert = async () => {
    if (!api || !alertThreshold || Number(alertThreshold) <= 0) return;
    setSavingConfig(true);
    try {
      await api.setExpenseAlert({ category: alertCategory, threshold: Number(alertThreshold) });
      toast({ title: 'Alerta guardada' });
      setAlertThreshold('');
      loadData();
    } catch (error) { handleApiError(error); } finally { setSavingConfig(false); }
  };

  if (accessLoading) return <FinanceSkeleton />;

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <FinanceHeader />
        <UpgradeWall
          title="Módulo de Finanzas"
          description="Controlá ingresos, egresos y ganancia neta de tu negocio. Disponible desde el plan Profesional."
          planName="Profesional"
          previewLabels={['Ingresos', 'Egresos', 'Ganancia neta', 'Ticket promedio']}
        />
      </div>
    );
  }

  if (loading) return <FinanceSkeleton />;

  const profit = summary?.profit ?? 0;
  const isPositive = profit >= 0;
  const totalTransactions = isGastro
    ? (summary?.income?.manualCount ?? 0)
    : (summary?.income?.bookingCount ?? 0) + (summary?.income?.orderCount ?? 0);
  const avgTicket = totalTransactions > 0 ? Math.round(summary.income.total / totalTransactions) : 0;

  // Previous month comparison
  const prevMonth = comparison?.months?.length >= 2
    ? comparison.months[comparison.months.length - 2]
    : null;
  const currMonthComp = comparison?.months?.length >= 1
    ? comparison.months[comparison.months.length - 1]
    : null;

  const incomeDelta = prevMonth && prevMonth.income > 0
    ? Math.round(((currMonthComp?.income - prevMonth.income) / prevMonth.income) * 100)
    : null;
  const expenseDelta = prevMonth && prevMonth.expenses > 0
    ? Math.round(((currMonthComp?.expenses - prevMonth.expenses) / prevMonth.expenses) * 100)
    : null;

  return (
    <div className="space-y-6">
      <FinanceHeader />

      {/* Alert banners */}
      {triggeredAlerts.length > 0 && (
        <div className="space-y-2">
          {triggeredAlerts.map((alert: any) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border text-sm',
                alert.percentUsed >= 120
                  ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
                  : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300',
              )}
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                <span className="font-semibold">{CATEGORY_LABELS[alert.category] || alert.category}</span>
                {' '}alcanzó {formatCurrency(alert.actual)} de {formatCurrency(alert.threshold)} ({alert.percentUsed}%)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Period selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {!rangeMode ? (
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold capitalize min-w-[120px] sm:min-w-[140px] text-center px-1">
                {monthLabel}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <CalendarRange className="h-4 w-4" />
              <span>Rango personalizado</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant={rangeMode ? 'secondary' : 'outline'}
              size="sm"
              className="h-8 gap-1.5 flex-shrink-0 text-xs"
              onClick={() => {
                if (rangeMode) {
                  setRangeMode(false); setRangeStart(''); setRangeEnd('');
                } else {
                  const start = new Date(year, month - 1, 1);
                  const end = new Date(year, month, 0);
                  setRangeStart(start.toISOString().split('T')[0]);
                  setRangeEnd(end.toISOString().split('T')[0]);
                  setRangeMode(true);
                }
              }}
            >
              {rangeMode ? <X className="h-3.5 w-3.5" /> : <CalendarRange className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{rangeMode ? 'Cerrar' : 'Rango'}</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleCopyRecurring}>
              <Repeat className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Copiar recurrentes</span>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" className="h-8 text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Registrar</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1.5" align="end" sideOffset={6}>
                <button
                  onClick={() => { resetIncomeForm(); setShowIncomeForm(true); setTimeout(() => incomeFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors text-left"
                >
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-400">Ingreso</span>
                </button>
                <button
                  onClick={() => { resetForm(); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                >
                  <div className="h-7 w-7 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-red-700 dark:text-red-400">Gasto</span>
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {rangeMode && (
          <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Desde</label>
                  <input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)}
                    className="w-full rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Hasta</label>
                  <input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)}
                    className="w-full rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none" />
                </div>
              </div>
              {summary?.period?.label && (
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <CalendarRange className="h-3 w-3 flex-shrink-0" />
                  Período: <span className="font-medium text-foreground">{summary.period.label}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* KPI Cards — gradient style matching dashboard */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Income */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Ingresos</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(summary?.income?.total ?? 0)}</div>
            <div className="text-xs text-white/70 mt-1 space-y-0.5">
              {isGastro ? (
                <>
                  {(summary?.income?.manual ?? 0) > 0 && <p>Salón: {formatCurrency(summary.income.manual)}</p>}
                </>
              ) : (
                <>
                  {(summary?.income?.bookings ?? 0) > 0 && <p>Servicios: {formatCurrency(summary.income.bookings)}</p>}
                  {(summary?.income?.orders ?? 0) > 0 && <p>Productos: {formatCurrency(summary.income.orders)}</p>}
                  {(summary?.income?.manual ?? 0) > 0 && <p>Manual: {formatCurrency(summary.income.manual)}</p>}
                </>
              )}
              {incomeDelta !== null && (
                <p className="font-medium text-white/90">{incomeDelta >= 0 ? '+' : ''}{incomeDelta}% vs mes anterior</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Egresos</CardTitle>
            <ArrowDownRight className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(summary?.expenses?.total ?? 0)}</div>
            <p className="text-xs text-white/70 mt-1">
              {expenses.length} gastos registrados
              {expenseDelta !== null && (
                <span className="ml-1 font-medium text-white/90">({expenseDelta >= 0 ? '+' : ''}{expenseDelta}%)</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Profit */}
        <Card className={cn(
          'border-0 shadow-md text-white overflow-hidden relative',
          isPositive ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-amber-500 to-orange-500',
        )}>
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Ganancia neta</CardTitle>
            {isPositive ? <TrendingUp className="h-5 w-5 text-white/80" /> : <TrendingDown className="h-5 w-5 text-white/80" />}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(profit)}</div>
            <p className="text-xs text-white/70 mt-1">Margen: {summary?.profitMargin ?? 0}%</p>
          </CardContent>
        </Card>

        {/* Average ticket */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Ticket promedio</CardTitle>
            <Wallet className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(avgTicket)}</div>
            <p className="text-xs text-white/70 mt-1">{totalTransactions} {isGastro ? 'mesas' : 'transacciones'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue goal progress */}
      {goalProgress && (
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Meta de facturación</CardTitle>
            </div>
            <Badge className={cn('border-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
              goalProgress.percentAchieved >= 100
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                : goalProgress.percentAchieved >= 50
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            )}>
              {goalProgress.percentAchieved}%
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{formatCurrency(goalProgress.actual)} de {formatCurrency(goalProgress.goal)}</span>
              <span className="font-medium">
                {goalProgress.remaining > 0 ? `Faltan ${formatCurrency(goalProgress.remaining)}` : 'Meta alcanzada'}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700',
                  goalProgress.percentAchieved >= 100
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : goalProgress.percentAchieved >= 50
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-400 to-blue-500',
                )}
                style={{ width: `${Math.min(goalProgress.percentAchieved, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income breakdown: by service + by product — only show cards relevant to the business */}
      {(() => {
        const hasServices = (summary?.income?.byService?.length ?? 0) > 0;
        const hasProducts = (summary?.income?.byProduct?.length ?? 0) > 0;
        // Show service card if: has data OR rubro is NOT mercado AND NOT gastro (services-based business)
        const showServiceCard = !isGastro && (hasServices || !isMercado);
        // Show product card if: has data OR rubro IS mercado (product-based business), hide for gastro
        const showProductCard = !isGastro && (hasProducts || isMercado);
        const singleColumn = (showServiceCard && !showProductCard) || (!showServiceCard && showProductCard);

        return (
          <div className={cn('grid gap-6', singleColumn ? 'lg:grid-cols-1' : 'lg:grid-cols-2')}>
            {showServiceCard && (
              <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-base">Ingresos por servicio</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {hasServices ? (
                    <div className="space-y-3">
                      {summary.income.byService.map((svc: any) => {
                        const pct = summary.income.total > 0 ? Math.round((svc.total / summary.income.total) * 100) : 0;
                        return (
                          <div key={svc.service}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium truncate mr-2">{svc.service}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-muted-foreground">{svc.count}</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(svc.total)}</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-2">
                        <Briefcase className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">Sin ingresos por servicio este período</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showProductCard && (
              <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-base">Ingresos por producto</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {hasProducts ? (
                    <div className="space-y-3">
                      {summary.income.byProduct.map((prod: any) => {
                        const pct = (summary?.income?.orders ?? 0) > 0 ? Math.round((prod.total / summary.income.orders) * 100) : 0;
                        return (
                          <div key={prod.product}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium truncate mr-2">{prod.product}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-muted-foreground">{prod.count} uds</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(prod.total)}</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-2">
                        <ShoppingBag className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">Sin ventas de productos este período</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );
      })()}

      {/* By employee */}
      {(summary?.income?.byEmployee?.length ?? 0) > 0 && (
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-base">{isMercado ? 'Rendimiento por vendedor' : 'Rendimiento por empleado'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {summary.income.byEmployee.map((emp: any, idx: number) => {
                const maxCount = summary.income.byEmployee[0]?.count || 1;
                const pct = Math.round((emp.count / maxCount) * 100);
                return (
                  <div key={emp.employee}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn(
                          'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                          idx === 0 ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white' : 'bg-muted text-muted-foreground',
                        )}>
                          {idx + 1}
                        </div>
                        <span className="font-medium truncate">{emp.employee}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{emp.count}</span>
                        <span className="font-semibold">{formatCurrency(emp.total)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual income by category */}
      {(summary?.income?.byIncomeCategory?.length ?? 0) > 0 && (
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-base">{isGastro ? 'Ingresos por categoría' : 'Otros ingresos por categoría'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {summary.income.byIncomeCategory.map((cat: any) => {
                const pct = summary.income.manual > 0 ? Math.round((cat.total / summary.income.manual) * 100) : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span className="text-base">{INCOME_CATEGORY_ICONS[cat.category] || '💰'}</span>
                        <span className="font-medium">{INCOME_CATEGORY_LABELS[cat.category] || cat.category}</span>
                        <span className="text-muted-foreground text-xs">({cat.count})</span>
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense breakdown + Budget vs Actual */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-base">Desglose de egresos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {(summary?.expenses?.byCategory?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {summary.expenses.byCategory.map((cat: any) => {
                  const pct = summary.expenses.total > 0 ? Math.round((cat.total / summary.expenses.total) * 100) : 0;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className="text-base">{CATEGORY_ICONS[cat.category] || '📌'}</span>
                          <span className="font-medium">{CATEGORY_LABELS[cat.category] || cat.category}</span>
                          <span className="text-muted-foreground text-xs">({cat.count})</span>
                        </span>
                        <span className="font-semibold">{formatCurrency(cat.total)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-2">
                  <Receipt className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm text-muted-foreground">Sin gastos registrados</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Presupuesto vs Real</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {budgetVsActual.length > 0 ? (
              <div className="space-y-3">
                {budgetVsActual.map((bva: any) => {
                  const exceeded = bva.percentUsed > 100;
                  return (
                    <div key={bva.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className="text-base">{CATEGORY_ICONS[bva.category] || '📌'}</span>
                          <span className="font-medium">{CATEGORY_LABELS[bva.category] || bva.category}</span>
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={exceeded ? 'font-bold text-red-600 dark:text-red-400' : 'text-muted-foreground'}>
                            {formatCurrency(bva.actual)}
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground">{formatCurrency(bva.budget)}</span>
                          <Badge className={cn('border-0 rounded-full px-2 py-0 text-[10px] font-semibold',
                            exceeded ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
                          )}>
                            {bva.percentUsed}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500',
                            exceeded ? 'bg-red-500' : bva.percentUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500',
                          )}
                          style={{ width: `${Math.min(bva.percentUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm text-muted-foreground">Sin presupuestos configurados</p>
                <Button variant="link" size="sm" className="mt-1 text-primary" onClick={() => setShowConfig(true)}>
                  Configurar presupuestos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly evolution + Projection */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Evolución mensual</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {comparison?.months?.length > 0 ? (
              <div className="space-y-2">
                {comparison.months.map((m: any) => {
                  const maxVal = Math.max(...comparison.months.map((x: any) => Math.max(x.income, x.expenses)), 1);
                  const incPct = Math.round((m.income / maxVal) * 100);
                  const expPct = Math.round((m.expenses / maxVal) * 100);
                  return (
                    <div key={`${m.year}-${m.month}`}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium capitalize w-20">{m.label}</span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(m.income)}</span>
                          <span className="text-red-500 dark:text-red-400">{formatCurrency(m.expenses)}</span>
                          <span className={cn('font-semibold min-w-[70px] text-right', m.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                            {formatCurrency(m.profit)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className="bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${incPct}%` }} />
                        <div className="bg-red-400 rounded-full transition-all duration-500" style={{ width: `${expPct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-4 pt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Ingresos</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Egresos</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm text-muted-foreground">Sin datos para evolución</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-base">Proyección financiera</CardTitle>
            </div>
            <Badge className="border-0 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
              3 meses
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {projection?.projected?.length > 0 ? (
              <div className="space-y-2">
                {projection.projected.map((m: any) => {
                  const maxVal = Math.max(
                    ...projection.projected.map((x: any) => Math.max(x.income, x.expenses)),
                    ...(projection.historical?.slice(-2) || []).map((x: any) => Math.max(x.income, x.expenses)),
                    1,
                  );
                  const incPct = Math.round((m.income / maxVal) * 100);
                  const expPct = Math.round((m.expenses / maxVal) * 100);
                  return (
                    <div key={`proj-${m.year}-${m.month}`}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium capitalize w-20 text-violet-600 dark:text-violet-400">{m.label}</span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-emerald-600/70 dark:text-emerald-400/70">{formatCurrency(m.income)}</span>
                          <span className="text-red-500/70 dark:text-red-400/70">{formatCurrency(m.expenses)}</span>
                          <span className={cn('font-semibold min-w-[70px] text-right', m.profit >= 0 ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-red-600/70 dark:text-red-400/70')}>
                            {formatCurrency(m.profit)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className="bg-emerald-500/40 rounded-full transition-all duration-500 border border-dashed border-emerald-400/50" style={{ width: `${incPct}%` }} />
                        <div className="bg-red-400/40 rounded-full transition-all duration-500 border border-dashed border-red-300/50" style={{ width: `${expPct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-4 pt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500 border border-dashed border-violet-400" /> Proyectado</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm text-muted-foreground">Se necesitan al menos 2 meses de datos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income form */}
      {showIncomeForm && (
        <Card ref={incomeFormRef} className="border border-emerald-200 dark:border-emerald-800/50 shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <CardHeader className="border-b bg-emerald-50/50 dark:bg-emerald-900/20">
            <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">
              {editingIncomeId ? 'Editar ingreso' : 'Nuevo ingreso'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium">Categoría</label>
                <select value={incomeFormCategory} onChange={(e) => setIncomeFormCategory(e.target.value)}
                  className="w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm">
                  {(incomeCategories.length > 0 ? incomeCategories : Object.entries(INCOME_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))).map((cat) => (
                    <option key={cat.value} value={cat.value}>{INCOME_CATEGORY_ICONS[cat.value] || ''} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <input type="text" value={incomeFormDescription} onChange={(e) => setIncomeFormDescription(e.target.value)}
                  placeholder="Ej: Honorarios marzo" className="w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Monto ($)</label>
                <input type="number" value={incomeFormAmount} onChange={(e) => setIncomeFormAmount(e.target.value)}
                  placeholder="0" min="0" step="100" className="w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm" />
              </div>
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={incomeFormRecurring} onChange={(e) => setIncomeFormRecurring(e.target.checked)} className="rounded" />
                  <Repeat className="h-3 w-3" /> Recurrente mensual
                </label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveIncome} disabled={savingIncome || !incomeFormAmount}>
                    {savingIncome ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    {editingIncomeId ? 'Guardar' : 'Agregar'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={resetIncomeForm}>Cancelar</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense form */}
      {showForm && (
        <Card ref={formRef} className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <CardTitle className="text-base">{editingId ? 'Editar gasto' : 'Nuevo gasto'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium">Categoría</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm">
                  {(categories.length > 0 ? categories : Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))).filter(c => c.value !== 'TOTAL').map((cat) => (
                    <option key={cat.value} value={cat.value}>{CATEGORY_ICONS[cat.value] || ''} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ej: Alquiler local" className="w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Monto ($)</label>
                <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0" min="0" step="100" className="w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm" />
              </div>
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={formRecurring} onChange={(e) => setFormRecurring(e.target.checked)} className="rounded" />
                  <Repeat className="h-3 w-3" /> Recurrente mensual
                </label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving || !formAmount}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    {editingId ? 'Guardar' : 'Agregar'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={resetForm}>Cancelar</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction lists: Incomes + Expenses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incomes list */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-base">Ingresos manuales</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">{incomes.length}</span>
          </CardHeader>
          <CardContent className="p-0">
            {incomes.length > 0 ? (
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {incomes.map((income) => (
                  <div key={income.id} className={cn(
                    'flex items-center justify-between p-4 group hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors',
                    deletingIncomeId === income.id && 'bg-red-50 dark:bg-red-900/20',
                  )}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{INCOME_CATEGORY_ICONS[income.category] || '💰'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{INCOME_CATEGORY_LABELS[income.category] || income.category}</span>
                          {income.isRecurring && (
                            <Badge className="border-0 rounded-full px-2 py-0 text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              <Repeat className="h-2.5 w-2.5 mr-0.5" /> Rec.
                            </Badge>
                          )}
                        </div>
                        {income.description && <p className="text-xs text-muted-foreground truncate">{income.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(Number(income.amount))}</span>
                      {deletingIncomeId === income.id ? (
                        <div className="flex gap-1.5">
                          <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => confirmDeleteIncome(income.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setDeletingIncomeId(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditIncome(income)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => setDeletingIncomeId(income.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                  <ArrowUpRight className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm text-muted-foreground">Sin ingresos manuales este mes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses list */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-neutral-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-base">Gastos del mes</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">{expenses.length}</span>
          </CardHeader>
          <CardContent className="p-0">
            {expenses.length > 0 ? (
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {expenses.map((expense) => (
                  <div key={expense.id} className={cn(
                    'flex items-center justify-between p-4 group hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors',
                    deletingId === expense.id && 'bg-red-50 dark:bg-red-900/20',
                  )}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{CATEGORY_ICONS[expense.category] || '📌'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{CATEGORY_LABELS[expense.category] || expense.category}</span>
                          {expense.isRecurring && (
                            <Badge className="border-0 rounded-full px-2 py-0 text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              <Repeat className="h-2.5 w-2.5 mr-0.5" /> Rec.
                            </Badge>
                          )}
                        </div>
                        {expense.description && <p className="text-xs text-muted-foreground truncate">{expense.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">-{formatCurrency(Number(expense.amount))}</span>
                      {deletingId === expense.id ? (
                        <div className="flex gap-1.5">
                          <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => confirmDelete(expense.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setDeletingId(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(expense)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => setDeletingId(expense.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-3">
                  <DollarSign className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm text-muted-foreground">Sin gastos registrados este mes</p>
                <Button variant="link" size="sm" className="mt-1" onClick={() => { setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}>
                  Agregar primer gasto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration section */}
      <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm overflow-hidden">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-500/10 dark:bg-slate-500/20 flex items-center justify-center">
              <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="font-semibold">Configuración financiera</span>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', showConfig && 'rotate-180')} />
        </button>

        {showConfig && (
          <div className="px-4 sm:px-6 pb-6 space-y-6 border-t">
            {/* Budget config */}
            <div className="pt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Presupuestos mensuales</h4>
              {budgets.length > 0 && (
                <div className="space-y-2 mb-3">
                  {budgets.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-neutral-700/50 rounded-lg px-3 py-2">
                      <span>{CATEGORY_ICONS[b.category] || '📌'} {CATEGORY_LABELS[b.category] || b.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(Number(b.amount))}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={async () => {
                          if (!api) return;
                          await api.deleteBudget(b.id);
                          toast({ title: 'Presupuesto eliminado' });
                          loadData();
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm">
                    {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== 'TOTAL').map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Monto" min="0" step="100" className="w-full h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm" />
                </div>
                <Button size="sm" onClick={handleSaveBudget} disabled={savingConfig || !budgetAmount}>Agregar</Button>
              </div>
            </div>

            {/* Goal config */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Meta de facturación</h4>
              {currentGoal && (
                <div className="flex items-center justify-between text-sm bg-slate-50 dark:bg-neutral-700/50 rounded-lg px-3 py-2 mb-3">
                  <span>Meta actual: <span className="font-semibold">{formatCurrency(Number(currentGoal.amount))}</span></span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={async () => {
                    if (!api) return;
                    await api.deleteRevenueGoal(currentGoal.id);
                    toast({ title: 'Meta eliminada' });
                    loadData();
                  }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="Meta de facturación mensual ($)" min="0" step="1000" className="w-full h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm" />
                </div>
                <Button size="sm" onClick={handleSaveGoal} disabled={savingConfig || !goalAmount}>
                  {currentGoal ? 'Actualizar' : 'Establecer'}
                </Button>
              </div>
            </div>

            {/* Alert config */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Alertas de gastos</h4>
              {alerts.length > 0 && (
                <div className="space-y-2 mb-3">
                  {alerts.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-neutral-700/50 rounded-lg px-3 py-2">
                      <span>{CATEGORY_LABELS[a.category] || a.category}: alerta a {formatCurrency(Number(a.threshold))}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={async () => {
                        if (!api) return;
                        await api.deleteExpenseAlert(a.id);
                        toast({ title: 'Alerta eliminada' });
                        loadData();
                      }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <select value={alertCategory} onChange={(e) => setAlertCategory(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm">
                    <option value="TOTAL">Total general</option>
                    {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== 'TOTAL').map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <input type="number" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)}
                    placeholder="Límite" min="0" step="100" className="w-full h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm" />
                </div>
                <Button size="sm" onClick={handleSaveAlert} disabled={savingConfig || !alertThreshold}>Agregar</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ============ HEADER ============

function FinanceHeader() {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-teal-600 p-4 sm:p-6 text-white shadow-lg">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute -top-24 -right-24 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-12 -left-12 w-28 sm:w-36 h-28 sm:h-36 bg-white/10 rounded-full blur-xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-medium text-white/80">Módulo de finanzas</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Finanzas</h1>
        <p className="mt-1 text-white/80 text-sm sm:text-base">
          Control de ingresos, egresos, presupuestos y proyecciones
        </p>
      </div>
    </div>
  );
}

