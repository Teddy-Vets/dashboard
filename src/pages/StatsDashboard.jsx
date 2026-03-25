import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, PawPrint, ClipboardList } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function StatsDashboard() {
  const [intakeForms, setIntakeForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      let forms;
      if (currentUser?.role === 'admin') {
        forms = await base44.entities.IntakeForm.list('-created_date', 500);
      } else {
        forms = await base44.entities.IntakeForm.filter(
          { clinic_id: currentUser?.clinic_id },
          '-created_date',
          500
        );
      }
      setIntakeForms(forms || []);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // גרף 1: לקוחות חדשים לפי חודש (6 חודשים אחרונים)
  const getNewClientsPerMonth = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const count = intakeForms.filter(f => {
        const created = new Date(f.created_date);
        return created >= start && created <= end;
      }).length;
      months.push({
        name: format(date, 'MM/yy'),
        טפסים: count,
      });
    }
    return months;
  };

  // גרף 2: תפוצת סוגי חיות המחמד
  const getPetTypeDistribution = () => {
    const counts = {};
    intakeForms.forEach(f => {
      const type = f.pet_type || 'לא צוין';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // גרף 3: סיבות ביקור נפוצות
  const getTopVisitReasons = () => {
    const counts = {};
    intakeForms.forEach(f => {
      if (f.visit_reason_main) {
        // פיצול אם יש פסיקים
        const reasons = f.visit_reason_main.split(',').map(r => r.trim());
        reasons.forEach(r => {
          if (r) counts[r] = (counts[r] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, fullName: name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-800">{payload[0]?.payload?.fullName || label}</p>
          <p className="text-blue-600">{payload[0]?.value} טפסים</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-blue-600">{payload[0].value} ({((payload[0].value / intakeForms.length) * 100).toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const newClientsData = getNewClientsPerMonth();
  const petTypeData = getPetTypeDistribution();
  const visitReasonsData = getTopVisitReasons();
  const totalForms = intakeForms.length;
  const thisMonthForms = newClientsData[newClientsData.length - 1]?.טפסים || 0;

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen" dir="rtl">
      <div className="max-w-6xl mx-auto">

        {/* כותרת */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">סטטיסטיקות</h1>
          <p className="text-slate-500 mt-1">ניתוח נתוני טפסי ההיכרות של המרפאה</p>
        </div>

        {/* כרטיסי סיכום */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border-blue-100">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">סה"כ טפסים</p>
              <p className="text-3xl font-bold text-blue-600">{totalForms}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-green-100">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">החודש</p>
              <p className="text-3xl font-bold text-green-600">{thisMonthForms}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-purple-100 col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">סוגי חיות שונות</p>
              <p className="text-3xl font-bold text-purple-600">{petTypeData.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* גרף 1: לקוחות חדשים לפי חודש */}
        <Card className="mb-6 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              לקוחות חדשים לפי חודש (6 חודשים אחרונים)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={newClientsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="טפסים" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* גרפים 2+3 בשורה */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* גרף 2: תפוצת סוגי חיות */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <PawPrint className="w-5 h-5 text-green-500" />
                תפוצת סוגי חיות המחמד
              </CardTitle>
            </CardHeader>
            <CardContent>
              {petTypeData.length === 0 ? (
                <p className="text-center text-slate-400 py-12">אין נתונים להצגה</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={petTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {petTypeData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* גרף 3: סיבות ביקור נפוצות */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <ClipboardList className="w-5 h-5 text-purple-500" />
                סיבות ביקור נפוצות
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visitReasonsData.length === 0 ? (
                <p className="text-center text-slate-400 py-12">אין נתונים להצגה</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={visitReasonsData}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}