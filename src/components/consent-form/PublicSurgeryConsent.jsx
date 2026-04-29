import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Loader2, FileText, AlertCircle, DollarSign, Download, Globe } from "lucide-react";
import { submitConsentForm } from "@/functions/submitConsentForm";

const LANGUAGES = [
  { code: "he", label: "עברית", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

const TRANSLATIONS = {
  he: {
    formTitle: "טופס הסכמה מדעת להליך רפואי",
    formSubtitle: "אנו פועלים במלוא המקצועיות והמסירות כדי להבטיח את שלום ובריאות חיית המחמד שלכם.",
    procedureDetails: "פרטי ההליך",
    ownerName: "שם הבעלים",
    petName: "שם חיית המחמד",
    procedureType: "סוג ההליך",
    plannedDate: "תאריך מתוכנן",
    clinicNotes: "הערות מהמרפאה",
    anesthesiaTitle: "2. הרדמה כללית והסיכונים הכרוכים בה",
    anesthesiaText: "אנו מבינים כי ההליך יבוצע בהרדמה כללית. הוסבר לנו כי הצוות הרפואי משתמש בחומרי הרדמה וניטור. עם זאת, אנו מודעים לכך שבכל הרדמה, בדומה לרפואת אדם, קיים סיכון מוגבר לסיבוכים, לרבות תגובה בלתי צפויה לחומרי ההרדמה, ובמקרים נדירים ביותר אף מוות.",
    confirmAnesthesia: "אני מאשר/ת שקראתי והבנתי את הסיכונים הכרוכים בהרדמה כללית",
    surgicalRisksTitle: "3. סיכונים וסיבוכים אפשריים בהליך הכירורגי",
    surgicalRisksIntro: "בנוסף לסיכונים הכרוכים בהרדמה, אנו מבינים כי לכל הליך כירורגי, פשוט או מורכב, ישנם סיכונים וסיבוכים אפשריים. הצוות הרפואי נוקט בכל האמצעים המקובלים כדי למזער סיכונים אלו, אך חשוב לנו להכיר בקיומם:",
    duringAfterTitle: "סיבוכים במהלך או לאחר הניתוח:",
    duringAfterText: "אנו מודעים לאפשרות של סיכונים כגון דימום, זיהום בפצע הניתוח, תגובה לחומרי התפירה, פתיחה של התפרים, או היווצרות בקעים ופתיחה באזור המנותח.",
    procedureResultsTitle: "תוצאות ההליך:",
    procedureResultsText: "הוסבר לנו כי בעוד שהמטרה היא להשיג תוצאה רפואית מיטבית, הרפואה אינה מדע מדויק. ייתכנו מקרים בהם ההליך לא יישא את מלוא התוצאה המקווה.",
    postOpTitle: "טיפול לאחר הניתוח:",
    postOpText: "אנו מבינים כי הצלחת הניתוח תלויה גם בטיפול שנעניק בבית לאחר השחרור, בהתאם להנחיות המדויקות שנקבל מהצוות הרפואי.",
    confirmSurgicalRisks: "אני מאשר/ת שקראתי והבנתי את הסיכונים והסיבוכים האפשריים בהליך הכירורגי",
    preOpTitle: "4. בדיקות והכנות מקדימות",
    preOpText: "בדיקות דם לפני הרדמה: אנו מסכימים לביצוע בדיקות דם לפני ההליך, במידת הצורך. ידוע לנו כי היקף הבדיקות מותאם אישית לגיל, לגזע ולמצב הרפואי של חיית המחמד.",
    quotePdfLabel: "הצעת מחיר מפורטת",
    quotePdfDesc: "המרפאה צירפה קובץ PDF עם הצעת מחיר מפורטת עבור ההליך",
    downloadQuote: "הורד הצעת מחיר PDF",
    confirmPreOp: "אני מאשר/ת שקראתי והבנתי את הצורך בבדיקות והכנות מקדימות",
    financialTitle: "5. הסכמה כספית",
    financialText: "הוסברה לנו הערכת העלות להליך המתוכנן. אנו מבינים כי העלות עשויה להשתנות בהתאם לממצאים במהלך ההליך ולטיפולים נוספים שיידרשו.",
    confirmFinancial: "אנו מתחייבים לשאת במלוא העלות של ההליך וכל הטיפולים הנלווים שיידרשו.",
    quoteSectionTitle: "הצעת מחיר",
    total: "סה״כ:",
    signatureTitle: "חתימה דיגיטלית",
    consentStatement: "אנו מאשרים כי קראנו והבנו את כל הפרטים הרפואיים והטיפוליים, ואנו מסכימים לבצע את ההליך המתואר לעיל.",
    fullName: "שם מלא *",
    namePlaceholder: "הכניסו את שמכם המלא",
    signature: "חתימה *",
    clearSignature: "נקה חתימה",
    submit: "שלח טופס חתום",
    submitting: "שולח טופס...",
    successTitle: "הטופס נשלח בהצלחה!",
    successText: "תודה רבה על חתימתכם. המרפאה קיבלה את הטופס וצוות הרפואי ייצור קשר בקרוב.",
    successNote: "אם יש לכם שאלות נוספות, אנא צרו קשר עם המרפאה.",
    errorFinancial: "יש לאשר את ההסכמה הכספית לפני המשך.",
    errorCheckboxes: "יש לאשר שקראת והבנת את כל הסעיפים לפני המשך.",
    errorSignature: "אנא חתמו על הטופס לפני שליחה.",
    notSet: "לא נקבע",
  },
  en: {
    formTitle: "Informed Consent Form for Medical Procedure",
    formSubtitle: "We operate with full professionalism and dedication to ensure the well-being and health of your pet.",
    procedureDetails: "Procedure Details",
    ownerName: "Owner Name",
    petName: "Pet Name",
    procedureType: "Procedure Type",
    plannedDate: "Planned Date",
    clinicNotes: "Clinic Notes",
    anesthesiaTitle: "2. General Anesthesia and Associated Risks",
    anesthesiaText: "We understand that the procedure will be performed under general anesthesia. It has been explained to us that the medical team uses anesthetic and monitoring agents. However, we are aware that in any anesthesia, similar to human medicine, there is an increased risk of complications, including unexpected reactions to anesthetic agents, and in very rare cases, death.",
    confirmAnesthesia: "I confirm that I have read and understood the risks associated with general anesthesia",
    surgicalRisksTitle: "3. Possible Risks and Complications of the Surgical Procedure",
    surgicalRisksIntro: "In addition to the risks associated with anesthesia, we understand that every surgical procedure, simple or complex, has possible risks and complications. The medical team takes all accepted measures to minimize these risks, but it is important to acknowledge their existence:",
    duringAfterTitle: "Complications during or after surgery:",
    duringAfterText: "We are aware of the possibility of risks such as bleeding, wound infection, reaction to suture materials, wound dehiscence, or hernia formation in the operated area.",
    procedureResultsTitle: "Procedure outcomes:",
    procedureResultsText: "It has been explained to us that while the goal is to achieve the best medical outcome, medicine is not an exact science. There may be cases where the procedure does not achieve the full expected result.",
    postOpTitle: "Post-operative care:",
    postOpText: "We understand that the success of the surgery also depends on the care we provide at home after discharge, according to the precise instructions we will receive from the medical team.",
    confirmSurgicalRisks: "I confirm that I have read and understood the possible risks and complications of the surgical procedure",
    preOpTitle: "4. Pre-operative Tests and Preparations",
    preOpText: "Blood tests before anesthesia: We agree to perform blood tests before the procedure. We know that the scope of tests is personally tailored to the age, breed, and medical condition of the animal.",
    quotePdfLabel: "Detailed Quote",
    quotePdfDesc: "The clinic has attached a PDF file with a detailed price quote for the procedure",
    downloadQuote: "Download Quote PDF",
    confirmPreOp: "I confirm that I have read and understood the need for pre-operative tests and preparations",
    financialTitle: "5. Financial Agreement",
    financialText: "The estimated cost of the planned procedure has been explained to us. We understand that the cost may change based on findings during the procedure and additional treatments required.",
    confirmFinancial: "We commit to bearing the full cost of the procedure and all related treatments required.",
    quoteSectionTitle: "Price Quote",
    total: "Total:",
    signatureTitle: "Digital Signature",
    consentStatement: "We confirm that we have read and understood all the medical and treatment details, and we agree to perform the procedure described above.",
    fullName: "Full Name *",
    namePlaceholder: "Enter your full name",
    signature: "Signature *",
    clearSignature: "Clear Signature",
    submit: "Submit Signed Form",
    submitting: "Submitting...",
    successTitle: "Form Submitted Successfully!",
    successText: "Thank you for your signature. The clinic has received the form and the medical team will be in touch soon.",
    successNote: "If you have any further questions, please contact the clinic.",
    errorFinancial: "You must agree to the financial consent before continuing.",
    errorCheckboxes: "You must confirm that you have read and understood all sections before continuing.",
    errorSignature: "Please sign the form before submitting.",
    notSet: "Not set",
  },
  es: {
    formTitle: "Formulario de Consentimiento Informado para Procedimiento Médico",
    formSubtitle: "Actuamos con plena profesionalidad y dedicación para garantizar el bienestar y la salud de su mascota.",
    procedureDetails: "Detalles del Procedimiento",
    ownerName: "Nombre del Propietario",
    petName: "Nombre de la Mascota",
    procedureType: "Tipo de Procedimiento",
    plannedDate: "Fecha Planificada",
    clinicNotes: "Notas de la Clínica",
    anesthesiaTitle: "2. Anestesia General y Riesgos Asociados",
    anesthesiaText: "Entendemos que el procedimiento se realizará bajo anestesia general. Se nos ha explicado que el equipo médico utiliza agentes anestésicos y de monitoreo. Sin embargo, somos conscientes de que en cualquier anestesia, similar a la medicina humana, existe un mayor riesgo de complicaciones, incluyendo reacciones inesperadas a los agentes anestésicos y, en casos muy raros, la muerte.",
    confirmAnesthesia: "Confirmo que he leído y comprendido los riesgos asociados con la anestesia general",
    surgicalRisksTitle: "3. Posibles Riesgos y Complicaciones del Procedimiento Quirúrgico",
    surgicalRisksIntro: "Además de los riesgos asociados con la anestesia, entendemos que todo procedimiento quirúrgico, simple o complejo, tiene posibles riesgos y complicaciones. El equipo médico toma todas las medidas aceptadas para minimizar estos riesgos, pero es importante reconocer su existencia:",
    duringAfterTitle: "Complicaciones durante o después de la cirugía:",
    duringAfterText: "Somos conscientes de la posibilidad de riesgos como sangrado, infección de la herida, reacción a los materiales de sutura, dehiscencia de la herida o formación de hernias en la zona operada.",
    procedureResultsTitle: "Resultados del procedimiento:",
    procedureResultsText: "Se nos ha explicado que, aunque el objetivo es lograr el mejor resultado médico, la medicina no es una ciencia exacta. Puede haber casos en que el procedimiento no logre el resultado esperado.",
    postOpTitle: "Cuidado postoperatorio:",
    postOpText: "Entendemos que el éxito de la cirugía también depende del cuidado que brindemos en casa tras el alta, según las instrucciones precisas que recibiremos del equipo médico.",
    confirmSurgicalRisks: "Confirmo que he leído y comprendido los posibles riesgos y complicaciones del procedimiento quirúrgico",
    preOpTitle: "4. Pruebas y Preparaciones Preoperatorias",
    preOpText: "Análisis de sangre antes de la anestesia: Acordamos realizar análisis de sangre antes del procedimiento. Sabemos que el alcance de las pruebas está personalizado según la edad, raza y condición médica del animal.",
    quotePdfLabel: "Presupuesto Detallado",
    quotePdfDesc: "La clínica ha adjuntado un archivo PDF con un presupuesto detallado para el procedimiento",
    downloadQuote: "Descargar Presupuesto PDF",
    confirmPreOp: "Confirmo que he leído y comprendido la necesidad de pruebas y preparaciones preoperatorias",
    financialTitle: "5. Acuerdo Financiero",
    financialText: "Se nos ha explicado el costo estimado del procedimiento planificado. Entendemos que el costo puede cambiar según los hallazgos durante el procedimiento y los tratamientos adicionales requeridos.",
    confirmFinancial: "Nos comprometemos a asumir el costo total del procedimiento y todos los tratamientos relacionados requeridos.",
    quoteSectionTitle: "Presupuesto",
    total: "Total:",
    signatureTitle: "Firma Digital",
    consentStatement: "Confirmamos que hemos leído y comprendido todos los detalles médicos y de tratamiento, y acordamos realizar el procedimiento descrito anteriormente.",
    fullName: "Nombre Completo *",
    namePlaceholder: "Ingrese su nombre completo",
    signature: "Firma *",
    clearSignature: "Borrar Firma",
    submit: "Enviar Formulario Firmado",
    submitting: "Enviando...",
    successTitle: "¡Formulario Enviado Exitosamente!",
    successText: "Gracias por su firma. La clínica ha recibido el formulario y el equipo médico se pondrá en contacto pronto.",
    successNote: "Si tiene alguna pregunta adicional, comuníquese con la clínica.",
    errorFinancial: "Debe aceptar el consentimiento financiero antes de continuar.",
    errorCheckboxes: "Debe confirmar que ha leído y comprendido todas las secciones antes de continuar.",
    errorSignature: "Por favor, firme el formulario antes de enviarlo.",
    notSet: "No establecido",
  },
  fr: {
    formTitle: "Formulaire de Consentement Éclairé pour Procédure Médicale",
    formSubtitle: "Nous agissons avec tout le professionnalisme et le dévouement nécessaires pour assurer le bien-être et la santé de votre animal.",
    procedureDetails: "Détails de la Procédure",
    ownerName: "Nom du Propriétaire",
    petName: "Nom de l'Animal",
    procedureType: "Type de Procédure",
    plannedDate: "Date Prévue",
    clinicNotes: "Notes de la Clinique",
    anesthesiaTitle: "2. Anesthésie Générale et Risques Associés",
    anesthesiaText: "Nous comprenons que la procédure sera réalisée sous anesthésie générale. Il nous a été expliqué que l'équipe médicale utilise des agents anesthésiques et de surveillance. Cependant, nous sommes conscients que toute anesthésie, comme en médecine humaine, comporte un risque accru de complications, notamment des réactions inattendues aux agents anesthésiques, et dans de très rares cas, la mort.",
    confirmAnesthesia: "Je confirme avoir lu et compris les risques associés à l'anesthésie générale",
    surgicalRisksTitle: "3. Risques et Complications Possibles de la Procédure Chirurgicale",
    surgicalRisksIntro: "En plus des risques liés à l'anesthésie, nous comprenons que toute procédure chirurgicale, simple ou complexe, comporte des risques et complications possibles. L'équipe médicale prend toutes les mesures reconnues pour minimiser ces risques, mais il est important d'en reconnaître l'existence:",
    duringAfterTitle: "Complications pendant ou après la chirurgie:",
    duringAfterText: "Nous sommes conscients de la possibilité de risques tels que saignements, infection de la plaie, réaction aux matériaux de suture, déhiscence de la plaie, ou formation de hernies dans la zone opérée.",
    procedureResultsTitle: "Résultats de la procédure:",
    procedureResultsText: "Il nous a été expliqué que même si l'objectif est d'obtenir le meilleur résultat médical, la médecine n'est pas une science exacte. Il peut y avoir des cas où la procédure n'atteint pas le résultat espéré.",
    postOpTitle: "Soins postopératoires:",
    postOpText: "Nous comprenons que le succès de la chirurgie dépend également des soins que nous prodiguerons à domicile après la sortie, conformément aux instructions précises que nous recevrons de l'équipe médicale.",
    confirmSurgicalRisks: "Je confirme avoir lu et compris les risques et complications possibles de la procédure chirurgicale",
    preOpTitle: "4. Tests et Préparations Préopératoires",
    preOpText: "Analyses de sang avant l'anesthésie: Nous acceptons d'effectuer des analyses de sang avant la procédure. Nous savons que la portée des tests est personnalisée en fonction de l'âge, de la race et de l'état médical de l'animal.",
    quotePdfLabel: "Devis Détaillé",
    quotePdfDesc: "La clinique a joint un fichier PDF avec un devis détaillé pour la procédure",
    downloadQuote: "Télécharger le Devis PDF",
    confirmPreOp: "Je confirme avoir lu et compris la nécessité de tests et préparations préopératoires",
    financialTitle: "5. Accord Financier",
    financialText: "Le coût estimé de la procédure prévue nous a été expliqué. Nous comprenons que le coût peut changer en fonction des résultats pendant la procédure et des traitements supplémentaires requis.",
    confirmFinancial: "Nous nous engageons à assumer le coût total de la procédure et de tous les traitements connexes requis.",
    quoteSectionTitle: "Devis",
    total: "Total:",
    signatureTitle: "Signature Numérique",
    consentStatement: "Nous confirmons avoir lu et compris tous les détails médicaux et de traitement, et nous acceptons d'effectuer la procédure décrite ci-dessus.",
    fullName: "Nom Complet *",
    namePlaceholder: "Entrez votre nom complet",
    signature: "Signature *",
    clearSignature: "Effacer la Signature",
    submit: "Soumettre le Formulaire Signé",
    submitting: "Envoi en cours...",
    successTitle: "Formulaire Soumis avec Succès!",
    successText: "Merci pour votre signature. La clinique a reçu le formulaire et l'équipe médicale vous contactera bientôt.",
    successNote: "Si vous avez d'autres questions, veuillez contacter la clinique.",
    errorFinancial: "Vous devez accepter le consentement financier avant de continuer.",
    errorCheckboxes: "Vous devez confirmer avoir lu et compris toutes les sections avant de continuer.",
    errorSignature: "Veuillez signer le formulaire avant de le soumettre.",
    notSet: "Non défini",
  },
  ru: {
    formTitle: "Форма Информированного Согласия на Медицинскую Процедуру",
    formSubtitle: "Мы работаем с максимальным профессионализмом и самоотдачей, чтобы обеспечить благополучие и здоровье вашего питомца.",
    procedureDetails: "Детали Процедуры",
    ownerName: "Имя Владельца",
    petName: "Имя Питомца",
    procedureType: "Тип Процедуры",
    plannedDate: "Запланированная Дата",
    clinicNotes: "Заметки Клиники",
    anesthesiaTitle: "2. Общая Анестезия и Связанные Риски",
    anesthesiaText: "Мы понимаем, что процедура будет выполняться под общей анестезией. Нам объяснили, что медицинская команда использует анестетики и мониторинговое оборудование. Тем не менее, мы осознаём, что при любой анестезии, как и в медицине человека, существует повышенный риск осложнений, включая неожиданные реакции на анестетики, и в очень редких случаях — смерть.",
    confirmAnesthesia: "Я подтверждаю, что прочитал(а) и понял(а) риски, связанные с общей анестезией",
    surgicalRisksTitle: "3. Возможные Риски и Осложнения Хирургической Процедуры",
    surgicalRisksIntro: "Помимо рисков, связанных с анестезией, мы понимаем, что каждая хирургическая процедура, простая или сложная, имеет возможные риски и осложнения. Медицинская команда принимает все принятые меры для минимизации этих рисков, но важно признать их существование:",
    duringAfterTitle: "Осложнения во время или после операции:",
    duringAfterText: "Мы осознаём возможность таких рисков, как кровотечение, инфицирование раны, реакция на шовный материал, расхождение швов или образование грыжи в прооперированной области.",
    procedureResultsTitle: "Результаты процедуры:",
    procedureResultsText: "Нам объяснили, что, хотя цель — достичь наилучшего медицинского результата, медицина не является точной наукой. Могут быть случаи, когда процедура не даст полного ожидаемого результата.",
    postOpTitle: "Послеоперационный уход:",
    postOpText: "Мы понимаем, что успех операции также зависит от ухода, который мы обеспечим дома после выписки, в соответствии с точными инструкциями, которые мы получим от медицинской команды.",
    confirmSurgicalRisks: "Я подтверждаю, что прочитал(а) и понял(а) возможные риски и осложнения хирургической процедуры",
    preOpTitle: "4. Предоперационные Анализы и Подготовка",
    preOpText: "Анализы крови перед анестезией: Мы соглашаемся на проведение анализов крови до процедуры. Нам известно, что объём анализов индивидуально подбирается с учётом возраста, породы и состояния здоровья животного.",
    quotePdfLabel: "Подробная Смета",
    quotePdfDesc: "Клиника приложила PDF-файл с подробной сметой расходов на процедуру",
    downloadQuote: "Скачать Смету PDF",
    confirmPreOp: "Я подтверждаю, что прочитал(а) и понял(а) необходимость предоперационных анализов и подготовки",
    financialTitle: "5. Финансовое Соглашение",
    financialText: "Нам была объяснена предполагаемая стоимость запланированной процедуры. Мы понимаем, что стоимость может изменяться в зависимости от результатов во время процедуры и необходимых дополнительных процедур.",
    confirmFinancial: "Мы берём на себя обязательство оплатить полную стоимость процедуры и всех связанных лечебных мероприятий.",
    quoteSectionTitle: "Смета",
    total: "Итого:",
    signatureTitle: "Цифровая Подпись",
    consentStatement: "Мы подтверждаем, что прочитали и поняли все медицинские и лечебные детали, и мы соглашаемся на проведение описанной выше процедуры.",
    fullName: "Полное Имя *",
    namePlaceholder: "Введите ваше полное имя",
    signature: "Подпись *",
    clearSignature: "Очистить Подпись",
    submit: "Отправить Подписанную Форму",
    submitting: "Отправка...",
    successTitle: "Форма Успешно Отправлена!",
    successText: "Спасибо за вашу подпись. Клиника получила форму, и медицинская команда свяжется с вами в ближайшее время.",
    successNote: "Если у вас есть дополнительные вопросы, пожалуйста, свяжитесь с клиникой.",
    errorFinancial: "Вы должны подтвердить финансовое согласие перед продолжением.",
    errorCheckboxes: "Вы должны подтвердить, что прочитали и поняли все разделы перед продолжением.",
    errorSignature: "Пожалуйста, подпишите форму перед отправкой.",
    notSet: "Не указано",
  },
  ar: {
    formTitle: "نموذج الموافقة المستنيرة على الإجراء الطبي",
    formSubtitle: "نعمل بكامل الاحترافية والتفاني لضمان سلامة وصحة حيوانك الأليف.",
    procedureDetails: "تفاصيل الإجراء",
    ownerName: "اسم المالك",
    petName: "اسم الحيوان الأليف",
    procedureType: "نوع الإجراء",
    plannedDate: "التاريخ المخطط",
    clinicNotes: "ملاحظات العيادة",
    anesthesiaTitle: "2. التخدير العام والمخاطر المرتبطة به",
    anesthesiaText: "نفهم أن الإجراء سيُنفَّذ تحت التخدير العام. وقد أوضح لنا الفريق الطبي أنه يستخدم عوامل تخدير ومراقبة. ومع ذلك، نُدرك أن أي تخدير، كما في الطب البشري، ينطوي على خطر متزايد للمضاعفات، بما في ذلك ردود فعل غير متوقعة لعوامل التخدير، وفي حالات نادرة جداً، الوفاة.",
    confirmAnesthesia: "أؤكد أنني قرأت وفهمت المخاطر المرتبطة بالتخدير العام",
    surgicalRisksTitle: "3. المخاطر والمضاعفات المحتملة للإجراء الجراحي",
    surgicalRisksIntro: "بالإضافة إلى المخاطر المرتبطة بالتخدير، نفهم أن كل إجراء جراحي، بسيطاً كان أم معقداً، ينطوي على مخاطر ومضاعفات محتملة. يتخذ الفريق الطبي جميع التدابير المقبولة لتقليل هذه المخاطر، لكن من المهم الاعتراف بوجودها:",
    duringAfterTitle: "مضاعفات أثناء الجراحة أو بعدها:",
    duringAfterText: "نُدرك احتمال وجود مخاطر مثل النزيف والعدوى في جرح الشق الجراحي وردود الفعل على مواد الخياطة وانفتاح الجرح أو تشكّل الفتق في المنطقة المُعالجة.",
    procedureResultsTitle: "نتائج الإجراء:",
    procedureResultsText: "أوضح لنا أنه رغم أن الهدف هو تحقيق أفضل نتيجة طبية، إلا أن الطب ليس علماً دقيقاً. قد تكون هناك حالات لا يحقق فيها الإجراء النتيجة المأمولة كاملةً.",
    postOpTitle: "الرعاية بعد الجراحة:",
    postOpText: "نفهم أن نجاح الجراحة يعتمد أيضاً على الرعاية التي سنقدمها في المنزل بعد الخروج، وفقاً للتعليمات الدقيقة التي سنتلقاها من الفريق الطبي.",
    confirmSurgicalRisks: "أؤكد أنني قرأت وفهمت المخاطر والمضاعفات المحتملة للإجراء الجراحي",
    preOpTitle: "4. الفحوصات والتحضيرات قبل العملية",
    preOpText: "فحوصات الدم قبل التخدير: نوافق على إجراء فحوصات دم قبل الإجراء. نعلم أن نطاق الفحوصات مخصص وفق عمر الحيوان وسلالته وحالته الصحية.",
    quotePdfLabel: "عرض أسعار تفصيلي",
    quotePdfDesc: "أرفقت العيادة ملف PDF مع عرض أسعار تفصيلي للإجراء",
    downloadQuote: "تحميل ملف PDF لعرض الأسعار",
    confirmPreOp: "أؤكد أنني قرأت وفهمت الحاجة إلى فحوصات وتحضيرات قبل العملية",
    financialTitle: "5. الاتفاقية المالية",
    financialText: "أُوضح لنا التكلفة التقديرية للإجراء المخطط. نفهم أن التكلفة قد تتغير بناءً على النتائج أثناء الإجراء والعلاجات الإضافية المطلوبة.",
    confirmFinancial: "نلتزم بتحمّل التكلفة الكاملة للإجراء وجميع العلاجات المرتبطة المطلوبة.",
    quoteSectionTitle: "عرض الأسعار",
    total: "المجموع:",
    signatureTitle: "التوقيع الرقمي",
    consentStatement: "نؤكد أننا قرأنا وفهمنا جميع التفاصيل الطبية والعلاجية، ونوافق على إجراء العملية الموضحة أعلاه.",
    fullName: "الاسم الكامل *",
    namePlaceholder: "أدخل اسمك الكامل",
    signature: "التوقيع *",
    clearSignature: "مسح التوقيع",
    submit: "إرسال النموذج الموقّع",
    submitting: "جارٍ الإرسال...",
    successTitle: "تم إرسال النموذج بنجاح!",
    successText: "شكراً على توقيعك. استلمت العيادة النموذج وسيتواصل معك الفريق الطبي قريباً.",
    successNote: "إذا كان لديك أسئلة إضافية، يُرجى التواصل مع العيادة.",
    errorFinancial: "يجب الموافقة على الموافقة المالية قبل المتابعة.",
    errorCheckboxes: "يجب تأكيد أنك قرأت وفهمت جميع الأقسام قبل المتابعة.",
    errorSignature: "يُرجى التوقيع على النموذج قبل إرساله.",
    notSet: "غير محدد",
  },
};

export default function PublicSurgeryConsent({ linkData, token }) {
  const [lang, setLang] = useState("he");
  const t = TRANSLATIONS[lang];
  const dir = LANGUAGES.find(l => l.code === lang)?.dir || "rtl";

  const [formData, setFormData] = useState({
    ownerName: linkData?.metadata?.owner_name || '',
    ownerSignature: '',
    agreedToFinancial: false,
    confirmedAnesthesia: false,
    confirmedSurgicalRisks: false,
    confirmedPreOperativeTests: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef(null);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();
      setFormData(prev => ({ ...prev, ownerSignature: signatureData }));
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, ownerSignature: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreedToFinancial) { setSubmitError(t.errorFinancial); return; }
    if (!formData.confirmedAnesthesia || !formData.confirmedSurgicalRisks || !formData.confirmedPreOperativeTests) { setSubmitError(t.errorCheckboxes); return; }
    if (!formData.ownerSignature) { setSubmitError(t.errorSignature); return; }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitConsentForm({
        token,
        signature_data: formData.ownerSignature,
        signature_verification_data: {
          browser_fingerprint: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          signature_duration: 0
        }
      });

      if (response.data?.success) {
        setSubmitSuccess(true);
      } else {
        throw new Error(response.data?.error || t.errorSignature);
      }
    } catch (error) {
      setSubmitError(error.message || t.errorSignature);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={dir}>
        <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">{t.successTitle}</h2>
            <p className="text-slate-600 text-lg">{t.successText}</p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">{t.successNote}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const consentDetails = linkData?.form || linkData?.formData || {};

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50" dir={dir}>
      <div className="max-w-4xl mx-auto">

        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
            alt="טדי וטס"
            className="mx-auto mb-4 w-64 h-auto object-contain"
          />
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          <Globe className="w-4 h-4 text-slate-500 flex-shrink-0" />
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                lang === l.code
                  ? 'bg-purple-500 text-white border-purple-500 shadow'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Main Form */}
        <Card className="bg-white shadow-md mb-6">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400 flex-shrink-0" />
              {t.formTitle}
            </CardTitle>
            <p className="text-slate-500 mt-2">{t.formSubtitle}</p>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Patient Details */}
            <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                {t.procedureDetails}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-slate-600">{t.ownerName}:</span><span className="mx-2 text-slate-700">{consentDetails.owner_name || '-'}</span></div>
                <div><span className="font-semibold text-slate-600">{t.petName}:</span><span className="mx-2 text-slate-700">{consentDetails.pet_name || '-'}</span></div>
                <div><span className="font-semibold text-slate-600">{t.procedureType}:</span><span className="mx-2 text-slate-700">{consentDetails.procedure_type || '-'}</span></div>
                <div>
                  <span className="font-semibold text-slate-600">{t.plannedDate}:</span>
                  <span className="mx-2 text-slate-700">
                    {consentDetails.procedure_date ? new Date(consentDetails.procedure_date).toLocaleDateString() : t.notSet}
                  </span>
                </div>
              </div>
              {consentDetails.clinic_notes && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100/50">
                  <p className="font-semibold text-slate-600 mb-2">{t.clinicNotes}:</p>
                  <p className="text-slate-600 whitespace-pre-wrap">{consentDetails.clinic_notes}</p>
                </div>
              )}
            </div>

            {/* Anesthesia */}
            <div className="bg-green-50/30 p-6 rounded-xl border border-green-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">{t.anesthesiaTitle}</h3>
              <div className="bg-white p-4 rounded-lg border border-green-100/50">
                <p className="text-slate-600 leading-relaxed">{t.anesthesiaText}</p>
              </div>
              <div className="mt-4 flex items-start gap-3 bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                <Checkbox id="confirm-anesthesia" checked={formData.confirmedAnesthesia} onCheckedChange={(c) => setFormData(p => ({ ...p, confirmedAnesthesia: c }))} className="mt-1 flex-shrink-0" />
                <Label htmlFor="confirm-anesthesia" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                  {t.confirmAnesthesia} <span className="text-red-500 font-bold">*</span>
                </Label>
              </div>
            </div>

            {/* Surgical Risks */}
            <div className="bg-orange-50/20 p-6 rounded-xl border border-orange-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">{t.surgicalRisksTitle}</h3>
              <div className="bg-orange-50/40 p-4 rounded-lg border border-orange-100/50 mb-4">
                <p className="text-slate-600 leading-relaxed">{t.surgicalRisksIntro}</p>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-slate-700 mb-2">{t.duringAfterTitle}</h4>
                  <p className="text-slate-600 leading-relaxed">{t.duringAfterText}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-slate-700 mb-2">{t.procedureResultsTitle}</h4>
                  <p className="text-slate-600 leading-relaxed">{t.procedureResultsText}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-slate-700 mb-2">{t.postOpTitle}</h4>
                  <p className="text-slate-600 leading-relaxed">{t.postOpText}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3 bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                <Checkbox id="confirm-surgical-risks" checked={formData.confirmedSurgicalRisks} onCheckedChange={(c) => setFormData(p => ({ ...p, confirmedSurgicalRisks: c }))} className="mt-1 flex-shrink-0" />
                <Label htmlFor="confirm-surgical-risks" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                  {t.confirmSurgicalRisks} <span className="text-red-500 font-bold">*</span>
                </Label>
              </div>
            </div>

            {/* Pre-op Tests */}
            <div className="bg-indigo-50/20 p-6 rounded-xl border border-indigo-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">{t.preOpTitle}</h3>
              <div className="bg-white p-4 rounded-lg border border-indigo-100/50">
                <p className="text-slate-600 leading-relaxed">{t.preOpText}</p>
              </div>
              {consentDetails.quote_pdf_url && (
                <div className="mt-4 bg-white p-4 rounded-lg border border-indigo-100/50">
                  <p className="text-slate-600 mb-3 font-semibold">{t.quotePdfLabel}</p>
                  <p className="text-slate-600 text-sm mb-3">{t.quotePdfDesc}</p>
                  <a href={consentDetails.quote_pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    {t.downloadQuote}
                  </a>
                </div>
              )}
              <div className="mt-4 flex items-start gap-3 bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                <Checkbox id="confirm-preoperative" checked={formData.confirmedPreOperativeTests} onCheckedChange={(c) => setFormData(p => ({ ...p, confirmedPreOperativeTests: c }))} className="mt-1 flex-shrink-0" />
                <Label htmlFor="confirm-preoperative" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                  {t.confirmPreOp} <span className="text-red-500 font-bold">*</span>
                </Label>
              </div>
            </div>

            {/* Financial */}
            <div className="bg-yellow-50/30 p-6 rounded-xl border border-yellow-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                {t.financialTitle}
              </h3>
              <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100/50 mb-4">
                <p className="text-slate-600 leading-relaxed">{t.financialText}</p>
              </div>
              <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                <div className="flex items-start gap-3">
                  <Checkbox id="financial" checked={formData.agreedToFinancial} onCheckedChange={(c) => setFormData(p => ({ ...p, agreedToFinancial: c }))} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="financial" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                    {t.confirmFinancial} <span className="text-red-500 font-bold">*</span>
                  </Label>
                </div>
              </div>
            </div>

            {/* Treatment Costs */}
            {consentDetails.treatment_costs && consentDetails.treatment_costs.length > 0 && (
              <div className="bg-yellow-50/30 p-6 rounded-xl border border-yellow-100/50">
                <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                  {t.quoteSectionTitle}
                </h3>
                <div className="space-y-3">
                  {consentDetails.treatment_costs.map((treatment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                      <span className="font-medium text-slate-700">{treatment.treatment_name}</span>
                      <span className="font-bold text-slate-800">₪{treatment.cost?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
                    <span className="text-lg font-bold text-gray-700">{t.total}</span>
                    <span className="text-2xl font-bold text-green-600">₪{consentDetails.total_cost?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Signature */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50 space-y-4">
                <h3 className="text-xl font-bold text-slate-700">{t.signatureTitle}</h3>
                <div className="bg-white p-4 rounded-lg border border-blue-100/50">
                  <p className="text-slate-600 leading-relaxed">{t.consentStatement} <span className="text-red-500 font-bold">*</span></p>
                </div>
                <div>
                  <Label htmlFor="owner-name" className="text-base font-medium text-slate-600 mb-2 block">{t.fullName}</Label>
                  <Input id="owner-name" value={formData.ownerName} onChange={(e) => setFormData(p => ({ ...p, ownerName: e.target.value }))} placeholder={t.namePlaceholder} required className="bg-white" />
                </div>
                <div>
                  <Label className="text-base font-medium text-slate-600 mb-2 block">{t.signature}</Label>
                  <div className="border border-slate-200 rounded-lg bg-white p-2">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="w-full touch-none"
                      style={{ touchAction: 'none', cursor: 'crosshair' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={clearSignature} className="mt-2 w-full md:w-auto">
                    {t.clearSignature}
                  </Button>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !formData.confirmedAnesthesia || !formData.confirmedSurgicalRisks || !formData.confirmedPreOperativeTests || !formData.agreedToFinancial}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mx-2 animate-spin" />{t.submitting}</>
                ) : (
                  <><Check className="w-5 h-5 mx-2" />{t.submit}</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}