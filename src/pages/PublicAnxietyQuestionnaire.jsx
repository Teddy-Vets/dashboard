
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Heart, PawPrint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { validateLink } from "@/functions/validateLink";
import { submitAnxietyQuestionnaire } from "@/functions/submitAnxietyQuestionnaire";

export default function PublicAnxietyQuestionnairePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [questionnaireData, setQuestionnaireData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    q1_home_reaction: "",
    qa1_coping_methods: [],
    qa1_other_method: "",
    q2_travel_behavior: "",
    q3_clinic_entrance: "",
    qa3_clinic_help: [],
    qa3_other_help: "",
    q4_examination_reaction: "",
    q5_owner_hesitation: "",
    qa5_owner_comfort: [],
    qa5_other_comfort: "",
    q6_improvement_suggestions: "",
    q7_difficult_treatments: "",
    q7_difficult_treatments_details: "",
    q8_owner_feelings: "",
    qa8_owner_relaxation: [],
    qa8_other_relaxation: "",
    q9_victory_visits: "",
    anxiety_score: null
  });

  useEffect(() => {
    validateAndLoadQuestionnaire();
  }, []);

  const validateAndLoadQuestionnaire = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("t");

      if (!token) {
        throw new Error("קישור לא תקין - חסר טוקן אימות");
      }

      const { data } = await validateLink({ t: token });

      if (!data.valid) {
        throw new Error(data.error || "הקישור אינו תקף או פג תוקפו");
      }

      if (data.linkData.form_type !== "anxiety_questionnaire") {
        throw new Error("קישור זה אינו מיועד לשאלון חרדה");
      }

      setQuestionnaireData({
        ...data.form,
        clinic_id: data.linkData.clinic_id,
        form_id: data.linkData.form_id,
        metadata: data.linkData.metadata
      });

    } catch (err) {
      console.error("Validation error:", err);
      setError(err.message || "שגיאה בטעינת השאלון");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const score = calculateAnxietyScore();
      
      const submissionData = {
        id: questionnaireData.form_id,
        ...formData,
        anxiety_score: score
      };

      await submitAnxietyQuestionnaire(submissionData);
      
      setCurrentStep('success');
      
    } catch (err) {
      console.error("Submission error:", err);
      setError("שגיאה בשליחת השאלון. אנא נסו שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAnxietyScore = () => {
    let score = 0;
    
    const scoreMap = {
      q1_home_reaction: { "רגועה, שמחה לצאת": 1, "קצת מתוחה אבל מסתדרת": 3, "מראה פחד (התחבאות, התנגדות)": 6, "חרדה קשה (רעד, יללות, בריחה)": 9 },
      q2_travel_behavior: { "רגועה": 1, "מתוחה מעט": 3, "נביחה/יללות/חוסר שקט": 6, "חרדה קשה (רעד, הקאות, ניסיונות בריחה)": 9 },
      q3_clinic_entrance: { "רגועה וסקרנית": 1, "מתוחה אבל נשלטת": 3, "נביחה, יללות, ניסיון להסתתר": 6, "חרדה קשה (רעד, נשימות כבדות, סירוב להתקדם)": 9 },
      q4_examination_reaction: { "מאפשרת בקלות": 1, "מתוחה, זזזה הרבה": 3, "מתנגדת, צריך להרגיע/להחזיק": 6, "חרדה קשה (נשיכות/שריטות, ניסיונות בריחה חזקים)": 9 },
      q5_owner_hesitation: { "לא בכלל": 1, "לפעמים": 4, "כן, לעיתים קרובות": 7, "בהחלט – כמעט מונע ביקורים": 10 },
      q8_owner_feelings: { "רגועים": 1, "מתוחים מעט": 3, "מודאגים מאוד": 6, "מרגישים לחץ או סטרס": 9 }
    };

    Object.keys(scoreMap).forEach(key => {
      if (formData[key] && scoreMap[key][formData[key]]) {
        score += scoreMap[key][formData[key]];
      }
    });

    return Math.min(10, Math.round(score / 6));
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-slate-600">טוען שאלון...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">שגיאה</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
              נסה שוב
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md">
          <Card className="border-green-200">
            <CardContent className="p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-green-600" />
              </motion.div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                תודה רבה!
              </h2>
              <p className="text-slate-600 text-lg mb-6">
                השאלון נשלח בהצלחה. המידע שלכם יעזור לנו להפוך את הביקור הבא לחוויה נעימה ורגועה יותר עבור {questionnaireData?.metadata?.pet_name || 'חיית המחמד'}.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-800">
                  צוות המרפאה יצור איתכם קשר בקרוב להמשך תיאום הביקור
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const questions = [
    {
      id: 'q1',
      question: "איך חיית המחמד שלכם מגיבה בבית כששומעת על נסיעה לווטרינר?",
      field: 'q1_home_reaction',
      type: 'radio',
      options: [
        "רגועה, שמחה לצאת",
        "קצת מתוחה אבל מסתדרת",
        "מראה פחד (התחבאות, התנגדות)",
        "חרדה קשה (רעד, יללות, בריחה)"
      ],
      followUp: {
        condition: (data) => data.q1_home_reaction && !data.q1_home_reaction.includes('רגועה'),
        question: "מה אתם עושים כדי להצליח להביא אותה?",
        field: 'qa1_coping_methods',
        type: 'checkbox',
        options: [
          "מתעלמים וממשיכים",
          "מנסים להרגיע (מילים, ליטוף)",
          "משתמשים בחטיפים/פינוקים",
          "פעולה אחרת"
        ],
        other: 'qa1_other_method'
      }
    },
    {
      id: 'q2',
      question: "איך היא מתנהגת בדרך למרפאה (ברכב/הליכה)?",
      field: 'q2_travel_behavior',
      type: 'radio',
      options: [
        "רגועה",
        "מתוחה מעט",
        "נביחה/יללות/חוסר שקט",
        "חרדה קשה (רעד, הקאות, ניסיונות בריחה)"
      ]
    },
    {
      id: 'q3',
      question: "איך היא מתנהגת בכניסה למרפאה/חדר המתנה?",
      field: 'q3_clinic_entrance',
      type: 'radio',
      options: [
        "רגועה וסקרנית",
        "מתוחה אבל נשלטת",
        "נביחה, יללות, ניסיון להסתתר",
        "חרדה קשה (רעד, נשימות כבדות, סירוב להתקדם)"
      ],
      followUp: {
        condition: (data) => data.q3_clinic_entrance && data.q3_clinic_entrance.includes('חרדה קשה'),
        question: "מה לדעתכם יכול לעזור לה?",
        field: 'qa3_clinic_help',
        type: 'checkbox',
        options: [
          "חדר נפרד ושקט",
          "פחות המתנה",
          "חטיפים/הסחת דעת",
          "משהו אחר"
        ],
        other: 'qa3_other_help'
      }
    },
    {
      id: 'q4',
      question: "איך היא מגיבה במהלך בדיקה או טיפול?",
      field: 'q4_examination_reaction',
      type: 'radio',
      options: [
        "מאפשרת בקלות",
        "מתוחה, זזזה הרבה",
        "מתנגדת, צריך להרגיע/להחזיק",
        "חרדה קשה (נשיכות/שריטות, ניסיונות בריחה חזקים)"
      ]
    },
    {
      id: 'q5',
      question: "האם יש לכם חשש או קושי להביא אותה לבדיקה ווטרינרית בגלל ההתנהגות שלה?",
      field: 'q5_owner_hesitation',
      type: 'radio',
      options: [
        "לא בכלל",
        "לפעמים",
        "כן, לעיתים קרובות",
        "בהחלט – כמעט מונע ביקורים"
      ],
      followUp: {
        condition: (data) => data.q5_owner_hesitation && !data.q5_owner_hesitation.includes('לא בכלל'),
        question: "מה יעזור לכם כבעלים להרגיש יותר נוח להביא אותה?",
        field: 'qa5_owner_comfort',
        type: 'checkbox',
        options: [
          "הסבר מראש על מה יקרה בביקור",
          "ביקורים קצרים וחיוביים ללא טיפול",
          "שימוש בתרופות הרגעה קלות",
          "משהו אחר"
        ],
        other: 'qa5_other_comfort'
      }
    },
    {
      id: 'q6',
      question: "אילו דרכים לדעתכם היו מקלות על חיית המחמד שלכם בביקור?",
      field: 'q6_improvement_suggestions',
      type: 'textarea'
    },
    {
      id: 'q7',
      question: "האם יש טיפול מסוים שחיית המחמד מתקשה בו במיוחד?",
      field: 'q7_difficult_treatments',
      type: 'radio',
      options: [
        "לא, אין בעיה מיוחדת",
        "כן"
      ],
      followUp: {
        condition: (data) => data.q7_difficult_treatments === 'כן',
        question: "אנא פרטו:",
        field: 'q7_difficult_treatments_details',
        type: 'textarea'
      }
    },
    {
      id: 'q8',
      question: "איך אתם עצמכם מרגישים בזמן ביקור אצל הווטרינר עם החיה?",
      field: 'q8_owner_feelings',
      type: 'radio',
      options: [
        "רגועים",
        "מתוחים מעט",
        "מודאגים מאוד",
        "מרגישים לחץ או סטרס"
      ],
      followUp: {
        condition: (data) => data.q8_owner_feelings && !data.q8_owner_feelings.includes('רגועים'),
        question: "מה לדעתכם יכול לעזור לכם להרגיש יותר נינוחים?",
        field: 'qa8_owner_relaxation',
        type: 'checkbox',
        options: [
          "הסבר ותיאום ציפיות מראש",
          "חדר שקט יותר",
          "אפשרות להיות נוכח יותר בבדיקה",
          "משהו אחר"
        ],
        other: 'qa8_other_relaxation'
      }
    },
    {
      id: 'q9',
      question: "האם הייתם מעוניינים בביקורי היכרות קצרים (Victory Visits) - ביקור ללא טיפול, רק כדי להרגיל את החיה לסביבה?",
      field: 'q9_victory_visits',
      type: 'radio',
      options: [
        "כן",
        "אולי, תלוי בעלות",
        "לא"
      ]
    }
  ];

  const renderQuestion = (q) => {
    const showFollowUp = q.followUp && q.followUp.condition(formData);

    return (
      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        className="mb-16"
        dir="rtl">
        
        {/* Main Question */}
        <div className="mb-8">
          <h3 className="text-2xl md:text-3xl font-light text-slate-800 mb-8 leading-relaxed text-right">
            {q.question}
          </h3>

          {q.type === 'radio' && (
            <RadioGroup 
              value={formData[q.field]} 
              onValueChange={(value) => updateFormData(q.field, value)} 
              className="space-y-4"
              dir="rtl">
              {q.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-5 rounded-lg border-2 transition-all cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 ${
                    formData[q.field] === option
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  dir="rtl">
                  <RadioGroupItem value={option} id={`${q.field}-${index}`} className="ml-8" />
                  <span className="text-lg text-slate-700 text-right flex-1">{option}</span>
                </label>
              ))}
            </RadioGroup>
          )}

          {q.type === 'checkbox' && (
            <div className="space-y-4" dir="rtl">
              {q.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-5 rounded-lg border-2 transition-all cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 ${
                    formData[q.field].includes(option)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  dir="rtl">
                  <Checkbox
                    checked={formData[q.field].includes(option)}
                    onCheckedChange={() => toggleArrayValue(q.field, option)}
                    className="ml-8"
                  />
                  <span className="text-lg text-slate-700 text-right flex-1">{option}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'textarea' && (
            <div className="relative" dir="rtl">
              <textarea
                value={formData[q.field]}
                onChange={(e) => updateFormData(q.field, e.target.value)}
                rows={4}
                className="w-full p-6 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none bg-transparent transition-colors resize-none text-right"
                placeholder="שתפו אותנו במחשבות שלכם..."
                dir="rtl"
              />
            </div>
          )}
        </div>

        {/* Follow-up Question */}
        <AnimatePresence>
          {showFollowUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mr-8 pt-8 border-r-4 border-purple-200 pr-8" 
              dir="rtl">
              
              <h4 className="text-xl md:text-2xl font-light text-slate-700 mb-6 text-right">
                {q.followUp.question}
              </h4>

              {q.followUp.type === 'checkbox' && (
                <div className="space-y-3" dir="rtl">
                  {q.followUp.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 ${
                        formData[q.followUp.field].includes(option)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white'
                      }`}
                      dir="rtl">
                      <Checkbox
                        checked={formData[q.followUp.field].includes(option)}
                        onCheckedChange={() => toggleArrayValue(q.followUp.field, option)}
                        className="ml-8"
                      />
                      <span className="text-base text-slate-700 text-right flex-1">{option}</span>
                    </label>
                  ))}

                  {q.followUp.other && (formData[q.followUp.field].includes('פעולה אחרת') || formData[q.followUp.field].includes('משהו אחר')) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mr-8 mt-4" 
                      dir="rtl">
                      <Input
                        value={formData[q.followUp.other]}
                        onChange={(e) => updateFormData(q.followUp.other, e.target.value)}
                        placeholder="אנא פרטו..."
                        className="border-b-2 border-t-0 border-x-0 rounded-none focus:border-purple-500 text-right"
                        dir="rtl"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {q.followUp.type === 'textarea' && (
                <div className="relative" dir="rtl"> 
                  <textarea
                    value={formData[q.followUp.field]}
                    onChange={(e) => updateFormData(q.followUp.field, e.target.value)}
                    rows={3}
                    className="w-full p-4 text-base border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none bg-transparent transition-colors resize-none text-right"
                    placeholder="שתפו אותנו..."
                    dir="rtl"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50" dir="rtl">
      {/* Hero Image Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=80)',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50" />
        
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="text-center max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-serif font-light text-white mb-4 leading-tight">
              לקראת ביקור רגוע יותר
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 font-light">
              נבין יחד את חווית חיית המחמד שלכם
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16 text-center">
          <div className="flex items-center justify-center mb-8">
            <PawPrint className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light max-w-2xl mx-auto text-center">
            אנו מאמינים שביקור רגוע מתחיל בהבנה עמוקה. מספר שאלות קצרות יאפשרו לנו להתאים את הביקור הבא במיוחד עבורכם ועבור חברכם הטוב ביותר, ולהפוך אותו לחוויה חיובית ונטולת מתחים.
          </p>
          
          {questionnaireData?.metadata && (
            <div className="mt-8 inline-block bg-purple-50 px-8 py-4 rounded-full border border-purple-100">
              <p className="text-lg text-purple-800">
                <span className="font-medium">{questionnaireData.metadata.pet_name}</span>
                {' '}&{' '}
                <span className="font-medium">{questionnaireData.metadata.owner_name}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Questions */}
        <div className="space-y-16">
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}>
              {renderQuestion(q)}
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-20 text-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-12 py-6 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-none shadow-lg hover:shadow-xl transition-all duration-300">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
                שולח...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-3" />
                שלחו לנו כדי שניערך טוב יותר
              </>
            )}
          </Button>
          
          <p className="text-sm text-slate-500 mt-6">
            המידע שלכם מאובטח ומטופל בסודיות מלאה
          </p>
        </motion.div>
      </div>
    </div>
  );
}
