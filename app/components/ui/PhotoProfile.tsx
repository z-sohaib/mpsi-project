import { useState } from 'react';

type PhotoProfileProps = {
  src: string;
  alt: string;
};

export default function PhotoProfile({ src, alt }: PhotoProfileProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className='relative size-16 overflow-hidden rounded-full'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={alt} // Simplified alt, e.g., "User profile" instead of "User profile photo"
        className='size-full object-cover'
      />
      {isHovered && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
          <span className='text-sm text-white'>Change</span>
        </div>
      )}
    </div>
  );
}
