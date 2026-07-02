import { ImageWithFallback } from './ImageWithFallback';
import logoFilled from '../../assets/imports/WhatsApp_Image_2026-04-30_at_7.52.21_PM__1_-1.jpeg';
import logoOutline from '../../assets/imports/WhatsApp_Image_2026-04-30_at_7.52.21_PM-1.jpeg';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'outline';
}

export default function Logo({ className = '', variant = 'full' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <div className={`flex items-center ${className}`}>
        <ImageWithFallback
          src={logoFilled}
          alt="Cloud Laundry"
          className="h-12 w-auto object-contain"
        />
      </div>
    );
  }

  if (variant === 'outline') {
    return (
      <div className={`flex items-center ${className}`}>
        <ImageWithFallback
          src={logoOutline}
          alt="Cloud Laundry"
          className="h-12 w-auto object-contain"
        />
      </div>
    );
  }

  // Full variant - use filled logo
  return (
    <div className={`flex items-center ${className}`}>
      <ImageWithFallback
        src={logoFilled}
        alt="Cloud Laundry"
        className="h-12 w-auto object-contain"
      />
    </div>
  );
}
