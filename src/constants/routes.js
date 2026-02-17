// src/constants/routes.js

export const ROUTES = {
    // กลุ่ม Auth
    LOGIN: 'LoginScreen',
    REGISTER: 'RegisterScreen',
    FORGOT_PASSWORD: 'ForgotPasswordScreen',

    // กลุ่ม Patient (คนไข้)
    PATIENT_HOME: 'PatientHome',
    FIND_DOCTOR: 'FindDoctor',
    MY_APPOINTMENTS: 'MyAppointments',
    PATIENT_PROFILE: 'PatientProfile',

    // กลุ่ม Doctor (หมอ)
    DOCTOR_HOME: 'DoctorHome',
    QUEUE_LIST: 'QueueList',
    PATIENT_DETAIL: 'PatientDetail',

    // กลุ่ม Consultation (ใช้ร่วมกัน)
    CHAT: 'ChatScreen',
    VIDEO_CALL: 'VideoCallScreen',
    PRESCRIPTION: 'PrescriptionScreen',
    PAYMENT: 'PaymentScreen',
};