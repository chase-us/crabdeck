// Type definitions for Google API Client & Google Picker API
// Ensures zero missing typings or compiler warnings across Google Drive, Picker, and Tasks Workspace integrations

declare namespace google {
  namespace picker {
    export class PickerBuilder {
      addView(view: any): PickerBuilder;
      addViewGroup(viewGroup: any): PickerBuilder;
      setOAuthToken(token: string): PickerBuilder;
      setDeveloperKey(key: string): PickerBuilder;
      setCallback(handler: (data: any) => void): PickerBuilder;
      setTitle(title: string): PickerBuilder;
      enableFeature(feature: any): PickerBuilder;
      setOrigin(origin: string): PickerBuilder;
      setSize(width: number, height: number): PickerBuilder;
      build(): Picker;
    }

    export interface Picker {
      setVisible(visible: boolean): void;
      dispose(): void;
    }

    export class View {
      constructor(viewId: any);
      setMimeTypes(mimeTypes: string): View;
    }

    export class DocsView {
      constructor(viewId?: any);
      setIncludeFolders(include: boolean): DocsView;
      setSelectFolderEnabled(enabled: boolean): DocsView;
      setMimeTypes(mimeTypes: string): DocsView;
    }

    export class DocsUploadView {
      constructor();
      setIncludeFolders(include: boolean): DocsUploadView;
    }

    export const Action: {
      PICKED: string;
      CANCEL: string;
    };

    export const Feature: {
      MULTISELECT_ENABLED: any;
      NAV_HIDDEN: any;
      SIMPLE_UPLOAD_ENABLED: any;
      MINE_ONLY: any;
    };

    export const ViewId: {
      DOCS: any;
      DOCS_IMAGES: any;
      DOCS_VIDEOS: any;
      DOCUMENTS: any;
      DRAWINGS: any;
      FOLDERS: any;
      FORMS: any;
      PDFS: any;
      PRESENTATIONS: any;
      SPREADSHEETS: any;
    };

    export const Document: {
      ID: string;
      NAME: string;
      MIME_TYPE: string;
      URL: string;
      ICON_URL: string;
      DESCRIPTION: string;
      SIZE_BYTES: string;
      LAST_EDITED_UTC: string;
    };

    export const Response: {
      ACTION: string;
      DOCUMENTS: string;
    };
  }
}

interface Window {
  gapi?: {
    load: (apiName: string, callbacks: { callback: () => void; onerror?: () => void }) => void;
    client?: any;
    auth2?: any;
  };
  google?: {
    picker?: typeof google.picker;
    accounts?: any;
  };
}
