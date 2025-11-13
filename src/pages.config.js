import Dashboard from './pages/Dashboard';
import IntakeForm from './pages/IntakeForm';
import Clients from './pages/Clients';
import Pets from './pages/Pets';
import PublicForm from './pages/PublicForm';
import ConsentForms from './pages/ConsentForms';
import CreateConsentForm from './pages/CreateConsentForm';
import PublicConsentForm from './pages/PublicConsentForm';
import Clinics from './pages/Clinics';
import IntakeFormsList from './pages/IntakeFormsList';
import PublicViewIntakeForm from './pages/PublicViewIntakeForm';
import ViewIntakeForm from './pages/ViewIntakeForm';
import PostSurgeryInstructions from './pages/PostSurgeryInstructions';
import CreatePostSurgeryInstructions from './pages/CreatePostSurgeryInstructions';
import PuppyAdoptionGuide from './pages/PuppyAdoptionGuide';
import SpayNeuterInstructions from './pages/SpayNeuterInstructions';
import DentalCareInstructions from './pages/DentalCareInstructions';
import CreateSpayNeuterInstructions from './pages/CreateSpayNeuterInstructions';
import ViewSpayNeuterInstructions from './pages/ViewSpayNeuterInstructions';
import CreateDentalCareInstructions from './pages/CreateDentalCareInstructions';
import AppointmentBooking from './pages/AppointmentBooking';
import VaccinationForm from './pages/VaccinationForm';
import MedicalVisitForm from './pages/MedicalVisitForm';
import AnxietyQuestionnaires from './pages/AnxietyQuestionnaires';
import CreateAnxietyQuestionnaire from './pages/CreateAnxietyQuestionnaire';
import PublicAnxietyQuestionnaire from './pages/PublicAnxietyQuestionnaire';
import ViewPostSurgeryInstructions from './pages/ViewPostSurgeryInstructions';
import ViewAnxietyQuestionnaire from './pages/ViewAnxietyQuestionnaire';
import ViewDentalCareInstructions from './pages/ViewDentalCareInstructions';
import ManageAppointments from './pages/ManageAppointments';
import PublicSpayNeuterInstructions from './pages/PublicSpayNeuterInstructions';
import UserManual from './pages/UserManual';
import MarketingMaterials from './pages/MarketingMaterials';
import ViewConsentForm from './pages/ViewConsentForm';
import SystemManagement from './pages/SystemManagement';
import PublicEmergencyTriage from './pages/PublicEmergencyTriage';
import EmergencyTriageDashboard from './pages/EmergencyTriageDashboard';
import ViewEmergencyTriage from './pages/ViewEmergencyTriage';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "IntakeForm": IntakeForm,
    "Clients": Clients,
    "Pets": Pets,
    "PublicForm": PublicForm,
    "ConsentForms": ConsentForms,
    "CreateConsentForm": CreateConsentForm,
    "PublicConsentForm": PublicConsentForm,
    "Clinics": Clinics,
    "IntakeFormsList": IntakeFormsList,
    "PublicViewIntakeForm": PublicViewIntakeForm,
    "ViewIntakeForm": ViewIntakeForm,
    "PostSurgeryInstructions": PostSurgeryInstructions,
    "CreatePostSurgeryInstructions": CreatePostSurgeryInstructions,
    "PuppyAdoptionGuide": PuppyAdoptionGuide,
    "SpayNeuterInstructions": SpayNeuterInstructions,
    "DentalCareInstructions": DentalCareInstructions,
    "CreateSpayNeuterInstructions": CreateSpayNeuterInstructions,
    "ViewSpayNeuterInstructions": ViewSpayNeuterInstructions,
    "CreateDentalCareInstructions": CreateDentalCareInstructions,
    "AppointmentBooking": AppointmentBooking,
    "VaccinationForm": VaccinationForm,
    "MedicalVisitForm": MedicalVisitForm,
    "AnxietyQuestionnaires": AnxietyQuestionnaires,
    "CreateAnxietyQuestionnaire": CreateAnxietyQuestionnaire,
    "PublicAnxietyQuestionnaire": PublicAnxietyQuestionnaire,
    "ViewPostSurgeryInstructions": ViewPostSurgeryInstructions,
    "ViewAnxietyQuestionnaire": ViewAnxietyQuestionnaire,
    "ViewDentalCareInstructions": ViewDentalCareInstructions,
    "ManageAppointments": ManageAppointments,
    "PublicSpayNeuterInstructions": PublicSpayNeuterInstructions,
    "UserManual": UserManual,
    "MarketingMaterials": MarketingMaterials,
    "ViewConsentForm": ViewConsentForm,
    "SystemManagement": SystemManagement,
    "PublicEmergencyTriage": PublicEmergencyTriage,
    "EmergencyTriageDashboard": EmergencyTriageDashboard,
    "ViewEmergencyTriage": ViewEmergencyTriage,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};