# Feature 15: Google Drive & Google Picker Workspace Integration

**Feature ID:** `FEAT-15`  
**Classification:** 1P Google Workspace Integration & Cloud Storage  
**Security Gating:** Destructive Gated (Mandatory User Confirmation Dialog for Deletions/Mutations)  
**APIs:** Google Picker API (`picker.googleapis.com`), Google Drive API v3 (`drive.googleapis.com`)  
**Auth Engine:** Firebase Auth with `GoogleAuthProvider` & In-Memory Token Caching  

---

## 1. System Overview

The **Google Drive & Google Picker Workspace** connects the Crabdeck Quantum Omni-Layer to Google's cloud ecosystem. It enables operators to select Drive documents, sheets, slides, and images via the native **Google Picker** client widget, browse their Google Drive files, inspect file metadata, and export Crabdeck sprint blueprints and architecture specifications directly to Drive.

```
+-----------------------------------------------------------------------------------+
|                        GOOGLE DRIVE & PICKER INTEGRATION                          |
+-----------------------------------------------------------------------------------+
                                          |
                      [ Firebase Client-Side Auth ]
                      GoogleAuthProvider (13 Scopes)
                                          |
                                          v
                      [ In-Memory Access Token Cache ]
                     (Strict zero-storage security invariant)
                                          |
         +--------------------------------+--------------------------------+
         |                                                                 |
         v                                                                 v
+-----------------------------------+             +-----------------------------------+
|       GOOGLE PICKER WIDGET        |             |        GOOGLE DRIVE API v3        |
|    (Client-Side Native Dialog)    |             |       (REST Cloud File Hub)       |
+-----------------------------------+             +-----------------------------------+
| - google.picker.PickerBuilder     |             | - List & Search Files (pageSize)  |
| - Origin calculation via          |             | - Download / Export plain text    |
|   ancestorOrigins fallback        |             | - Multipart Upload (Markdown)     |
| - DOCS, SPREADSHEETS, IMAGES views|             | - Explicit Confirmation Delete    |
| - Multi-Select support            |             | - Sync Crabdeck Architecture      |
+-----------------------------------+             +-----------------------------------+
```

---

## 2. OAuth Scope Matrix

The integration is configured with the following official Google Workspace scopes:
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/drive.metadata.readonly`
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/drive.activity`
- `https://www.googleapis.com/auth/drive.activity.readonly`
- `https://www.googleapis.com/auth/drive.appdata`
- `https://www.googleapis.com/auth/drive.apps.readonly`
- `https://www.googleapis.com/auth/drive.install`
- `https://www.googleapis.com/auth/drive.meet.readonly`
- `https://www.googleapis.com/auth/drive.metadata`
- `https://www.googleapis.com/auth/drive.photos.readonly`
- `https://www.googleapis.com/auth/drive.scripts`

---

## 3. Client-Side Google Picker Architecture

As specified in official workspace guidelines, the Picker API is a browser client widget:
1. **Dynamic Library Loading:** Loads `https://apis.google.com/js/api.js` and calls `gapi.load('picker', ...)`.
2. **Ancestor Origin Resolution:** Computes `pickerOrigin` dynamically to work inside nested AI Studio sandboxed iframes:
   ```typescript
   const pickerOrigin =
     window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
       ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
       : window.location.origin;
   ```
3. **View Customization:** Supports `DOCS`, `SPREADSHEETS`, `PRESENTATIONS`, and `DOCS_IMAGES` with folder browsing and multi-select.

---

## 4. Mandatory User Confirmation for Destructive Operations

In strict accordance with Google Workspace Security Invariants:
- Any file deletion or mutation **MUST** be gated by an explicit confirmation dialog.
- Silent file mutations or background file deletions are strictly banned.
- The dialog presents the exact file name, file ID, permanent warning text, and requires physical confirmation before calling `DELETE https://www.googleapis.com/drive/v3/files/${fileId}`.

---

## 5. UI Features & Controls (`GoogleDrivePickerView.tsx`)

- **Official Google Sign-In Button:** Official Google 4-color SVG logo button for initial sign-in, and authenticated user profile card with sign-out.
- **Google Picker Launcher:** Instant button to open the Google Picker dialog, view selected files in a recent tray, and inspect file links.
- **Drive Explorer:** Live searchable table of the user's files with file size, modified date, preview toggle, and Drive link.
- **Crabdeck Architecture Sync:** One-click button to export architecture specifications directly into the user's Google Drive as Markdown files.
