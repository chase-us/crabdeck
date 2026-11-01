export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[];
  shared?: boolean;
}

export interface DriveFileListResponse {
  files: DriveFileItem[];
  nextPageToken?: string;
}

/**
 * List files from the user's Google Drive
 */
export const listDriveFiles = async (
  accessToken: string,
  options: {
    pageSize?: number;
    pageToken?: string;
    query?: string;
    orderBy?: string;
  } = {}
): Promise<DriveFileListResponse> => {
  const { pageSize = 25, pageToken, query, orderBy = 'modifiedTime desc' } = options;

  const params = new URLSearchParams({
    pageSize: String(pageSize),
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink, thumbnailLink, shared, owners)',
    orderBy,
    spaces: 'drive'
  });

  if (pageToken) params.append('pageToken', pageToken);
  if (query) params.append('q', query);

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${errorBody}`);
  }

  return await res.json();
};

/**
 * Fetch file content (text or binary preview)
 */
export const getDriveFileContent = async (
  accessToken: string,
  fileId: string
): Promise<string> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    // If it's a native Google Doc, export it as plain text
    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (exportRes.ok) {
      return await exportRes.text();
    }

    throw new Error(`Failed to fetch file content (${res.status})`);
  }

  return await res.text();
};

/**
 * Upload a file directly to Google Drive (e.g. Crabdeck briefing or artifact)
 */
export const uploadDriveFile = async (
  accessToken: string,
  name: string,
  content: string,
  mimeType: string = 'text/markdown'
): Promise<DriveFileItem> => {
  const metadata = {
    name,
    mimeType
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload file to Google Drive: ${err}`);
  }

  return await res.json();
};

/**
 * Delete file from Google Drive
 * Note: Caller MUST verify explicit confirmation before invoking this destructive method!
 */
export const deleteDriveFile = async (
  accessToken: string,
  fileId: string
): Promise<void> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Failed to delete file from Google Drive (${res.status}): ${err}`);
  }
};
