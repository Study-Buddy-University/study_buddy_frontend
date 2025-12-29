/**
 * Preload an image to ensure it's cached before displaying
 * @param src - Image URL to preload
 * @returns Promise that resolves when image is loaded
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`))
    img.src = src
  })
}

/**
 * Preload multiple images in parallel
 * @param urls - Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(urls.map(url => preloadImage(url)))
}
