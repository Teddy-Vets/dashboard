
import React, { useState, useEffect } from "react";
import { AnxietyQuestionnaire } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, PawPrint, User, Calendar, CheckCircle, Download, Send } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";

import { getEntityById } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import PageHeader from "@/components/common/PageHeader";

import { generateAnxietyQuestionnairePDF } from "@/functions/generateAnxietyQuestionnairePDF";

const getAnxietyLevel = (score) => {
  if (!score) return { label: "לא מחושב", color: "bg-gray-100 text-gray-800" };
  if (score <= 3) return { label: "נמוכה", color: "bg-green-100 text-green-800" };
  if (score <= 6) return { label: "בינונית", color: "bg-yellow-100 text-yellow-800" };
  return { label: "גבוהה", color: "bg-red-100 text-red-800" };
};

export default function ViewAnxietyQuestionnairePage() {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      
      if (!id) {
        throw new Error('מזהה שאלון חסר');
      }

      const data = await getEntityById(AnxietyQuestionnaire, id, 'AnxietyQuestionnaire');
      setQuestionnaire(data);
    } catch (error) {
      console.error("Error loading questionnaire:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { data } = await generateAnxietyQuestionnairePDF({
        questionnaire_id: questionnaire.id
      });

      if (data && data.success) {
        // המרת base64 ל-blob
        const binaryString = atob(data.pdf_base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        alert('השאלון הורד בהצלחה כקובץ PDF!');
      } else {
        throw new Error('שגיאה ביצירת הקובץ');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('שגיאה ביצירת קובץ PDF. אנא נסו שוב.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto flex justify-center items-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="צפייה בשאלון חרדה" />
          <ErrorMessage error={error} onRetry={loadQuestionnaire} />
        </div>
      </div>
    );
  }

  const anxietyLevel = getAnxietyLevel(questionnaire?.anxiety_score);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="צפייה בשאלון חרדת חיות מחמד"
          description={`שאלון עבור ${questionnaire?.pet_name} של ${questionnaire?.owner_name}`}
          backButton={true}
          onBack={() => navigate(createPageUrl("AnxietyQuestionnaires"))}
        />

        {/* כרטיס מידע כללי */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl mb-6">
          <CardHeader className="border-b border-blue-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                מידע כללי
              </CardTitle>
              {questionnaire?.status === 'completed' && (
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  הושלם
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-800">{questionnaire?.owner_name}</p>
                    <p className="text-sm text-slate-600">בעלים</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <PawPrint className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-slate-800">{questionnaire?.pet_name}</p>
                    <p className="text-sm text-slate-600">{questionnaire?.pet_type || 'כלב'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-slate-800">
                      {questionnaire?.completed_at 
                        ? format(new Date(questionnaire.completed_at), "d MMMM yyyy, HH:mm", { locale: he })
                        : "טרם הושלם"}
                    </p>
                    <p className="text-sm text-slate-600">תאריך השלמה</p>
                  </div>
                </div>

                {questionnaire?.anxiety_score && (
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <div>
                      <Badge className={`${anxietyLevel.color} border text-lg px-3 py-1`}>
                        {questionnaire.anxiety_score}/10 - רמת חרדה {anxietyLevel.label}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* כפתורי פעולה */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-blue-100">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                    יוצר PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 ml-2" />
                    הורד כ-PDF
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Send className="w-4 h-4 ml-2" />
                שלח ללקוח
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* תשובות השאלון */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-xl font-bold text-slate-800">תשובות השאלון</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {questionnaire?.q1_home_reaction && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">איך חיית המחמד מגיבה בבית כששומעת על נסיעה לווטרינר?</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{questionnaire.q1_home_reaction}</p>
                </div>
              )}

              {questionnaire?.q2_travel_behavior && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">איך היא מתנהגת בדרך למרפאה?</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{questionnaire.q2_travel_behavior}</p>
                </div>
              )}

              {questionnaire?.q3_clinic_entrance && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">איך היא מתנהגת בכניסה למרפאה?</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{questionnaire.q3_clinic_entrance}</p>
                </div>
              )}

              {questionnaire?.q4_examination_reaction && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">איך היא מגיבה במהלך בדיקה או טיפול?</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{questionnaire.q4_examination_reaction}</p>
                </div>
              )}

              {questionnaire?.q5_owner_hesitation && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">האם יש חשש או קושי להביא אותה לבדיקה?</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{questionnaire.q5_owner_hesitation}</p>
                </div>
              )}

              {questionnaire?.q6_improvement_suggestions && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">דרכים שיכולות להקל על חיית המחמד</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{questionnaire.q6_improvement_suggestions}</p>
                </div>
              )}

              {questionnaire?.q8_owner_feelings && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">איך אתם מרגישים בזמן ביקור אצל הווטרינר?</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{questionnaire.q8_owner_feelings}</p>
                </div>
              )}

              {questionnaire?.q9_victory_visits && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">עניין בביקורי היכרות קצרים (Victory Visits)?</h3>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{questionnaire.q9_victory_visits}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
