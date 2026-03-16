import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Timer "mo:core/Timer";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserRole = AccessControl.UserRole;
  type Timestamp = Int;

  type ThemeId = Text;
  type UserId = Principal;
  type TemplateId = Text;
  type PlaceholderId = Text;
  type FieldId = Text;
  type DocumentId = Text;
  type ExportId = Text;
  type PaymentId = Text;

  module UserRole {
    public func compare(role1 : UserRole, role2 : UserRole) : Order.Order {
      func convert(role : UserRole) : Nat {
        switch (role) {
          case (#guest) { 0 };
          case (#user) { 1 };
          case (#admin) { 2 };
        };
      };

      Nat.compare(convert(role1), convert(role2));
    };
  };

  type UserProfile = {
    id : UserId;
    name : Text;
    email : Text;
    companyName : Text;
    country : Text;
    phone : Text;
    role : UserRole;
    createdAt : Timestamp;
  };

  type Template = {
    id : TemplateId;
    name : Text;
    category : Text;
    commodityType : Text;
    description : Text;
    status : Bool;
    createdAt : Timestamp;
    createdBy : UserId;
  };

  type FormField = {
    fieldId : FieldId;
    templateId : TemplateId;
    fieldLabel : Text;
    fieldPlaceholder : Text;
    fieldType : {
      #textField;
      #numberField;
      #dateField;
      #dropdown;
      #multiSelect;
      #textArea;
      #currency;
      #percentage;
      #checkbox;
      #radio;
    };
    options : [Text];
    required : Bool;
    defaultValue : ?Text;
    order : Nat;
    fieldWidth : Nat;
    helpText : Text;
    groupName : Text;
    visible : Bool;
    condition : ?{
      conditionField : Text;
      conditionValue : Text;
    };
  };

  type Placeholder = {
    placeholderId : PlaceholderId;
    templateId : TemplateId;
    token : Text;
    fieldId : FieldId;
    description : Text;
  };

  type Theme = {
    themeId : ThemeId;
    themeName : Text;
    fontFamily : Text;
    primaryColor : Text;
    secondaryColor : Text;
    headerDesign : Text;
    footerStyle : Text;
    tableBorders : Bool;
    pageMargins : Text;
    createdBy : ?UserId;
  };

  type Document = {
    documentId : DocumentId;
    userId : UserId;
    templateId : TemplateId;
    title : Text;
    themeId : ThemeId;
    status : { #draft; #generated };
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  type DocumentData = {
    documentId : DocumentId;
    fieldId : FieldId;
    value : Text;
  };

  type Payment = {
    paymentId : PaymentId;
    userId : UserId;
    documentId : DocumentId;
    transactionId : ?Text;
    amount : Nat;
    currency : Text;
    status : { #pending; #confirmed };
    createdAt : Timestamp;
  };

  type Export = {
    exportId : ExportId;
    documentId : DocumentId;
    userId : UserId;
    format : { #docx; #xlsx; #pdf };
    downloadDate : Timestamp;
    paymentId : PaymentId;
  };

  type TemplateSeedResult = {
    templatesCreated : Nat;
    templatesSkipped : Nat;
    themesCreated : Nat;
    themesSkipped : Nat;
  };

  type TemplateSeedStatus = {
    totalTemplates : Nat;
    totalThemes : Nat;
    seededTemplateNames : [Text];
  };

  type ThemeSeed = {
    themeName : Text;
    fontFamily : Text;
    primaryColor : Text;
    secondaryColor : Text;
    headerDesign : Text;
    footerStyle : Text;
    tableBorders : Bool;
    pageMargins : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<UserId, UserProfile>();
  let templates = Map.empty<TemplateId, Template>();
  let formFields = Map.empty<FieldId, FormField>();
  let placeholders = Map.empty<PlaceholderId, Placeholder>();
  let themes = Map.empty<ThemeId, Theme>();
  let documents = Map.empty<DocumentId, Document>();
  let documentData = Map.empty<Text, DocumentData>();
  let payments = Map.empty<PaymentId, Payment>();
  let exports = Map.empty<ExportId, Export>();

  // ============ USER PROFILE FUNCTIONS ============

  public shared ({ caller }) func createProfile(name : Text, email : Text, companyName : Text, country : Text, phone : Text) : async UserProfile {
    if (userProfiles.containsKey(caller)) { Runtime.trap("Profile already exists") };

    let role = if (userProfiles.isEmpty()) { #admin } else { #user };

    let profile : UserProfile = {
      id = caller;
      name;
      email;
      companyName;
      country;
      phone;
      role;
      createdAt = Time.now();
    };

    userProfiles.add(caller, profile);
    profile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(name : Text, email : Text, companyName : Text, country : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?profile) {
        let updatedProfile = {
          profile with
          name;
          email;
          companyName;
          country;
          phone;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func promoteToAdmin(user : UserId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can promote users");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        let updatedProfile = { profile with role = #admin };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func demoteToUser(user : UserId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can demote users");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) {
        let updatedProfile = { profile with role = #user };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.values().toArray();
  };

  // ============ TEMPLATE FUNCTIONS ============

  public shared ({ caller }) func createTemplate(name : Text, category : Text, commodityType : Text, description : Text, status : Bool) : async Template {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create templates");
    };
    let id = Time.now().toText();

    let template : Template = {
      id;
      name;
      category;
      commodityType;
      description;
      status;
      createdAt = Time.now();
      createdBy = caller;
    };

    templates.add(id, template);
    template;
  };

  public shared ({ caller }) func updateTemplate(id : TemplateId, name : Text, category : Text, commodityType : Text, description : Text, status : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update templates");
    };
    switch (templates.get(id)) {
      case (null) { Runtime.trap("Template not found") };
      case (?template) {
        let updatedTemplate = {
          template with name;
          category;
          commodityType;
          description;
          status;
        };
        templates.add(id, updatedTemplate);
      };
    };
  };

  public shared ({ caller }) func deleteTemplate(id : TemplateId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete templates");
    };
    templates.remove(id);
  };

  public query ({ caller }) func getTemplate(id : TemplateId) : async ?Template {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view templates");
    };
    templates.get(id);
  };

  public query ({ caller }) func getActiveTemplates() : async [Template] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view templates");
    };
    let actives = List.empty<Template>();
    let templatesIter = templates.values();

    for (template in templatesIter) {
      if (template.status) {
        actives.add(template);
      };
    };

    actives.toArray();
  };

  public query ({ caller }) func getAllTemplates() : async [Template] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all templates");
    };
    templates.values().toArray();
  };

  // ============ FORM FIELD FUNCTIONS ============

  public shared ({ caller }) func createFormField(templateId : TemplateId, fieldLabel : Text, fieldPlaceholder : Text, _fieldType : Text, options : [Text], required : Bool, defaultValue : ?Text, order : Nat, fieldWidth : Nat, helpText : Text, groupName : Text, visible : Bool, condition : ?{ conditionField : Text; conditionValue : Text }) : async FormField {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create form fields");
    };
    let fieldId = Time.now().toText();

    let formField : FormField = {
      fieldId;
      templateId;
      fieldLabel;
      fieldPlaceholder;
      fieldType = #textField;
      options;
      required;
      defaultValue;
      order;
      fieldWidth;
      helpText;
      groupName;
      visible;
      condition;
    };

    formFields.add(fieldId, formField);
    formField;
  };

  public shared ({ caller }) func updateFormField(fieldId : FieldId, fieldLabel : Text, fieldPlaceholder : Text, options : [Text], required : Bool, defaultValue : ?Text, order : Nat, fieldWidth : Nat, helpText : Text, groupName : Text, visible : Bool, condition : ?{ conditionField : Text; conditionValue : Text }) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update form fields");
    };
    switch (formFields.get(fieldId)) {
      case (null) { Runtime.trap("Field not found") };
      case (?field) {
        let updatedField = {
          field with
          fieldLabel;
          fieldPlaceholder;
          options;
          required;
          defaultValue;
          order;
          fieldWidth;
          helpText;
          groupName;
          visible;
          condition;
        };
        formFields.add(fieldId, updatedField);
      };
    };
  };

  public shared ({ caller }) func deleteFormField(fieldId : FieldId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete form fields");
    };
    formFields.remove(fieldId);
  };

  public query ({ caller }) func getFieldsForTemplate(templateId : TemplateId) : async [FormField] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view form fields");
    };
    let fields = List.empty<FormField>();
    for (field in formFields.values()) {
      if (field.templateId == templateId) {
        fields.add(field);
      };
    };
    fields.toArray();
  };

  // ============ PLACEHOLDER FUNCTIONS ============

  public shared ({ caller }) func createPlaceholder(templateId : TemplateId, token : Text, fieldId : FieldId, description : Text) : async Placeholder {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create placeholders");
    };
    let placeholderId = Time.now().toText();

    let placeholder : Placeholder = {
      placeholderId;
      templateId;
      token;
      fieldId;
      description;
    };

    placeholders.add(placeholderId, placeholder);
    placeholder;
  };

  public shared ({ caller }) func updatePlaceholder(placeholderId : PlaceholderId, token : Text, fieldId : FieldId, description : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update placeholders");
    };
    switch (placeholders.get(placeholderId)) {
      case (null) { Runtime.trap("Placeholder not found") };
      case (?placeholder) {
        let updated = {
          placeholder with
          token;
          fieldId;
          description;
        };
        placeholders.add(placeholderId, updated);
      };
    };
  };

  public shared ({ caller }) func deletePlaceholder(placeholderId : PlaceholderId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete placeholders");
    };
    placeholders.remove(placeholderId);
  };

  public query ({ caller }) func getPlaceholdersForTemplate(templateId : TemplateId) : async [Placeholder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view placeholders");
    };
    let result = List.empty<Placeholder>();
    for (placeholder in placeholders.values()) {
      if (placeholder.templateId == templateId) {
        result.add(placeholder);
      };
    };
    result.toArray();
  };

  // ============ THEME FUNCTIONS ============

  public shared ({ caller }) func createTheme(
    themeName : Text,
    fontFamily : Text,
    primaryColor : Text,
    secondaryColor : Text,
    headerDesign : Text,
    footerStyle : Text,
    tableBorders : Bool,
    pageMargins : Text,
  ) : async Theme {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create themes");
    };
    let themeId = Time.now().toText();

    let theme : Theme = {
      themeId;
      themeName;
      fontFamily;
      primaryColor;
      secondaryColor;
      headerDesign;
      footerStyle;
      tableBorders;
      pageMargins;
      createdBy = ?caller;
    };

    themes.add(themeId, theme);
    theme;
  };

  public shared ({ caller }) func updateTheme(
    themeId : ThemeId,
    themeName : Text,
    fontFamily : Text,
    primaryColor : Text,
    secondaryColor : Text,
    headerDesign : Text,
    footerStyle : Text,
    tableBorders : Bool,
    pageMargins : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update themes");
    };
    switch (themes.get(themeId)) {
      case (null) { Runtime.trap("Theme not found") };
      case (?theme) {
        switch (theme.createdBy) {
          case (?creator) {
            if (creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only update your own themes");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only admins can update system themes");
            };
          };
        };
        let updated = {
          theme with
          themeName;
          fontFamily;
          primaryColor;
          secondaryColor;
          headerDesign;
          footerStyle;
          tableBorders;
          pageMargins;
        };
        themes.add(themeId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteTheme(themeId : ThemeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete themes");
    };
    switch (themes.get(themeId)) {
      case (null) { Runtime.trap("Theme not found") };
      case (?theme) {
        switch (theme.createdBy) {
          case (?creator) {
            if (creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only delete your own themes");
            };
          };
          case (null) {
            Runtime.trap("Unauthorized: Cannot delete system themes");
          };
        };
        themes.remove(themeId);
      };
    };
  };

  public query ({ caller }) func getAllThemes() : async [Theme] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view themes");
    };
    themes.values().toArray();
  };

  // ============ DOCUMENT FUNCTIONS ============

  public shared ({ caller }) func createDocument(templateId : TemplateId, title : Text, themeId : ThemeId) : async Document {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create documents");
    };
    let documentId = Time.now().toText();
    let now = Time.now();

    let document : Document = {
      documentId;
      userId = caller;
      templateId;
      title;
      themeId;
      status = #draft;
      createdAt = now;
      updatedAt = now;
    };

    documents.add(documentId, document);
    document;
  };

  public shared ({ caller }) func updateDocument(documentId : DocumentId, title : Text, themeId : ThemeId, status : { #draft; #generated }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update documents");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        if (doc.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own documents");
        };
        let updated = {
          doc with
          title;
          themeId;
          status;
          updatedAt = Time.now();
        };
        documents.add(documentId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteDocument(documentId : DocumentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete documents");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        if (doc.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own documents");
        };
        documents.remove(documentId);
      };
    };
  };

  public query ({ caller }) func getDocumentsByUser(userId : UserId) : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view documents");
    };
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own documents");
    };
    let result = List.empty<Document>();
    for (doc in documents.values()) {
      if (doc.userId == userId) {
        result.add(doc);
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func saveDocumentData(documentId : DocumentId, fieldId : FieldId, value : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save document data");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        if (doc.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only modify your own documents");
        };
        let key = documentId # ":" # fieldId;
        let data : DocumentData = {
          documentId;
          fieldId;
          value;
        };
        documentData.add(key, data);
      };
    };
  };

  public query ({ caller }) func getDocumentData(documentId : DocumentId) : async [DocumentData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view document data");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        if (doc.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own documents");
        };
        let result = List.empty<DocumentData>();
        for (data in documentData.values()) {
          if (data.documentId == documentId) {
            result.add(data);
          };
        };
        result.toArray();
      };
    };
  };

  // ============ PAYMENT FUNCTIONS ============

  public shared ({ caller }) func recordPayment(documentId : DocumentId, amount : Nat, currency : Text) : async Payment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record payments");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        if (doc.userId != caller) {
          Runtime.trap("Unauthorized: Can only pay for your own documents");
        };
        let paymentId = Time.now().toText();
        let payment : Payment = {
          paymentId;
          userId = caller;
          documentId;
          transactionId = null;
          amount;
          currency;
          status = #pending;
          createdAt = Time.now();
        };
        payments.add(paymentId, payment);
        payment;
      };
    };
  };

  public shared ({ caller }) func confirmPayment(paymentId : PaymentId, transactionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can confirm payments");
    };
    switch (payments.get(paymentId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        if (payment.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only confirm your own payments");
        };
        let updated = {
          payment with
          transactionId = ?transactionId;
          status = #confirmed;
        };
        payments.add(paymentId, updated);
      };
    };
  };

  public query ({ caller }) func getPaymentsByUser(userId : UserId) : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payments");
    };
    let result = List.empty<Payment>();
    for (payment in payments.values()) {
      if (payment.userId == userId) {
        result.add(payment);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAllPayments() : async [Payment] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };
    payments.values().toArray();
  };

  // ============ EXPORT FUNCTIONS ============

  public shared ({ caller }) func recordExport(documentId : DocumentId, format : { #docx; #xlsx; #pdf }, paymentId : PaymentId) : async Export {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record exports");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        if (doc.userId != caller) {
          Runtime.trap("Unauthorized: Can only export your own documents");
        };
        let exportId = Time.now().toText();
        let export : Export = {
          exportId;
          documentId;
          userId = caller;
          format;
          downloadDate = Time.now();
          paymentId;
        };
        exports.add(exportId, export);
        export;
      };
    };
  };

  public query ({ caller }) func getExportsByUser(userId : UserId) : async [Export] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view exports");
    };
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own exports");
    };
    let result = List.empty<Export>();
    for (export in exports.values()) {
      if (export.userId == userId) {
        result.add(export);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAllExports() : async [Export] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all exports");
    };
    exports.values().toArray();
  };

  // ============ ANALYTICS FUNCTIONS ============

  public query ({ caller }) func getAnalytics() : async {
    totalUsers : Nat;
    totalDocuments : Nat;
    totalDownloads : Nat;
    totalRevenue : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    var confirmedPayments = 0;
    for (payment in payments.values()) {
      switch (payment.status) {
        case (#confirmed) { confirmedPayments += 1 };
        case (_) {};
      };
    };

    {
      totalUsers = userProfiles.size();
      totalDocuments = documents.size();
      totalDownloads = exports.size();
      totalRevenue = confirmedPayments;
    };
  };

  // ============ TEMPLATE LIBRARY SEEDER ============

  public shared ({ caller }) func seedStandardTemplates() : async TemplateSeedResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed templates");
    };

    let existingTemplates = List.empty<Text>();
    templates.values().forEach(func(template) { existingTemplates.add(template.name) });

    let existingThemes = List.empty<Text>();
    themes.values().forEach(func(theme) { existingThemes.add(theme.themeName) });

    let standardTemplates = [
      "Proforma Invoice",
      "Commercial Invoice",
      "Sales Contract",
      "Purchase Contract",
      "Packing List",
      "Commodity Specification Sheet",
      "Cashew Kernel Offer Sheet",
      "Inspection Certificate",
      "Broker Commission Agreement",
      "LC Draft",
    ];

    var templatesCreated = 0;
    var templatesSkipped = 0;

    for (templateName in standardTemplates.values()) {
      let exists = existingTemplates.values().any(func(name) { name == templateName });
      if (exists) {
        templatesSkipped += 1;
      } else {
        let templateId = Time.now().toText();

        let template : Template = {
          id = templateId;
          name = templateName;
          category = "";
          commodityType = "";
          description = "";
          status = true;
          createdAt = Time.now();
          createdBy = caller;
        };

        templates.add(templateId, template);

        templatesCreated += 1;
      };
    };

    let defaultThemes = [
      (
        "Classic Trade",
        "Arial",
        "#336699",
        "#EEEEEE",
        "Standard Header",
        "Classic Footer",
        true,
        "1in",
      ),
      (
        "Premium Export",
        "Times New Roman",
        "#445566",
        "#FFFFDD",
        "Bold Header",
        "Premium Footer",
        true,
        "1in",
      ),
      (
        "Agro Green",
        "Roboto",
        "#209966",
        "#DDFFEE",
        "Green Header",
        "Agro Footer",
        true,
        "1in",
      ),
      (
        "Minimal Corporate",
        "Helvetica",
        "#222222",
        "#CCCCCC",
        "Minimal Header",
        "Corporate Footer",
        true,
        "1in",
      ),
      (
        "Executive Gold",
        "Roman",
        "#EEDD55",
        "#FFFDEE",
        "Gold Header",
        "Executive Footer",
        true,
        "1in",
      ),
    ];

    var themesCreated = 0;
    var themesSkipped = 0;

    for (theme in defaultThemes.values()) {
      let (themeName, fontFamily, primaryColor, secondaryColor, headerDesign, footerStyle, tableBorders, pageMargins) = theme;
      let exists = existingThemes.values().any(func(name) { name == themeName });
      if (exists) {
        themesSkipped += 1;
      } else {
        let themeId = Time.now().toText();
        let theme = {
          themeId;
          themeName;
          fontFamily;
          primaryColor;
          secondaryColor;
          headerDesign;
          footerStyle;
          tableBorders;
          pageMargins;
          createdBy = ?caller;
        };
        themes.add(themeId, theme);
        themesCreated += 1;
      };
    };

    {
      templatesCreated;
      templatesSkipped;
      themesCreated;
      themesSkipped;
    };
  };

  public query ({ caller }) func getSeedStatus() : async TemplateSeedStatus {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view seed status");
    };

    let allTemplates = templates.values().toArray();
    let allThemes = themes.values().toArray();

    let templateNames = allTemplates.map(func(t) { t.name });

    {
      totalTemplates = allTemplates.size();
      totalThemes = allThemes.size();
      seededTemplateNames = templateNames;
    };
  };
};
