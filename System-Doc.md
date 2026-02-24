# MyNaati System Documentation

This document outlines the technical architecture, logic flows, libraries, and database schemas for the core features of the MyNaati application.

---

## 1. Authentication & Security

### 1.1 Login & Registration
**Logic:**
- **Login:**
  1.  User submits username/email and password.
  2.  Backend authenticates against **ASP.NET Membership** (legacy support).
  3.  Checks if the account is `IsApproved` and not `IsLockedOut`.
  4.  Verifies password hash (using `bcrypt` or legacy hashing).
  5.  Retrieves [Person](file:///d:/MyNaati-UI/server/src/models/Credential.js#9-31) details via `tblMyNaatiUser` link ([AspUserId](file:///d:/MyNaati-UI/server/src/models/MyNaatiUser.js#89-102) ↔ `NaatiNumber`).
  6.  Checks if **MFA** is enabled for the person.
      -   If Yes: Returns a temporary MFA token.
      -   If No: Issues Access & Refresh JWTs.
- **Registration:**
  1.  Validates that the email is unique in `aspnet_Users`.
  2.  Generates a new **Naati Number** via `KeyAllocation` table.
  3.  Creates Identity records: `aspnet_Users`, `aspnet_Membership`.
  4.  Creates Domain records: `tblEntity`, `tblPerson`, `tblPersonName`.
  5.  Links Identity to Domain via `tblMyNaatiUser`.
  6.  Logs the user in automatically.

**Libraries:**
-   **Frontend:** `react-hook-form` (validation), `axios` (API), `lucide-react` (icons).
-   **Backend:** `jsonwebtoken` (JWT), `bcryptjs` (hashing), `express-validator` (input validation).

**Tables & Schema:**
-   `aspnet_Users`: [UserId](file:///d:/MyNaati-UI/server/src/models/MyNaatiUser.js#56-70) (PK, GUID), `UserName` (Email).
-   `aspnet_Membership`: [UserId](file:///d:/MyNaati-UI/server/src/models/MyNaatiUser.js#56-70) (FK), [Password](file:///d:/MyNaati-UI/server/src/services/auth.service.js#355-399), `PasswordSalt`, [Email](file:///d:/MyNaati-UI/server/src/models/User.js#241-256), `IsApproved`, `IsLockedOut`.
-   `tblMyNaatiUser`: `MyNaatiUserId` (PK), [AspUserId](file:///d:/MyNaati-UI/server/src/models/MyNaatiUser.js#89-102) (FK), [PersonId](file:///d:/MyNaati-UI/server/src/models/Credential.js#9-31) (FK), `NaatiNumber`.
-   `tblEntity`: [EntityId](file:///d:/MyNaati-UI/server/src/models/Person.js#68-87) (PK), `NaatiNumber`.
-   `tblPerson`: [PersonId](file:///d:/MyNaati-UI/server/src/models/Credential.js#9-31) (PK), [EntityId](file:///d:/MyNaati-UI/server/src/models/Person.js#68-87) (FK), `BirthDate`, `Gender`.

### 1.2 Multi-Factor Authentication (MFA)
**Logic:**
-   **Setup:** User requests setup → Server generates TOTP secret → Returns QR Code URL.
-   **Enable:** User scans QR & enters code → Server verifies code → Enables MFA by setting `MfaExpireStartDate`.
-   **Login Verification:** User enters code after password → Server verifies against stored secret → Issues full JWTs.

**Libraries:**
-   **Backend:** `otplib` (TOTP generation/verify), `qrcode` (QR code generation).

**Tables & Schema:**
-   `tblPerson`: 
    -   `MfaCode` (The TOTP Secret).
    -   `MfaExpireStartDate` (If not null, MFA is active).

### 1.3 Forgot / Reset Password
**Logic:**
-   **Forgot:** User enters email → System checks `aspnet_Membership` → Generates short-lived JWT → Sends email with link.
-   **Reset:** User clicks link → Enters new password → Server verifies token → Updates password hash in `aspnet_Membership` → Unlocks account if locked.

**Libraries:**
-   **Backend:** `nodemailer` (Email sending).

---

## 2. My Account (User Profile)
**Logic:**
-   **Fetching:** Aggregates data from [Person](file:///d:/MyNaati-UI/server/src/models/Credential.js#9-31), `PersonName`, `Address`, [Email](file:///d:/MyNaati-UI/server/src/models/User.js#241-256), `Phone`.
-   **Updates:**
    -   Personal details update `tblPerson`.
    -   Addresses are managed in `tblAddress` (supports Multiple, with `IsPrimary` flag).
    -   Phone numbers in `tblPhone`.
    -   Emails in `tblEmail`.

**Tables & Schema:**
-   `tblPersonName`: `PersonNameId`, [PersonId](file:///d:/MyNaati-UI/server/src/models/Credential.js#9-31), `GivenName`, `Surname`, `OtherNames`, `EffectiveDate` (Supports name history).
-   `tblAddress`: `AddressId`, [EntityId](file:///d:/MyNaati-UI/server/src/models/Person.js#68-87), `AddressLine1`, `AddressLine2`, `Suburb`, `State`, `Postcode`, `CountryId`, `PrimaryContact` (Bit).
-   `tblPhone`: `PhoneId`, [EntityId](file:///d:/MyNaati-UI/server/src/models/Person.js#68-87), `Number`, `PrimaryContact`.
-   `tblEmail`: `EmailId`, [EntityId](file:///d:/MyNaati-UI/server/src/models/Person.js#68-87), [Email](file:///d:/MyNaati-UI/server/src/models/User.js#241-256), `PrimaryContact`.

---

## 3. Manage My Tests & Results
**Logic:**
-   **Upcoming Tests:** Fetches `TestSitting` records where date > now.
-   **Test Results:** 
    -   Fetches from `tblTestResult`.
    -   Joins `TestSitting` -> `TestSession` -> `Venue` for location details.
    -   Calculates eligibility for **Supplementary** tests based on DB flags and system settings (`SystemValue` table).
    -   Calculates **Paid Review** eligibility (window of days after result processed).

**Tables & Schema:**
-   `tblTestSitting`: `TestSittingId` (PK), `TestSessionId` (FK), `CandidateId`.
-   `tblTestSession`: `TestSessionId`, `TestDateTime`, `VenueId`.
-   `tblTestResult`: 
    -   `TestResultId` (PK), `TestSittingId` (FK).
    -   `ResultTypeId` (FK -> `tluResultType`: Pass/Fail).
    -   `ProcessedDate` (Date result was finalized).
    -   `EligibleForSupplementary` (Bit).
    -   `EligibleForConcededPass` (Bit).
-   `tblTestComponentResult`: Details marks for specific sections (Dialogue 1, Ethics, etc.).

---

## 4. My Credentials
**Logic:**
-   Displays active credentials associated with the user.
-   Filters for credentials that are not terminated and have not expired (or within recertification window).

**Tables & Schema:**
-   `tblCredential`: `CredentialId` (PK), `CertificationPeriodId` (FK), `ExpiryDate`, `TerminationDate`.
-   `tblCertificationPeriod`: `CertificationPeriodId`, [PersonId](file:///d:/MyNaati-UI/server/src/models/Credential.js#9-31) (FK), `StartDate`, `EndDate`.
-   `tblCredentialType`: `CredentialTypeId`, `ExternalName` (e.g., "Certified Translator").
