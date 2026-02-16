/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AnxietyQuestionnaires from './pages/AnxietyQuestionnaires';
import AppointmentBooking from './pages/AppointmentBooking';
import Clients from './pages/Clients';
import ClinicSettings from './pages/ClinicSettings';
import Clinics from './pages/Clinics';
import ConsentForms from './pages/ConsentForms';
import CreateAnxietyQuestionnaire from './pages/CreateAnxietyQuestionnaire';
import CreateConsentForm from './pages/CreateConsentForm';
import CreateDentalCareInstructions from './pages/CreateDentalCareInstructions';
import CreatePostSurgeryInstructions from './pages/CreatePostSurgeryInstructions';
import CreateSpayNeuterInstructions from './pages/CreateSpayNeuterInstructions';
import Dashboard from './pages/Dashboard';
import DentalCareInstructions from './pages/DentalCareInstructions';
import EmergencyTriageDashboard from './pages/EmergencyTriageDashboard';
import Home from './pages/Home';
import IntakeForm from './pages/IntakeForm';
import IntakeFormsList from './pages/IntakeFormsList';
import ManageAppointments from './pages/ManageAppointments';
import MarketingMaterials from './pages/MarketingMaterials';
import MedicalVisitForm from './pages/MedicalVisitForm';
import Pets from './pages/Pets';
import PostSurgeryInstructions from './pages/PostSurgeryInstructions';
import PublicAnxietyQuestionnaire from './pages/PublicAnxietyQuestionnaire';
import PublicConsentForm from './pages/PublicConsentForm';
import PublicEmergencyTriage from './pages/PublicEmergencyTriage';
import PublicForm from './pages/PublicForm';
import PublicFormEn from './pages/PublicFormEn';
import PublicFormRu from './pages/PublicFormRu';
import PublicSpayNeuterInstructions from './pages/PublicSpayNeuterInstructions';
import PublicViewIntakeForm from './pages/PublicViewIntakeForm';
import PuppyAdoptionGuide from './pages/PuppyAdoptionGuide';
import SpayNeuterInstructions from './pages/SpayNeuterInstructions';
import SystemManagement from './pages/SystemManagement';
import UserManual from './pages/UserManual';
import VaccinationForm from './pages/VaccinationForm';
import ViewAnxietyQuestionnaire from './pages/ViewAnxietyQuestionnaire';
import ViewConsentForm from './pages/ViewConsentForm';
import ViewDentalCareInstructions from './pages/ViewDentalCareInstructions';
import ViewEmergencyTriage from './pages/ViewEmergencyTriage';
import ViewIntakeForm from './pages/ViewIntakeForm';
import ViewPostSurgeryInstructions from './pages/ViewPostSurgeryInstructions';
import ViewSpayNeuterInstructions from './pages/ViewSpayNeuterInstructions';
import UserManagement from './pages/UserManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AnxietyQuestionnaires": AnxietyQuestionnaires,
    "AppointmentBooking": AppointmentBooking,
    "Clients": Clients,
    "ClinicSettings": ClinicSettings,
    "Clinics": Clinics,
    "ConsentForms": ConsentForms,
    "CreateAnxietyQuestionnaire": CreateAnxietyQuestionnaire,
    "CreateConsentForm": CreateConsentForm,
    "CreateDentalCareInstructions": CreateDentalCareInstructions,
    "CreatePostSurgeryInstructions": CreatePostSurgeryInstructions,
    "CreateSpayNeuterInstructions": CreateSpayNeuterInstructions,
    "Dashboard": Dashboard,
    "DentalCareInstructions": DentalCareInstructions,
    "EmergencyTriageDashboard": EmergencyTriageDashboard,
    "Home": Home,
    "IntakeForm": IntakeForm,
    "IntakeFormsList": IntakeFormsList,
    "ManageAppointments": ManageAppointments,
    "MarketingMaterials": MarketingMaterials,
    "MedicalVisitForm": MedicalVisitForm,
    "Pets": Pets,
    "PostSurgeryInstructions": PostSurgeryInstructions,
    "PublicAnxietyQuestionnaire": PublicAnxietyQuestionnaire,
    "PublicConsentForm": PublicConsentForm,
    "PublicEmergencyTriage": PublicEmergencyTriage,
    "PublicForm": PublicForm,
    "PublicFormEn": PublicFormEn,
    "PublicFormRu": PublicFormRu,
    "PublicSpayNeuterInstructions": PublicSpayNeuterInstructions,
    "PublicViewIntakeForm": PublicViewIntakeForm,
    "PuppyAdoptionGuide": PuppyAdoptionGuide,
    "SpayNeuterInstructions": SpayNeuterInstructions,
    "SystemManagement": SystemManagement,
    "UserManual": UserManual,
    "VaccinationForm": VaccinationForm,
    "ViewAnxietyQuestionnaire": ViewAnxietyQuestionnaire,
    "ViewConsentForm": ViewConsentForm,
    "ViewDentalCareInstructions": ViewDentalCareInstructions,
    "ViewEmergencyTriage": ViewEmergencyTriage,
    "ViewIntakeForm": ViewIntakeForm,
    "ViewPostSurgeryInstructions": ViewPostSurgeryInstructions,
    "ViewSpayNeuterInstructions": ViewSpayNeuterInstructions,
    "UserManagement": UserManagement,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};