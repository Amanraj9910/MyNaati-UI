I'll deeply analyze the "My Digital ID Card" section in the Home. Let me search for all related code, services, and database interactions.


Let me search in the compiled output or check if controllers are in a different location:


The controller might be in the bin folder or compiled. Let me search for the service layer that generates the credential ID cards:


Excellent! Now let me search for the controller and related domain models:


Now let me search for the MFA and verification logic:


Now let me search for the verification endpoint and understand how QR codes are verified:


Now let me search for the database service layer and understand the complete flow:


Perfect! Now I have comprehensive information. Let me create the detailed documentation:

## **"My Digital ID Card" Section - Comprehensive Documentation**

### **1. Overview**

The "My Digital ID Card" section is a secure, MFA-protected feature that generates digital credential cards for NAATI practitioners. These cards serve as official proof of certification and include QR codes for real-time verification. The feature displays active credentials in a carousel format with front and back card views.

---

### **2. UI Components & User Flow**

#### **2.1 Menu Entry Points**
**File**: `MenuHelper.cs` (Lines 41, 59)

Two menu items lead to the same endpoint:
- **"My Digital ID Mobile Card"** - Icon: mfa.png, ID: MobileCredentialCards
- **"My Digital ID Card"** - Icon: my-credential-id.png, ID: CredentialCards

**Route**: `/Credential/DigitalIDCard`
**Controller**: CredentialController (compiled/inferred)
**View**: `DigitalIDCard.cshtml`

#### **2.2 Access Control & Visibility**
```csharp
// MenuHelper.cs - Lines 125-129
if (isPractitioner)  // Only visible to practitioners
{
    links.Add(_menuLinks["My Digital ID Mobile Card"]);
    links.Add(_menuLinks["My Digital ID Card"]);
}
```

**Access Requirements**:
1. User must be authenticated
2. User must have practitioner status (`isPractitioner = true`)
3. User must have MFA configured OR email verification completed
4. User must have at least one active credential (certification type)

---

### **3. View Structure & Rendering Logic**

#### **3.1 DigitalIDCard.cshtml**

**Authentication Check** (Lines 10-73):
```razor
@if ((Model.MfaAndAccessCodeModel.MfaConfigured && Model.MfaAndAccessCodeModel.MfaActive) 
     || Model.MfaAndAccessCodeModel.Email != "")
{
    // Display credential cards carousel
}
else
{
    // Display MFA setup partial view
    @Html.Partial("_MfaAndAccessCodePartial", Model.MfaAndAccessCodeModel)
}
```

**Carousel Display** (Lines 21-68):
- Uses Bootstrap carousel component
- Displays multiple credential ID card images
- Supports navigation (previous/next controls)
- Shows indicators for number of cards
- Each card is rendered as an `<img>` tag with base64-encoded image source

**Key Features**:
- First card shows **front side** (practitioner photo, name, QR code)
- Second card shows **back side** (list of all active credentials with expiry dates)
- If user has interpreter credentials, those are prioritized as the first card

---

### **4. Backend Service Architecture**

#### **4.1 Main Service: CredentialQrCodeService**

**Location**: `F1Solutions.Naati.Common.Bl\Credentials\CredentialQrCodeService.cs`

**Dependencies**:
```csharp
- ICredentialQrCodeDalService    // Data access for QR codes
- IPersonQueryService            // Person data and images
- ICredentialApplicationService  // Credential retrieval
- ILookupProvider                // System configuration values
```

#### **4.2 Core Method: GetCredentialIdCards()**

**Signature**: `GenericResponse<List<string>> GetCredentialIdCards(int naatiNumber)`

**Complete Workflow** (Lines 152-300):

**Step 1: Retrieve Active Credentials**
```csharp
var allActiveCredentials = _credentialApplicationService
    .GetAllCredentialsByNaatiNumber(naatiNumber)
    .Results
    .Where(x => x.Certification                        // Must be certification type
             && x.Status != "Expired"                  // Not expired
             && x.Status != "Terminated");             // Not terminated
```

**Step 2: Get Practitioner Photo**
```csharp
var personImageResponse = _personQueryService
    .GetPersonImage(new GetPersonDetailsRequest() { NaatiNumber = naatiNumber });
var personImageBytes = personImageResponse.PersonImageData;

if(personImageBytes == null)
{
    personImageBytes = GetDefaultImage();  // Use default avatar
}
```

**Step 3: Determine Primary Credential**
```csharp
// Prioritize interpreter credentials for first card
var firstInterpreterCredential = allActiveCredentials
    .FirstOrDefault(x => x.CredentialTypeExternalName.Contains("Interpreter"));

if(firstInterpreterCredential.IsNotNull())
{
    firstCredentialId = firstInterpreterCredential.Id;
}
else
{
    firstCredentialId = allActiveCredentials.FirstOrDefault().Id;
}
```

**Step 4: Generate QR Code**
```csharp
var credentialQrCodeResponse = GetCredentialQRCodeForIdCardResponse(firstCredentialId);
// This creates/retrieves QR code GUID from database
```

**Step 5: Create Front Card Image (480x640 pixels)**

**Design Elements**:
- **Top Section** (0-212px): Teal background (#009383) with rounded corners
- **Logo**: NAATI alternate logo (white) positioned at top
- **Photo Area** (212px center): Circular-cropped practitioner photo (185x185px)
- **Name Section** (318px): Bold practitioner name in dark teal (#005C5D)
- **Practitioner Number** (346px): Centered below name
- **QR Code** (379px): 160x160px QR code with NAATI logo embedded
- **Bottom Bar** (560-640px): Teal footer with rounded corners

**Color Scheme**:
- Primary: `#009383` (Teal)
- Secondary: `#CAE9E4` (Light teal)
- Accent: `#005C5D` (Dark teal)
- Text: Black on light backgrounds

**Step 6: Create Back Card Image (480x640 pixels)**

**Design Elements**:
- **Header** (0-80px): Teal rounded header
- **Content Area** (80-560px): White background with black borders
- **Footer** (560-640px): Teal rounded footer
- **Credential List**: Each credential displays:
  - Credential Type External Name (bold, 18pt Raleway)
  - Skill Display Name (16pt Raleway, teal color)
  - Expiry Date (16pt Raleway, teal color)
  - Vertical spacing: 94px between credentials

**Step 7: Convert to Base64 URLs**
```csharp
private string GetCredentialIdCardUrl(Bitmap finalCard)
{
    byte[] finalCardBytes;
    using (var stream = new MemoryStream())
    {
        finalCard.Save(stream, ImageFormat.Png);
        finalCardBytes = stream.ToArray();
    }
    var finalCardBase64 = Convert.ToBase64String(finalCardBytes);
    return $"data:image/png;base64, {finalCardBase64}";
}
```

**Returns**: `List<string>` containing base64-encoded image URLs (typically 2 cards)

---

### **5. Database Tables & Relationships**

#### **5.1 Primary Tables**

**tblCredential** (Core Credential Table)
```sql
Primary Key: Id
Foreign Keys:
  - CertificationPeriodId → tblCertificationPeriod

Key Fields:
  - StartDate (datetime)
  - ExpiryDate (datetime, nullable)
  - TerminationDate (datetime, nullable)
  - ShowInOnlineDirectory (bit)

Relationships:
  - One-to-Many: CredentialQrCodes (tblCredentialQrCode)
  - One-to-Many: CredentialAttachments (tblCredentialAttachment)
  - Many-to-Many: CredentialRequests (via tblCredentialCredentialRequest)
  - One-to-Many: WorkPractices (tblWorkPractice)
```

**tblCredentialQrCode** (QR Code Storage)
```sql
Primary Key: Id
Foreign Keys:
  - CredentialId → tblCredential

Key Fields:
  - QrCodeGuid (uniqueidentifier) - Unique GUID for QR code
  - IssueDate (datetime) - When QR code was generated
  - InactiveDate (datetime, nullable) - Deactivation date
  - ModifiedBy (int) - User who modified
  - ModifiedDate (datetime) - Last modification date

Purpose: Stores unique QR code identifiers linked to credentials
```

**tblCertificationPeriod** (Certification Validity Period)
```sql
Primary Key: Id
Foreign Keys:
  - PersonId → tblPerson
  - StartDate
  - EndDate

Relationships:
  - One-to-Many: Credentials
  - One-to-One: Person

Purpose: Defines time periods during which person holds certifications
```

**tblPerson** (Practitioner Information)
```sql
Primary Key: Id
Foreign Keys:
  - EntityId → tblEntity

Key Fields:
  - NaatiNumber (int)
  - PractitionerNumber (nvarchar)
  - GivenName, Surname, OtherNames, Title
  - Deceased (bit)
  - AllowVerifyOnline (bit)
  - MfaCode (nvarchar(50)) - MFA secret
  - MfaExpireStartDate (datetime) - MFA activation timestamp
  - PrimaryEmailAddress

Relationships:
  - One-to-Many: CertificationPeriods
  - One-to-Many: PersonImages (tblPersonImage)
  - One-to-Many: PersonNames (tblPersonName)
```

**tblPersonImage** (Practitioner Photos)
```sql
Primary Key: Id
Foreign Keys:
  - PersonId → tblPerson

Key Fields:
  - ImageData (varbinary/max) - Stored as binary
  - ContentType
  - FileName

Purpose: Stores practitioner photos for ID cards
```

**tblCredentialType** (Credential Type Definitions)
```sql
Primary Key: Id
Foreign Keys:
  - CredentialCategoryId → tblCredentialCategory

Key Fields:
  - InternalName
  - ExternalName (displayed on ID card)
  - DisplayName
  
Purpose: Defines types like "Certified Translator", "Certified Interpreter"
```

**tblSkill** (Language/Skill Definitions)
```sql
Primary Key: Id

Key Fields:
  - DisplayName (e.g., "English > Arabic")
  - LanguageFromId → tblLanguage
  - LanguageToId → tblLanguage
  
Purpose: Defines language pairs and directions
```

**tblCredentialCredentialRequest** (Junction Table)
```sql
Primary Key: Id
Foreign Keys:
  - CredentialId → tblCredential
  - CredentialRequestId → tblCredentialRequest

Purpose: Links credentials to the application requests that created them
```

#### **5.2 Supporting Tables**

**tblEntity** (Core Entity Record)
```sql
Primary Key: Id

Key Fields:
  - NaatiNumber (int, unique)
  - EntityTypeid → tblEntityType
  
Purpose: Central entity registry for all persons/organizations
```

**tblCredentialCategory** (Category Groupings)
```sql
Primary Key: Id

Key Fields:
  - DisplayName (e.g., "Translator", "Interpreter")
  
Purpose: Groups credential types into categories
```

**tblLanguage** (Language Definitions)
```sql
Primary Key: Id

Key Fields:
  - DisplayName
  - ISOCode
  
Purpose: Defines available languages for translation/interpretation
```

---

### **6. QR Code Generation & Verification System**

#### **6.1 QR Code Creation Process**

**Method**: `GenerateCredentialQrCode(Guid credentialQrCodeGuid)`

**Steps**:
1. **Retrieve/Create GUID**: 
   - Calls `GetCredentialQRCodeForStampAndId(credentialId)`
   - Checks if QR code exists for credential
   - Creates new `CredentialQrCode` record if none exists
   - Generates new `Guid.NewGuid()`

2. **Build Verification URL**:
   ```csharp
   var qrCodeAccessUrl = ConfigurationManager.AppSettings["QrCodeAccessUrl"];
   // Example: "https://mynaati.naati.com.au/VerifyCredential/Index/{0}"
   var qrCodeUrl = string.Format(qrCodeAccessUrl, credentialQrCodeGuid);
   ```

3. **Generate QR Code Image**:
   ```csharp
   QRCodeGenerator qrGenerator = new QRCodeGenerator();
   QRCodeData qrCodeData = qrGenerator.CreateQrCode(qrCodeUrl, QRCodeGenerator.ECCLevel.Q);
   QRCode qrCode = new QRCode(qrCodeData);
   Bitmap qrCodeImage = qrCode.GetGraphic(
       20,                                          // Pixels per module
       Color.FromArgb(255, 0, 147, 131),           // Foreground (teal)
       Color.White,                                 // Background
       Resources.CredentialQr.NaatiLogoForQR,      // Embedded logo
       20,                                          // Logo size
       2,                                           // Logo border
       false,                                       // Draw quiet zone
       Color.White                                  // Quiet zone color
   );
   ```

4. **Store in Database**:
   ```csharp
   var newCredentialQrCode = new CredentialQrCode()
   {
       Credential = credential,
       IssueDate = DateTime.Now.Date,
       QrCodeGuid = Guid.NewGuid(),
       InactiveDate = null,
       ModifiedBy = 0,
       ModifiedDate = DateTime.Now.Date
   };
   
   credential.AddQrCode(newCredentialQrCode);
   NHibernateSession.Current.Flush();
   ```

5. **Create Audit Note**:
   ```csharp
   var qrGeneratedMessage = $"{person.PrimaryEmailAddress} has generated a QR for 
       a digital translation stamp for {credentialType} {skill}.";
   
   // Creates Note record
   // Creates NaatiEntityNote linking to person's entity
   ```

#### **6.2 QR Code Verification Flow**

**Endpoint**: `/VerifyCredential/Index/{qrCodeGuid}`

**Method**: `GetVerifyPractitionerModelFromQrCode(Guid QrCode)`

**Verification Steps**:

1. **Validate QR Code Exists**:
   ```csharp
   var credentialQrCode = NHibernateSession.Current
       .Query<CredentialQrCode>()
       .FirstOrDefault(x => x.QrCodeGuid == qrCode);
   
   if (credentialQrCode == null)
       return Error: "Not a valid Practitioner Identifier";
   ```

2. **Navigate to Person**:
   ```csharp
   var credential = credentialQrCode.Credential;
   var credentialRequest = credential.CredentialCredentialRequests
       .First(x => x.CredentialRequest.StatusTypeId == 12) // CertificationIssued
       .CredentialRequest;
   var person = credentialRequest.CredentialApplication.Person;
   ```

3. **Check Practitioner Status**:
   ```csharp
   result.PractitionerId = person.PractitionerNumber;
   result.IsDeceased = person.Deceased;
   result.AlowVerifyOnline = person.AllowVerifyOnline;
   result.GeneratedOn = credentialQrCode.IssueDate;
   ```

4. **Retrieve All Credentials**:
   ```csharp
   var allCredentials = NHibernateSession.Current
       .Query<CertificationPeriod>()
       .Where(x => x.Person.Id == person.Id)
       .SelectMany(x => x.Credentials);
   ```

5. **Separate Current vs Past Certifications**:
   - **Current**: Status = Active or Future, not expired
   - **Past**: Status = Expired, Terminated, or Surrendered

6. **Display Verification Page**:
   - Practitioner name and photo
   - Current certifications with validity dates
   - Past credentials (if any)
   - Digital stamp validation status
   - QR code generation date

---

### **7. MFA (Multi-Factor Authentication) Security**

#### **7.1 MFA Configuration Check**

**Method**: `GetMFAConfiguredAndValid(int naatiNumber)`

**Logic**:
```csharp
var personResponse = _personQueryService.GetPersonMfaDetails(naatiNumber);
var person = personResponse.Data;

var mfaActive = person.MfaExpireStartDate.IsNotNull() &&
                person.MfaExpireStartDate.GetValueOrDefault()
                    .AddHours(_lookupProvider.SystemValues.MfaAndAccessCodeExpiryHours) 
                    > DateTime.Now;

return new MfaDetailsModel()
{
    MfaActive = mfaActive,                              // Within expiry window
    MfaConfigured = person.MfaCode.IsNotNull(),         // Has MFA secret
    Email = person.Email,                               // For email verification fallback
};
```

**MFA States**:
1. **Not Configured**: `MfaCode == null` → Must set up MFA
2. **Configured but Expired**: `MfaExpireStartDate + ExpiryHours < Now` → Must re-verify
3. **Active**: Both conditions met → Can access ID cards

**Configuration**:
- **System Parameter**: `MfaAndAccessCodeExpiryHours` (typically 24-48 hours)
- **Storage**: `tblPerson.MfaCode`, `tblPerson.MfaExpireStartDate`

#### **7.2 Fallback: Email Verification**

If MFA not configured but email exists:
```razor
|| Model.MfaAndAccessCodeModel.Email != ""
```

Allows email-based verification as alternative to MFA.

---

### **8. Complete Data Flow Diagram**

```
User Clicks "My Digital ID Card"
    ↓
CredentialController.DigitalIDCard() [inferred]
    ↓
Check MFA Status
    ├─→ CredentialQrCodeService.GetMFAConfiguredAndValid(naatiNumber)
    ├─→ Query tblPerson.MfaCode, MfaExpireStartDate
    └─→ Return MfaAndAccessCodeModel
    ↓
MFA Active? ─No─→ Display _MfaAndAccessCodePartial (setup MFA)
    │
   Yes
    ↓
Generate ID Cards
    ↓
CredentialQrCodeService.GetCredentialIdCards(naatiNumber)
    ↓
    ├─→ Step 1: Get Active Credentials
    │       └─→ CredentialApplicationService.GetAllCredentialsByNaatiNumber()
    │           └─→ PersonQueryService.GetPersonCredentials()
    │               └─→ Query: tblCertificationPeriod → tblCredential
    │                   Filter: Status != Expired/Terminated, Certification = true
    │
    ├─→ Step 2: Get Practitioner Photo
    │       └─→ PersonQueryService.GetPersonImage()
    │           └─→ Query: tblPersonImage.ImageData
    │           └─→ If null: Use default avatar (base64 embedded)
    │
    ├─→ Step 3: Select Primary Credential
    │       └─→ Prioritize Interpreter credentials
    │
    ├─→ Step 4: Generate/Retrieve QR Code
    │       └─→ CredentialQrCodeDalService.GetCredentialQRCodeForStampAndId()
    │           ├─→ Query: tblCredentialQrCode WHERE CredentialId = ?
    │           ├─→ If exists: Return existing QrCodeGuid
    │           └─→ If not: Create new CredentialQrCode record
    │               ├─→ Generate Guid.NewGuid()
    │               ├─→ Set IssueDate = Today
    │               ├─→ Save to tblCredentialQrCode
    │               └─→ Create audit note in tblNote + tblEntityNote
    │
    ├─→ Step 5: Create Front Card (Bitmap 480x640)
    │       ├─→ Draw teal background with rounded corners
    │       ├─→ Add NAATI logo (white)
    │       ├─→ Resize & crop practitioner photo (185x185, rounded)
    │       ├─→ Add practitioner name, number
    │       ├─→ Generate QR code image (160x160) with embedded logo
    │       └─→ Convert to base64 PNG
    │
    └─→ Step 6: Create Back Card (Bitmap 480x640)
            ├─→ Draw white background with borders
            └─→ For each active credential:
                ├─→ Credential Type External Name
                ├─→ Skill Display Name
                ├─→ Expiry Date
                └─→ Convert to base64 PNG
    ↓
Return List<string> (base64 image URLs)
    ↓
Populate CredentialIdCardModel
    ├─→ CredentialIdCards = List of base64 strings
    └─→ MfaAndAccessCodeModel = MFA status
    ↓
Render DigitalIDCard.cshtml
    ├─→ If MFA active: Display carousel with ID cards
    └─→ If MFA inactive: Display MFA setup form
```

---

### **9. Image Generation Technical Details**

#### **9.1 Graphics Operations**

**Libraries Used**:
- `System.Drawing` - GDI+ graphics
- `System.Drawing.Drawing2D` - Advanced drawing (rounded rectangles)
- `QRCoder` - QR code generation library
- `System.Windows.Forms` - Text rendering metrics

**Key Techniques**:

**Rounded Rectangles**:
```csharp
canvas.FillRoundedRectangle(brush, rectangle, cornerRadius);
// Custom extension method using GraphicsPath
```

**Image Resizing with Aspect Ratio**:
```csharp
Bitmap ResizeImage(Bitmap image, int maxWidth, int maxHeight)
{
    float ratioBitmap = (float)width / (float)height;
    float ratioMax = (float)maxWidth / (float)maxHeight;
    
    if (ratioMax > ratioBitmap)
        finalWidth = maxHeight * ratioBitmap;
    else
        finalHeight = maxWidth / ratioBitmap;
        
    return new Bitmap(image, finalWidth, finalHeight);
}
```

**Circular Image Cropping**:
```csharp
Image RoundCorners(Image StartImage, int CornerRadius)
{
    GraphicsPath gp = new GraphicsPath();
    gp.AddArc(0, 0, CornerRadius, CornerRadius, 180, 90);
    gp.AddArc(width - radius, 0, radius, radius, 270, 90);
    gp.AddArc(width - radius, height - radius, radius, radius, 0, 90);
    gp.AddArc(0, height - radius, radius, radius, 90, 90);
    g.FillPath(brush, gp);
}
```

**Text Measurement & Wrapping**:
```csharp
var textWidth = TextRenderer.MeasureText(text, font).Width;
if (textWidth > maxWidth)
{
    // Log warning about potential rendering issues
    LoggingHelper.LogWarning($"Name too long: {textWidth}px > {maxWidth}px");
}
```

---

### **10. Security Considerations**

#### **10.1 Access Control Layers**

1. **Authentication**: User must be logged in
2. **Authorization**: Must be practitioner role
3. **MFA**: Multi-factor authentication required (or email verification)
4. **Ownership Validation**: 
   ```csharp
   DoesCredentialBelongToUser(credentialId, currentUserNaatiNumber)
   // Validates credential belongs to requesting user
   ```

#### **10.2 QR Code Security**

- **Unique GUIDs**: Each QR code uses cryptographically secure `Guid.NewGuid()`
- **One-Time Generation**: New QR code generated each time (no reuse within same day removed per TFS220404)
- **Inactive Date Support**: QR codes can be deactivated via `InactiveDate` field
- **Verification Endpoint**: Public endpoint validates QR authenticity
- **Deceased Check**: Prevents verification of deceased practitioners
- **AllowVerifyOnline Flag**: Practitioners can opt-out of online verification

#### **10.3 Data Protection**

- **Photos**: Stored as binary in database, not file system
- **Personal Info**: Only displayed after MFA verification
- **Audit Trail**: All QR generation logged in `tblNote` and `tblEntityNote`
- **No Caching**: Fresh QR codes generated on each request

---

### **11. Configuration Settings**

**Web.config AppSettings**:
```xml
<!-- QR Code Verification URL Template -->
<add key="QrCodeAccessUrl" value="https://mynaati.naati.com.au/VerifyCredential/Index/{0}" />

<!-- Temporary File Storage Path -->
<add key="tempFilePath" value="C:\Temp\NaatiCredentials" />

<!-- MFA Expiry Hours -->
<!-- Stored in tblSystemParameter: MfaAndAccessCodeExpiryHours -->
```

---

### **12. Error Handling & Edge Cases**

#### **12.1 Handled Scenarios**

1. **No Active Credentials**: Returns empty list, no cards displayed
2. **No Practitioner Photo**: Uses default avatar image
3. **Long Names**: Logs warning, may cause rendering issues if > 478px width
4. **Multiple Credentials**: All displayed on back card with dynamic spacing
5. **Expired/Terminated Credentials**: Filtered out, not shown on cards
6. **QR Code Generation Failure**: Logged, error returned to user
7. **Database Connection Issues**: Generic error response with success=false

#### **12.2 Logging**

```csharp
LoggingHelper.LogInfo("Creating QR Code Generator...");
LoggingHelper.LogInfo("QR Code Generator Created...");
LoggingHelper.LogWarning($"Practitioner Name '{name}' is too long...");
LoggingHelper.LogError($"Credential {id} does not belong to {naatiNumber}");
```

---

### **13. Performance Considerations**

1. **Image Generation**: Done server-side, cached in browser via base64
2. **Database Queries**: 
   - Single query for credentials
   - Single query for person image
   - Lazy-loaded QR codes (created on-demand)
3. **Memory Usage**: Bitmaps disposed after conversion to base64
4. **Network**: Base64 encoding increases size ~33% vs binary, but avoids additional HTTP requests

---

### **14. Summary**

The "My Digital ID Card" feature is a sophisticated, security-focused system that:

1. **Generates Professional ID Cards**: Creates visually appealing, branded digital credentials with practitioner photos and QR codes
2. **Implements Strong Security**: Requires MFA/email verification, validates ownership, supports deactivation
3. **Enables Real-Time Verification**: QR codes link to public verification page showing current credential status
4. **Maintains Audit Trail**: Logs all QR code generation with user and timestamp
5. **Handles Multiple Credentials**: Displays all active certifications on card back
6. **Provides Fallback Options**: Default avatars, email verification alternative
7. **Ensures Data Integrity**: Direct database queries, no caching of sensitive data

**Key Tables Involved**:
- `tblCredential` - Core credential records
- `tblCredentialQrCode` - QR code GUIDs and metadata
- `tblCertificationPeriod` - Certification validity periods
- `tblPerson` - Practitioner details and MFA status
- `tblPersonImage` - Practitioner photos
- `tblCredentialType` - Credential type definitions
- `tblSkill` - Language/skill definitions
- `tblNote` / `tblEntityNote` - Audit trail

The system elegantly balances security, usability, and professional presentation while maintaining comprehensive audit capabilities for compliance and fraud prevention.