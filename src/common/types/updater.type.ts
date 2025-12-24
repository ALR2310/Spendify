type assets = {
  id: number;
  url: string;
  name: string;
  label: string;
  uploader: Record<string, any>;
  content_type: string;
  state: string;
  size: number;
  digest: string;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
};

export type CheckForUpdatesResponse = {
  hasUpdate: boolean;
  assets?: assets[];
};

export type UpdaterEvents = {
  progress: number;
  complete: {
    message: string;
    path?: string;
  };
  error: Error;
};
