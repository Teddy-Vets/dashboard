import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, PieChart as PieIcon, BarChart2, Calendar } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const PLAN_LABELS = {
  teddy_basic: "טדי בייסיק",
  teddy_plus: "טדי פלוס",
  teddy_platinum: "טדי פלטינום",
  teddy_royal: "טדי רויאל",
  teddy_insured: "טדי בטוח",
};

const PLAN_MONTHLY_PRICE = {
  teddy_basic: 89,
  teddy_plus: 129,
  teddy_platinum: 169,
  teddy_royal: 79,
  teddy_insured: 79,
};

const PLAN_ANNUAL_PRICE = {
  teddy_basic: 82,
  teddy_plus: 118,
  teddy_platinum: 155,
  teddy_royal: 72,
  teddy_insured: 72,
};

const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

const HEBREW_MONTHS = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"];

export default function Reports() {
  const [agreements, setAgreements] = useState([]);
  const [clients, setClients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [agreementsRes, clientsRes, clinicsRes] = await Promise.all([
      base44.entities.SubscriptionAgreement.list("-created_date", 500),
      base44.entities.Client.list("-created_date", 500),
      base44.entities.Clinic.list(),
    ]);
    setAgreements(agreementsRes || []);
    setClients(clientsRes || []);
    setClinics(clinicsRes || []);
    setIsLoading(false);
  };

  // --- Monthly Revenue (last 12 months) ---
  const monthlyRevenue = (() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: HEBREW_MONTHS[d.getMonth()] });
    }
    return months.map(({ year, month, label }) => {
      const signed = agreements.filter(a => {
        if (!a.signed_at) return false;
        const d = new Date(a.signed_at);
        return d.getFullYear() === year && d.getMonth() === month && a.status === 'legally_sealed';
      });
      const revenue = signed.reduce((sum, a) => {
        const price = a.payment_frequency === 'annual'
          ? (PLAN_ANNUAL_PRICE[a.selected_plan] || 0) * 12
          : (PLAN_MONTHLY_PRICE[a.selected_plan] || 0);
        return sum + price;
      }, 0);
      return { name: label, הכנסות: revenue, מנויים: signed.length };
    });
  })();

  // --- Plans Distribution ---
  const planDistribution = Object.entries(PLAN_LABELS).map(([key, label]) => ({
    name: label,
    value: agreements.filter(a => a.selected_plan === key).length,
  })).filter(p => p.value > 0);

  // --- New Clients per Month (last 12 months) ---
  const newClientsPerMonth = (() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: HEBREW_MONTHS[d.getMonth()] });
    }
    return months.map(({ year, month, label }) => {
      const count = clients.filter(c => {
        const d = new Date(c.created_date);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;
      return { name: label, "לקוחות חדשים": count };
    });
  })();

  // --- Subscriptions per Clinic ---
  const perClinic = clinics.map(c => ({
    name: c.name,
    מנויים: agreements.filter(a => a.clinic_id === c.id).length,
  })).filter(c => c.מנויים > 0);

  // --- Summary stats ---
  const totalRevenue = agreements
    .filter(a => a.status === 'legally_sealed')
    .reduce((sum, a) => {
      const price = a.payment_frequency === 'annual'
        ? (PLAN_ANNUAL_PRICE[a.selected_plan] || 0) * 12
        : (PLAN_MONTHLY_PRICE[a.selected_plan] || 0);
      return sum + price;
    }, 0);

  const activeAgreements = agreements.filter(a => a.status === 'legally_sealed').length;
  const thisMonthClients = clients.filter(c => {
    const d = new Date(c.created_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">דוחות וניתוח</h1>
          <p className="text-slate-500 text-sm">נתונים עדכניים על הכנסות, מנויים וצמיחה</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">סה"כ הכנסות ממנויים פעילים</p>
                <p className="text-2xl font-bold text-slate-800">₪{totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">מנויים פעילים (חתומים)</p>
                <p className="text-2xl font-bold text-slate-800">{activeAgreements}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">לקוחות חדשים החודש</p>
                <p className="text-2xl font-bold text-slate-800">{thisMonthClients}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Chart */}
        <Card className="bg-white shadow-md mb-6">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <BarChart2 className="w-5 h-5 text-green-500" />
              הכנסות חודשיות ממנויים (12 חודשים אחרונים)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₪${v.toLocaleString()}`} />
                <Tooltip formatter={(v) => [`₪${v.toLocaleString()}`, 'הכנסות']} />
                <Bar dataKey="הכנסות" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plans Distribution + Per Clinic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white shadow-md">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <PieIcon className="w-5 h-5 text-purple-500" />
                התפלגות מנויים לפי מסלול
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              {planDistribution.length === 0 ? (
                <p className="text-center text-slate-400 py-12">אין נתונים להצגה</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={planDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {planDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                מנויים לפי מרפאה
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              {perClinic.length === 0 ? (
                <p className="text-center text-slate-400 py-12">אין נתונים להצגה</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={perClinic} layout="vertical" margin={{ right: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="מנויים" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* New Clients Growth */}
        <Card className="bg-white shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              קצב צמיחה – לקוחות חדשים (12 חודשים אחרונים)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-6">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={newClientsPerMonth} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="לקוחות חדשים" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}