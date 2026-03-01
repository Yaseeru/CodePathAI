/**
 * Image Optimization Utilities
 * Helpers for optimizing images with Next.js Image component
 */

/**
 * Generate blur placeholder data URL
 * Creates a lightweight SVG placeholder for blur effect
 */
export function generateBlurDataURL(width: number = 700, height: number = 475): string {
     const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" version="1.1">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="0%" />
          <stop stop-color="#e5e7eb" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)" />
    </svg>
  `;

     const base64 = Buffer.from(svg).toString('base64');
     return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Image size configurations for responsive images
 */
export const IMAGE_SIZES = {
     thumbnail: { width: 150, height: 150 },
     small: { width: 320, height: 240 },
     medium: { width: 640, height: 480 },
     large: { width: 1024, height: 768 },
     xlarge: { width: 1920, height: 1080 },
} as const;

/**
 * Responsive image sizes string for Next.js Image component
 */
export const RESPONSIVE_SIZES = {
     full: '100vw',
     half: '(max-width: 768px) 100vw, 50vw',
     third: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
     quarter: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
} as const;

/**
 * Image quality settings
 */
export const IMAGE_QUALITY = {
     low: 50,
     medium: 75,
     high: 85,
     max: 95,
} as const;

/**
 * Check if image should use WebP format
 */
export function shouldUseWebP(userAgent?: string): boolean {
     if (!userAgent) return true; // Default to WebP support

     // Check for browsers that support WebP
     const supportsWebP =
          /Chrome|Firefox|Edge|Opera/.test(userAgent) &&
          !/Safari/.test(userAgent);

     return supportsWebP;
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
     src: string,
     alt: string,
     options: {
          priority?: boolean;
          sizes?: string;
          quality?: number;
          fill?: boolean;
          width?: number;
          height?: number;
     } = {}
) {
     const {
          priority = false,
          sizes = RESPONSIVE_SIZES.full,
          quality = IMAGE_QUALITY.high,
          fill = false,
          width,
          height,
     } = options;

     return {
          src,
          alt,
          priority,
          sizes,
          quality,
          fill,
          width,
          height,
          placeholder: 'blur' as const,
          blurDataURL: generateBlurDataURL(width, height),
          loading: priority ? ('eager' as const) : ('lazy' as const),
     };
}

/**
 * Preload critical images
 */
export function preloadImage(src: string) {
     if (typeof window !== 'undefined') {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
     }
}

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyLoading() {
     if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
          return;
     }

     const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
               if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    const src = img.dataset.src;

                    if (src) {
                         img.src = src;
                         img.removeAttribute('data-src');
                         observer.unobserve(img);
                    }
               }
          });
     });

     // Observe all images with data-src attribute
     document.querySelectorAll('img[data-src]').forEach((img) => {
          imageObserver.observe(img);
     });
}

/**
 * Compress image client-side before upload
 */
export async function compressImage(
     file: File,
     maxWidth: number = 1920,
     maxHeight: number = 1080,
     quality: number = 0.85
): Promise<Blob> {
     return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (e) => {
               const img = new Image();

               img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    // Calculate new dimensions
                    if (width > maxWidth || height > maxHeight) {
                         const ratio = Math.min(maxWidth / width, maxHeight / height);
                         width *= ratio;
                         height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                         reject(new Error('Failed to get canvas context'));
                         return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                         (blob) => {
                              if (blob) {
                                   resolve(blob);
                              } else {
                                   reject(new Error('Failed to compress image'));
                              }
                         },
                         'image/webp',
                         quality
                    );
               };

               img.onerror = () => reject(new Error('Failed to load image'));
               img.src = e.target?.result as string;
          };

          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
     });
}
