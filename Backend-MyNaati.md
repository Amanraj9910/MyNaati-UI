# MyNaati Backend Structure and API Documentation

## Overview

The MyNaati application follows a layered architecture consistent with ASP.NET MVC/Web API applications. The backend logic is separated from the presentation layer, though the Controller entry points are defined within the UI project.

### Key Directories

*   **Presentation & API Layer**: `d:\naati-productionsourcecode\MyNaati.Ui`
    *   Contains the `Controllers` (virtual/missing from disk in this environment, but defined in [.csproj](file:///d:/naati-productionsourcecode/MyNaati.Bl/MyNaati.Bl.csproj)), `Views`, and frontend assets ([App](file:///d:/naati-productionsourcecode/MyNaati.Ui/Global.asax.cs#73-77) folder).
    *   **Note**: The physical `Controllers` folder appears to be missing from the file system, but the project file ([MyNaati.Ui.csproj](file:///d:/naati-productionsourcecode/MyNaati.Ui/MyNaati.Ui.csproj)) confirms their existence and names.
*   **Business Logic Layer**: `d:\naati-productionsourcecode\MyNaati.Bl`
    *   Contains the core logic, services, and repositories that the Controllers call.
    *   Key logic is found in `BackOffice` and `Portal` subdirectories.

## Backend File Roles

| File / Component | Location | Role & Purpose |
| :--- | :--- | :--- |
| **Controllers** | `MyNaati.Ui\Controllers` | **Entry Points**: Handle HTTP requests, parsing parameters, and returning JSON responses. They delegate all complex logic to Services. (e.g., `CredentialApplicationController.cs`, `PublicController.cs`) |
| **Services** | `MyNaati.Bl` | **Business Logic**: Implement the core rules, validation, and data orchestration. (e.g., [CredentialApplicationService.cs](file:///d:/naati-productionsourcecode/MyNaati.Bl/BackOffice/CredentialApplicationService.cs), [ApiPublicService.cs](file:///d:/naati-productionsourcecode/MyNaati.Bl/BackOffice/ApiPublicService.cs)) |
| **Frontend Services** | `MyNaati.Ui\App\services` | **API Clients**: JavaScript files that define the actual AJAX calls to the backend, revealing the API endpoints. (e.g., `credential-application-service.js`) |

---

## API Detail: Credential Application
**Primary Controller**: `CredentialApplicationController` (inferred)
**Logic Service**: `MyNaati.Bl\BackOffice\CredentialApplicationService.cs`
**Frontend Client**: `MyNaati.Ui\App\services\credential-application-service.js`

This API manages the lifecycle of a candidate's application for credentials (translators/interpreters).

| Frontend Action (JS) | Inferred Endpoint | Backend Method (Service) | Purpose |
| :--- | :--- | :--- | :--- |
| `save(request)` | `POST api/credentialapplication/save` | `SaveCredentialRequest` | Saves a draft of the application. |
| `submit(request)` | `POST api/credentialapplication/submit` | `SubmitApplication` (inferred) | Finalizes and submits the application for processing. |
| `delete(request)` | `POST api/credentialapplication/delete` | `DeleteCredentialRequest` | Deletes a draft credential request. |
| `forms` | `GET api/credentialapplication/forms` | `GetPublicApplicationForms` | Retrieves available application forms (tables) based on user type. |
| `sections(request)` | `GET api/credentialapplication/sections` | `GetCredentialApplicationFormSections` | Gets the specific sections (wizard steps) for a form. |
| `credentials` | `GET api/credentialapplication/credentials` | `GetCredentials` | Lists credentials associated with the user. |
| `availablecredentials`| `GET api/credentialapplication/availablecredentials` | `GetAvailableCredentials` | Lists credentials the user *can* apply for. |
| `fees(request)` | `GET api/credentialapplication/fees` | `GetFees` | Calculates fees for the application. |
| `documentTypes` | `GET api/credentialapplication/documenttypes` | `GetDocumentTypes` | Lists valid document types for upload (Passport, etc.). |
| `personDetails` | `GET api/credentialapplication/persondetails` | `GetPersonDetailsBasic` | Fetches applicant's personal details. |
| `testSessions` | `GET api/credentialapplication/testsessions` | `GetAvailableTestSessions...` | Lists available testing sessions for the application. |
| `createcredentialapplication` | `POST api/credentialapplication/create...` | `CreateCredentialApplication` | Initiates a new application process. |

## API Detail: Public API
**Primary Controller**: `PublicController` (inferred from `Controllers\API\1.0\PublicController.cs`)
**Logic Service**: `MyNaati.Bl\BackOffice\ApiPublicService.cs`

This API handles public-facing data verifications and directories, often used without login or for public registers.

| Data / Feature | Backend Method (Service) | Purpose |
| :--- | :--- | :--- |
| **Practitioner Search** | `SearchPractitioner` | Searches the public directory of practitioners (Naati verified). Supports filtering by country, state, language, etc. |
| **Verify QR Code** | `VerifyCertificationQrCode` | Verifies the validity of a digital credential via its QR code GUID. |
| **Verify Document** | `VerifyDocument` | Verifies a physical document using a document number (format `credential-app-docId`). |
| **Test Sessions** | `SearchTestSession` | Searches for upcoming test sessions public availability. |
| **Availability** | `GetTestSessionAvailability` | Checks if specific test slots are available for booking. |
| **Person Photo** | `GetPersonPhoto` | Retrieves the public photo of a practitioner if authorized/available. |
| **Lookups** | `GetLookups` / `GetLanguages` | Provides reference data for dropdowns (Languages, Countries, etc.). |

## API Detail: Account & User
**Primary Controller**: `AccountController`
**Logic Service**: `MyNaati.Bl\BackOffice\UserService.cs` / `MembershipProviderService.cs`

| Feature | Purpose |
| :--- | :--- |
| **Authentication** | Handles Login, Logout, and Session management. |
| **Registration** | Handles new user sign-up (`RegisterHelper.cs` is heavily involved here). |
| **Profile** | implementations for updating password, email, and contact details. |

## Other Notable Controllers (from .csproj)

*   `VerifyPractitionerController`: Specific endpoint for verification logic.
*   `UnraisedInvoicesController`: Manages pending payments.
*   `LogbookController`: Manages the practitioner's work logbook for recertification.
*   `ExaminerToolsController`: logic for examiners to mark tests (likely internal/restricted).
*   `OnlineDirectoryController`: Backs the "Find a Practitioner" public page.
