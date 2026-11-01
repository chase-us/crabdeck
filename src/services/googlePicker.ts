// Global TypeScript definitions for Google API and Google Picker
declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

export interface PickedGoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  url?: string;
  iconUrl?: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  description?: string;
}

interface OpenGooglePickerOptions {
  accessToken: string;
  onPicked: (files: PickedGoogleDriveFile[]) => void;
  onCancel?: () => void;
  viewId?: string; // 'DOCS' | 'DOCS_IMAGES' | 'SPREADSHEETS' | 'PRESENTATIONS' | 'ALL'
  multiSelect?: boolean;
}

// Ensure gapi script and 'picker' module are loaded
export const loadGooglePickerApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Google Picker can only be run in a browser environment'));
    }

    const checkPickerReady = () => {
      if (window.google?.picker?.PickerBuilder) {
        return resolve();
      }

      if (window.gapi) {
        window.gapi.load('picker', {
          callback: () => {
            if (window.google?.picker?.PickerBuilder) {
              resolve();
            } else {
              reject(new Error('Google Picker library failed to initialize'));
            }
          },
          onerror: () => reject(new Error('Failed to load Google Picker via gapi.load'))
        });
      } else {
        // Load api.js script dynamically if not present
        const existingScript = document.getElementById('google-api-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-api-script';
          script.src = 'https://apis.google.com/js/api.js';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            window.gapi.load('picker', {
              callback: () => resolve(),
              onerror: () => reject(new Error('Failed to load Google Picker module'))
            });
          };
          script.onerror = () => reject(new Error('Failed to load https://apis.google.com/js/api.js'));
          document.head.appendChild(script);
        } else {
          // Poll briefly
          setTimeout(checkPickerReady, 200);
        }
      }
    };

    checkPickerReady();
  });
};

/**
 * Creates and displays Google Picker widget
 * Respects iframe ancestry origin resolution as documented in references/picker.md
 */
export const openGooglePicker = async ({
  accessToken,
  onPicked,
  onCancel,
  viewId = 'DOCS',
  multiSelect = true
}: OpenGooglePickerOptions): Promise<void> => {
  await loadGooglePickerApi();

  if (!window.google?.picker?.PickerBuilder) {
    throw new Error('Google Picker API is not ready');
  }

  // Calculate picker origin according to reference specification
  const pickerOrigin =
    window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
      ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
      : window.location.origin;

  const builder = new window.google.picker.PickerBuilder();

  // Add designated views
  const googleViewId = window.google.picker.ViewId;
  let targetView = new window.google.picker.DocsView(googleViewId.DOCS);

  if (viewId === 'SPREADSHEETS') {
    targetView = new window.google.picker.DocsView(googleViewId.SPREADSHEETS);
  } else if (viewId === 'PRESENTATIONS') {
    targetView = new window.google.picker.DocsView(googleViewId.PRESENTATIONS);
  } else if (viewId === 'DOCS_IMAGES') {
    targetView = new window.google.picker.DocsView(googleViewId.DOCS_IMAGES);
  }

  targetView.setIncludeFolders(true);
  builder.addView(targetView);

  // Optional multi-select
  if (multiSelect) {
    builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
  }

  builder.setOAuthToken(accessToken);
  builder.setOrigin(pickerOrigin);

  builder.setCallback((data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const docs = data.docs || [];
      const files: PickedGoogleDriveFile[] = docs.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        url: doc.url,
        iconUrl: doc.iconUrl,
        sizeBytes: doc.sizeBytes,
        lastEditedUtc: doc.lastEditedUtc,
        description: doc.description
      }));
      onPicked(files);
    } else if (data.action === window.google.picker.Action.CANCEL) {
      if (onCancel) onCancel();
    }
  });

  const picker = builder.build();
  picker.setVisible(true);
};
