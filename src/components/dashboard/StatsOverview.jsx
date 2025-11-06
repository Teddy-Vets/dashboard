import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, PawPrint, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, color, isLoading, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
  >
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 ${color} rounded-full opacity-10`} />
      <CardHeader className="pb-3 relative">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium text-slate-600 mb-2">
              {title}
            </CardTitle>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-slate-800">
                {value}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardHeader>
    </Card>
  </motion.div>
);

export default function StatsOverview({ stats, isLoading }) {
  const statCards = [
    {
      title: "סה״כ טפסים",
      value: stats.totalForms,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      title: "טפסים היום",
      value: stats.todayForms,
      icon: Clock,
      color: "bg-green-500",
    },
    {
      title: "ממתינים לטיפול",
      value: stats.pendingForms,
      icon: AlertCircle,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          isLoading={isLoading}
          delay={index}
        />
      ))}
    </div>
  );
}