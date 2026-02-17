declare global {
  interface Window {
    CMS_MANUAL_INIT?: boolean;
    CMS: {
      init: (config?: any) => void;
    };
  }
}

export {};
