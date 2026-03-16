import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export type ThemeId = string;
export interface TemplateSeedStatus {
    totalThemes: bigint;
    seededTemplateNames: Array<string>;
    totalTemplates: bigint;
}
export interface FormField {
    fieldPlaceholder: string;
    order: bigint;
    templateId: TemplateId;
    fieldLabel: string;
    helpText: string;
    fieldWidth: bigint;
    visible: boolean;
    required: boolean;
    groupName: string;
    options: Array<string>;
    fieldType: Variant_textArea_multiSelect_numberField_textField_currency_checkbox_dateField_radio_percentage_dropdown;
    defaultValue?: string;
    fieldId: FieldId;
    condition?: {
        conditionField: string;
        conditionValue: string;
    };
}
export interface DocumentData {
    value: string;
    documentId: DocumentId;
    fieldId: FieldId;
}
export type TemplateId = string;
export type FieldId = string;
export type ExportId = string;
export interface Payment {
    status: Variant_pending_confirmed;
    userId: UserId;
    createdAt: Timestamp;
    currency: string;
    paymentId: PaymentId;
    documentId: DocumentId;
    amount: bigint;
    transactionId?: string;
}
export interface Placeholder {
    token: string;
    templateId: TemplateId;
    description: string;
    placeholderId: PlaceholderId;
    fieldId: FieldId;
}
export interface Document {
    status: Variant_generated_draft;
    title: string;
    templateId: TemplateId;
    userId: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    documentId: DocumentId;
    themeId: ThemeId;
}
export interface Template {
    id: TemplateId;
    status: boolean;
    name: string;
    createdAt: Timestamp;
    createdBy: UserId;
    commodityType: string;
    description: string;
    category: string;
}
export type PlaceholderId = string;
export interface Export {
    exportId: ExportId;
    userId: UserId;
    downloadDate: Timestamp;
    paymentId: PaymentId;
    documentId: DocumentId;
    format: Variant_pdf_docx_xlsx;
}
export type UserId = Principal;
export type PaymentId = string;
export type DocumentId = string;
export interface Theme {
    themeName: string;
    footerStyle: string;
    primaryColor: string;
    createdBy?: UserId;
    headerDesign: string;
    fontFamily: string;
    secondaryColor: string;
    tableBorders: boolean;
    themeId: ThemeId;
    pageMargins: string;
}
export interface UserProfile {
    id: UserId;
    country: string;
    name: string;
    createdAt: Timestamp;
    role: UserRole;
    email: string;
    companyName: string;
    phone: string;
}
export interface TemplateSeedResult {
    templatesSkipped: bigint;
    themesCreated: bigint;
    templatesCreated: bigint;
    themesSkipped: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_generated_draft {
    generated = "generated",
    draft = "draft"
}
export enum Variant_pdf_docx_xlsx {
    pdf = "pdf",
    docx = "docx",
    xlsx = "xlsx"
}
export enum Variant_pending_confirmed {
    pending = "pending",
    confirmed = "confirmed"
}
export enum Variant_textArea_multiSelect_numberField_textField_currency_checkbox_dateField_radio_percentage_dropdown {
    textArea = "textArea",
    multiSelect = "multiSelect",
    numberField = "numberField",
    textField = "textField",
    currency = "currency",
    checkbox = "checkbox",
    dateField = "dateField",
    radio = "radio",
    percentage = "percentage",
    dropdown = "dropdown"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmPayment(paymentId: PaymentId, transactionId: string): Promise<void>;
    createDocument(templateId: TemplateId, title: string, themeId: ThemeId): Promise<Document>;
    createFormField(templateId: TemplateId, fieldLabel: string, fieldPlaceholder: string, _fieldType: string, options: Array<string>, required: boolean, defaultValue: string | null, order: bigint, fieldWidth: bigint, helpText: string, groupName: string, visible: boolean, condition: {
        conditionField: string;
        conditionValue: string;
    } | null): Promise<FormField>;
    createPlaceholder(templateId: TemplateId, token: string, fieldId: FieldId, description: string): Promise<Placeholder>;
    createProfile(name: string, email: string, companyName: string, country: string, phone: string): Promise<UserProfile>;
    createTemplate(name: string, category: string, commodityType: string, description: string, status: boolean): Promise<Template>;
    createTheme(themeName: string, fontFamily: string, primaryColor: string, secondaryColor: string, headerDesign: string, footerStyle: string, tableBorders: boolean, pageMargins: string): Promise<Theme>;
    deleteDocument(documentId: DocumentId): Promise<void>;
    deleteFormField(fieldId: FieldId): Promise<void>;
    deletePlaceholder(placeholderId: PlaceholderId): Promise<void>;
    deleteTemplate(id: TemplateId): Promise<void>;
    deleteTheme(themeId: ThemeId): Promise<void>;
    demoteToUser(user: UserId): Promise<void>;
    getActiveTemplates(): Promise<Array<Template>>;
    getAllExports(): Promise<Array<Export>>;
    getAllPayments(): Promise<Array<Payment>>;
    getAllTemplates(): Promise<Array<Template>>;
    getAllThemes(): Promise<Array<Theme>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getAnalytics(): Promise<{
        totalUsers: bigint;
        totalRevenue: bigint;
        totalDownloads: bigint;
        totalDocuments: bigint;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDocumentData(documentId: DocumentId): Promise<Array<DocumentData>>;
    getDocumentsByUser(userId: UserId): Promise<Array<Document>>;
    getExportsByUser(userId: UserId): Promise<Array<Export>>;
    getFieldsForTemplate(templateId: TemplateId): Promise<Array<FormField>>;
    getPaymentsByUser(userId: UserId): Promise<Array<Payment>>;
    getPlaceholdersForTemplate(templateId: TemplateId): Promise<Array<Placeholder>>;
    getSeedStatus(): Promise<TemplateSeedStatus>;
    getTemplate(id: TemplateId): Promise<Template | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    promoteToAdmin(user: UserId): Promise<void>;
    recordExport(documentId: DocumentId, format: Variant_pdf_docx_xlsx, paymentId: PaymentId): Promise<Export>;
    recordPayment(documentId: DocumentId, amount: bigint, currency: string): Promise<Payment>;
    saveCallerUserProfile(name: string, email: string, companyName: string, country: string, phone: string): Promise<void>;
    saveDocumentData(documentId: DocumentId, fieldId: FieldId, value: string): Promise<void>;
    seedStandardTemplates(): Promise<TemplateSeedResult>;
    updateDocument(documentId: DocumentId, title: string, themeId: ThemeId, status: Variant_generated_draft): Promise<void>;
    updateFormField(fieldId: FieldId, fieldLabel: string, fieldPlaceholder: string, options: Array<string>, required: boolean, defaultValue: string | null, order: bigint, fieldWidth: bigint, helpText: string, groupName: string, visible: boolean, condition: {
        conditionField: string;
        conditionValue: string;
    } | null): Promise<void>;
    updatePlaceholder(placeholderId: PlaceholderId, token: string, fieldId: FieldId, description: string): Promise<void>;
    updateTemplate(id: TemplateId, name: string, category: string, commodityType: string, description: string, status: boolean): Promise<void>;
    updateTheme(themeId: ThemeId, themeName: string, fontFamily: string, primaryColor: string, secondaryColor: string, headerDesign: string, footerStyle: string, tableBorders: boolean, pageMargins: string): Promise<void>;
}
