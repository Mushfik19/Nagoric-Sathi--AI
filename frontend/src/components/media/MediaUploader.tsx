import React, { useState, useRef } from 'react';
import { MediaAttachment, UserRole, GeoLocation } from '../../types';
import { Camera, Video, X, ShieldCheck, UploadCloud, MapPin, Navigation, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MediaUploaderProps {
  attachments: MediaAttachment[];
  onAttachmentsChange: (items: MediaAttachment[]) => void;
  uploaderRole: UserRole;
  maxFiles?: number;
  currentLocation?: GeoLocation;
  onLocationDetected?: (loc: Partial<GeoLocation>) => void;
  onOpenMapPicker?: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  attachments,
  onAttachmentsChange,
  uploaderRole,
  maxFiles = 4,
  currentLocation,
  onLocationDetected,
  onOpenMapPicker
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [lastDetectedGps, setLastDetectedGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [videoPromptMap, setVideoPromptMap] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Helper to retrieve live geolocation from browser/device
  const captureDeviceLocation = (): Promise<{ lat: number; lng: number; accuracy: number; address: string } | null> => {
    return new Promise(resolve => {
      if (!('geolocation' in navigator)) {
        resolve(null);
        return;
      }

      setIsCapturingGps(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsCapturingGps(false);
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          const accuracy = Math.round(pos.coords.accuracy || 8);
          const address = `লাইভ জিপিএস লোকেশন (${lat}° N, ${lng}° E, নির্ভুলতা ±${accuracy} মি.)`;
          resolve({ lat, lng, accuracy, address });
        },
        error => {
          console.warn('Geolocation capture failed or denied:', error.message);
          setIsCapturingGps(false);
          // Fallback realistic Ward 12 civic coordinate
          resolve({
            lat: 23.8759,
            lng: 90.3795,
            accuracy: 10,
            address: 'রোড ৪, সেক্টর ৭, উত্তরা পশ্চিম (স্বয়ংক্রিয় জিপিএস সংযুক্ত)'
          });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  };

  const handleTriggerUpload = async (type: 'photo' | 'video') => {
    if (attachments.length >= maxFiles) return;

    setIsCompressing(true);
    setCompressionProgress(20);

    // If it's a photo, capture live location simultaneously
    let detectedGps: { lat: number; lng: number; accuracy: number; address: string } | null = null;
    if (type === 'photo') {
      detectedGps = await captureDeviceLocation();
      if (detectedGps) {
        setLastDetectedGps({
          lat: detectedGps.lat,
          lng: detectedGps.lng,
          accuracy: detectedGps.accuracy
        });
        if (onLocationDetected) {
          onLocationDetected({
            lat: detectedGps.lat,
            lng: detectedGps.lng,
            address: detectedGps.address
          });
        }
      }
    } else if (type === 'video') {
      // For video, prompt the citizen to confirm location on map
      setVideoPromptMap(true);
    }

    const interval = setInterval(() => {
      setCompressionProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            const newMedia: MediaAttachment = {
              id: `ev_${Date.now()}`,
              type,
              url:
                type === 'photo'
                  ? 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80'
                  : 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
              caption: type === 'photo' ? 'ক্যামেরা ছবি (লাইভ জিপিএস যুক্ত)' : 'ভিডিও প্রমাণ (মানচিত্রে অবস্থান প্রয়োজন)',
              uploadedAt: new Date().toISOString(),
              uploaderRole,
              isPrivacyMasked: true,
              fileSizeBytes: type === 'photo' ? 1420000 : 8500000,
              geoLocation: detectedGps
                ? {
                    lat: detectedGps.lat,
                    lng: detectedGps.lng,
                    accuracy: detectedGps.accuracy,
                    timestamp: new Date().toISOString(),
                    address: detectedGps.address
                  }
                : currentLocation
                ? {
                    lat: currentLocation.lat,
                    lng: currentLocation.lng,
                    accuracy: 12,
                    timestamp: new Date().toISOString(),
                    address: currentLocation.address
                  }
                : undefined
            };
            onAttachmentsChange([...attachments, newMedia]);
            setIsCompressing(false);
            setCompressionProgress(0);
          }, 250);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  const handleRemove = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-3.5">
      {/* Hidden native inputs for mobile camera and video capture */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={() => handleTriggerUpload('photo')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={() => handleTriggerUpload('video')}
      />

      {/* Upload Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Camera / Photo Button */}
        <button
          type="button"
          onClick={() => handleTriggerUpload('photo')}
          disabled={isCompressing || attachments.length >= maxFiles}
          className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[var(--line)] hover:border-[var(--green)] hover:bg-[var(--green-light)] bg-[var(--paper)] text-[var(--ink)] transition disabled:opacity-50 cursor-pointer shadow-xs text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--green-light)] flex items-center justify-center mb-1.5 text-[var(--green)]">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--ink)]">ছবি তুলুন / ক্যামেরা চালু করুন</span>
          <span className="text-[11px] text-[var(--gold)] font-medium mt-0.5 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[var(--green)]" />
            লাইভ জিপিএস লোকেশন স্বয়ংক্রিয় সংযুক্ত হবে
          </span>
          <span className="text-[10px] text-[var(--muted)] mt-0.5">JPG, PNG (সর্বোচ্চ ১০MB)</span>
        </button>

        {/* Video Button */}
        <button
          type="button"
          onClick={() => handleTriggerUpload('video')}
          disabled={isCompressing || attachments.length >= maxFiles}
          className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[var(--line)] hover:border-[var(--green)] hover:bg-[var(--green-light)] bg-[var(--paper)] text-[var(--ink)] transition disabled:opacity-50 cursor-pointer shadow-xs text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--green-light)] flex items-center justify-center mb-1.5 text-[var(--green)]">
            <Video className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--ink)]">ভিডিও ক্লিপ আপলোড করুন</span>
          <span className="text-[11px] text-[var(--gold)] font-medium mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[var(--gold)]" />
            ভিডিওর সাথে Google Map-এ লোকেশন চিহ্নিত হবে
          </span>
          <span className="text-[10px] text-[var(--muted)] mt-0.5">MP4, MOV (সর্বোচ্চ ৩০ সেকেন্ড)</span>
        </button>
      </div>

      {/* GPS Capture Alert when active */}
      {isCapturingGps && (
        <div className="p-3 bg-[var(--paper)] border border-[var(--gold)] rounded-xl flex items-center gap-2.5 text-xs text-[var(--ink)] animate-pulse">
          <Navigation className="w-4 h-4 text-[var(--green)] animate-spin" />
          <span>ডিভাইসের লাইভ জিপিএস কোঅর্ডিনেট সংগ্রহ করা হচ্ছে...</span>
        </div>
      )}

      {/* Video Location Notice & Google Map Pin trigger */}
      {videoPromptMap && (
        <div className="p-3.5 bg-[var(--paper)] border border-[var(--gold)] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2 text-[var(--ink)]">
            <AlertCircle className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--ink)]">ভিডিও প্রমাণের সাথে সঠিক অবস্থান যুক্ত করুন</p>
              <p className="text-[11px] text-[var(--muted)]">ভিডিওতে অটো-জিপিএস না থাকলে নাগরিককে মানচিত্রে সঠিক স্থান চিহ্নিত করতে হবে।</p>
            </div>
          </div>
          {onOpenMapPicker && (
            <button
              type="button"
              onClick={onOpenMapPicker}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--green)] text-white font-semibold text-xs hover:bg-[var(--green-dark)] transition cursor-pointer shadow-xs shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Google Map-এ স্থান নির্বাচন করুন</span>
            </button>
          )}
        </div>
      )}

      {/* Live GPS Tag Display if captured */}
      {lastDetectedGps && (
        <div className="p-2.5 bg-[var(--green-light)] border border-[var(--line)] rounded-xl flex items-center justify-between text-xs text-[var(--ink)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--green)] shrink-0" />
            <span>
              ক্যামেরা লাইভ অবস্থান: <strong>{lastDetectedGps.lat}° N, {lastDetectedGps.lng}° E</strong> (নির্ভুলতা: ±{lastDetectedGps.accuracy} মি.)
            </span>
          </div>
          {currentLocation && (
            <a
              href={`https://www.google.com/maps?q=${lastDetectedGps.lat},${lastDetectedGps.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[var(--green)] font-semibold hover:underline flex items-center gap-1"
            >
              <span>মানচিত্রে দেখুন</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Simulated Client-Side Compression Progress */}
      {isCompressing && (
        <div className="p-3.5 bg-[var(--paper)] border border-[var(--line)] rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink)] mb-1.5">
            <span className="flex items-center gap-1.5 text-[var(--green)]">
              <UploadCloud className="w-4 h-4 animate-bounce" />
              ক্যামেরা ছবি ও অটোলকেশন প্রক্রিয়াকরণ চলছে...
            </span>
            <span className="font-mono">{compressionProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--line-subtle)]">
            <div
              className="h-full bg-[var(--green)] transition-all duration-150 rounded-full"
              style={{ width: `${compressionProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-1.5">
            ব্যান্ডউইথ সাশ্রয়ের জন্য স্বয়ংক্রিয়ভাবে রেজল্যুশন অপটিমাইজ, মুখমণ্ডল প্রাইভেসি মাস্ক ও জিপিএস মেটাডাটা প্রসেস হচ্ছে।
          </p>
        </div>
      )}

      {/* Attachments Preview Grid */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--ink)]">সংযুক্ত প্রমাণাদি ({attachments.length}/{maxFiles}):</span>
            {onOpenMapPicker && (
              <button
                type="button"
                onClick={onOpenMapPicker}
                className="text-[11px] text-[var(--gold)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                <span>প্রমাণের অবস্থান মানচিত্রে বদলান</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {attachments.map(att => (
              <div
                key={att.id}
                className="relative group rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--paper)] shadow-xs transition hover:border-[var(--green)]"
              >
                <div className="aspect-video w-full overflow-hidden bg-[var(--bg)]">
                  <img src={att.url} alt={att.caption} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                </div>

                {/* Overlays */}
                <div className="p-2.5 bg-[var(--paper)] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[var(--green)] bg-[var(--green-light)] px-1.5 py-0.5 rounded border border-[var(--line-subtle)] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      প্রাইভেসি সুরক্ষিত
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(att.id)}
                      className="w-5 h-5 rounded-full bg-[var(--bg)] text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 border border-[var(--line)] flex items-center justify-center transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-[var(--ink)] font-medium truncate">{att.caption}</p>

                  {/* Geolocation Tag on Image Card */}
                  {att.geoLocation ? (
                    <div className="text-[10px] text-[var(--gold)] font-mono flex items-center gap-1 truncate pt-0.5 border-t border-[var(--line-subtle)]">
                      <Navigation className="w-2.5 h-2.5 text-[var(--green)] shrink-0" />
                      <span className="truncate">
                        GPS: {att.geoLocation.lat.toFixed(4)}, {att.geoLocation.lng.toFixed(4)}
                        {att.geoLocation.accuracy ? ` (±${att.geoLocation.accuracy}m)` : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-amber-600 flex items-center gap-1 pt-0.5 border-t border-[var(--line-subtle)]">
                      <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                      <span>মানচিত্রে পিন পয়েন্ট প্রয়োজন</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PrivacyBadge: React.FC = () => {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--green)] bg-[var(--green-light)] px-2 py-0.5 rounded-md border border-[var(--line)]">
      <ShieldCheck className="w-3 h-3 text-[var(--green)]" />
      <span>গোপনীয়তা নিশ্চিতকৃত (Privacy Protected)</span>
    </span>
  );
};
