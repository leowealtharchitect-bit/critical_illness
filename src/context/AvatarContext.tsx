import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LEO_BRAND_INFO } from '../data/insuranceContent';

interface AvatarContextType {
  avatarUrl: string;
  isCustom: boolean;
  uploadAvatar: (file: File) => Promise<void>;
  resetAvatar: () => void;
  triggerFileInput: () => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

const STORAGE_KEY = 'leo_custom_avatar';

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(LEO_BRAND_INFO.portraitUrl);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAvatarUrl(saved);
        setIsCustom(true);
        // Automatically persist to server disk so all public visitors see it permanently
        if (saved.startsWith('data:image')) {
          fetch('/api/admin/save-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: saved }),
          }).catch((err) => console.debug('Sync avatar to server error:', err));
        }
      } else {
        // Check if personal_photo.png was uploaded directly to server
        const checkImg = new Image();
        checkImg.onload = () => {
          setAvatarUrl('/assets/brand/personal_photo.png');
          setIsCustom(true);
        };
        checkImg.onerror = () => {
          setAvatarUrl(LEO_BRAND_INFO.portraitUrl);
          setIsCustom(false);
        };
        checkImg.src = '/assets/brand/personal_photo.png';
      }
    } catch (e) {
      console.warn('Could not read saved avatar from localStorage', e);
    }

    // Secret shortcut for Leo (Owner only): Ctrl+Shift+L or ?admin=leo in URL
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Support dropping personal photo directly onto window
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) {
        uploadAvatar(files[0]).catch(console.error);
      }
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('drop', handleWindowDrop);
    window.addEventListener('dragover', handleDragOver);

    // If URL contains ?admin=leo or ?owner=true, trigger file input once on load if needed
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'leo' || params.get('owner') === 'true') {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 500);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('drop', handleWindowDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  const uploadAvatar = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('请选择图片文件（如 PNG、JPG）'));
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          try {
            localStorage.setItem(STORAGE_KEY, result);
          } catch (storageError) {
            console.warn('localStorage may be full, using in-memory avatar', storageError);
          }
          setAvatarUrl(result);
          setIsCustom(true);

          // Permanently save to server disk for all public visitors
          try {
            await fetch('/api/admin/save-avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl: result }),
            });
          } catch (syncErr) {
            console.debug('Failed to sync avatar to server', syncErr);
          }

          resolve();
        } else {
          reject(new Error('读取图片失败'));
        }
      };
      reader.onerror = () => reject(new Error('读取图片发生异常'));
      reader.readAsDataURL(file);
    });
  };

  const resetAvatar = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not remove avatar from localStorage', e);
    }
    setAvatarUrl(LEO_BRAND_INFO.portraitUrl);
    setIsCustom(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar(file).catch((err) => {
        alert(err.message || '上传头像失败，请重试');
      });
      // reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  return (
    <AvatarContext.Provider
      value={{
        avatarUrl,
        isCustom,
        uploadAvatar,
        resetAvatar,
        triggerFileInput,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChange}
        id="leo-avatar-hidden-file-input"
      />
      {children}
    </AvatarContext.Provider>
  );
};

export function useLeoAvatar(): AvatarContextType {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useLeoAvatar must be used within an AvatarProvider');
  }
  return context;
}
